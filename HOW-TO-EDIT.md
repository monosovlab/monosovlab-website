# How to update the lab website

You do **not** need to know Git.

The live site is built from the files in this repository. When those files change on the `main` branch, the website updates by itself. Do not upload files to DreamHost or edit the live server.

If you get stuck, please ask Beiya for help. (Or ChatGPT :D)

## One-time setup

1. Create a free account at [github.com](https://github.com/signup) if you do not have one.
2. Ask to be added to our organization. You cannot edit the repo until you are invited. Accept the email invite.
3. Install [GitHub Desktop](https://desktop.github.com/). Open it and sign in with the same GitHub account.
4. In GitHub Desktop: **File → Clone Repository**. Pick this lab website repo (or paste the repo URL). Choose a folder on your computer, then **Clone**.

That folder is now your local copy. You will edit files there, then send them back to GitHub.

## Every time you make a change

Do this in order. Skipping **Fetch** is how two people overwrite each other.

1. Open GitHub Desktop. Make sure this website repo is selected in the top-left.
2. Click **Fetch origin**, then **Pull origin** if a pull button appears. This downloads other people’s updates first.
3. Edit the files (see below). Add new photos to the matching folder under `images/`.
4. Preview on your computer before you publish:
   - Double-click the `.html` file you changed and open it in a browser.
   - For the **home** page news list, double-clicking the file is not enough. In Terminal, `cd` into the website folder and run `python3 -m http.server`, then open [http://localhost:8000/home.html](http://localhost:8000/home.html).
5. Back in GitHub Desktop, you will see the changed files listed. Check that the list matches what you meant to change.
6. In the bottom-left box, write a short summary in plain English, for example `Add XXX to People` or `News: Sep 15 welcome`.
7. Click **Commit to main**, then **Push origin**.
8. On GitHub, open the **Actions** tab. Wait until **Deploy to DreamHost** is green. Then refresh the live site (you may need to force-refresh: `Cmd-Shift-R` on a Mac).

If Actions is red, do not keep pushing. Send the failed log to whoever maintains the site.

### Tiny text-only edits (optional)

For a one-line typo, you can skip GitHub Desktop:

1. Open the file on github.com.
2. Click the pencil icon (**Edit this file**).
3. Change the text.
4. Scroll down, write a short commit message, commit directly to `main`.

Use GitHub Desktop instead when you add photos or change several files.

## Which file to edit

```
├── home.html           Home intro. Latest news is pulled from news.html; do not add news here
├── research.html       Research themes and funding
├── people.html         PI, members, Join the lab
├── publications.html   Paper list (generated — see Publications below)
├── methods.html        Approaches and the GitHub link
├── news.html           News archive. Edit news only here
├── css/style.css       Colors and layout (usually leave this alone)
├── js/site.js          Header, menu, footer (lab name, address, logos)
├── images/people/      Member photos
├── images/news/        News photos
├── images/research/    Research figures and funder logos
└── tools/              Script that rebuilds the publications list
```

Change page wording in that page’s `.html` file. Copy an existing block, then change the text. Do not invent new class names.

## Research

Edit `research.html`. Each project is one `<article class="theme">`.

- `.theme-num` is the number (`01`, `02`, …).
- `h2` is the title. The first `<p>` is the short summary.
- Paragraphs inside `.theme-more` appear after **Read more**.
- Each `<span>` inside `.keywords` is one keyword.
- The figure is the `<img>` inside `.theme-figures`. Put the file in `images/research/`.

The **Funding** section is the paragraphs under that heading, then the logos in `.funders`.

## People

Edit `people.html`.

- The PI is the `.pi` block at the top.
- Members are grouped by role. Each group is an `h3.subhead` followed by a `.people-grid`. Copy a `.person` block into the right group.
- `h3` is the name, `.role` is the title, and the `<p>` is the intro that appears when someone rests on the photo (or taps it).
- Photos go in `images/people/`. Use a short lowercase filename, such as `jane-doe.png`.

Grey placeholder:

```html
<div class="person-photo ph"></div>
```

Real photo:

```html
<div class="person-photo"><img src="images/people/jane-doe.png" alt="Jane Doe"></div>
```

Add only the links that person has, as attributes on `.person`:

- `data-email`
- `data-github`
- `data-linkedin` (handle or full URL)
- `data-scholar` (the `user=` ID from Google Scholar, or the full URL)
- `data-web` (a site address)

A missing attribute shows no icon. **Join the Lab** is the `.cta` section at the bottom.

## News

Edit **only** `news.html`. The home page shows the three newest items from this file (newest year, then date). Do not add news to `home.html`.

Copy a `.news-row` into the matching `.year-block`. For a new calendar year, copy a whole `.year-block` and put the newest year first.

```html
<div class="news-row" data-img="images/news/example.png">
  <div class="date">Oct 6</div>
  <div>
    <h3><span class="tag">Publication</span>Headline</h3>
    <p>One or two sentences. <a href="https://…">Optional link</a>.</p>
  </div>
</div>
```

- `.date` is month and day (`Oct 6`), not the year. The year is the `.year-label` above the block.
- `.tag` is the label (`Publication`, `People`, and so on).
- `data-img` is optional. It is the picture on the home page. Several images are separated by commas, with no spaces: `data-img="images/people/a.png,images/people/b.png"`.
- Put news images in `images/news/`.

## Methods

Edit `methods.html`. The opening paragraph and **Approaches** are ordinary `<p>` text. **Software & Resources** is the link to the lab GitHub.

## Publications

Do **not** type papers into `publications.html` by hand. Anything between `PUBLICATIONS:START` and `PUBLICATIONS:END` is overwritten by a script.

On your own computer, from the website folder (Google Scholar blocks cloud servers):

```bash
python3 tools/update_publications.py
```

Then open `publications.html` in a browser and check the list. If it looks right, commit and push both `publications.html` and, if you changed them, `tools/update_publications.py`.

If Google Scholar has the wrong title or DOI, fix it in `FIXES` at the top of `tools/update_publications.py`, keyed by the title as it appears on Scholar. To add PDF / code / data links, use `EXTRA_LINKS` in the same file, keyed by the paper title.

## Please do not

- Edit the live website with Cyberduck, an FTP app, or the DreamHost panel. The next GitHub deploy will overwrite those edits.
- Commit to any branch other than `main` unless you were asked to.
- Push if **Fetch origin** shows other people’s changes you have not pulled yet.
- Put passwords, private keys, or secrets in any file in this repo.
- Reformat a whole HTML file, or mix tabs and spaces, when you only needed to change one block. Copy a nearby block instead.
