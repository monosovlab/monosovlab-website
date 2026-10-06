# Lab Website

A hand-built, dependency-free lab website. Plain HTML + CSS + a little JavaScript.
Open `home.html` in a browser to preview. No build step is needed.

## Files

```
lab-website/
├── home.html           Home: intro over the animated hero, then latest news
├── research.html       Research themes and funding
├── people.html         PI, members by role, alumni, "Join the lab"
├── publications.html   Papers by year, with search and type filter
├── methods.html        Approaches, plus a link to the lab GitHub
├── news.html           Full news archive by year
├── css/style.css       All styling
├── js/site.js          Header, menu, footer, animations
├── images/             people/, news/, research/
├── files/              PDFs such as a CV
└── tools/              update_publications.py
```

## Research

Edit `research.html`. Each project is one `<article class="theme">`:

- `.theme-num` is the number (`01`, `02`, …).
- `h2` is the title. The first `<p>` is the short summary shown on the page.
- Paragraphs inside `.theme-more` open when someone clicks **Read more**.
- Each `<span>` inside `.keywords` is one keyword.
- The figure is the `<img>` inside `.theme-figures`. Put the file in `images/research/`.

The **Funding** section is the prose under that heading, then the logos in `.funders`.

## People

Edit `people.html`.

- The PI is the `.pi` block at the top: photo, name, role, bio, and the links under `.person-links`.
- Members are grouped by role. Each group is an `h3.subhead` followed by a `.people-grid`. Copy a `.person` block into the right group.
- Inside a person: `h3` is the name, `.role` is the title, and the `<p>` is the introduction shown when the pointer rests on the photo (or when the photo is tapped).
- Photos go in `images/people/`. A grey placeholder is `<div class="person-photo ph"></div>`; a real photo is:

  ```html
  <div class="person-photo"><img src="images/people/jane.png" alt="Jane Doe"></div>
  ```

- Add only the links that person has, as attributes on `.person`: `data-email`, `data-github`, `data-linkedin` (handle or full URL), `data-scholar` (the `user=` ID or the full profile URL), and `data-web` (a site address). A missing attribute shows no icon.
- Alumni are `<li>` items in the `.alumni` list.
- The **Join the Lab** text is the `.cta` section at the bottom of the page.

## News

Add news only in `news.html`. The home page reads that file and shows the three newest items (by year, then date). The newest one is large, with a **Read more** link to it on the News page.

Copy a `.news-row` into the matching `.year-block`. For a new year, copy the whole `.year-block` and put the newest year first.

```html
<div class="news-row" data-img="images/news/example.png">
  <div class="date">Oct 6</div>
  <div>
    <h3><span class="tag">Publication</span>Headline</h3>
    <p>One or two sentences. <a href="https://…">Optional link</a>.</p>
  </div>
</div>
```

- `.date` is month and day (`Oct 6`). `.tag` is the label (`Publication`, `People`, and so on).
- `data-img` is optional. It is the picture on the home page. Several images are separated by commas: `data-img="images/people/a.png,images/people/b.png"`.
- Put news images in `images/news/`.

Preview the home page with a local server (`python3 -m http.server`). Opening `home.html` as a file blocks the news list.

## Methods

Edit `methods.html`. The opening paragraph and the **Approaches** section are ordinary `<p>` text. **Software & Resources** is the link to the lab GitHub.

## Publications

The paper list is generated. Do not edit the HTML between `PUBLICATIONS:START` and `PUBLICATIONS:END` in `publications.html`; the script overwrites it.

From the project folder, on your own computer (Google Scholar blocks cloud servers):

```bash
python3 tools/update_publications.py
```

Titles, venues, and years come from the PI's Google Scholar profile. The script matches each title on OpenAlex for the full author list, DOI, and open-access PDF, then rewrites `publications.html`.

Two dictionaries at the top of `tools/update_publications.py` are the places to correct the output:

- `FIXES` — keyed by the title as it appears on Google Scholar. Use it when Scholar has the wrong title or DOI.
- `EXTRA_LINKS` — keyed by the paper title. Add `"pdf"`, `"code"`, or `"data"` URLs. A `"pdf"` here replaces the open-access PDF from OpenAlex.

Check `publications.html` after the script finishes.
