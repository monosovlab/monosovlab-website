#!/usr/bin/env python3
"""Rebuild the publication list in publications.html from Google Scholar.

Titles, venues and years come from the PI's Google Scholar profile. Each paper is
matched by title against OpenAlex to fill in the full author list and the DOI.

Usage (from the repo root):  python3 tools/update_publications.py
Google Scholar blocks cloud servers, so run this on your own computer, then commit.
"""
import difflib
import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

SCHOLAR_USER = "UZ46kzgAAAAJ"
OPENALEX_AUTHOR = "A5024947116"

# Scholar entries matching this (supplements, corrections, errata) are left out.
SKIP = re.compile(r"^supplement|correction|erratum|\(vol \d+, pg", re.I)

# PDF, code and data links, keyed by paper title. A "pdf" here replaces the open-access PDF found on OpenAlex.
EXTRA_LINKS = {
    # "A neural network for information seeking": {"code": "https://github.com/...", "data": "https://..."},
}

# Fixes for entries that are wrong on Google Scholar, keyed by the title shown there.
FIXES = {
    "Royal Netherlands Academy of Arts and Sciences (KNAW)": {
        "title": "The zona incerta in control of novelty seeking and investigation across species",
        "doi": "https://doi.org/10.1016/j.conb.2022.102650",
    },
}

ROOT = Path(__file__).resolve().parent.parent
PUBS = ROOT / "publications.html"
START, END = "<!-- PUBLICATIONS:START -->", "<!-- PUBLICATIONS:END -->"
SCHOLAR_URL = f"https://scholar.google.com/citations?user={SCHOLAR_USER}&hl=en"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"

PREPRINT = re.compile(r"arxiv|biorxiv|medrxiv|psyarxiv|ssrn|research square|preprint", re.I)
CONFERENCE = re.compile(r"proceedings(?! of the national academy)|conference|neurips|neural information processing|workshop|symposium"
                        r"|meeting|society for neuroscience|\bsuppl", re.I)
SERVERS = {"biorxiv": "bioRxiv", "medrxiv": "medRxiv", "psyarxiv": "PsyArXiv", "arxiv": "arXiv", "ssrn": "SSRN"}
SMALL_WORDS = {"of", "the", "and", "in", "for", "on", "a", "an", "to"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def text(fragment):
    return html.unescape(re.sub(r"<.*?>", "", fragment)).replace("\xa0", " ").strip()


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def fetch_scholar():
    papers, start = [], 0
    while True:
        page = get(f"{SCHOLAR_URL}&cstart={start}&pagesize=100&sortby=pubdate")
        if "gsc_a_tr" not in page:
            if start == 0:
                sys.exit("Google Scholar returned no papers (probably a CAPTCHA). Try again later.")
            break
        rows = re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S)
        for row in rows:
            title = re.search(r'class="gsc_a_at">(.*?)</a>', row)
            gray = re.findall(r'<div class="gs_gray">(.*?)</div>', row)
            year = re.search(r'gsc_a_hc gs_ibl">(\d*)<', row)
            papers.append({
                "title": text(title.group(1)),
                "authors": text(gray[0]) if gray else "",
                "venue": text(gray[1]) if len(gray) > 1 else "",
                "year": int(year.group(1)) if year and year.group(1) else None,
            })
        if len(rows) < 100:
            break
        start += 100
        time.sleep(2)
    return papers


def fetch_openalex():
    works, cursor = [], "*"
    while cursor:
        q = urllib.parse.urlencode({
            "filter": f"author.id:{OPENALEX_AUTHOR}", "per-page": 200, "cursor": cursor,
            "select": "title,doi,publication_year,type,primary_location,best_oa_location,authorships",
        })
        data = json.loads(get(f"https://api.openalex.org/works?{q}"))
        works += [w for w in data["results"] if w.get("title")]
        cursor = data["meta"].get("next_cursor")
    return {norm(w["title"]): w for w in works}


def match(title, works):
    key = norm(title)
    if key in works:
        return works[key]
    close = difflib.get_close_matches(key, works.keys(), n=1, cutoff=0.9)
    return works[close[0]] if close else None


def short_name(full):
    """'Ethan S. Bromberg-Martin' -> 'ES Bromberg-Martin', 'Yang-Yang Feng' -> 'YY Feng' (Google Scholar's style)."""
    parts = full.replace(".", " ").split()
    if len(parts) < 2:
        return full
    given = [g for p in parts[:-1] for g in p.split("-") if g]
    return "".join(g[0].upper() for g in given) + " " + parts[-1]


def classify(venue, work):
    # OpenAlex often matches the preprint version of a published paper, so Scholar's venue decides.
    if not venue and work:
        return "preprint" if work["type"] == "preprint" else "journal"
    if PREPRINT.search(venue):
        return "preprint"
    if CONFERENCE.search(venue):
        return "conference"
    return "journal"


