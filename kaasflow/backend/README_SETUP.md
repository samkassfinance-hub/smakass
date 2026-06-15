# 🚀 Quick Setup Guide - Email & Supabase

## ⚡ 30-Second Setup

Your credentials are **incomplete**. Here's the fastest way to fix it:

### Option 1: Interactive Setup (Easiest)
```bash
cd kaasflow/backend
python3 SETUP_CREDENTIALS.py
```

This will:
1. Ask for your complete Resend API key
2. Ask for your Supabase Service Role key
3. Create your .env file
4. Run tests automatically

### Option 2: Manual Setup
1. Open: `kaasflow/backend/.env`
2. Find these lines:
   ```
   RESEND_API_KEY=re_DxueLnyr
   ```
3. Replace with your **complete** API key from https://resend.com/api-keys
4. Save the file
5. Run: `python3 test_integration.py`

---

## 🔑 Where to Get Your Complete Keys

### Resend API Key
1. Go to: **https://resend.com/api-keys**
2. Find: **"samkass"** (ID: 61798d8d-0511-42cb-b4be-7a41a09875a2)
3. **Click on it** to reveal the complete token
4. Copy the **entire key** (40+ characters, starts with `re_`)

**Example format:**
```
re_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890ab
```

### Supabase Service Role Key
1. Go to: **https://app.supabase.com/project/eahyuwpejwbqzzolajzr/settings/api**
2. Find: **"Service Role (secret)"**
3. Copy the complete key (100+ characters)

**Example format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHl1d3BlandicXp6b2xhanpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA5MjI0NCwiZXhwIjoyMDk0NjY4MjQ0fQ.Mm4eOTioL1FpasqsqJPBeNdRP_BBW0_50ucBsf5Uoxs
```

---

## ✅ Verification

After setup, run:
```bash
python3 test_integration.py
```

**You should see:**
```
✅ TEST EMAIL SENT SUCCESSFULLY!
✅ Supabase client created successfully
✅ ALL SYSTEMS OPERATIONAL! ✅
```

---

## 📋 Quick Checklist

- [ ] Got complete Resend API key (40+ chars)
- [ ] Got complete Supabase Service Role key (100+ chars)
- [ ] Updated .env file
- [ ] Ran test_integration.py
- [ ] Saw ✅ ALL SYSTEMS OPERATIONAL!

---

## 🆘 Troubleshooting

**"My Resend key is still not working"**
→ Make sure you clicked on the "samkass" API key entry to REVEAL the full token, not just copied the preview

**"Supabase connection failed"**
→ Check that you got the "Service Role (secret)" key, not the "Anon" key

**"Still seeing 'NOT SET' in the test"**
→ Make sure your .env file is in the right location: `kaasflow/backend/.env`

---

## 📞 Support Files

- `UPDATE_ENV_NOW.txt` - Detailed instructions
- `GET_COMPLETE_API_KEY.md` - How to get your keys
- `SETUP_CREDENTIALS.py` - Interactive setup wizard
- `test_integration.py` - Comprehensive tests
- `verify_setup.sh` - Quick verification

---

**Time to complete:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** Waiting for your complete API keys ⏳
