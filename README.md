# Student Sync — Blue Archive Personality Match

A responsive fan-made page for GitHub Pages. Visitors choose up to five students, give each a personal similarity rating from 0–100, and see those ratings divided into a pie chart. Portraits and the roster are loaded from the Blue Archive Wiki’s Fandom API; selected portraits and names appear around the chart.

## Run locally

Open `index.html` in a browser, or serve the project folder with any static web server. The app requests the wiki API and loads its fallback roster from `data/students.json`, so use a local server if your browser blocks JSON fetches from `file://` URLs.

For example, with Python installed:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000` and open the `blue-archive-personality-pie` folder if you launched the server from its parent directory.

## Publish with GitHub Pages

1. Create a GitHub repository and put the contents of this folder at the repository root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. GitHub Pages will publish the page at the repository's Pages URL.

No build step, API key, or server is required. The app saves the current lineup in the visitor's browser `localStorage`; no ratings are sent anywhere.

## Wiki API, roster, and chart behavior

- At startup, `app.js` calls the MediaWiki Action API on the [Blue Archive Wiki’s Students category](https://bluearchive.fandom.com/wiki/Category:Students) to enumerate category pages. It then calls the PageImages API in batches for page thumbnails. New wiki entries can appear without editing the site.
- The cross-origin API request uses `origin=*`. The wiki must permit browser CORS requests from the GitHub Pages site for live roster and portrait loading. If it cannot be reached, the page reports that and uses `data/students.json` as a starter fallback; that fallback is not guaranteed to include every wiki entry and has no portrait URLs.
- Edit `data/students.json` to change the fallback roster. It is a list of names, one string per entry.
- Slider values are personal ratings, not official character statistics. The pie chart normalizes selected scores to shares of their combined total. If all scores are zero, the chart shows a neutral disc and the shares read 0%.
- Student portraits are served directly from the wiki image URLs returned by the API. A page may have no thumbnail or the image host may reject a request, in which case the app displays the student’s initials.
- Student names, images, and the fan-made page are not affiliated with or endorsed by Nexon.

## Files

- `index.html` — page content and structure
- `styles.css` — responsive design and chart-side portrait layout
- `app.js` — Fandom API loading, student selection, sliders, chart rendering, and local saving
- `data/students.json` — fallback student roster