def clean_venue(venue, year, kind, work):
    venue = re.sub(rf",\s*{year}$", "", venue) if year else venue
    source = (((work or {}).get("primary_location") or {}).get("source") or {}).get("display_name") or ""
    if not venue:
        venue = source
    elif source and venue.lower().startswith(source.lower()):
        venue = source + venue[len(source):]
    if kind == "preprint":
        arxiv = re.search(r"arXiv:\s*([\d.]+v?\d*)", venue)
        if arxiv:
            return f"arXiv:{arxiv.group(1)}"
        server = next((v for k, v in SERVERS.items() if k in venue.lower()), None)
        return server or venue.split(",")[0]
    return title_case(venue)


def title_case(venue):
    """'Nature communications 8 (1)' -> 'Nature Communications 8 (1)'; leaves 'PLoS', 'IEEE/CVF' alone."""
    m = re.match(r"([^\d,(]*)(.*)", venue, re.S)
    name, rest = m.group(1), m.group(2)
    shouting = name.isupper()
    words = []
    for i, w in enumerate(name.split(" ")):
        if w.islower() or shouting:
            w = w.lower() if i and w.lower() in SMALL_WORDS else w.capitalize()
        words.append(w)
    return " ".join(words) + rest


def links(p, work):
    """A DOI if there is one, else the arXiv/bioRxiv page; then PDF, Code, Data."""
    out = []
    doi = p.get("doi") or (work or {}).get("doi") or ""
    arxiv = re.search(r"arXiv:\s*([\d.]+v?\d*)", p["venue"])
    if doi and "arxiv" not in doi.lower() and "10.1101/" not in doi:
        out.append(("DOI", doi))
    elif arxiv:
        out.append(("arXiv", f"https://arxiv.org/abs/{arxiv.group(1)}"))
    elif doi:
        out.append(("arXiv" if "arxiv" in doi.lower() else "bioRxiv", doi))
    extra = EXTRA_LINKS.get(p["title"], {})
    pdf = extra.get("pdf") or (((work or {}).get("best_oa_location") or {}).get("pdf_url"))
    for label, url in (("PDF", pdf), ("Code", extra.get("code")), ("Data", extra.get("data"))):
        if url:
            out.append((label, url))
    return out


def render(papers, works):
    by_year, seen = defaultdict(list), set()
    for p in papers:
        if SKIP.search(p["title"]):
            continue
        p = {**p, **FIXES.get(p["title"], {})}
        if norm(p["title"]) in seen:
            continue
        seen.add(norm(p["title"]))
        work = match(p["title"], works)
        year = p["year"] or (work and work["publication_year"])
        if not year:
            continue
        if work and work["authorships"]:
            authors = [short_name(a["author"]["display_name"]) for a in work["authorships"]]
        else:
            authors = [a.strip() for a in p["authors"].split(",") if a.strip()]
        authors = ", ".join(html.escape(a) for a in authors if a not in ("...", "…"))
        if "..." in p["authors"] and not work:
            authors += ", …"
        kind = classify(p["venue"], work)
        venue = clean_venue(p["venue"], year, kind, work)
        by_year[year].append((p, authors, kind, venue, links(p, work)))

    out = [START]
    for year in sorted(by_year, reverse=True):
        out.append(f'      <div class="pub-year">\n        <div class="year-label">{year}</div>\n        <div>')
        for p, authors, kind, venue, lnks in by_year[year]:
            a = "".join(f'<a href="{html.escape(u)}">{l}</a>' for l, u in lnks)
            out.append(
                f'          <div class="pub" data-type="{kind}">\n'
                f'            <div class="pub-title">{html.escape(p["title"])}</div>\n'
                f'            <div class="pub-authors">{authors}</div>\n'
                f'            <div class="pub-venue">{html.escape(venue)} <span class="pub-type">{kind.title()}</span></div>\n'
                f'            <div class="pub-links">{a}</div>\n'
                f'          </div>')
        out.append("        </div>\n      </div>\n")
    out.append("      " + END)
    return "\n".join(out), sum(map(len, by_year.values()))


def main():
    papers = fetch_scholar()
    works = fetch_openalex()
    block, count = render(papers, works)
    page = PUBS.read_text(encoding="utf-8")
    if START not in page:
        sys.exit(f"{PUBS.name} has no {START} … {END} markers.")
    page = re.sub(re.escape(START) + ".*?" + re.escape(END), lambda _: block, page, flags=re.S)
    PUBS.write_text(page, encoding="utf-8")
    print(f"Wrote {count} publications to {PUBS.name} ({len(papers)} on Scholar, {len(works)} on OpenAlex).")


if __name__ == "__main__":
    main()
