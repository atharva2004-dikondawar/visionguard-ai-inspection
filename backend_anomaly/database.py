import sqlite3
from datetime import datetime

DB_PATH = "inspection.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS inspections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT,
        object_id TEXT,
        filename TEXT,
        score REAL,
        result TEXT,
        timestamp TEXT
    )
    """)

    conn.commit()
    conn.close()


def save_inspection(user, object_id, filename, score, result):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
    INSERT INTO inspections (user, object_id, filename, score, result, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user, object_id, filename, score, result, datetime.utcnow().isoformat()))

    conn.commit()
    conn.close()


def get_history(user, object_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
    SELECT filename, score, result, timestamp
    FROM inspections
    WHERE user=? AND object_id=?
    ORDER BY id DESC
    """, (user, object_id))

    rows = c.fetchall()
    conn.close()

    return rows
