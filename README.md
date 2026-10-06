# Lab Website

A hand-built, dependency-free lab website. Plain HTML + CSS + a little JavaScript.
Open `home.html` in a browser to preview. No build step is needed.

## Files

```
lab-website/
├── home.html           Home: intro over the animated hero, then latest news
├── research.html       Overview, research themes (text, then a row of figures), funders
├── people.html         PI, members by role, alumni, "Join the lab"
├── publications.html   Papers by year, with search and type filter
├── methods.html        Technique cards, software & resources list
├── news.html           Full news archive by year
├── css/style.css       All styling (colors & fonts at the top)
├── js/site.js          Header, menu, footer, animations (settings at the top)
├── images/             people/, news/, research/ (put your images here)
└── files/              PDFs such as a CV
```

## Where to edit what

| To change…                           | Edit                                            |
|--------------------------------------|-------------------------------------------------|
| Lab name, menu items, footer, logos  | `SITE` block at the top of `js/site.js` (once, for every page) |
| Colors, fonts                        | `:root` block at the top of `css/style.css`     |
| Page content                         | That page's `.html` file                        |

## Replacing placeholders

- **Images:** every grey box has the class `ph`. Replace it with a real image, keeping the other class:
  ```html
  <div class="person-photo ph">Photo</div>
  <!-- becomes -->
  <div class="person-photo"><img src="images/people/jane.jpg" alt="Jane Doe"></div>
  ```
  People photos of any size are cropped to the frame (3:4 portrait for members, 4:5 for the PI),
  centered slightly above the middle so faces stay in view.
- **Footer logos:** in `js/site.js`, set `src: "images/univ-logo.png"` on each logo.
- **Hero photo instead of the network:** delete `<canvas class="network">` in the page, and in `css/style.css`
  change the `.hero` background to `url("../images/hero.jpg") center / cover`.
- **Network behavior:** `LINK`, `MOUSE_R` and `PUSH` in `js/site.js`.

## Adding content

Each repeatable item has a comment above it saying "copy this block".
- News: add a `.news-row` to `news.html` only. The home page reads that page and shows the three newest items
  (by year and date), the newest one large with a "Read more" link to it on the News page. Add
  `data-img="images/news/….jpg"` to a row to give it a picture on the home page. Preview with a local server
  (`python3 -m http.server`), since browsers block this when `home.html` is opened as a file.
- Publications: generated from the PI's Google Scholar profile. Run `python3 tools/update_publications.py`
  on your own computer (Google Scholar blocks cloud servers), check `publications.html`, then commit.
  It fills in full author lists, DOIs and open-access PDFs from OpenAlex.
  Each paper gets a DOI link (or arXiv/bioRxiv if it has no DOI), then PDF, Code and Data; add code and
  data links in `EXTRA_LINKS` at the top of the script.
  Anything between the `PUBLICATIONS:START` and `PUBLICATIONS:END` markers is overwritten, so fix wrong
  Scholar entries in `FIXES` at the top of the script rather than in the HTML.
- People: copy a `.person` block. The `<p>` is the self-introduction shown in the banner that opens
  under the row when the mouse rests on the photo (or when it is tapped on touch screens).
  Add only the links that person has: `data-email`, `data-github`, `data-linkedin` (handle or full URL),
  `data-scholar` (the `user=` ID from the Google Scholar profile URL, or the full URL),
  `data-web` (a site address; a plain domain opens as `http://`, write `https://…` to force HTTPS). Missing ones get no icon.
- New page: copy any inner page, change its hero and content, and add it to `SITE.menu` in `js/site.js`.

## Hosting (DreamHost)

The site is served from DreamHost. `.htaccess` makes `home.html` the page for the bare domain.
Every push to `main` runs `.github/workflows/deploy.yml`, which uploads the site to DreamHost over SFTP.
To contribute, open a pull request; the site updates once it is merged into `main`.

One-time setup:

1. On your computer, create a key used only for deploys:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/dreamhost_deploy -N ""
   ```
2. The DreamHost user is SFTP-only, so `ssh-copy-id` does not work. With an SFTP client (e.g. Cyberduck,
   with hidden files shown), create `~/.ssh/authorized_keys` in the user's home, paste in the contents of
   `~/.ssh/dreamhost_deploy.pub`, and set permissions to `700` on `.ssh` and `600` on `authorized_keys`.
3. In the GitHub repo, go to Settings → Secrets and variables → Actions and add:

   | Secret              | Value                                                   |
   |---------------------|---------------------------------------------------------|
   | `DREAMHOST_HOST`    | the host name, e.g. `jh.monosovlab.org`                 |
   | `DREAMHOST_USER`    | the SFTP user name                                      |
   | `DREAMHOST_PATH`    | the website directory, e.g. `/home/USER/jh.monosovlab.org` |
   | `DREAMHOST_SSH_KEY` | the contents of `~/.ssh/dreamhost_deploy` (private key) |

4. Run the workflow once from the Actions tab (Deploy to DreamHost → Run workflow) to check it works.

Deploys only add and update files; a file deleted from the repo must also be deleted on DreamHost.
