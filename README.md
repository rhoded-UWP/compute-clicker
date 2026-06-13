# Scale or Die AI

https://compute-clicker.onrender.com/

An incremental/clicker game in the spirit of Cookie Clicker, built to teach
intro CS students real computing vocabulary — bytes through exabytes, RAM vs
storage vs VRAM, CPUs vs GPUs, racks, data centers, megawatts — and the power
of exponential growth, by letting them *hit the bottlenecks themselves*.

Press the dev key. Write code. Code earns money. Money buys hardware.
Hardware hits bottlenecks. Bottlenecks teach computer science.

**100% static site: plain HTML, CSS, and JavaScript. No Node.js, no build
step, no frameworks.** The full game-economy design lives in
[economy.md](economy.md).

---

## Run it locally

Option 1 — just open it:

> Double-click `index.html`. That's it.

Option 2 — local web server (closer to how Render serves it):

```
python -m http.server 8000
```

Then visit http://localhost:8000

---

## Project structure

```
index.html        Page structure (panels, meters, shop, log)
css/style.css     All styling — amber CRT terminal theme
js/data.js        ALL game balance lives here: producers, upgrades,
                  projects, research, events, flavor text.
                  Tweak the economy in this file, not in engine.js.
js/engine.js      Game state + math (bottleneck formula, power/cooling,
                  prestige, save/load). No DOM code.
js/ui.js          Rendering. Reads state, writes DOM.
js/main.js        Game loop, input wiring, boot sequence.
economy.md        The design document the game implements.
smoke-test.js     Quick balance check: `node smoke-test.js`
                  (optional — only needed if you tweak js/data.js)
```

## Game systems implemented

- **Core loop** — `money/sec = code/sec × code value × project value ×
  bottleneck efficiency × uptime` (see economy.md)
- **Bottleneck system** — projects need storage, RAM, compute, GPUs, and
  VRAM; the weakest resource throttles everything (and is called out by name)
- **Exponential costs** — `cost = base × growth^owned`; RAM/storage
  purchases *double* capacity each time so students watch 4 MB become
  131 GB in 15 buys
- **Unit ladder** — KB → MB → GB → TB → PB → EB unlock announcements
- **KB/KiB toggle** — switch between decimal (×1000) and binary (×1024)
  units in the shop footer; great for a class discussion
- **Power & cooling** — servers draw kilowatts, cooling adds overhead,
  capacity shortfalls throttle output, and the electric bill is visible
- **Rack slots** — 4 closet slots free; after that, servers need 42U racks
  (21 × 2U servers each). Hardware is physical.
- **Uptime nines** — 95% → 99% → 99.9% → 99.99% via reliability upgrades
- **Random events** — memory leaks, cache hit streaks, full disks, GPU
  driver roulette, power spikes, grant funding
- **Prestige** — "publish a breakthrough paper" at $100M lifetime earnings
  to earn permanent Research Points spent on CS topics (Algorithms, Data
  Structures, OS, Networking, ML, Security, Sustainability)
- **Saves** — autosaves to the browser's localStorage every 15s, with 50%
  offline earnings (capped at 8 hours)

---

## Put it on GitHub

From this folder (one-time setup; the repo is already initialized):

1. Create a new **empty** repository on GitHub (no README, no .gitignore —
   we already have them). Suggested name: `compute-clicker`.
2. Connect and push:

```
git remote add origin https://github.com/YOUR_USERNAME/compute-clicker.git
git branch -M main
git push -u origin main
```

After that, day-to-day updates are:

```
git add .
git commit -m "Describe your change"
git push
```

---

## Deploy on Render (free static site)

1. Sign in at https://render.com (you can sign in with GitHub).
2. Click **New → Static Site**.
3. Connect your GitHub account and pick the `compute-clicker` repository.
4. Settings:
   - **Branch:** `main`
   - **Build Command:** *(leave empty — there is no build step)*
   - **Publish Directory:** `.`
5. Click **Create Static Site**.

Render gives you a URL like `https://compute-clicker.onrender.com`. Every
`git push` to `main` redeploys automatically.

> Tip: GitHub Pages works identically for this project if you ever want a
> second mirror — Settings → Pages → deploy from `main`, root folder.

---

## Tweaking the game for your class

- **All balance numbers** are in `js/data.js` with comments. Costs, growth
  rates, project requirements, flavor text — change them freely.
- **The design rationale** for every number is in `economy.md`.
- After balance changes, run `node smoke-test.js` (if you have Node
  installed) to sanity-check income at several game stages — or just
  playtest in the browser.
- Player progress saves per-browser in localStorage under the key
  `compute-clicker-v2`. The **⟪ WIPE ⟫** button in the shop footer resets
  a student's save.

## Roadmap

- Animated assets (planned) to enhance the look and feel
- More random events and achievements
- Optional class "speed-run" mode

---

Built with plain HTML/CSS/JS. Design doc: [economy.md](economy.md).
