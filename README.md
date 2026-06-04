<div align="center">

<!-- Animated Header Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0a0a0a&height=200&section=header&text=FORSATI%20·%20فرصتي&fontSize=60&fontColor=ffffff&animation=fadeIn&desc=Discover%20Your%20Opportunity&descAlignY=70&descAlign=62" width="100%" alt="Forsati Header"/>

**A personalized youth-opportunity discovery platform connecting young Algerians to ODEJ youth establishments.**

🏆 **Proudly Built for EcoHack Chellata by SUDOTeam** 🏆

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)

[Explore Features](#✨-features) • [Getting Started](#📦-getting-started) • [Tech Stack](#🧱-tech-stack) • [The Team](#👥-meet-the-team)

</div>

---

## 🧠 The Vision

> *Young people don't lack opportunities — they lack a simple, centralized way to reach them.*

**FORSATI** (from the Arabic فرصتي — *"my opportunity"*) is a premium, mobile-first web application designed to bring youth opportunities offered by ODEJ (youth houses, sports complexes, science centers, hostels, and camps) into a single, accessible hub.

By utilizing a deterministic recommendation engine (matching interests with location), FORSATI connects youth with the right institutions, allows seamless event registration with **QR-coded ticketing**, and breaks language barriers by offering full support in **4 languages (including Kabyle and RTL Arabic)**.

<div align="center">
  <!-- 💡 TIP: Drop a GIF of your app working here! -->
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" width="0" height="0">
  <br/>
  <i>[ 📱 Drop a GIF or Screenshot of the Forsati Mobile UI here ]</i>
  <br/><br/>
</div>

---

## ✨ Features

We built FORSATI to be feature-rich yet incredibly lightweight. 

| Feature | Description |
| :--- | :--- |
| 🧭 **Discover Feed** | Personalized institution & opportunity recommendations based on your exact interests and Wilaya. |
| 🤖 **Smart Assistant** | Ask in natural words (*"sport in Akbou"*). Matched against the real ODEJ dataset with **zero hallucination**. |
| 🎟️ **Events & QR Tickets** | Dynamic registration forms that generate a unique QR ticket for every participant. |
| 📷 **QR Check-in** | Admin dashboard with a built-in scanner to confirm real-time attendance on-site. |
| 🏛️ **Institutions Browser**| Explore ODEJ youth establishments with deep details, categories, and direct contact info. |
| 💬 **Community Feed** | A built-in social feed for sharing, networking, and discussion among local youth. |
| 🌍 **Multilingual + RTL** | Seamlessly switch between **Arabic, French, English, and Kabyle (kab)** with flawless RTL support. |
| 🚀 **Smart Onboarding** | Frictionless profile setup that powers our recommendation engine instantly. |

---

## 🌱 Efficiency by Design

FORSATI is light on purpose. This isn't just a claim; it's a series of strict engineering decisions:

*   🧮 **Zero-AI Recommendation Engine:** `lib/recommend.ts` is a pure scoring function (interests × wilaya). No heavy models, no expensive API calls. It runs locally in **~1 ms**.
*   🔎 **Local Dataset Search:** The assistant reads a bundled JSON dataset. Answers come from *real* ODEJ data—it is mathematically impossible to hallucinate.
*   🌑 **Dark-first UI:** A sleek `#0a0a0a` default theme. OLED-friendly, battery-saving, and easy on the eyes.
*   🪶 **Lightweight Stack:** Powered by `lucide-react` icons and minimal animations to avoid UI framework bloat.
*   🖼️ **Next.js Edge Optimization:** Images and assets are served efficiently out-of-the-box.

---

## 🧱 Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,ts,react,tailwind,firebase,git,nodejs" alt="Tech Stack" />
</div>

<br>

| Layer | Technology Used |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript, React 18 |
| **Styling** | Tailwind CSS (Custom Dark Theme) |
| **Auth & DB**| Firebase Auth (Email/Google) & Cloud Firestore |
| **QR Tech** | `html5-qrcode` (Scanner) / `qrcode.react` (Ticketing) |
| **Dataset** | `odej_bejaia_dataset.json` (68 Establishments) |

---

## 📦 Getting Started

### Prerequisites
* **Node.js 18+**
* A Firebase Project (with Authentication & Firestore enabled)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/SUDOTeam/forsati.git
cd forsati
2. Install dependencies
code
Bash
npm install
3. Set up environment variables
Create a .env.local file at the root of the project:
code
Env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
4. Seed the Database (One-time setup)
Deploy your Firestore rules (firestore.rules), start the dev server, and visit http://localhost:3000/seed once to securely load the ODEJ Béjaïa dataset into your Firestore.
5. Launch the App
code
Bash
npm run dev
Open http://localhost:3000 to see the app in action 🚀.
🗂️ Project Architecture
<details>
<summary><b>Click to expand folder structure</b></summary>
code
Text
forsati/
├── app/
│   ├── (app)/            # discover · events · institutions · community · dashboard · assistant 
│   ├── (admin)/          # admin dashboard + QR scanner
│   ├── (auth)/           # sign-in · sign-up · forgot-password
│   ├── api/assistant/    # keyword-search endpoint over the ODEJ dataset
│   ├── seed/             # one-time loader for the ODEJ dataset
│   ├── layout.tsx        # root layout + providers
│   └── page.tsx          # landing page
├── components/           # UI Components (Cards, Modals, Forms, Navbars)
├── lib/
│   ├── firebase.ts       # Firebase config
│   ├── recommend.ts      # Deterministic recommendation engine (no AI)
│   ├── contexts/         # AuthContext · LanguageContext (i18n + RTL)
│   └── translations/     # ar · fr · en · kab
├── odej_bejaia_dataset.json   # 68 ODEJ youth establishments (Béjaïa)
└── tailwind.config.ts
</details>
🗺️ Roadmap & Data
The Dataset:
Powered by odej_bejaia_dataset.json — featuring 68 real youth establishments across the wilaya of Béjaïa (06), strictly organized into Maisons de Jeunes, Sports Complexes, Science Centers, and Hostels/Camps.
(Note: Data sourced from public ODEJ Béjaïa listings. Verify before prod).
Future Updates:

🗺️ National Scale: Expand dataset to cover all 58 Algerian wilayas.

📍 Interactive Maps: Geocode institutions at the commune level.

📅 Admin Event Feed: Structured event feed populated directly from the ODEJ dashboard.

📴 Offline Mode: PWA support with rich push notifications.

📱 Native Mobile: Port to React Native / Expo.
👥 Meet the Team
<div align="center">
<b>Built with 💚 by SUDOTeam at EcoHack Chellata</b><br><br>
👨‍💻 Adam Mila	👨‍💻 Syphax Ait Kheddache	👨‍💻 Mouhamed Amine Yata
</div>
<div align="center">
<p>Released under the <a href="LICENSE">MIT License</a>.</p>
<b>FORSATI · فرصتي — Discover your opportunity.</b>
</div>
```
