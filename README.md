# CareerPilot

An AI-powered career coach that analyzes a resume, GitHub profile, and target
job description to produce a career match score and an actionable plan.

> **Status:** Milestone 1 — project scaffolding. No AI yet.

## Project structure

```
careerpilot/
├── backend/     FastAPI server
└── mobile/      Expo (React Native + TypeScript) app
```

## Running the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/health — you should see:
```json
{"status": "ok", "service": "careerpilot-backend"}
```

## Running the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the Expo Go app (iOS/Android) or press `i` / `a` for a
simulator.

**Before running:** open `App.tsx` and set `API_BASE_URL` to match how your
phone can reach your computer (see the comment above that constant).

## Milestone roadmap

1. ✅ Project setup
2. Basic ADK agent
3. Connect mobile app to backend
4. Resume analysis
5. GitHub integration
6. Job matching
7. Multi-agent orchestration
8. Career dashboard
9. AI career coach chat
10. Portfolio polish
