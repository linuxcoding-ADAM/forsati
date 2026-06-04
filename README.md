<div align="center">

<br/>

<img src="./public/logo.png" alt="FORSATI Logo" width="100" style="border-radius: 20px;" />

<br/>

# FORSATI · فرصتي

> **"Discover your opportunity."**

<br/>

![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-ff6b6b?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

[![ECOHACK Chellata](https://img.shields.io/badge/🌿_ECOHACK-Chellata_2026-16a34a?style=for-the-badge)](https://github.com/SUDOTeam/forsati)

<br/>

---

*A personalized youth-opportunity discovery platform connecting young Algerians to **ODEJ** youth establishments — built on real **ODEJ Béjaïa** data.*

---

</div>

<br/>

## 🧠 The Idea

> Young people don't lack opportunities — they lack a **simple, centralized way to reach them.**

**FORSATI** (from the Arabic *فرصتي* — *"my opportunity"*) is a mobile-first web app that brings the youth opportunities offered by **ODEJ** — youth houses, sports complexes, science centers, hostels, camps — into a **single place**.

It matches each young person with the right institutions using a **deterministic recommendation engine** (interests + location), lets them register for events and check in with a **QR ticket**, and works in **four languages** including **Kabyle**.

The current dataset covers the **wilaya of Béjaïa (06)** and follows a schema designed to scale to all **58 wilayas**.

<br/>

---

## ✨ Features

<br/>

| Feature | Description |
|---|---|
| 🧭 **Discover Feed** | Personalized institution & opportunity recommendations based on your interests and wilaya |
| 🤖 **Smart Assistant** | Ask in natural words (*"sport in Akbou"*) — matched against the real ODEJ dataset, zero hallucination |
| 🎟️ **Events & QR Tickets** | Dynamic registration forms + QR ticket generated for each participant |
| 📷 **QR Check-in** | Admin staff scan tickets on-site to confirm real attendance |
| 🏛️ **Institutions Browser** | Explore ODEJ youth establishments with details, categories, and contact info |
| 💬 **Community Feed** | Post feed for sharing and discussion among youth |
| 📊 **Personal Dashboard** | Your activity, registrations, and history in one view |
| 🛠️ **Admin Dashboard** | Manage content and validate participation |
| 🌍 **Multilingual + RTL** | Arabic, French, English & **Kabyle (kab)** with full RTL support |
| 🔐 **Authentication** | Email/password and Google sign-in via Firebase Auth |
| 🚀 **Smart Onboarding** | Quick profile setup (interests, wilaya) that powers recommendations |

<br/>

---

## 🌱 Efficiency by Design

FORSATI is light on purpose — not as a claim, but as engineering decisions:

- 🧮 **Zero-AI Recommendation Engine** — `lib/recommend.ts` is a pure scoring function (interests × wilaya). No model, no API calls. Runs locally in **~1 ms**.
- 🔎 **Local Dataset Search** — The assistant reads a bundled JSON dataset, so answers come from real ODEJ data and **never hallucinate**.
- 🌑 **Dark-first UI** — Default `#0a0a0a` theme. OLED-friendly, easy on the eyes.
- 🪶 **Lightweight Stack** — `lucide-react` icons, minimal animations, no heavy UI framework bloat.
- 🖼️ **Next.js Image Optimization** — Assets served efficiently out of the box.

<br/>

---

## 🧱 Tech Stack

<br/>

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript · React 18 |
| **Styling** | Tailwind CSS (custom dark theme) |
| **Auth** | Firebase Authentication (email + Google) |
| **Database** | Cloud Firestore |
| **QR** | `html5-qrcode` (scanner) · `qrcode` / `qrcode.react` (tickets) |
| **Icons** | `lucide-react` |
| **Data** | `odej_bejaia_dataset.json` — 68 ODEJ Béjaïa establishments |

<br/>

---

## 📦 Getting Started

### Prerequisites

- **Node.js** `18+`
- A **Firebase** project with Authentication + Firestore enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SUDOTeam/forsati.git
cd forsati

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

<br/>

### Environment Variables

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

<br/>

### Seed the Data

Deploy the Firestore rules (`firestore.rules`) to your project, then visit [`/seed`](http://localhost:3000/seed) **once** to load the ODEJ Béjaïa dataset into Firestore.

<br/>

### Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Production build
npm run start    # Run the production build
npm run lint     # Lint the project
```

<br/>

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
│
├── components/           # EventCard · InstitutionCard · PostCard · TicketModal
│                         # DynamicRegistrationForm · Onboarding · Sidebar · BottomNav
│
├── lib/
│   ├── firebase.ts       # Firebase init (Auth + Firestore)
│   ├── recommend.ts      # Deterministic recommendation engine (no AI)
│   ├── events.ts · posts.ts · data.ts · admin.ts · validation.ts · localize.ts
│   ├── contexts/         # AuthContext · LanguageContext (i18n + RTL)
│   └── translations/     # ar · fr · en · kab
│
├── odej_bejaia_dataset.json   # 68 ODEJ youth establishments (wilaya of Béjaïa)
├── firestore.rules
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── public/               # logo.png · favicon.ico
```

<br/>

---

## 🗺️ Roadmap

- [ ] 🗺️ Scale to more of Algeria's **58 wilayas** — the dataset schema already supports it
- [ ] 📍 Geocode institutions at commune level for **map views**
- [ ] 📅 Structured **event feed** populated through the admin dashboard
- [ ] 📴 **Offline support** and richer push notifications
- [ ] 📱 Native mobile app (React Native / Expo)

<br/>

---

## 📚 Data

The app is powered by **`odej_bejaia_dataset.json`** — **68 youth establishments** across the wilaya of Béjaïa (code 06), organized into categories:

- 🏠 Maisons de Jeunes
- 🏋️ Sports Complexes
- 🔬 Science Centers
- 🏕️ Youth Hostels & Camps

Each establishment is tagged with activity interests and wilaya metadata.

> ⚠️ Data sourced from public ODEJ Béjaïa listings ([odejbejaia-dz.com](https://odejbejaia-dz.com)). Verify before production use. GPS coordinates are not published at the source and must be geocoded before mapping.

<br/>

---

## 👥 Team

<br/>

<div align="center">

Built with 💚 at **EcoHack Chellata 2026**

<br/>

| | Name |
|---|---|
| 👨‍💻 | **Adam** |
| 👨‍💻 | **Mila** |
| 👨‍💻 | **Yata** |
| 👨‍💻 | **Moha** |
| 👨‍💻 | **Ait Kheddache Syphax** |

<br/>

*Team **SUDOTeam** · FORSATI · فرصتي*

</div>

<br/>

---

## 📄 License

Released under the **MIT License** — see [LICENSE](./LICENSE) for details.

<br/>

---

<div align="center">

<br/>

**FORSATI** · فرصتي

*Discover your opportunity.*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-SUDOTeam-181717?style=for-the-badge&logo=github)](https://github.com/SUDOTeam/forsati)
[![ECOHACK Chellata](https://img.shields.io/badge/🌿_ECOHACK-Chellata_2026-16a34a?style=for-the-badge)](https://github.com/SUDOTeam/forsati)

<br/>

</div>
