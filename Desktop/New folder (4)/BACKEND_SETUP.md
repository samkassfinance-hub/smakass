# Backend Setup & Running Instructions

## Quick Start

Your web app has two separate servers that need to run:

### 1. Backend Server (Port 5000)
This handles authentication and API requests.

```bash
cd kaasflow/backend
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
```

### 2. Frontend Server (Port 5500)
This serves your web interface.

```bash
cd kaasflow/frontend
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5500
```

## Setup Steps

1. **Install dependencies** (if not already done):
   ```bash
   cd kaasflow/backend
   pip install -r requirements.txt
   ```

2. **Set environment variables** in `kaasflow/backend/.env`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SECRET_KEY=your-secret-key
   BACKEND_PORT=5000
   ```

3. **Start both servers** in separate terminal windows:
   - Terminal 1: `cd kaasflow/backend && python app.py`
   - Terminal 2: `cd kaasflow/frontend && python app.py`

4. **Access your app**:
   - Open browser to `http://localhost:5500`
   - You should now be able to register and login

## Troubleshooting

### "Backend offline" message still appears
- Check that backend server is running on port 5000
- Check browser console (F12) for CORS errors
- Verify `API_URL` in `kaasflow/frontend/api.js` is correct

### Port already in use
- Change port in `.env` file or use different port:
  ```bash
  BACKEND_PORT=5001 python app.py
  ```

### Supabase connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Check Supabase project is active

## What Was Fixed

✅ Created proper backend Flask app (`kaasflow/backend/app.py`)
✅ Updated frontend to serve static files correctly
✅ Fixed API endpoint configuration
✅ Separated frontend and backend servers
✅ Added health check endpoint
