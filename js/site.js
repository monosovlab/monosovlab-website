const SITE = {
  labName: "Monosov Lab",
  university: "Johns Hopkins University",
  menu: [
    { label: "Home", href: "home.html" },
    { label: "Research", href: "research.html" },
    { label: "People", href: "people.html" },
    { label: "Publications", href: "publications.html" },
    { label: "Methods", href: "methods.html" },
    { label: "News", href: "news.html" },
    { label: "Support", href: "support.html" },
  ],
  logos: [
    { label: "Johns Hopkins University", src: "images/JHU_logo.jpg", href: "https://www.jhu.edu/" },
    { label: "Laboratory of Adaptive and Maladaptive Intelligence", src: "images/lab-logo.png", href: "home.html" },
  ],
  address: ["Room 275, Maxine F. Singer Building", "3520 San Martin Dr", "Baltimore, MD 21218"],
  email: "ilya.monosov@gmail.com",
  origin: "https://jh.monosovlab.org",
};

(function seo() {
  const origin = SITE.origin;
  const file = location.pathname.split("/").pop() || "home.html";
  const path = file === "index.html" ? "home.html" : file;
  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical ? canonical.href : `${origin}/${path}`;
  const image = `${origin}/images/lab-logo.png`;
  let desc = document.querySelector('meta[name="description"]');
  if (!desc) {
    const fromPage = (document.querySelector(".lead, .hero-content .tagline, .prose p, .pi p") || {}).textContent || "";
    const text = fromPage.replace(/\s+/g, " ").trim();
    if (text) {
      desc = document.createElement("meta");
      desc.name = "description";
      desc.content = text.length > 160 ? text.slice(0, 157) + "…" : text;
      document.head.appendChild(desc);
    }
  }
  const add = (attr, key, val) => {
    if (!val || document.querySelector(`meta[${attr}="${key}"]`)) return;
    const el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.content = val;
    document.head.appendChild(el);
  };
  add("property", "og:type", path === "home.html" ? "website" : "article");
  add("property", "og:site_name", "Monosov Lab");
  add("property", "og:title", document.title);
  add("property", "og:description", desc && desc.content);
  add("property", "og:url", url);
  add("property", "og:image", image);
  add("name", "twitter:card", "summary");
  add("name", "twitter:title", document.title);
  add("name", "twitter:description", desc && desc.content);
  if (document.querySelector('script[type="application/ld+json"]')) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ResearchOrganization",
        "@id": `${origin}/#lab`,
        name: "Monosov Lab",
        alternateName: ["Laboratory of Adaptive and Maladaptive Intelligence", "LAMI"],
        url: `${origin}/`,
        logo: image,
        email: SITE.email,
        parentOrganization: { "@type": "CollegeOrUniversity", name: SITE.university },
        founder: { "@id": `${origin}/#ilya` },
      },
      {
        "@type": "Person",
        "@id": `${origin}/#ilya`,
        name: "Ilya E. Monosov",
        honorificSuffix: "PhD",
        jobTitle: "Bloomberg Distinguished Professor",
        url: `${origin}/people.html`,
        image: `${origin}/images/people/ilya-monosov.png`,
        sameAs: [
          "https://scholar.google.com/citations?user=UZ46kzgAAAAJ&hl=en",
          "https://neuroscience.jhu.edu/research/faculty/176",
        ],
      },
      { "@type": "WebSite", name: "Monosov Lab", url: `${origin}/`, publisher: { "@id": `${origin}/#lab` } },
    ],
  });
  document.head.appendChild(script);
})();

