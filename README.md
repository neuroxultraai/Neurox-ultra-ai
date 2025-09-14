Doctor AI — Final (Deployable)

This package contains a focused Doctor AI app (frontend + Node backend).
It provides a symptom checker endpoint and a simple frontend UI to query it.

Quick start (local)
1. Extract ZIP
2. Start backend:
   cd server
   npm install
   cp .env.example .env   # edit .env to add OPENAI_API_KEY if you have one
   npm run dev
3. Serve frontend:
   npx http-server ../client -p 8080   # run from server folder
   Open http://localhost:8080 in browser