-- KrishAI Schema — FC 25 Player Database
-- Tables are created automatically by the seed script (python -m app.seed)

DROP TABLE IF EXISTS player_positions CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS player_clubs CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;

CREATE TABLE players (
    player_id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    age INTEGER,
    nationality VARCHAR(100),
    overall_rating INTEGER,
    potential INTEGER,
    value_eur BIGINT,
    wage_eur BIGINT,
    release_clause_eur BIGINT
);

CREATE TABLE clubs (
    club_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    league VARCHAR(200),
    nation VARCHAR(100)
);

CREATE TABLE player_clubs (
    player_id INTEGER PRIMARY KEY REFERENCES players(player_id),
    club_id INTEGER NOT NULL REFERENCES clubs(club_id),
    jersey_number INTEGER
);

CREATE TABLE player_stats (
    player_id INTEGER PRIMARY KEY REFERENCES players(player_id),
    pace INTEGER,
    shooting INTEGER,
    passing INTEGER,
    dribbling INTEGER,
    defending INTEGER,
    physic INTEGER
);

CREATE TABLE player_positions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(player_id),
    position VARCHAR(10) NOT NULL
);

-- Indexes
CREATE INDEX ix_players_overall_rating ON players(overall_rating);
CREATE INDEX ix_players_nationality ON players(nationality);
CREATE INDEX ix_clubs_league ON clubs(league);
CREATE INDEX ix_player_clubs_club_id ON player_clubs(club_id);
CREATE INDEX ix_player_positions_player_id ON player_positions(player_id);
CREATE INDEX ix_player_positions_position ON player_positions(position);
