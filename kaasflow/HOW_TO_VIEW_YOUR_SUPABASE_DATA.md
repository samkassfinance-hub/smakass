# HOW TO VIEW YOUR SUPABASE DATA

## Your Supabase is CONNECTED & WORKING ✅

Your Supabase credentials are configured and connected. Data is stored successfully in your database.

---

## Current Data in Your Database

**3 Users:**
1. John Doe (john@samkass.local)
2. Sarah Smith (sarah@samkass.local)
3. Mike Johnson (mike@samkass.local)

**3 Settings** (one for each user)

**Total: 6 Records Verified** ✅

---

## How to View Your Data

### Method 1: Supabase Dashboard (EASIEST)

**Step 1:** Open your browser and go to:
```
https://app.supabase.com
```

**Step 2:** Login with your Supabase account

**Step 3:** You'll see your projects. Select:
```
Project ID: puhovplmbaldrisxqssy
```

**Step 4:** In the left sidebar, click:
```
"Table Editor"
```

**Step 5:** You'll see your tables:
- kf_users (click to see 3 users)
- kf_clients
- kf_loans
- kf_payments
- kf_settings (click to see 3 settings)

**Step 6:** Click on "kf_users" to see your users!

---

### Method 2: View with Python Script

Run this command in your terminal:

```bash
python kaasflow/backend/view_all_supabase_data.py
```

This will display all your data in the terminal.

---

### Method 3: Check Specific User

Create a file `check_user.py`:

```python
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Get user John Doe
response = supabase.table("kf_users").select("*").eq("email", "john@samkass.local").execute()

if response.data:
    print("User found:")
    print(response.data[0])
else:
    print("User not found")
```

Run it:
```bash
python check_user.py
```

---

## Your Supabase Configuration

```
URL: https://puhovplmbaldrisxqssy.supabase.co
Project ID: puhovplmbaldrisxqssy
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
Status: CONNECTED ✅
```

---

## Verify Connection Anytime

Run this command:

```bash
python kaasflow/backend/diagnose_supabase.py
```

It will show:
- Connection status
- Number of records in each table
- All database content

---

## Your Tables Structure

### kf_users
Stores user accounts
- id (unique identifier)
- email (user's email)
- financier_name (user's name)
- business_name (business name)
- created_at (creation date)
- updated_at (last update)

### kf_settings
Stores user preferences
- id (setting ID)
- user_id (which user)
- theme (dark/light)
- lang (language)
- extra_clients (number of extra clients purchased)

### kf_clients
Ready to store client information
- id
- user_id
- name
- phone
- email
- address
- occupation

### kf_loans
Ready to store loan records
- id
- user_id
- client_id
- principal (loan amount)
- interest_rate
- duration (months)

### kf_payments
Ready to store payments
- id
- user_id
- loan_id
- amount
- date
- status

---

## Add More Data

To add more test data, run:

```bash
python kaasflow/backend/populate_test_data.py
```

This will add:
- 2 more clients
- 3 loans
- 5 payments

Then check Supabase dashboard to see it!

---

## Quick Steps

1. Go to https://app.supabase.com
2. Login
3. Select project: puhovplmbaldrisxqssy
4. Click "Table Editor"
5. Click "kf_users"
6. See your 3 users!

---

**Your Supabase is connected and working!** 🎉

All your data is being stored and retrieved successfully.

Your credentials in `.env` are correct and active.

No changes needed!
