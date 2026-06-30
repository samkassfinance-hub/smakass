import sqlite3
import os

is_vercel = os.environ.get("VERCEL") == "1"
if is_vercel:
    DATABASE_PATH = "/tmp/users.db"
    # Copy starting users.db to /tmp if it doesn't exist
    original_db = os.path.join(os.path.dirname(__file__), '..', 'users.db')
    if not os.path.exists(DATABASE_PATH) and os.path.exists(original_db):
        import shutil
        try:
            shutil.copy2(original_db, DATABASE_PATH)
        except Exception as e:
            print(f"Failed to copy users.db to /tmp: {e}")
else:
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'users.db')


def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            pin_hash TEXT NOT NULL,
            financier_name TEXT DEFAULT '',
            business_name TEXT DEFAULT '',
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


def get_user_by_phone(phone):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE phone = ?', (phone,)).fetchone()
    conn.close()
    return user


def create_user(phone, pin_hash, financier_name='', business_name='', role='admin'):
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO users (phone, pin_hash, financier_name, business_name, role) VALUES (?, ?, ?, ?, ?)',
        (phone, pin_hash, financier_name, business_name, role)
    )
    conn.commit()
    user = conn.execute('SELECT * FROM users WHERE phone = ?', (phone,)).fetchone()
    conn.close()
    return dict(user)


def update_pin(phone, new_pin_hash):
    conn = get_db_connection()
    conn.execute(
        'UPDATE users SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE phone = ?',
        (new_pin_hash, phone)
    )
    conn.commit()
    conn.close()


def phone_exists(phone):
    return get_user_by_phone(phone) is not None