(function buildLayout() {
  const here = location.pathname.split("/").pop() || "home.html";
  const header = `
    <header class="site-header" id="header">
      <a href="home.html" class="logo">${SITE.labName}</a>
      <nav class="top-nav" aria-label="Main">
        ${SITE.menu.map(m => `<a href="${m.href}"${m.href === here ? ' class="active"' : ""}>${m.label}</a>`).join("")}
      </nav>
    </header>`;
  const logos = SITE.logos.map(l => l.src
    ? `<a href="${l.href}"><img src="${l.src}" alt="${l.label}"></a>`
    : `<a href="${l.href}" class="logo-ph">${l.label.replace(" ", "<br>")}</a>`
  ).join("");
  const footer = `
    <footer>
      <div class="foot-grid">
        <div class="foot-logos">${logos}</div>
        <div class="foot-col">
          <h4>Find Us</h4>
          <address>${SITE.address.join("<br>")}</address>
          <a href="mailto:${SITE.email}">${SITE.email}</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© ${new Date().getFullYear()} ${SITE.labName} · ${SITE.university}</span>
        <a href="#" class="to-top">Back to top ↑</a>
      </div>
    </footer>`;

  const hSlot = document.getElementById("site-header");
  const fSlot = document.getElementById("site-footer");
  if (hSlot) hSlot.outerHTML = header;
  if (fSlot) fSlot.outerHTML = footer;
  document.querySelectorAll('[data-site="address"]').forEach(el => { el.innerHTML = SITE.address.join("<br>"); });
  document.querySelectorAll('[data-site="email"]').forEach(el => { el.href = `mailto:${SITE.email}`; el.textContent = SITE.email; });

  const top = document.querySelector(".to-top");
  top && top.addEventListener("click", e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
})();

(function scrollEffects() {
  const header = document.getElementById("header");
  const onScroll = () => header && header.classList.toggle("scrolled", scrollY > 60);
  addEventListener("scroll", onScroll);
  onScroll();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
})();

(function peoplePanel() {
  const icon = (box, body, filled) => `<svg viewBox="0 0 ${box} ${box}" aria-hidden="true" ${filled
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
  const at = base => v => /^https?:\/\//.test(v) ? v : base + v.replace(/^@/, "");
  const LINKS = {
    email: { label: "Email", url: v => `mailto:${v}`,
      icon: icon(24, '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>') },
    github: { label: "GitHub", url: at("https://github.com/"),
      icon: icon(16, '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>', true) },
    linkedin: { label: "LinkedIn", url: at("https://www.linkedin.com/in/"),
      icon: icon(24, '<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>', true) },
    scholar: { label: "Google Scholar", url: at("https://scholar.google.com/citations?user="),
      icon: icon(24, '<path d="M5.24 13.77 0 9.5 12 0l12 9.5-5.24 4.27C17.55 11.25 14.98 9.5 12 9.5s-5.55 1.75-6.76 4.27zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>', true) },
    web: { label: "Website", url: at("http://"),
      icon: icon(24, '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>') },
  };
  const people = [...document.querySelectorAll(".person")].filter(p =>
    p.querySelector(".person-photo") && (p.querySelector("p") || Object.keys(LINKS).some(k => p.dataset[k])));
  if (!people.length) return;

  const panel = document.createElement("div");
  panel.className = "person-panel";
  panel.id = "person-panel";
  panel.hidden = true;
  panel.innerHTML = '<div class="panel-inner"><button class="panel-close" aria-label="Close">&times;</button><div class="panel-body"></div></div>';
  const body = panel.querySelector(".panel-body");
  let current = null;

  const render = person => {
    const intro = person.querySelector("p");
    const role = person.querySelector(".role");
    const links = Object.entries(LINKS).filter(([key]) => person.dataset[key]).map(([key, l]) =>
      `<a href="${l.url(person.dataset[key])}"${key === "email" ? "" : ' target="_blank" rel="noopener"'}>${l.icon}<span>${l.label}</span></a>`
    ).join("");
    return `<div><h3>${person.querySelector("h3").innerHTML}</h3>${role ? `<div class="panel-role">${role.innerHTML}</div>` : ""}</div>
      <div class="panel-intro">${intro ? intro.innerHTML : ""}</div>
      ${links ? `<div class="panel-links">${links}</div>` : ""}`;
  };
  const rowEnd = person => [...person.parentElement.children]
    .filter(el => el.classList.contains("person") && el.offsetTop === person.offsetTop).pop();
  const caret = () => {
    const r = current.querySelector(".person-photo").getBoundingClientRect();
    panel.style.setProperty("--caret", `${r.left + r.width / 2 - panel.getBoundingClientRect().left}px`);
  };
  const grow = () => { panel.style.height = body.offsetHeight + "px"; };
  const setActive = (person, on) => {
    person.classList.toggle("active", on);
    person.querySelector(".person-photo").setAttribute("aria-expanded", on);
  };

  function mount(fromZero) {
    panel.classList.add("instant");
    if (fromZero) panel.style.height = "0px";
    rowEnd(current).after(panel);
    panel.hidden = false;
    caret();
    if (!fromZero) grow();
    panel.offsetHeight;
    panel.classList.remove("instant");
  }

  let swapTimer, rendered = null;
  const fill = person => { body.innerHTML = render(person); rendered = person; };
  const swap = () => {
    clearTimeout(swapTimer);
    if (rendered === current) { body.classList.remove("fading"); grow(); return; }
    body.classList.add("fading");
    swapTimer = setTimeout(() => {
      if (!current) return;
      fill(current);
      body.classList.remove("fading");
      grow();
    }, 150);
  };

  // Leaves a copy of the panel collapsing in the old row while the real one opens in the new row.
  const leaveGhost = () => {
    const ghost = panel.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.classList.add("ghost");
    ghost.style.height = panel.offsetHeight + "px";
    panel.before(ghost);
    ghost.offsetHeight;
    ghost.classList.remove("open");
    ghost.style.height = "0px";
    setTimeout(() => ghost.remove(), 450);
  };

  // Keeps the element still on screen while content above it collapses.
  const anchor = (el, ms) => {
    const top = el.getBoundingClientRect().top, end = performance.now() + ms;
    const step = () => {
      scrollBy(0, el.getBoundingClientRect().top - top);
      if (performance.now() < end) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  function open(person, byHover) {
    const shown = !panel.hidden;
    const sameRow = shown && rowEnd(person) === panel.previousElementSibling;
    if (current) setActive(current, false);
    current = person;
    setActive(person, true);
    panel.classList.add("open");
    if (sameRow) {
      caret();
      swap();
    } else {
      clearTimeout(swapTimer);
      body.classList.remove("fading");
      if (shown) {
        anchor(person, 450);
        leaveGhost();
      }
      fill(person);
      mount(true);
      grow();
    }
    if (!byHover) setTimeout(() => current === person && panel.scrollIntoView({ block: "nearest", behavior: "smooth" }), 500);
  }

  function close() {
    if (!current) return;
    setActive(current, false);
    current = null;
    panel.classList.remove("open");
    panel.style.height = "0px";
  }

  panel.addEventListener("transitionend", e => {
    if (e.target === panel && e.propertyName === "height" && !current) panel.hidden = true;
  });
  panel.querySelector(".panel-close").addEventListener("click", () => {
    const person = current;
    close();
    person.querySelector(".person-photo").focus();
  });
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  addEventListener("resize", () => {
    if (!current) return;
    if (rowEnd(current) !== panel.previousElementSibling) mount(false);
    else { caret(); grow(); }
  });

  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let hoverTimer, px = 0, py = 0;
  const cancel = () => { clearTimeout(hoverTimer); hoverTimer = null; };
  const overKeep = () => {
    if (!current) return false;
    const el = document.elementFromPoint(px, py);
    if (!el) return false;
    if (current === el || current.contains(el)) return true;
    return !!el.closest("#person-panel .panel-inner");
  };
  const scheduleClose = () => {
    if (hoverTimer) return;
    hoverTimer = setTimeout(() => {
      hoverTimer = null;
      if (!overKeep()) close();
    }, 500);
  };
  if (canHover) {
    addEventListener("mousemove", e => { px = e.clientX; py = e.clientY; }, { passive: true });
    panel.querySelector(".panel-inner").addEventListener("mouseenter", cancel);
    panel.querySelector(".panel-inner").addEventListener("mouseleave", scheduleClose);
  }

  people.forEach(person => {
    const photo = person.querySelector(".person-photo");
    person.classList.add("has-panel");
    photo.tabIndex = 0;
    photo.setAttribute("role", "button");
    photo.setAttribute("aria-controls", panel.id);
    photo.setAttribute("aria-expanded", "false");
    photo.setAttribute("aria-label", `About ${person.querySelector("h3").textContent}`);
    const toggle = () => current === person ? close() : open(person);
    if (canHover) {
      person.addEventListener("mouseenter", () => {
        cancel();
        if (current !== person) open(person, true);
      });
      person.addEventListener("mouseleave", scheduleClose);
    }
    photo.addEventListener("click", () => canHover ? (cancel(), current !== person && open(person)) : toggle());
    photo.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toggle();
    });
  });
})();

(function news() {
  const MONTHS = "janfebmaraprmayjunjulaugsepoctnovdec";
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const read = doc => [...doc.querySelectorAll(".year-block")].flatMap(block => {
    const year = +block.querySelector(".year-label").textContent.trim();
    return [...block.querySelectorAll(".news-row")].map(row => {
      const h3 = row.querySelector("h3"), tag = h3.querySelector(".tag");
      const date = row.querySelector(".date").textContent.trim();
      const month = MONTHS.indexOf(date.slice(0, 3).toLowerCase()) / 3;
      const title = [...h3.childNodes].filter(n => n !== tag).map(n => n.textContent).join("").trim();
      return {
        row, title, year, month,
        when: new Date(year, Math.max(month, 0), parseInt(date.slice(3)) || 1),
        tag: tag ? tag.textContent.trim() : "",
        text: (row.querySelector("p") || {}).innerHTML || "",
        img: (row.dataset.img || "").split(",").map(s => s.trim()).filter(Boolean),
        id: slug(`${year} ${date} ${title}`),
      };
    });
  }).sort((a, b) => b.when - a.when);

  if (document.querySelector(".news-row")) {
    read(document).forEach(n => { n.row.id = n.id; });
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ block: "center" });
      target.classList.add("highlight");
      setTimeout(() => target.classList.remove("highlight"), 2500);
    }
  }

  const grid = document.querySelector("[data-latest-news]");
  if (!grid) return;
  const card = (n, featured) => {
    const href = `news.html#${n.id}`;
    const meta = `${n.month >= 0 ? MONTHS.substr(n.month * 3, 3).replace(/^./, c => c.toUpperCase()) + " " : ""}${n.year}`;
    const pics = n.img.map(src => `<img src="${src}" alt="">`).join("");
    return `<article class="news-card${featured ? " featured" : ""}">
      <div class="news-img${n.img.length ? "" : " ph"}">${pics || "News image"}</div>
      <div class="news-body">
        <div class="news-meta">${meta}${n.tag ? ` <span class="tag">${n.tag}</span>` : ""}</div>
        <h3><a href="${href}">${n.title}</a></h3>
        <p>${n.text}</p>
        ${featured ? `<a href="${href}" class="more">Read more</a>` : ""}
      </div>
    </article>`;
  };
  fetch("news.html", { cache: "no-cache" })
    .then(r => r.text())
    .then(html => {
      const items = read(new DOMParser().parseFromString(html, "text/html")).slice(0, 3);
      grid.innerHTML = items.map((n, i) => card(n, i === 0)).join("");
    })
    .catch(() => { grid.innerHTML = '<p>See all news on the <a href="news.html">News page</a>.</p>'; });
})();

