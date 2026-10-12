# Spendwise

## Firebase Cloud Expense Tracker

Spendwise is a React/Vite expense tracker using Firebase as its cloud
backend. Users can create accounts, sign in, add expenses in Indian rupees,
view spending summaries, and delete their own expense records.

## Firebase architecture

```text
React + Vite frontend
        |
        v
Firebase Hosting
        |
        +-- Firebase Authentication
        |
        +-- Cloud Firestore
        |
        +-- Firebase/Google Cloud monitoring
```

| Service | Purpose |
| --- | --- |
| Firebase Hosting | Hosts the production React frontend |
| Firebase Authentication | Email/password registration and login |
| Cloud Firestore | Cloud NoSQL database for expenses |
| Firestore Security Rules | Restricts each user to their own records |
| Firebase console | Usage, authentication, hosting, and project metrics |

## Run locally

Requirements:

- Node.js 18 or later
- npm
- A Firebase project

Install and start the frontend:

```powershell
npm install
npm run dev
```

Without Firebase environment variables, the UI runs in demo mode. Copy
`.env.example` to `.env.local` and add the web app configuration from the
Firebase console to enable cloud authentication and storage.

## Configure Firebase

1. Open the [Firebase console](https://console.firebase.google.com/).
2. Create a project.
3. Add a Web app from **Project overview → Add app → Web**.
4. Copy the Firebase configuration values into `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. Open **Authentication → Sign-in method** and enable **Email/Password**.
6. Open **Firestore Database → Create database** and select production mode.
7. Deploy the rules from [`firestore.rules`](./firestore.rules).

The Firebase web configuration is public client configuration. Never put
service-account private keys in `.env.local` or frontend code.

## Deploy to Firebase Hosting

Install the Firebase CLI:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
```

Select the Firebase project you created. Then build and deploy:

```powershell
npm run build
firebase deploy --only hosting,firestore
```

The hosting URL will be similar to:

```text
https://your-project-id.web.app
```

## Security model

Every expense document stores the authenticated Firebase user ID as `userId`.
The rules in [`firestore.rules`](./firestore.rules) allow a user to read or
delete a document only when its `userId` matches `request.auth.uid`. Create
requests validate the title, amount, category, and owner.

## Cloud metrics to demonstrate

Use these Firebase and Google Cloud console pages in your presentation:

- **Firebase console → Authentication**: registered users and sign-in
  providers
- **Firestore → Usage**: reads, writes, deletes, storage, and network usage
- **Hosting → Usage**: hosting storage and data transfer
- **Project settings → Usage and billing**: plan and quota information
- **Google Cloud console → Monitoring**: project metrics and dashboards

Firebase is a managed cloud platform. Hosting and Firestore scale without
manually managing virtual machines. Exact quotas, free-plan limits, and
available monitoring features depend on the Firebase plan and Google Cloud
region, so use the values shown in your project console when presenting
metrics.
