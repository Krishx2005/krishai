from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class Player(Base):
    __tablename__ = "players"

    player_id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    age = Column(Integer)
    nationality = Column(String(100))
    overall_rating = Column(Integer)
    potential = Column(Integer)
    value_eur = Column(BigInteger)
    wage_eur = Column(BigInteger)
    release_clause_eur = Column(BigInteger)

    positions = relationship("PlayerPosition", back_populates="player", cascade="all, delete-orphan")
    club_link = relationship("PlayerClub", back_populates="player", uselist=False, cascade="all, delete-orphan")
    stats = relationship("PlayerStats", back_populates="player", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_players_overall_rating", "overall_rating"),
        Index("ix_players_nationality", "nationality"),
    )


class Club(Base):
    __tablename__ = "clubs"

    club_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, unique=True)
    league = Column(String(200))
    nation = Column(String(100))

    players = relationship("PlayerClub", back_populates="club")

    __table_args__ = (
        Index("ix_clubs_league", "league"),
    )


class PlayerClub(Base):
    __tablename__ = "player_clubs"

    player_id = Column(Integer, ForeignKey("players.player_id"), primary_key=True)
    club_id = Column(Integer, ForeignKey("clubs.club_id"), nullable=False)
    jersey_number = Column(Integer)

    player = relationship("Player", back_populates="club_link")
    club = relationship("Club", back_populates="players")

    __table_args__ = (
        Index("ix_player_clubs_club_id", "club_id"),
    )


class PlayerStats(Base):
    __tablename__ = "player_stats"

    player_id = Column(Integer, ForeignKey("players.player_id"), primary_key=True)
    pace = Column(Integer)
    shooting = Column(Integer)
    passing = Column(Integer)
    dribbling = Column(Integer)
    defending = Column(Integer)
    physic = Column(Integer)

    player = relationship("Player", back_populates="stats")


class PlayerPosition(Base):
    __tablename__ = "player_positions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey("players.player_id"), nullable=False)
    position = Column(String(10), nullable=False)

    player = relationship("Player", back_populates="positions")

    __table_args__ = (
        Index("ix_player_positions_player_id", "player_id"),
        Index("ix_player_positions_position", "position"),
    )
