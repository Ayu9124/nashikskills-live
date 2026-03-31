# NashikSkills Live 🎯

A real-time skill-gap dashboard for Nashik's industries and students. Built for IDS 6.0.

## 📁 Project Structure

```
nashikskills-live/
├── src/                        ← React frontend (Vite + TypeScript + Tailwind)
│   ├── components/             ← All UI components
│   ├── api/index.ts            ← Frontend API helper (calls backend)
│   ├── firebase.ts             ← Firebase SDK (auth + Firestore)
│   ├── App.tsx                 ← Main app
│   ├── data.ts                 ← Static seed data
│   └── types.ts                ← TypeScript types
├── backend/                    ← Express.js backend (Node + TypeScript)
│   ├── src/
│   │   ├── index.ts            ← Entry point (Express server on port 5000)
│   │   ├── firebase-admin.ts   ← Firebase Admin SDK
│   │   └── routes/
│   │       ├── industries.ts   ← GET/POST /api/industries
│   │       ├── students.ts     ← GET/PUT  /api/students/:uid
│   │       └── dashboard.ts    ← GET      /api/dashboard/stats|sectors
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example            ← Copy to .env and fill in
├── firebase-applet-config.json ← Firebase project config (public keys only)
├── firestore.rules             ← Firestore security rules
├── vite.config.ts              ← Vite config (proxies /api → backend)
├── package.json
├── .env.example                ← Copy to .env and fill in
└── .gitignore
```

## 🚀 How to Run Locally (Step by Step)

### Step 1 — Install VS Code (if not installed)
Download from https://code.visualstudio.com

### Step 2 — Install Node.js (if not installed)
Download LTS version from https://nodejs.org

### Step 3 — Open the project in VS Code
```
File → Open Folder → select the nashikskills-live folder
```

### Step 4 — Open Terminal in VS Code
```
View → Terminal  (or press Ctrl + `)
```

### Step 5 — Set up Frontend environment
```bash
cp .env.example .env
```
Then open `.env` and fill in your `GEMINI_API_KEY`.

### Step 6 — Install Frontend dependencies
```bash
npm install
```

### Step 7 — Set up Backend environment
```bash
cd backend
cp .env.example .env
```
Then open `backend/.env` and fill in:
- `FIREBASE_SERVICE_ACCOUNT_JSON` — from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- `FIREBASE_DATABASE_ID` — copy from firebase-applet-config.json

### Step 8 — Install Backend dependencies
```bash
npm install
cd ..
```
(You should now be back in the root folder)

### Step 9 — Run Backend (Terminal 1)
```bash
cd backend
npm run dev
```
You should see: ✅ NashikSkills Backend running at http://localhost:5000

### Step 10 — Run Frontend (Terminal 2 — open a new terminal tab)
```bash
npm run dev
```
You should see: Local: http://localhost:3000

### Step 11 — Open in browser
Go to http://localhost:3000 — the app is running!

---

## 🔑 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Check if backend is running |
| GET | /api/industries | Get recent industry submissions |
| POST | /api/industries | Submit new industry skill gap data |
| GET | /api/students/:uid | Get a student profile |
| PUT | /api/students/:uid | Save/update a student profile |
| GET | /api/students | Search students by sector/skill |
| GET | /api/dashboard/stats | Total companies, students, avg gap |
| GET | /api/dashboard/sectors | Skill gap breakdown by sector |

---

## 🌐 Deploying to the Internet

### Frontend → Deploy on Vercel (free)
1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → Import your GitHub repo
3. Set Root Directory to `/` (the frontend)
4. Add Environment Variables: `GEMINI_API_KEY` and `VITE_API_URL` (your backend URL)
5. Click Deploy

### Backend → Deploy on Render (free)
1. Go to https://render.com → Sign up with GitHub
2. Click "New Web Service" → Connect your repo
3. Set Root Directory to `backend`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add Environment Variables from `backend/.env`
7. Click Deploy

---

## 🔒 Security Notes

- NEVER commit `.env` files to GitHub
- NEVER commit `firebase-service-account.json` to GitHub
- The `firebase-applet-config.json` contains only public Firebase config — this is safe to commit
- Firestore rules are in `firestore.rules` — deploy them via Firebase Console

---

## 👥 Team Setup

Each team member should:
1. Clone the repo: `git clone <repo-url>`
2. Follow Steps 5–11 above
3. Get the `.env` and `backend/.env` values from the team lead (share securely, NOT via git)

