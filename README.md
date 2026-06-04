<div align="center">

<!-- Animated Header Banner: black → green gradient waves with twinkling animation -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0a,40:052e16,80:16a34a,100:22c55e&height=230&section=header&text=FORSATI%20·%20فرصتي&fontSize=60&fontColor=22c55e&animation=twinkling&desc=Discover%20Your%20Opportunity&descAlignY=72&descAlign=62&descSize=20&descColor=ffffff&stroke=22c55e&strokeWidth=1" width="100%" alt="Forsati Animated Header"/>

<!-- App Logo & ODEJ Logo — transparent, side by side -->
<p align="center">
  <img src="./docs/logo.png" alt="Forsati App Logo" width="170"/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./docs/logo-odej.png" alt="ODEJ Béjaïa Official Logo" width="170"/>
</p>

**A personalized youth-opportunity discovery platform connecting young Algerians to ODEJ youth establishments.**

🏆 **Proudly Built for EcoHack Chellata by SUDOTeam** 🏆

<br />

### 🚀 <a href="https://forsatii.vercel.app/" target="_blank" rel="noopener noreferrer">Experience FORSATI Live Here</a> 🚀

<br />

<!-- Clickable Badges (open in new tab) -->
<a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/></a>
<a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
<a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/></a>
<a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/></a>
<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/License-MIT-22c55e.svg?style=for-the-badge" alt="License: MIT"/></a>
<a href="https://www.websitecarbon.com/website/forsatii-vercel-app/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Carbon_Rating-A%2B_·_Cleaner_than_95%25-22c55e?style=for-the-badge&logo=leaflet&logoColor=white" alt="Carbon Rating A+"/></a>

