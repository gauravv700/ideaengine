<div align="center">

# 💡 IdeaEngine

### Turn a business idea into a practical plan of action.

An AI-powered planning app that converts a founder's raw idea into a structured, downloadable strategy blueprint, complete with a 14-day action checklist.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

### 🌐 [**Try the live demo → idea-engine143.vercel.app**](https://idea-engine143.vercel.app/)

[Live Demo](https://idea-engine143.vercel.app/) · [Features](#-features) · [How It Works](#-how-it-works) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [Routes](#-app-routes) · [Deployment](#-deployment)

</div>

---

<p align="center">
  <a href="https://idea-engine143.vercel.app/">
    <img src="doc/screenshots/landing.png" alt="IdeaEngine landing page" width="900">
  </a>
</p>

## ✨ Overview

Most great ideas stall at the same point: *"Where do I start?"*

**IdeaEngine** answers that question. Describe your audience, offering, revenue model, costs, team, and timeline through a guided form, and IdeaEngine uses the Google Gemini API to generate a tailored strategy blueprint you can download as a PDF and revisit from your account at any time.

## 🚀 Features

| | Feature | What you get |
| --- | --- | --- |
| 🔐 | **Flexible authentication** | Sign up with email and password, or continue with Google |
| 🧭 | **Guided idea intake** | A structured form covering customers, operations, finances, and goals |
| 📄 | **Complete strategy blueprint** | Executive summary, value proposition, 30/60/90-day roadmap, go-to-market strategy, risks, KPIs, budget, and a 14-day action checklist |
| 🎯 | **Readiness signals** | Practical scoring around problem clarity, audience fit, monetization, and execution readiness |
| ⬇️ | **One-click PDF export** | Server-generated PDF download, with a record saved to your account |
| 👤 | **Profile management** | Edit your details, upload a profile photo, and browse recent blueprints |
| 📊 | **Plan-based usage limits** | Rolling 30-day generation caps tied to the account plan |

### Account plans

| Plan | Price | Blueprints per month | Highlights |
| --- | --- | --- | --- |
| **Starter** | $0 | 5 | Basic market insights, PDF export, email support |
| **Pro** | $29/mo | 100 | Advanced GTM and KPI recommendations, competitive positioning, version history |
| **Team** | $99/mo | Unlimited | Up to 10 seats, shared workspace, admin controls, dedicated onboarding |

> [!NOTE]
> Pricing and plan benefits are shown on the [live site](https://idea-engine143.vercel.app/#pricing). Generation limits (Starter 5, Pro 100, Team unlimited) are what the app enforces in code; some listed benefits, such as team seats, shared workspace, and version history, are product-page descriptions and may not all be implemented yet.

## ⚙️ How It Works

```mermaid
flowchart LR
    A[Sign in] --> B[Fill in the guided form]
    B --> C{Server checks}
    C -->|Valid input, verified session, within plan limit| D[Gemini drafts the strategy]
    C -->|Failed| X[Error returned to user]
    D --> E[Blueprint saved to Firestore]
    E --> F[PDF generated and downloaded]
```

1. The signed-in user submits the guided business form.
2. The server validates required inputs, verifies the session, and enforces the account's rolling 30-day generation limit.
3. Gemini drafts a practical strategy from the submitted details.
4. IdeaEngine stores the blueprint record in Firestore, creates a PDF, and returns it as a download.

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router) and React |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Authentication | [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password and Google) |
| Database | [Cloud Firestore](https://firebase.google.com/docs/firestore) for profiles and blueprint records |
| File storage | [Firebase Storage](https://firebase.google.com/docs/storage) for profile photos |
| AI | [Google Gemini API](https://ai.google.dev/) for blueprint content |
| Documents | Server-side PDF generation |

## 🏁 Quick Start

### Prerequisites

- **Node.js 20+** and npm
- A **Firebase project** with Authentication (Email/Password and Google), Firestore, and Cloud Storage enabled
- A **Google Gemini API key**
- A **Firebase Admin service account** for server-side Auth, Firestore, and Storage access

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```dotenv
# Firebase client configuration (from the Firebase console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Server-side Firebase Admin service account, as a single-line JSON value
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...","client_id":"...","token_uri":"https://oauth2.googleapis.com/token"}

# Gemini
GEMINI_API_KEY=your-gemini-api-key
# Optional; defaults to gemini-1.5-flash
GEMINI_MODEL=gemini-1.5-flash

# Optional if the Firebase client storage bucket is already configured
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**Firebase setup checklist**

- [x] Enable the Email/Password and Google sign-in providers
- [x] Add your domains to Authentication's authorized domains
- [x] Create Firestore and Storage in the same project

> [!NOTE]
> The Admin SDK also supports a local `serviceaccountkey.json` file as a fallback when `FIREBASE_SERVICE_ACCOUNT` is not set. The Admin SDK configuration also references the Realtime Database URL for the `ideaengine-25bb0` project, so update `lib/firebase/admin.js` if you are connecting a different Firebase project.

> [!WARNING]
> Keep service account credentials private. Never commit them, expose them in client-side variables, or share them publicly. Only the `NEXT_PUBLIC_` Firebase values are used by the browser; every other credential must stay server-side.

### 3. Run locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server (run after `npm run build`) |
| `npm run lint` | Run ESLint |

## 🗺️ App Routes

| Route | Purpose | Auth required |
| --- | --- | :---: |
| `/` | Product landing page and feature overview | |
| `/signup` | Create an account with email or Google | |
| `/login` | Sign in with email or Google | |
| `/generateblueprint` | Submit business details and download a generated PDF | ✅ |
| `/profile` | View and edit profile details and recent blueprint records | ✅ |

API routes under `app/api` handle session cookies, profile data and photos, blueprint generation, and blueprint retrieval. Protected actions use Firebase Admin to verify the signed session cookie.

## 🏗️ Project Structure

```text
app/
├── api/                 # Route handlers: auth, profiles, blueprints
├── blueprints/[id]/     # Blueprint detail page
├── generateblueprint/   # Blueprint intake form
└── login/ signup/       # Authentication pages
components/              # Landing page sections and shared UI
lib/
├── blueprints/          # PDF generation
└── firebase/            # Firebase client and Admin SDK setup
```

## ☁️ Deployment

IdeaEngine runs as a Node.js Next.js application. The live demo is hosted on [Vercel](https://vercel.com/) at [idea-engine143.vercel.app](https://idea-engine143.vercel.app/).

1. Add all environment variables from the setup above to your deployment environment.
2. Use a **production** Firebase service account.
3. Add the deployed domain to Firebase Authentication's authorized domains.
4. Store server credentials in your hosting provider's secret manager.

## ⚠️ Disclaimer

Generated recommendations depend on the quality of the information you provide. Review every blueprint carefully before using it for business, financial, or investment decisions.

## 📄 License

No license file is currently included. Contact the project owner before redistributing or using this project beyond its intended scope.

---

<div align="center">

**Built to help founders move from idea to action.**

</div>
