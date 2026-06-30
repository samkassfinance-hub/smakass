import os
import sqlite3
from datetime import datetime, timedelta

def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'users.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_subscriptions_db():
    try:
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                plan_type TEXT NOT NULL,
                plan_name TEXT NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                payment_id TEXT NOT NULL,
                amount_paid REAL NOT NULL,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error initializing subscriptions database: {e}")

# Initialize subscriptions table
init_subscriptions_db()

class PlanManager:
    PLANS = {
        'monthly': {
            'name': 'Monthly Plan',
            'duration_days': 30,
            'price': 270
        },
        'quarterly': {
            'name': 'Quarterly Plan',
            'duration_days': 90,
            'price': 850
        },
        'yearly': {
            'name': 'Yearly Plan',
            'duration_days': 365,
            'price': 1999
        }
    }
    
    @staticmethod
    def activate_plan(email, plan_type, payment_id):
        """Activate plan for user after successful payment in SQLite"""
        if plan_type not in PlanManager.PLANS:
            return {'success': False, 'error': 'Invalid plan type'}
        
        plan = PlanManager.PLANS[plan_type]
        start_date = datetime.now()
        end_date = start_date + timedelta(days=plan['duration_days'])
        
        try:
            conn = get_db_connection()
            # Deactivate previous active plans for this email
            conn.execute('''
                UPDATE subscriptions 
                SET status = 'expired' 
                WHERE email = ? AND status = 'active'
            ''', (email,))
            
            # Insert the new subscription
            conn.execute('''
                INSERT INTO subscriptions 
                (email, plan_type, plan_name, start_date, end_date, payment_id, amount_paid, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
            ''', (email, plan_type, plan['name'], start_date.isoformat(), end_date.isoformat(), payment_id, plan['price']))
            conn.commit()
            conn.close()
        except Exception as e:
            return {'success': False, 'error': f'Database error: {str(e)}'}
        
        subscription = {
            'plan_type': plan_type,
            'status': 'active',
            'valid_until': end_date.isoformat(),
            'updated_at': start_date.isoformat()
        }
        
        return {
            'success': True,
            'subscription': subscription,
            'message': f'{plan["name"]} activated until {end_date.strftime("%Y-%m-%d")}'
        }
    
    @staticmethod
    def check_plan_status(email):
        """Check if user's plan is active in SQLite"""
        try:
            conn = get_db_connection()
            subscription = conn.execute('''
                SELECT * FROM subscriptions 
                WHERE email = ? AND status = 'active'
                ORDER BY end_date DESC LIMIT 1
            ''', (email,)).fetchone()
            conn.close()
            
            if subscription:
                end_date = datetime.fromisoformat(subscription['end_date'])
                if datetime.now() > end_date:
                    # Update status to expired
                    conn = get_db_connection()
                    conn.execute('UPDATE subscriptions SET status = "expired" WHERE id = ?', (subscription['id'],))
                    conn.commit()
                    conn.close()
                    return {'active': False, 'expired': True}
                return {
                    'active': True,
                    'end_date': end_date.isoformat(),
                    'plan_type': subscription['plan_type']
                }
        except Exception as e:
            print(f"Error checking plan status: {e}")
            
        return {'active': False}
    
    @staticmethod
    def get_plan_price(plan_type):
        """Get price for a plan"""
        return PlanManager.PLANS.get(plan_type, {}).get('price', 0)

