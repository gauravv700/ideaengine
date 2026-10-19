# IdeaEngine

**Turn a business idea into a practical plan of action.**

IdeaEngine is an AI-powered business planning app for founders and teams. Share the details of an idea—your audience, offering, revenue model, costs, team, and timeline—and IdeaEngine generates a structured strategy blueprint you can download as a PDF. Sign in to manage your profile and see your recent blueprints.

## What you can do

- Create an account with email and password or Google sign-in.
- Describe a business, its customers, operations, finances, and goals through a guided form.
- Generate a tailored blueprint with an executive summary, value proposition, roadmap, go-to-market strategy, risks, KPIs, budget, and a 14-day action checklist.
- Download the blueprint as a PDF and keep a record in your account.
- Edit your profile and upload a profile photo.
- Apply monthly generation limits based on the account plan (Starter: 5, Pro: 100, Team: unlimited).

## Built with

- [Next.js](https://nextjs.org/) App Router and React
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Firebase Authentication](https://firebase.google.com/docs/auth) for email and Google sign-in
- [Cloud Firestore](https://firebase.google.com/docs/firestore) for user profiles and blueprint records
- [Firebase Storage](https://firebase.google.com/docs/storage) for profile photos
- [Google Gemini API](https://ai.google.dev/) for blueprint content
- Server-generated PDF downloads

## Getting started

### Prerequisites

- Node.js 20 or later and npm
- A Firebase project with Authentication (Email/Password and Google), Firestore, and Cloud Storage configured
- A Google Gemini API key
- A Firebase Admin service account for server-side authentication, Firestore, and Storage access

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```dotenv
# Firebase client configuration (available in the Firebase console)
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

The Admin SDK also supports a local `serviceaccountkey.json` file as a fallback when `FIREBASE_SERVICE_ACCOUNT` is not set. Keep service account credentials private: do not commit them, expose them in client-side variables, or share them publicly. The `NEXT_PUBLIC_` Firebase values are used by the browser; all other credentials should remain server-side.

In Firebase, enable the sign-in providers used by the app and configure their authorized domains. Create or configure Firestore and Storage for the same project. The app's Admin SDK configuration also references the Firebase Realtime Database URL for the `ideaengine-25bb0` project; update `lib/firebase/admin.js` if you are connecting a different Firebase project.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server (run after `npm run build`) |
| `npm run lint` | Run ESLint |

## App routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page and feature overview |
| `/signup` | Create an account with email or Google |
| `/login` | Sign in with email or Google |
| `/generateblueprint` | Submit business details and download a generated PDF (requires sign-in) |
| `/profile` | View and edit profile details and recent blueprint records |

The API routes under `app/api` handle session cookies, profile data and photos, blueprint generation, and blueprint retrieval. Protected actions use Firebase Admin to verify the signed session cookie.

## How generation works

1. The signed-in user submits the guided business form.
2. The server checks required inputs, verifies the session, and enforces the account's rolling 30-day generation limit.
3. Gemini drafts a practical strategy from the submitted details.
4. IdeaEngine stores the blueprint record in Firestore, creates a PDF, and returns it as a download.

Generated recommendations depend on the quality of the information provided and should be reviewed before being used for business, financial, or investment decisions.

## Project structure

```text
app/
  api/                 Route handlers for auth, profiles, and blueprints
  blueprints/[id]/     Blueprint detail page
  generateblueprint/   Blueprint intake form
  login/ signup/       Authentication pages
components/            Landing page sections and shared UI
lib/
  blueprints/          PDF generation
  firebase/            Firebase client and Admin SDK setup
```

## Deployment

Deploy as a Node.js Next.js application on a platform such as [Vercel](https://vercel.com/). Add the environment variables above to the deployment environment, use a production Firebase service account, and add the deployed domain to Firebase Authentication's authorized domains. Keep server credentials in the hosting provider's secret manager.

## License

No license file is currently included. Contact the project owner before redistributing or using this project beyond its intended scope.
