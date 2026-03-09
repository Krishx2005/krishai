# KrishAI

## Project Overview
LLM-powered natural language to SQL analytics tool for FC 25 player data (18,000+ players).

## Commands
```bash
# Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload     # Start backend (port 8000)
python -m app.seed                 # Seed database with sample data

# Frontend
cd frontend
npm run dev                        # Start frontend (port 5173)
npm run build                      # Production build
```

## Architecture
- **Backend:** FastAPI + SQLAlchemy (sync, psycopg2)
- **Database:** PostgreSQL (local)
- **LLM:** Claude API (anthropic SDK) for NL-to-SQL conversion
- **Frontend:** React + Vite + Tailwind CSS (dark theme, Perplexity-inspired)
- **Config:** pydantic-settings loading from .env; frontend uses VITE_API_URL

## Key Files
- `backend/app/main.py` — FastAPI app, CORS, lifespan
- `backend/app/routes.py` — API endpoints (/query, /schema, /examples)
- `backend/app/nl_to_sql.py` — Claude API integration, dynamic schema prompt, NL-to-SQL conversion
- `backend/app/models.py` — 5 SQLAlchemy models (players, clubs, player_clubs, player_stats, player_positions)
- `backend/app/database.py` — Engine, session, Base
- `backend/app/seed.py` — CSV-based seeder (parses backend/data/fc25_players.csv)
- `backend/schema.sql` — DDL (tables created automatically by seed script)
- `frontend/src/App.jsx` — Main app component with search + results layout
- `frontend/src/api.js` — API client (queryNL, fetchExamples)
- `frontend/src/components/` — SearchBar, ExampleChips, ResultCard, Spinner, ErrorMessage

## Data
- Source: FC 25 player dataset (18,400+ players, 662 clubs)
- CSV at backend/data/fc25_players.csv
- Tables: players, clubs, player_clubs, player_stats, player_positions
- value_eur/wage_eur/release_clause_eur are BigInteger (euros)

## Conventions
- All FK columns have explicit indexes
- POST /query accepts {"question": "..."} for NL mode or {"sql": "..."} for raw SQL mode
- Both modes enforce SELECT-only (regex + prefix check)
