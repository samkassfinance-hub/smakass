#!/usr/bin/env python3
"""
Populate Supabase with test data
Run this to add sample users, clients, loans, and payments for testing
"""

from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("\n" + "=" * 80)
print("POPULATING SUPABASE WITH TEST DATA")
print("=" * 80)

# Add test users
print("\n[1] Adding Test Users...")
users = [
    {
        "id": "user_001",
        "email": "john@samkass.local",
        "financier_name": "John Doe",
        "business_name": "John's Finance Co."
    },
    {
        "id": "user_002",
        "email": "sarah@samkass.local",
        "financier_name": "Sarah Smith",
        "business_name": "Sarah's Lending Services"
    },
    {
        "id": "user_003",
        "email": "mike@samkass.local",
        "financier_name": "Mike Johnson",
        "business_name": "Johnson Finance Group"
    }
]

for user in users:
    try:
        supabase.table("kf_users").insert(user).execute()
        print(f"  + {user['financier_name']} ({user['email']})")
    except Exception as e:
        print(f"  - Error adding {user['email']}: {str(e)[:50]}")

# Add test clients
print("\n[2] Adding Test Clients...")
clients = [
    {
        "id": "client_001",
        "user_id": "user_001",
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "email": "ramesh@example.com",
        "business_type": "Agriculture"
    },
    {
        "id": "client_002",
        "user_id": "user_001",
        "name": "Priya Singh",
        "phone": "9123456789",
        "email": "priya@example.com",
        "business_type": "Retail"
    },
    {
        "id": "client_003",
        "user_id": "user_002",
        "name": "Ahmed Hassan",
        "phone": "8765432109",
        "email": "ahmed@example.com",
        "business_type": "Manufacturing"
    },
    {
        "id": "client_004",
        "user_id": "user_002",
        "name": "Divya Patel",
        "phone": "7654321098",
        "email": "divya@example.com",
        "business_type": "Services"
    },
    {
        "id": "client_005",
        "user_id": "user_003",
        "name": "Rajesh Gupta",
        "phone": "6543210987",
        "email": "rajesh@example.com",
        "business_type": "Trading"
    }
]

for client in clients:
    try:
        supabase.table("kf_clients").insert(client).execute()
        print(f"  + {client['name']} ({client['phone']})")
    except Exception as e:
        print(f"  - Error adding {client['name']}: {str(e)[:50]}")

# Add test loans
print("\n[3] Adding Test Loans...")
loans = [
    {
        "id": "loan_001",
        "user_id": "user_001",
        "client_id": "client_001",
        "amount": 100000,
        "interest_rate": 15,
        "duration": 12
    },
    {
        "id": "loan_002",
        "user_id": "user_001",
        "client_id": "client_002",
        "amount": 50000,
        "interest_rate": 18,
        "duration": 24
    },
    {
        "id": "loan_003",
        "user_id": "user_002",
        "client_id": "client_003",
        "amount": 200000,
        "interest_rate": 12,
        "duration": 36
    },
    {
        "id": "loan_004",
        "user_id": "user_002",
        "client_id": "client_004",
        "amount": 75000,
        "interest_rate": 16,
        "duration": 18
    },
    {
        "id": "loan_005",
        "user_id": "user_003",
        "client_id": "client_005",
        "amount": 150000,
        "interest_rate": 14,
        "duration": 24
    }
]

for loan in loans:
    try:
        supabase.table("kf_loans").insert(loan).execute()
        print(f"  + Loan Rs.{loan['amount']:,} at {loan['interest_rate']}% for {loan['duration']} months")
    except Exception as e:
        print(f"  - Error adding loan: {str(e)[:50]}")

# Add test payments
print("\n[4] Adding Test Payments...")
today = datetime.now().date()
payments = [
    {
        "id": "payment_001",
        "loan_id": "loan_001",
        "amount": 9000,
        "payment_date": str(today - timedelta(days=10)),
        "receipt_id": "REC_001",
        "status": "completed"
    },
    {
        "id": "payment_002",
        "loan_id": "loan_001",
        "amount": 9000,
        "payment_date": str(today - timedelta(days=5)),
        "receipt_id": "REC_002",
        "status": "completed"
    },
    {
        "id": "payment_003",
        "loan_id": "loan_002",
        "amount": 2500,
        "payment_date": str(today),
        "receipt_id": "REC_003",
        "status": "completed"
    },
    {
        "id": "payment_004",
        "loan_id": "loan_003",
        "amount": 6000,
        "payment_date": str(today - timedelta(days=3)),
        "receipt_id": "REC_004",
        "status": "completed"
    },
    {
        "id": "payment_005",
        "loan_id": "loan_004",
        "amount": 4500,
        "payment_date": str(today),
        "receipt_id": "REC_005",
        "status": "pending"
    }
]

for payment in payments:
    try:
        supabase.table("kf_payments").insert(payment).execute()
        print(f"  + Payment Rs.{payment['amount']:,} ({payment['status']})")
    except Exception as e:
        print(f"  - Error adding payment: {str(e)[:50]}")

# Add test settings
print("\n[5] Adding Test Settings...")
settings = [
    {
        "user_id": "user_001",
        "theme": "dark",
        "lang": "en",
        "extra_clients": 0
    },
    {
        "user_id": "user_002",
        "theme": "light",
        "lang": "en",
        "extra_clients": 5
    },
    {
        "user_id": "user_003",
        "theme": "dark",
        "lang": "en",
        "extra_clients": 10
    }
]

for setting in settings:
    try:
        supabase.table("kf_settings").insert(setting).execute()
        print(f"  + Settings for user {setting['user_id']}")
    except Exception as e:
        print(f"  - Error adding settings: {str(e)[:50]}")

print("\n" + "=" * 80)
print("TEST DATA POPULATION COMPLETE")
print("=" * 80)

print("\nData Summary:")
print(f"  Users: {len(users)}")
print(f"  Clients: {len(clients)}")
print(f"  Loans: {len(loans)}")
print(f"  Payments: {len(payments)}")
print(f"  Settings: {len(settings)}")

print("\nNext Steps:")
print("1. Go to https://app.supabase.com")
print("2. Select project: puhovplmbaldrisxqssy")
print("3. Click 'Table Editor'")
print("4. View the tables with data!")
print("\n")
