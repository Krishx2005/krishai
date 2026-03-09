# KrishAI

[Live Site](https://krishai-ruby.vercel.app)

A full stack app that lets you ask questions about FC 25 player data in plain English. You type something like "who are the fastest players in the Premier League?" and it turns that into SQL, runs it against a database of 18,000+ players, and shows you the results in a table with auto-generated charts.

## How it works

1. You ask a question in the search bar
2. The backend sends your question to the Claude API along with the database schema
3. Claude writes a SQL query
4. The backend runs that query against a PostgreSQL database with real FC 25 player stats
5. Results come back to the frontend as a table (with bar/line charts when it makes sense)

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + SQLAlchemy
- **Database:** PostgreSQL (hosted on Railway) with data from [EAFC26-DataHub](https://github.com/ismailoksuz/EAFC26-DataHub)
- **AI:** Claude API for natural language → SQL
- **Hosting:** Vercel (frontend), Render (backend), Railway (database)

## Running locally

Backend:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # add your DATABASE_URL and ANTHROPIC_API_KEY
python -m app.seed    # loads the player data
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

You'll need PostgreSQL running locally (`brew install postgresql@17 && createdb queryai`) and an Anthropic API key.