[Explore Features](#✨-features) • [Gallery](#📸-app-gallery) • [Low Carbon](#-a-low-carbon-website--by-design) • [Getting Started](#📦-getting-started) • [Tech Stack](#🧱-tech-stack) • [Contact](#-contact--follow-the-developers)

</div>

---

## 🧠 The Vision

> *Young people don't lack opportunities — they lack a simple, centralized way to reach them.*

**FORSATI** (from the Arabic فرصتي — *"my opportunity"*) is a premium, mobile-first web application designed to bring youth opportunities offered by ODEJ (youth houses, sports complexes, science centers, hostels, and camps) into a single, accessible hub.

By utilizing a deterministic recommendation engine (matching interests with location), FORSATI connects youth with the right institutions, allows seamless event registration with **QR-coded ticketing**, and breaks language barriers by offering full support in **4 languages (including Kabyle and RTL Arabic)**.

---

## 📸 App Gallery

### 💻 Desktop Experience
<div align="center">
  <img src="./docs/desktop-landing.png" alt="Forsati Desktop Landing Page" width="800" style="border-radius: 8px; margin-bottom: 15px;"/>
  <br/>
  <img src="./docs/desktop-home.png" alt="Forsati Desktop Dashboard" width="800" style="border-radius: 8px;"/>
</div>

<br/>

### 📱 Mobile-First Design
<div align="center">
  <table>
    <tr>
      <td align="center"><b>Landing & Onboarding</b></td>
      <td align="center"><b>Personalized Feed</b></td>
      <td align="center"><b>Community & Settings</b></td>
    </tr>
    <tr>
      <td><img src="./docs/mobile-landing.png" alt="Mobile Landing" width="250" style="border-radius: 10px;"/></td>
      <td><img src="./docs/mobile-home.png" alt="Mobile Feed" width="250" style="border-radius: 10px;"/></td>
      <td><img src="./docs/mobile-community.png" alt="Mobile Community" width="250" style="border-radius: 10px;"/></td>
    </tr>
  </table>
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
*   🔥 **Targeted Firestore `where()` Queries:** We never fetch entire collections. Every read is filtered **server-side** with Firestore's `where()` clauses (e.g. `where("wilaya", "==", "06")`, `where("category", "==", "sport")`), so only the documents the user actually needs travel over the network. Fewer document reads = lower bandwidth, faster screens, lower Firebase costs, and a smaller carbon footprint.
*   🌑 **Dark-first UI:** A sleek `#0a0a0a` default theme with `#22c55e` accents. OLED-friendly, battery-saving, and stunning.
*   🪶 **Lightweight Stack:** Powered by `lucide-react` icons and minimal animations to avoid UI framework bloat.
*   🖼️ **Next.js Edge Optimization:** Images and assets are served efficiently out-of-the-box.

---

## 🌍 A+ Low-Carbon Website — By Design

All of those engineering decisions add up to something measurable. FORSATI was independently tested by <a href="https://www.websitecarbon.com/website/forsatii-vercel-app/" target="_blank" rel="noopener noreferrer"><b>Website Carbon Calculator</b></a> and earned the highest possible rating:

<div align="center">

<img src="./docs/carbon-rating.png" alt="FORSATI achieves an A+ carbon rating — cleaner than 95% of all web pages globally" width="800" style="border-radius: 8px;"/>

### 🏅 Carbon Rating: **A+** — Cleaner than **95%** of all web pages globally

🔗 <b>Verify it yourself:</b> <a href="https://www.websitecarbon.com/website/forsatii-vercel-app/" target="_blank" rel="noopener noreferrer">websitecarbon.com/website/forsatii-vercel-app</a>

</div>

This matters because the web has a real environmental cost: every byte transferred consumes energy across data centers, networks, and devices. By shipping a minimal bundle, filtering data at the source with Firestore `where()` queries, and defaulting to an OLED-friendly dark theme, FORSATI sits in the **top 5% of the entire web** for energy efficiency — a perfect fit for a project born at **EcoHack** 🌱.

---

## 🧱 Tech Stack

<div align="center">
  <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer"><img src="https://skillicons.dev/icons?i=nextjs" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer"><img src="https://skillicons.dev/icons?i=ts" alt="TypeScript" /></a>
  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer"><img src="https://skillicons.dev/icons?i=react" alt="React" /></a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer"><img src="https://skillicons.dev/icons?i=tailwind" alt="Tailwind CSS" /></a>
  <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer"><img src="https://skillicons.dev/icons?i=firebase" alt="Firebase" /></a>
  <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer"><img src="https://skillicons.dev/icons?i=git" alt="Git" /></a>
</div>

<br>

| Layer | Technology Used |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript, React 18 |
| **Styling** | Tailwind CSS (Custom Dark/Green Theme) |
| **Auth & DB**| Firebase Auth (Email/Google) & Cloud Firestore (with server-side `where()` filtering) |
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
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file at the root of the project:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**4. Seed the Database (One-time setup)**

Deploy your Firestore rules (`firestore.rules`), start the dev server, and visit `http://localhost:3000/seed` once to securely load the ODEJ Béjaïa dataset into your Firestore.

**5. Launch the App**
```bash
npm run dev
```

Open <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">http://localhost:3000</a> to see the app in action 🚀.

---

## 🗂️ Project Architecture

<details>
<summary><b>Click to expand folder structure</b></summary>

```text
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
```

</details>

---

## 🗺️ Roadmap & Data

**The Dataset:**

Powered by `odej_bejaia_dataset.json` — featuring **68 real youth establishments** across the wilaya of Béjaïa (06), strictly organized into Maisons de Jeunes, Sports Complexes, Science Centers, and Hostels/Camps.

*(Note: Data sourced from public ODEJ Béjaïa listings. Verify before prod).*

**Future Updates:**

- 🗺️ **National Scale:** Expand dataset to cover all 58 Algerian wilayas.
- 📍 **Interactive Maps:** Geocode institutions at the commune level.
- 📅 **Admin Event Feed:** Structured event feed populated directly from the ODEJ dashboard.
- 📴 **Offline Mode:** PWA support with rich push notifications.
- 📱 **Native Mobile:** Port to React Native / Expo.

---

## 👥 Meet the Team

<div align="center">

<b>Built with 💚 by SUDOTeam at EcoHack Chellata</b>

<br/>

👨‍💻 Adam Mila &nbsp;·&nbsp; 👨‍💻 Syphax Ait Kheddache &nbsp;·&nbsp; 👨‍💻 Mouhamed Amine Yata

</div>

---

## 📬 Contact — Follow the Developers

<div align="center">

Got a question, an idea, or want to collaborate? Reach out to us directly on Instagram:

<br/>

<a href="https://www.instagram.com/_adam_mila_?igsh=MTJ1em5kN3dneHlnNQ==" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Adam_Mila-@__adam__mila__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Adam Mila on Instagram"/></a>
&nbsp;
<a href="https://www.instagram.com/syphax_aitkhe?igsh=eGQ1ZGR2cWFkdDJv" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Syphax_Ait_Kheddache-@syphax__aitkhe-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Syphax Ait Kheddache on Instagram"/></a>
&nbsp;
<a href="https://www.instagram.com/prvtt_mo7aa?igsh=MWtzdnp1ZWZ5dTh6aw==" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Mouhamed_Amine_Yata-@prvtt__mo7aa-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Mouhamed Amine Yata on Instagram"/></a>

</div>

---

<div align="center">

<p>Released under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.</p>

<b>FORSATI · فرصتي — Discover your opportunity.</b>

</div>

<!-- Animated Footer: matching black → green gradient waves -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,20:16a34a,60:052e16,100:0a0a0a&height=140&section=footer&animation=twinkling" width="100%" alt="Forsati Animated Footer"/>
