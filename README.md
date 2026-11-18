# X Society

Marketing site for X Society, a (fictional) Chicago-based collective of TikTok and Instagram
creators in Atlanta, Chicago, Brooklyn, Louisville and Austin. Plain HTML, CSS and JavaScript,
with Wix Headless as the CMS (creator profiles) and Wix Forms (contact form).

## Pages

| Page | File | Data |
| --- | --- | --- |
| Home | `index.html` | Static, plus the "Meet the Roster" strip read from the Wix CMS |
| Creators | `influencers.html` | Wix CMS collection `Influencers` (6 creators, city filter) |
| Contact | `contact.html` | Wix Forms form "Work With Us" |

## Layout

- `src/` – source pages, CSS, JS. Pages use `{{> partial}}` includes and `{{img:key:WxH}}` /
  `{{vid:...}}` tokens that point at files in the Wix Media Manager.
- `build.py` – expands the tokens and includes into `dist/` (and a local `preview/` that uses
  the mocks in `mock/`). Run `python3 build.py` after editing `src/`, then commit `dist/`.
- `dist/` – the built site that Vercel serves.
- `site/fonts/moka.woff` – heading font.

## Wix

- Wix site ID: `709b354b-aaf9-4a72-b7c6-00570d3e50f8`
- Headless client (app) ID: `214ce0c6-1a6a-454e-a9e6-b7080a303a32`
- The Wix browser modules (`/js/wix/*.js`) are not stored in this repo. `vercel.json`
  rewrites `/js/wix/*` to the same files on the Wix-hosted copy of the site, so they stay in
  sync with Wix. Edit creators in the Wix dashboard under CMS → Influencers; edit the form under
  Forms.

## Deploy on Vercel

Import the repo in Vercel with the default settings ("Other" framework). `vercel.json` sets the
output directory to `dist` and the `/js/wix` rewrite; there is no build step.

## Local preview

```bash
python3 build.py
cd preview && python3 -m http.server 8765
```

The preview uses mocked Wix modules and expects the generated images in `media/`
(not committed), so images will be missing unless you add them there.
