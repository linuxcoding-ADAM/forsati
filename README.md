<div align="center">

# 🧭 FOURSSATI · فرصتي

### **One gateway to every youth opportunity.**

A modern, mobile-first community platform that centralizes the opportunities offered by **ODEJ** and local youth establishments — events, workshops, volunteering, youth centers — into a single, lightweight, accessible gateway.

[![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-ready-5EEAD4)](https://web.dev/progressive-web-apps/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-95%2B-10B981)](https://developer.chrome.com/docs/lighthouse/)
[![ECOHACK '26](https://img.shields.io/badge/ECOHACK-'26-34D399)]()

</div>

---

> **The thesis:** Young people don't lack opportunities. They lack a simple, centralized, immediate way to reach them.

---

## ⚡ Overview

**FOURSSATI** (from the Arabic *فرصتي*, "my opportunity") is the digital bridge between young people and their community.

Today, youth opportunities are scattered across Facebook pages, paper flyers, separate forms, and disconnected websites — forcing every young person to act as their own search engine. FOURSSATI replaces that fragmentation with **one gateway**, connected directly to ODEJ, where discovering and joining an opportunity takes **seconds, not an afternoon**.

It's **fast, accessible, mobile-first**, and **efficient by design** — engineered so that the common path (browsing & discovering) never even wakes a server.

> **The goal:** Centralize access. Remove friction. Reward real participation.

---

## 🧩 Features

- 🔍 **Smart Discover Feed** — relevant opportunities ranked by interest & location, served static-first. Transparent, rule-based ranking — _no heavy black-box model._
- 👆 **One Tap Join** — register for anything in a single tap. No forms, no re-login.
- 🪪 **Smart Profile** — fill your details once (`interests`, `location`, `language`); reused everywhere. The platform never asks twice.
- 🏅 **Contribution & Impact** — levels, badges, and missions that reward real involvement, not screen time.
- 📲 **QR Check-in** — a quick on-site scan confirms real attendance and updates your impact.
- 🌍 **Multilingual + RTL** — Arabic & French with native right-to-left layouts (extensible to Tamazight).
- 📶 **Low Data Mode** — strips media to the essentials for limited or costly connections.
- 🛠️ **No-code ODEJ Dashboard** — staff publish events, validate participation, and monitor engagement without a developer.

---

## 🚀 Performance & Efficiency

Efficiency here is a **consequence of good engineering**, not a marketing claim. Because the architecture is static-first and edge-cached, FOURSSATI is light on networks, devices, and servers alike.

| Metric | Target |
| --- | --- |
| 🟢 Lighthouse performance | **95+** |
| 📦 First-load page weight | **< 0.4 MB** |
| ⏱️ Time-to-Interactive | **< 1 s** |
| 🖥️ Server compute on reads | **0** (static / edge) |
| 🌱 Estimated CO₂ per visit | **< 0.1 g** |

**How:** Dark OLED-friendly UI · edge caching · lazy loading · lightweight JSON · minimal animations · mobile-first · reduced form friction.

> _All targets are independently verifiable — run Lighthouse and a public carbon calculator against the deployed build._

---

## 🏗️ Architecture

Static-first, edge-cached, query-driven — **no heavy AI in the request path**, so the system stays fast and **cannot hallucinate** ODEJ data.

```
┌──────────────┐        ┌───────────────┐
│  Youth · PWA │        │  ODEJ · Admin │
└──────┬───────┘        └───────┬───────┘
       └────────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │   Edge / CDN    │   static-first · cache · compression
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │     Next.js     │   SSG / ISR · React Server Components
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │    REST API     │   Auth · Events · Participation · Impact
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │   PostgreSQL    │   + Object Storage (optimized media)
            └─────────────────┘
```

**Two request paths:** _reads_ (navigation, discovery) are served fully static from the edge — **0 server compute**; only _writes_ (join, check-in) reach the API, with a payload of about **1 KB**.

> 📊 Detailed system, data-flow, auth, admin, and impact diagrams are available in [`/docs`](./docs).

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js** (App Router, SSG/ISR, React Server Components) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** (dark OLED-first design system) |
| Database | **PostgreSQL** |
| ORM | **Prisma** |
| Delivery | **Edge / CDN** + **PWA** (offline-capable) |
| i18n | Arabic / French with RTL support |

---

## 📦 Getting Started

### Prerequisites
- **Node.js** `18+`
- **PostgreSQL** `14+`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/fourssati.git
cd fourssati

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
#   then fill in DATABASE_URL and auth secrets

# 4. Set up the database
npx prisma migrate dev

# 5. Run the dev server
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000) to view the app.

### Build for production

```bash
npm run build
npm run start
```

---

## 🗂️ Project Structure

```
fourssati/
├── app/                 # Next.js App Router
│   ├── (youth)/         # Youth-facing PWA routes
│   ├── admin/           # No-code ODEJ dashboard
│   └── api/             # Minimal REST endpoints
├── components/          # Reusable, lightweight UI components
├── lib/                 # DB client, ranking rules, auth
├── prisma/              # Schema & migrations
├── locales/             # ar / fr translations (i18n + RTL)
├── public/              # PWA manifest, icons, static assets
└── docs/                # Architecture & data-flow diagrams
```

---

## 🗺️ Roadmap

- [ ] 🌐 Tamazight language pack
- [ ] 📍 Onboard additional wilayas & youth establishments
- [ ] 📴 Full offline-first synchronization
- [ ] 📊 Open-data exports for ODEJ engagement insights

---

## 👥 Team — Club Origo

Built for **ECOHACK '26** by Club Origo.

| Name | Role |
| --- | --- |
| _Your name_ | _Role_ |
| _Teammate_ | _Role_ |

> Replace this table with your team members.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙌 Acknowledgments

- **ODEJ** — for the mission of connecting youth with opportunity.
- **ECOHACK '26** — theme: *Bridging Youth & Opportunities*.

<div align="center">

**FOURSSATI** · فرصتي — _the lightest possible bridge between young people and opportunity._

</div>
