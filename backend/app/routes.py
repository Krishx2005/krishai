import re
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.nl_to_sql import natural_language_to_sql

router = APIRouter(prefix="/api")

FORBIDDEN_PATTERN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE)\b",
    re.IGNORECASE,
)


class QueryRequest(BaseModel):
    question: Optional[str] = None
    sql: Optional[str] = None


class QueryResponse(BaseModel):
    question: Optional[str] = None
    sql: str
    columns: list[str]
    rows: list[list]
    row_count: int


def _validate_sql(sql: str) -> None:
    if FORBIDDEN_PATTERN.search(sql):
        raise HTTPException(status_code=400, detail="Only SELECT queries are allowed.")
    if not sql.upper().startswith("SELECT"):
        raise HTTPException(status_code=400, detail="Only SELECT queries are allowed.")


def _execute_sql(sql: str, db: Session) -> tuple[list[str], list[list]]:
    result = db.execute(text(sql))
    columns = list(result.keys())
    rows = [list(row) for row in result.fetchall()]

    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            if hasattr(val, "isoformat"):
                rows[i][j] = val.isoformat()
            elif isinstance(val, Decimal):
                rows[i][j] = float(val)

    return columns, rows


@router.post("/query", response_model=QueryResponse)
def run_query(req: QueryRequest, db: Session = Depends(get_db)):
    if not req.question and not req.sql:
        raise HTTPException(status_code=400, detail="Provide either 'question' or 'sql'.")

    question = None

    if req.question:
        question = req.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty.")

        try:
            sql = natural_language_to_sql(question)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"LLM error: {e}")
    else:
        sql = req.sql.strip()
        if not sql:
            raise HTTPException(status_code=400, detail="SQL query cannot be empty.")

    _validate_sql(sql)

    try:
        columns, rows = _execute_sql(sql, db)
        return QueryResponse(
            question=question,
            sql=sql,
            columns=columns,
            rows=rows,
            row_count=len(rows),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL execution error: {e}")


@router.get("/schema")
def get_schema():
    inspector = inspect(engine)
    tables = []

    for table_name in inspector.get_table_names(schema="public"):
        columns = []
        for col in inspector.get_columns(table_name, schema="public"):
            columns.append({
                "name": col["name"],
                "type": str(col["type"]),
                "nullable": col["nullable"],
            })
        tables.append({"table_name": table_name, "columns": columns})

    return {"tables": tables}


@router.get("/examples")
def get_examples():
    return {
        "examples": [
            "Who are the top 10 players by overall rating?",
            "Which league has the highest average player wage?",
            "Show me the fastest players by pace rating",
            "Compare average stats across the top 5 leagues",
            "Which clubs have the most players rated 85+?",
            "Who are the best young players under 21 with high potential?",
            "What nationality produces the most top-rated players?",
            "Find the most valuable players in the Premier League",
        ]
    }
