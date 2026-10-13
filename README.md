# Sweep — Demo

A redesigned, fully static demo of the Sweep web3 ecosystem: homepage (video hero, live
SWEEP/USDT ticker, token sale, airdrop), an **Airdrop** page with a playable Sweepbird game,
**17 playable mini-games** (Crash, Plinko, Mines, Dice, Wheel, Coin Flip, Tower, Cases,
Upgrade, Hi-Lo, Racing, Fighter, Click, Market, Trade, Sport, Sweepstake), a **Sweep Perp**
launch section, auth / How-it-works / live-chat modals, EN/TR language toggle, and legal pages.

> Demo / play-money only. Game outcomes are simulated for preview purposes.

## Pages
- `index.html` — homepage
- `airdrop.html` — airdrop + Sweepbird game
- `game.html` — games lobby · `game.html?g=crash` — a specific game
- `docs.html` · `help.html` · `terms.html` · `privacy.html`

## Run locally
No build step — it's plain HTML/CSS/JS.
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

### GitHub Pages
Push to GitHub and enable Pages (Settings → Pages → Branch: `main` / root). `.nojekyll`
is included so every file is served as-is.

### Render (Static Site)
A `render.yaml` blueprint is included. On Render: **New → Blueprint**, pick this repo.
Or **New → Static Site** with Publish Directory `.` and no build command.

## Notes
- Fonts/logo are inlined. The hero video, wallet icons, and How-it-works images load from
  `sweep.finance` / `cdn.sweep.finance` over HTTPS.
- The **Sweep Perp** button opens the KAAN PLATFORM TRADE perp app. On localhost/LAN it
  targets `:3300`; for production set `PERP_DEPLOYED` in `app.js` to your deployed perp URL.
