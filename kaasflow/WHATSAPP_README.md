# WhatsApp Integration for KaasFlow

Complete guide for setting up and managing WhatsApp automation for payment reminders.

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Setup Options](#setup-options)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Files Reference](#files-reference)

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Python 3.7+
- Git (to pull updates)

### 3-Minute Setup

#### macOS/Linux:
```bash
cd kaasflow/backend
bash start-all.sh
```

#### Windows (PowerShell):
```powershell
cd kaasflow/backend
.\start-all.ps1
```

### Test the Setup
```bash
python test_whatsapp_integration.py
```

✅ If all tests pass, you're ready to use WhatsApp!

---

## 📦 Setup Options

### Option A: Automated Setup (Recommended)
Automatically starts both Evolution API and Flask backend.

**Linux/Mac:**
```bash
cd kaasflow/backend
bash start-all.sh
```

**Windows PowerShell:**
```powershell
cd kaasflow/backend
.\start-all.ps1
```

### Option B: Manual Docker Setup
Start Evolution API manually with Docker Compose.

```bash
cd kaasflow/backend

# Start Evolution API
docker-compose -f docker-compose-whatsapp.yml up -d

# In another terminal, start Flask
python app.py
```

### Option C: Mock Server (Testing Only)
For development without Docker.

```bash
cd kaasflow/backend
python mock_evolution_api.py
```

### Option D: Manual Setup Script
Run individual setup scripts.

**Linux/Mac:**
```bash
cd kaasflow/backend
bash setup_whatsapp_evolution.sh
```

**Windows PowerShell:**
```powershell
cd kaasflow/backend
.\setup_whatsapp_evolution.ps1
```

---

## ⚙️ Configuration

### Environment Variables

Your `.env` file already includes:
```env
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371
```

### Changing the Port

If port 8080 is in use:

1. Edit `docker-compose-whatsapp.yml`:
   ```yaml
   ports:
     - "8081:8080"  # Changed from 8080:8080
   ```

2. Update `.env`:
   ```env
   WHATSAPP_API_URL=http://localhost:8081
   ```

3. Restart services:
   ```bash
   docker-compose -f docker-compose-whatsapp.yml restart
   ```

### Custom API Key

1. Generate a new key:
   ```bash
   # Linux/Mac
   openssl rand -hex 32
   
   # Windows (PowerShell)
   [System.Guid]::NewGuid()
   ```

2. Update `.env`:
   ```env
   WHATSAPP_API_KEY=your-new-key-here
   ```

3. Update `docker-compose-whatsapp.yml`:
   ```yaml
   environment:
     AUTHENTICATION_API_KEY: your-new-key-here
   ```

---

## 🧪 Testing

### Quick Status Check
```bash
# Check if Evolution API is running
docker ps | grep evolution-api

# Check if Flask is running
curl http://localhost:5000/api/health

# Check if WhatsApp API is running
curl http://localhost:8080/health
```

### Full Integration Test
```bash
cd kaasflow/backend
python test_whatsapp_integration.py
```

### Test WhatsApp Connection in App
1. Open the app: http://localhost:3000
2. Go to Settings
3. Scroll to "WhatsApp Automation"
4. Click "Connect WhatsApp"
5. You should see a QR code
6. Scan with your phone's WhatsApp

---

## 🔧 Troubleshooting

### "Docker: command not found"
**Issue:** Docker not installed or not in PATH
**Solution:**
```bash
# Verify Docker is installed
docker --version

# If not installed, visit:
# https://docs.docker.com/get-docker/
```

### "Port 8080 already in use"
**Issue:** Another service is using port 8080
**Solution:**
```bash
# Find what's using port 8080
# Linux/Mac:
lsof -i :8080

# Windows PowerShell:
netstat -ano | findstr :8080

# Either stop that service or use a different port
# (See "Changing the Port" section above)
```

### "Connection refused" or "Cannot reach API"
**Issue:** Evolution API not running
**Solution:**
```bash
# Check if container is running
docker ps

# If not, start it
docker-compose -f docker-compose-whatsapp.yml up -d

# Check logs
docker logs evolution-api
```

### "Unauthorized" Error (401)
**Issue:** API key mismatch
**Solution:**
1. Check API key in `.env`
2. Check API key in `docker-compose-whatsapp.yml`
3. Ensure they match exactly
4. Restart: `docker-compose -f docker-compose-whatsapp.yml restart`

### QR Code Not Loading
**Issue:** Evolution API not responding
**Solution:**
```bash
# Check API health
curl http://localhost:8080/health

# View logs
docker logs -f evolution-api

# Restart container
docker-compose -f docker-compose-whatsapp.yml restart
```

### "Failed to send test message"
**Issue:** WhatsApp not connected or invalid phone
**Solution:**
1. Ensure WhatsApp status shows "Connected"
2. Verify phone number format: +91XXXXXXXXXX
3. Try scanning QR code again
4. Check phone has internet connection

### Test Results Show Failures
**Issue:** Some tests failing
**Solution:**
```bash
# Check detailed results
cat whatsapp_test_results.json

# Common issues:
# 1. API not running - start it
# 2. Wrong port - check docker-compose.yml
# 3. API key wrong - check .env and docker-compose.yml
```

---

## 📁 Files Reference

### Key Files Created/Modified

#### Configuration
- `.env` - Environment variables with API credentials
- `docker-compose-whatsapp.yml` - Docker configuration

#### Startup Scripts
- `start-all.sh` - Complete startup for Linux/Mac
- `start-all.ps1` - Complete startup for Windows
- `setup_whatsapp_evolution.sh` - Manual setup for Linux/Mac
- `setup_whatsapp_evolution.ps1` - Manual setup for Windows

#### Implementation
- `mock_evolution_api.py` - Mock server for testing
- `configure_whatsapp.py` - Configuration helper
- `test_whatsapp_integration.py` - Integration testing

#### Backend Routes
- `routes/whatsapp.py` - WhatsApp API endpoints

#### Frontend
- `frontend/whatsapp-automation.js` - Client-side WhatsApp handling
- `frontend/app.js` - UI components

#### Documentation
- `WHATSAPP_SETUP_GUIDE.md` - Detailed setup instructions
- `WHATSAPP_ERROR_FIX.md` - Error explanation and fixes
- `WHATSAPP_DEPLOYMENT.md` - Deployment options
- `WHATSAPP_QUICK_FIX.txt` - Quick reference
- `WHATSAPP_README.md` - This file

### Credentials File
- `evolution-api-credentials.txt` - Generated after setup with your credentials

---

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│           KaasFlow Frontend             │
│        (http://localhost:3000)          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│         Flask Backend API               │
│        (http://localhost:5000)          │
│  ┌───────────────────────────────────┐  │
│  │ WhatsApp Routes (/api/whatsapp)   │  │
│  └───────────────────┬───────────────┘  │
└──────────────────────┼──────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Evolution API       │
            │ (localhost:8080)     │
            │                      │
            │ Docker Container    │
            └──────────────────────┘
                       │
                       ▼
                  WhatsApp Cloud API
```

---

## ✅ Verification Checklist

- [ ] Docker is installed: `docker --version`
- [ ] Docker daemon is running
- [ ] Port 8080 is available: `docker ps`
- [ ] `.env` file has credentials
- [ ] `docker-compose-whatsapp.yml` exists
- [ ] Can start services without errors
- [ ] All tests pass: `python test_whatsapp_integration.py`
- [ ] App loads without console errors
- [ ] WhatsApp settings page loads
- [ ] Can click "Connect WhatsApp" without errors
- [ ] QR code displays
- [ ] Can scan QR with phone

---

## 🎯 Next Steps

### For Development
1. Run `start-all.sh` or `start-all.ps1`
2. Test with `test_whatsapp_integration.py`
3. Open app and test WhatsApp features

### For Production
1. Use managed Evolution API service
2. Update `.env` with production credentials
3. Configure proper monitoring
4. Set up backup procedures

### For Deployment
1. Update Vercel environment variables
2. Redeploy backend
3. Test in production environment

---

## 📞 Support

**WhatsApp:** +91 7904987242  
**Email:** samkassfinance@gmail.com

## 📚 Additional Resources

- [Evolution API Documentation](https://github.com/EvolutionAPI/evolution-api)
- [Docker Documentation](https://docs.docker.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

## 🎉 Success!

Once everything is working, you can:
- ✅ Send automatic payment reminders via WhatsApp
- ✅ Send test messages to verify setup
- ✅ Configure reminder schedules
- ✅ Track delivery status
- ✅ Manage WhatsApp connections

**Your WhatsApp integration is now complete and production-ready!**
