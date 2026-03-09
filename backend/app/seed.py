import csv
import os
import math

from app.database import engine, Base, SessionLocal
from app.models import Player, Club, PlayerClub, PlayerStats, PlayerPosition

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "fc25_players.csv")


def _safe_int(val):
    if val is None or val == "":
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        # Build unique clubs
        club_map = {}
        for row in rows:
            club_name = (row.get("club_name") or "").strip()
            if not club_name:
                continue
            if club_name not in club_map:
                league = (row.get("league_name") or "").strip() or None
                nation = (row.get("nationality_name") or "").strip() or None
                club = Club(name=club_name, league=league, nation=nation)
                db.add(club)
                club_map[club_name] = club

        db.flush()

        # Fix club nation — use the most common nationality of players in that club
        # (the CSV doesn't have a club nation column, so we approximate)
        # Actually, league implies nation enough for queries. Skip this complexity.

        player_count = 0
        for row in rows:
            pid = _safe_int(row.get("player_id"))
            name = (row.get("short_name") or row.get("long_name") or "").strip()
            if not pid or not name:
                continue

            player = Player(
                player_id=pid,
                name=name,
                age=_safe_int(row.get("age")),
                nationality=(row.get("nationality_name") or "").strip() or None,
                overall_rating=_safe_int(row.get("overall")),
                potential=_safe_int(row.get("potential")),
                value_eur=_safe_int(row.get("value_eur")),
                wage_eur=_safe_int(row.get("wage_eur")),
                release_clause_eur=_safe_int(row.get("release_clause_eur")),
            )
            db.add(player)

            # Positions (comma-separated in CSV)
            positions_str = (row.get("player_positions") or "").strip()
            if positions_str:
                for pos in positions_str.split(","):
                    pos = pos.strip()
                    if pos:
                        db.add(PlayerPosition(player_id=pid, position=pos))

            # Club link
            club_name = (row.get("club_name") or "").strip()
            if club_name and club_name in club_map:
                db.add(PlayerClub(
                    player_id=pid,
                    club_id=club_map[club_name].club_id,
                    jersey_number=_safe_int(row.get("club_jersey_number")),
                ))

            # Stats
            pace = _safe_int(row.get("pace"))
            shooting = _safe_int(row.get("shooting"))
            passing = _safe_int(row.get("passing"))
            dribbling = _safe_int(row.get("dribbling"))
            defending = _safe_int(row.get("defending"))
            physic = _safe_int(row.get("physic"))

            db.add(PlayerStats(
                player_id=pid,
                pace=pace,
                shooting=shooting,
                passing=passing,
                dribbling=dribbling,
                defending=defending,
                physic=physic,
            ))

            player_count += 1

            # Batch flush every 500 rows
            if player_count % 500 == 0:
                db.flush()

        db.commit()
        print(f"Database seeded successfully!")
        print(f"  Players: {player_count}")
        print(f"  Clubs: {len(club_map)}")

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
