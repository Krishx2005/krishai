from typing import Optional

import anthropic
from sqlalchemy import inspect

from app.config import settings
from app.database import engine

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


def _build_schema_text() -> str:
    inspector = inspect(engine)
    lines = ["Tables in the PostgreSQL database:\n"]

    for i, table_name in enumerate(inspector.get_table_names(schema="public"), 1):
        lines.append(f"{i}. {table_name}")
        for col in inspector.get_columns(table_name, schema="public"):
            nullable = "" if col["nullable"] else " NOT NULL"
            lines.append(f"   - {col['name']}: {col['type']}{nullable}")

        fks = inspector.get_foreign_keys(table_name, schema="public")
        for fk in fks:
            local_cols = ", ".join(fk["constrained_columns"])
            ref_table = fk["referred_table"]
            ref_cols = ", ".join(fk["referred_columns"])
            lines.append(f"   FK: {local_cols} -> {ref_table}({ref_cols})")

        lines.append("")

    return "\n".join(lines)


SYSTEM_PROMPT_TEMPLATE = """You are a SQL expert. Convert natural language questions into PostgreSQL SELECT queries.

This is an FC 25 (EA Sports football/soccer) player database.

Database schema:
{schema}

Key relationships:
- players.player_id is the primary key linking to player_clubs, player_stats, and player_positions
- player_clubs links players to clubs via club_id
- A player can have multiple positions in player_positions
- player_stats has face stats: pace, shooting, passing, dribbling, defending, physic

Rules:
- Output ONLY a valid PostgreSQL SELECT query, nothing else.
- No markdown, no explanation, no code fences — just the SQL.
- Never output INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or any data-modifying statement.
- Use descriptive column aliases for readability (e.g., AS avg_rating, AS total_players).
- Default to ordering by the most relevant metric descending.
- Limit results to 20 rows unless the user specifies otherwise.
- Only use tables and columns from the schema above.
- When asked about a player's "position", use the player_positions table.
- value_eur, wage_eur, and release_clause_eur are in euros (integers).
- When querying player_stats columns (pace, shooting, passing, dribbling, defending, physic), always filter out NULLs for the stat columns used (e.g., WHERE ps.pace IS NOT NULL). Goalkeepers often have NULL outfield stats.
- Player names use abbreviated first names (e.g., "K. Mbappé", "J. Bellingham", "M. Salah", not "Kylian Mbappé"). When searching for a specific player, use ILIKE with the last name only: WHERE p.name ILIKE '%Bellingham%'. Never match on the full first name."""


_cached_schema: Optional[str] = None


def _get_system_prompt() -> str:
    global _cached_schema
    if _cached_schema is None:
        _cached_schema = _build_schema_text()
    return SYSTEM_PROMPT_TEMPLATE.format(schema=_cached_schema)


def natural_language_to_sql(question: str) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=_get_system_prompt(),
        messages=[{"role": "user", "content": question}],
    )

    sql = message.content[0].text.strip()

    # Strip markdown code fences if Claude includes them despite instructions
    if sql.startswith("```"):
        sql = sql.split("\n", 1)[1] if "\n" in sql else sql[3:]
        sql = sql.rsplit("```", 1)[0]
        sql = sql.strip()

    return sql
