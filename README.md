# Kotori's Blue Archive Personality Tool

A responsive fan-made page for GitHub Pages. Visitors can search the current student roster, choose any number of students, assign each a personal similarity rating from 0–100, and see the ratings as a pie chart. Portraits appear with the sliders and beside each student label around the pie. Results can be saved as a PNG.

## Run locally

Serve this folder with any static web server to use the live roster refresh and local JSON copy:

```sh
python3 -m http.server 8000
```

Visit `http://localhost:8000` if you started the server inside this folder. If you started it from the parent folder, visit `http://localhost:8000/blue-archive-personality-pie/`.

## Publish with GitHub Pages

1. Replace `index.html`, `app.js`, and `styles.css` at the root of your GitHub repository. Keep the files together at the repository root, not inside a nested project folder. The editable chart title and page text are in `index.html`; the complete roster is embedded in `app.js`, so GitHub does not need to upload a `data/` folder for student search to work. You can also upload `data/students.json` as a reference copy.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Open the Pages URL after GitHub finishes deploying.

No build step, API key, or server is required. Lineups and ratings stay in each visitor’s browser and are not sent anywhere.

## Roster and portraits

- `app.js` embeds the 278 playable-student roster entries available on October 16, 2026. Entries use SchaleDB student IDs so alternate versions with the same display name stay distinct. `data/students.json` is a reference copy; the app does not require it.
- On page load, the app makes the embedded roster available immediately, then checks the public [Yuzu Trends student feed](https://yuzutrends.app/txt/en/students.txt) for updates. If the feed is unreachable, search still works from the embedded snapshot.
- Portrait URLs are generated from each SchaleDB ID. The page tries SchaleDB’s image host first and its GitHub image repository as a backup. If both image hosts fail for a portrait, the student’s initials remain visible.
- The feed currently identifies its source as [SchaleDB](https://schaledb.com/). This is a community-maintained playable roster, not an official Nexon API; it does not include every non-playable story character page that may appear in the Fandom category. New game releases appear when the feed is updated upstream. To refresh the offline snapshot too, update both `BUNDLED_ROSTER` in `app.js` and the JSON reference copy.

## Chart behavior

- Slider values are personal ratings, not official character statistics. The pie chart converts them to shares of their combined total and shows percentages inside the slices.
- Every portrait-and-name marker is placed at the angular midpoint of its corresponding slice and moves when a slider changes.
- A zero rating has no visible slice, so its marker sits at that slice’s boundary. If all ratings are zero, the chart shows a neutral disc and the markers use equal spacing.

## Files

- `index.html` — page structure and source attribution
- `styles.css` — responsive design and chart-side portrait layout
- `app.js` — roster loading, student selection, sliders, chart rendering, and local saving
- `data/students.json` — reference copy of the bundled roster; optional for GitHub Pages

Unofficial fan-made tool. Blue Archive is owned by NEXON Games.