(function projectOpen() {
  const themes = [...document.querySelectorAll(".theme")];
  if (!themes.length) return;
  const panel = document.createElement("div");
  panel.className = "theme-panel";
  panel.id = "theme-panel";
  panel.hidden = true;
  panel.innerHTML = '<div class="panel-inner"><button class="panel-close" type="button" aria-label="Close">&times;</button><div class="panel-body"></div></div>';
  const body = panel.querySelector(".panel-body");
  let current = null;

  const render = theme => {
    const more = theme.querySelector(".theme-more");
    const first = theme.querySelector(".theme-text > p");
    const rest = more ? more.innerHTML : "";
    const keys = theme.querySelector(".keywords");
    return `<div><div class="theme-num">${theme.querySelector(".theme-num").textContent}</div>
      <h3>${theme.querySelector("h2").innerHTML}</h3></div>
      <div class="panel-intro">${first ? first.outerHTML : ""}${rest}</div>
      ${keys ? keys.outerHTML : ""}`;
  };
  const rowEnd = theme => [...theme.parentElement.children]
    .filter(el => el.classList.contains("theme") && el.offsetTop === theme.offsetTop).pop();
  const caret = () => {
    const r = current.getBoundingClientRect();
    panel.style.setProperty("--caret", `${r.left + r.width / 2 - panel.getBoundingClientRect().left}px`);
  };
  const grow = () => { panel.style.height = body.offsetHeight + "px"; };
  const setActive = (theme, on) => {
    theme.classList.toggle("active", on);
    theme.querySelector(".more")?.setAttribute("aria-expanded", on);
  };

  function mount(fromZero) {
    panel.classList.add("instant");
    if (fromZero) panel.style.height = "0px";
    rowEnd(current).after(panel);
    panel.hidden = false;
    caret();
    if (!fromZero) grow();
    panel.offsetHeight;
    panel.classList.remove("instant");
  }

  function open(theme) {
    const shown = !panel.hidden;
    const sameRow = shown && rowEnd(theme) === panel.previousElementSibling;
    if (current) setActive(current, false);
    current = theme;
    setActive(theme, true);
    body.innerHTML = render(theme);
    panel.classList.add("open");
    if (sameRow) { caret(); grow(); }
    else {
      if (shown) {
        const top = theme.getBoundingClientRect().top;
        mount(true);
        grow();
        scrollBy(0, theme.getBoundingClientRect().top - top);
      } else {
        mount(true);
        grow();
      }
    }
    setTimeout(() => current === theme && panel.scrollIntoView({ block: "nearest", behavior: "smooth" }), 400);
  }

  function close() {
    if (!current) return;
    setActive(current, false);
    current = null;
    panel.classList.remove("open");
    panel.style.height = "0px";
  }

  panel.addEventListener("transitionend", e => {
    if (e.target === panel && e.propertyName === "height" && !current) panel.hidden = true;
  });
  panel.querySelector(".panel-close").addEventListener("click", close);
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  addEventListener("resize", () => {
    if (!current) return;
    if (rowEnd(current) !== panel.previousElementSibling) mount(false);
    else { caret(); grow(); }
  });

  themes.forEach(theme => {
    const btn = theme.querySelector(".more");
    if (!btn) return;
    btn.setAttribute("aria-controls", panel.id);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", e => {
      e.preventDefault();
      current === theme ? close() : open(theme);
    });
  });
})();

