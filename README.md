<div align="center">

<img src="./public/logo.png" alt="FORSATI" width="120" />

# FORSATI · فرصتي

### **Discover your opportunity.**

A personalized youth-opportunity discovery platform that connects young Algerians to **ODEJ** youth establishments — built on real **ODEJ Béjaïa** data.

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ECOHACK '26](https://img.shields.io/badge/ECOHACK-'26-16a34a)]()

**Made by SUDOTeam**

</div>

---

> **The idea:** Young people don't lack opportunities — they lack a simple, centralized way to reach them.

---

## ⚡ Overview

**FORSATI** (from the Arabic *فرصتي*, "my opportunity") is a mobile-first web app that brings the youth opportunities offered by **ODEJ** — youth houses, sports complexes, science centers, hostels, camps — into a single place.

It matches each young person with the right institutions using a **deterministic recommendation engine** (interests + location), lets them register for events and check in with a **QR ticket**, and works in **four languages** including **Kabyle**.

The current dataset covers the **wilaya of Béjaïa (06)** and follows a schema designed to scale to all 58 wilayas.

---

## 🧩 Features

- 🧭 **Discover feed** — personalized institution & opportunity recommendations based on your interests and wilaya.
- 🤖 **Assistant** — ask in natural words (e.g. *"sport in Akbou"*) and get matching ODEJ institutions, via keyword search over the local dataset.
- 🎟️ **Events & registration** — dynamic registration forms and a **QR ticket** generated for each participant.
- 📷 **QR check-in (admin)** — staff scan tickets on-site to confirm real attendance.
- 🏛️ **Institutions** — browse ODEJ youth establishments with details, categories, and contact info.
- 💬 **Community** — a simple post feed for sharing and discussion.
- 📊 **Dashboard** — a personal view of the user's activity.
- 🛠️ **Admin dashboard** — manage content and validate participation.
- 🌍 **Multilingual + RTL** — **Arabic, French, English, Kabyle (kab)**, with right-to-left layout (Arabic by default).
- 🔐 **Authentication** — email/password and Google sign-in (Firebase Auth).
- 🚀 **Onboarding** — quick profile setup (interests, wilaya) that powers recommendations.

---

## 🌱 Efficiency by design

FORSATI keeps things light on purpose — not as a marketing claim, but as engineering choices:

- 🧮 **No-AI recommendation engine** — `lib/recommend.ts` is a pure scoring function (interests + wilaya). _No model, no API calls, runs locally in ~1 ms._
- 🔎 **Local dataset search** — the assistant reads a bundled JSON dataset, so answers come from real ODEJ data and never hallucinate.
- 🌑 **Dark-first UI** — default `#0a0a0a` theme, OLED-friendly and easy on the eyes.
- 🪶 **Lightweight dependencies** — `lucide-react` icons, minimal animations (`fade-in` / `fade-up`), no heavy UI framework.
- 🖼️ **Next.js image optimization** — assets served efficiently out of the box.

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript**, **React 18** |
| Styling | **Tailwind CSS** (custom dark theme) |
| Auth | **Firebase Authentication** (email + Google) |
| Database | **Cloud Firestore** |
| QR | `html5-qrcode` (scanner) · `qrcode` / `qrcode.react` (tickets) |
| Icons | `lucide-react` |
| Data | `odej_bejaia_dataset.json` (ODEJ Béjaïa) |

---

## 📦 Getting Started

### Prerequisites
- **Node.js** `18+`
- A **Firebase** project (Authentication + Firestore enabled)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SUDOTeam/forsati.git
cd forsati

# 2. Install dependencies
npm install

# 3. Configure environment — create .env.local with your Firebase keys (see below)

# 4. Run the dev server
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000).

### Environment variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional — used for absolute metadata URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Seed the data

Deploy the Firestore rules (`firestore.rules`) to your project, then visit [`/seed`](http://localhost:3000/seed) once to load the ODEJ Béjaïa dataset into Firestore.

### Available scripts

```bash
npm run dev      # start the development server
npm run build    # production build
npm run start    # run the production build
npm run lint     # lint the project
```

---

## 🗂️ Project Structure

```
forsati/
├── app/
│   ├── (app)/            # discover · events · institutions · community · dashboard · assistant · settings
│   ├── (admin)/          # admin dashboard + QR scanner
│   ├── (auth)/           # sign-in · sign-up · forgot-password
│   ├── api/assistant/    # keyword-search endpoint over the ODEJ dataset
│   ├── seed/             # one-time loader for the ODEJ dataset
│   ├── layout.tsx        # root layout + providers
│   └── page.tsx          # landing page
├── components/           # UI: EventCard, InstitutionCard, PostCard, TicketModal,
│                         #     DynamicRegistrationForm, Onboarding, Sidebar, BottomNav…
├── lib/
│   ├── firebase.ts       # Firebase init (Auth + Firestore)
│   ├── recommend.ts      # deterministic recommendation engine (no AI)
│   ├── events.ts · posts.ts · data.ts · admin.ts · validation.ts · localize.ts
│   ├── contexts/         # AuthContext · LanguageContext (i18n + RTL)
│   └── translations/     # ar · fr · en · kab
├── odej_bejaia_dataset.json   # 68 ODEJ youth establishments (wilaya of Béjaïa)
├── firestore.rules
├── tailwind.config.ts · next.config.mjs · tsconfig.json
└── public/               # logo.png · favicon.ico
```

---

## 🗺️ Roadmap

- [ ] 🗺️ Scale beyond Béjaïa to more of Algeria's 58 wilayas (the dataset schema already supports it)
- [ ] 📍 Geocode institutions at commune level for map views (coordinates are currently empty)
- [ ] 📅 Structured event feed populated through the admin dashboard
- [ ] 📴 Offline support and richer notifications

---

## 📚 Data

The app is powered by **`odej_bejaia_dataset.json`** — 68 youth establishments across the wilaya of Béjaïa (code 06), organized into categories such as *Maisons de Jeunes*, sports complexes, science centers, hostels, and camps, each tagged with activity interests.

> Data sourced from the public ODEJ Béjaïa listings (`odejbejaia-dz.com`). Verify before production use. GPS coordinates are not published at the source and must be geocoded before mapping.

---

## 📄 License

Released under the **MIT License** — see [LICENSE](./LICENSE).

---

<div align="center">

**FORSATI** · فرصتي — _Discover your opportunity._ · by **SUDOTeam**

</div>
