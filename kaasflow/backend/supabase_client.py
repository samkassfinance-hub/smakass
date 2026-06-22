"""
Supabase Client Configuration and Utilities
Handles database operations, authentication, and data sync
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional, Dict, List, Any

load_dotenv()

class SupabaseManager:
    """Centralized Supabase client manager"""
    
    _instance: Optional['SupabaseManager'] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseManager, cls).__new__(cls)
            cls._instance._initialize_client()
        return cls._instance
    
    def _initialize_client(self):
        """Initialize Supabase client with error handling"""
        try:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
            
            if not url or not key:
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables")
            
            self._client = create_client(url, key)
            print("✅ Supabase client initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Supabase client: {e}")
            self._client = None
    
    @property
    def client(self) -> Optional[Client]:
        """Get Supabase client instance"""
        return self._client
    
    def is_connected(self) -> bool:
        """Check if Supabase is connected"""
        return self._client is not None


class SupabaseService:
    """Service layer for Supabase operations"""
    
    def __init__(self):
        self.manager = SupabaseManager()
        self.client = self.manager.client
    
    def _check_connection(self):
        """Verify Supabase connection"""
        if not self.client:
            raise RuntimeError("Supabase client not initialized")
    
    # ─── User Operations ───────────────────────────────────────
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Fetch user by ID"""
        try:
            self._check_connection()
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Fetch user by email"""
        try:
            self._check_connection()
            response = self.client.table('users').select('*').eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None
    
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create new user"""
        try:
            self._check_connection()
            response = self.client.table('users').insert(user_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    def update_user(self, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update user data"""
        try:
            self._check_connection()
            response = self.client.table('users').update(updates).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating user: {e}")
            return None
    
    # ─── Data Backup Operations ────────────────────────────────
    
    def save_backup(self, user_email: str, backup_data: Dict) -> bool:
        """Save user app data backup"""
        try:
            self._check_connection()
            backup = {
                "user_email": user_email,
                "clients_json": backup_data.get("clients", []),
                "loans_json": backup_data.get("loans", []),
                "payments_json": backup_data.get("payments", []),
                "settings_json": backup_data.get("settings", {}),
                "updated_at": "now()"
            }
            self.client.table('app_backups').upsert(backup).execute()
            return True
        except Exception as e:
            print(f"Error saving backup: {e}")
            return False
    
    def get_backup(self, user_email: str) -> Optional[Dict]:
        """Retrieve user app data backup"""
        try:
            self._check_connection()
            response = self.client.table('app_backups').select('*').eq('user_email', user_email).execute()
            if response.data:
                backup = response.data[0]
                return {
                    "clients": backup.get("clients_json", []),
                    "loans": backup.get("loans_json", []),
                    "payments": backup.get("payments_json", []),
                    "settings": backup.get("settings_json", {})
                }
            return None
        except Exception as e:
            print(f"Error retrieving backup: {e}")
            return None
    
    # ─── Subscription Operations ───────────────────────────────
    
    def get_subscription(self, user_id: str) -> Optional[Dict]:
        """Fetch user subscription"""
        try:
            self._check_connection()
            response = self.client.table('subscriptions').select('*').eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching subscription: {e}")
            return None
    
    def create_subscription(self, subscription_data: Dict) -> Optional[Dict]:
        """Create new subscription"""
        try:
            self._check_connection()
            response = self.client.table('subscriptions').insert(subscription_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating subscription: {e}")
            return None
    
    def update_subscription(self, subscription_id: str, updates: Dict) -> Optional[Dict]:
        """Update subscription"""
        try:
            self._check_connection()
            response = self.client.table('subscriptions').update(updates).eq('id', subscription_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating subscription: {e}")
            return None
    
    # ─── Generic Operations ───────────────────────────────────
    
    def query_table(self, table_name: str, filters: Optional[Dict] = None) -> List[Dict]:
        """Query any table with optional filters"""
        try:
            self._check_connection()
            query = self.client.table(table_name).select('*')
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Error querying {table_name}: {e}")
            return []
    
    def insert_record(self, table_name: str, data: Dict) -> Optional[Dict]:
        """Insert record into any table"""
        try:
            self._check_connection()
            response = self.client.table(table_name).insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error inserting into {table_name}: {e}")
            return None
    
    def update_record(self, table_name: str, record_id: str, updates: Dict) -> Optional[Dict]:
        """Update record in any table"""
        try:
            self._check_connection()
            response = self.client.table(table_name).update(updates).eq('id', record_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating {table_name}: {e}")
            return None
    
    def delete_record(self, table_name: str, record_id: str) -> bool:
        """Delete record from any table"""
        try:
            self._check_connection()
            self.client.table(table_name).delete().eq('id', record_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting from {table_name}: {e}")
            return False


# Singleton instance
supabase_service = SupabaseService()