(function lightbox() {
  const figures = document.querySelectorAll(".theme-figures img");
  if (!figures.length) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = '<img alt=""><p></p>';
  document.body.append(box);
  const [img, caption] = box.children;
  const close = () => box.classList.remove("open");
  figures.forEach(f => f.addEventListener("click", () => {
    img.src = f.currentSrc || f.src;
    img.alt = f.alt;
    caption.textContent = f.closest("figure")?.querySelector("figcaption")?.textContent || "";
    box.classList.add("open");
  }));
  box.addEventListener("click", close);
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();

document.querySelectorAll("canvas.network").forEach(canvas => {
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = devicePixelRatio || 1;
  const LINK = 140, MOUSE_R = 180, PUSH = 0.6;
  const mouse = { x: -9999, y: -9999, active: false };
  let w, h, nodes;
  const hero = canvas.parentElement;

  hero.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
    if (reduce) draw();
  });
  hero.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = mouse.y = -9999;
    if (reduce) draw();
  });

  function init() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = Array.from({ length: Math.round((w * h) / 16000) }, () => {
      const vx = (Math.random() - .5) * .25, vy = (Math.random() - .5) * .25;
      return { x: Math.random() * w, y: Math.random() * h, vx, vy, bvx: vx, bvy: vy, r: Math.random() * 1.8 + .6 };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d >= LINK) continue;
        ctx.strokeStyle = `rgba(165,148,249,${(1 - d / LINK) * .35})`;
        ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    if (mouse.active) {
      nodes.forEach(n => {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d < MOUSE_R) {
          ctx.strokeStyle = `rgba(210,200,255,${(1 - d / MOUSE_R) * .5})`;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
        }
      });
    }
    nodes.forEach(n => {
      const d = mouse.active ? Math.hypot(n.x - mouse.x, n.y - mouse.y) : Infinity;
      const glow = d < MOUSE_R ? 1 - d / MOUSE_R : 0;
      ctx.fillStyle = `rgba(210,200,255,${.75 + glow * .25})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + glow * 1.4, 0, Math.PI * 2); ctx.fill();
    });
  }

  function step() {
    nodes.forEach(n => {
      if (mouse.active) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < MOUSE_R && d > 0.1) {
          const f = (1 - d / MOUSE_R) * PUSH * 0.05;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
      }
      n.vx += (n.bvx - n.vx) * 0.02;
      n.vy += (n.bvy - n.vy) * 0.02;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx); n.bvx = Math.abs(n.bvx); }
      if (n.x > w) { n.x = w; n.vx = -Math.abs(n.vx); n.bvx = -Math.abs(n.bvx); }
      if (n.y < 0) { n.y = 0; n.vy = Math.abs(n.vy); n.bvy = Math.abs(n.bvy); }
      if (n.y > h) { n.y = h; n.vy = -Math.abs(n.vy); n.bvy = -Math.abs(n.bvy); }
    });
    draw();
    requestAnimationFrame(step);
  }

  init();
  addEventListener("resize", () => { init(); if (reduce) draw(); });
  reduce ? draw() : step();
});

(function publications() {
  const search = document.querySelector(".pub-search");
  const buttons = document.querySelectorAll(".pub-filters button");
  if (!search && !buttons.length) return;
  let type = "all";
  const apply = () => {
    const q = (search ? search.value : "").trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll(".pub-year").forEach(year => {
      let yearShown = 0;
      year.querySelectorAll(".pub").forEach(p => {
        const ok = (type === "all" || p.dataset.type === type) && (!q || p.textContent.toLowerCase().includes(q));
        p.style.display = ok ? "" : "none";
        if (ok) yearShown++;
      });
      year.style.display = yearShown ? "" : "none";
      shown += yearShown;
    });
    const empty = document.querySelector(".pub-empty");
    if (empty) empty.style.display = shown ? "none" : "block";
  };
  search && search.addEventListener("input", apply);
  buttons.forEach(b => b.addEventListener("click", () => {
    buttons.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    type = b.dataset.filter;
    apply();
  }));
})();
