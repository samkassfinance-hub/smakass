# WhatsApp Integration - Quick Commands Reference

Copy & paste ready commands for all common tasks.

---

## 🚀 START EVERYTHING

### Option 1: Linux/Mac (Recommended)
```bash
cd kaasflow/backend && bash start-all.sh
```

### Option 2: Windows PowerShell
```powershell
cd kaasflow/backend; .\start-all.ps1
```

### Option 3: Manual Docker + Flask
```bash
# Terminal 1:
cd kaasflow/backend
docker-compose -f docker-compose-whatsapp.yml up -d

# Terminal 2:
cd kaasflow/backend
python app.py
```

---

## 🧪 TESTING

### Run Full Integration Tests
```bash
cd kaasflow/backend
python test_whatsapp_integration.py
```

### Check Services Status
```bash
# Check Evolution API Docker
docker ps | grep evolution-api

# Check if containers exist
docker ps -a

# View Evolution API logs
docker logs evolution-api

# Live tail logs
docker logs -f evolution-api
```

### API Health Checks
```bash
# Evolution API
curl http://localhost:8080/health

# Flask Backend
curl http://localhost:5000/api/health

# Frontend (if running locally)
curl http://localhost:3000/
```

---

## 🛑 STOP/CLEANUP

### Stop All Services
```bash
# Stop Flask (Ctrl+C if running in terminal)

# Stop Docker containers
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down
```

### Remove Containers Completely
```bash
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down -v
```

### Stop Specific Container
```bash
docker stop evolution-api
docker rm evolution-api
```

---

## 🔄 RESTART SERVICES

### Restart Docker Container
```bash
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml restart
```

### Restart Evolution API Only
```bash
docker restart evolution-api
```

### Rebuild and Start
```bash
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml up -d --build
```

---

## 📊 MONITORING

### View Container Logs
```bash
# All logs
docker logs evolution-api

# Last 100 lines
docker logs evolution-api | tail -100

# Live logs with timestamps
docker logs -f --timestamps evolution-api
```

### Container Resource Usage
```bash
docker stats evolution-api
```

### Container Details
```bash
docker inspect evolution-api
```

---

## 🔧 CONFIGURATION

### View Current Configuration
```bash
# View .env file
cat kaasflow/backend/.env

# View docker-compose config
cat kaasflow/backend/docker-compose-whatsapp.yml
```

### Edit Configuration
```bash
# Edit .env (choose your editor)
nano kaasflow/backend/.env        # Linux/Mac
vim kaasflow/backend/.env         # Linux/Mac
code kaasflow/backend/.env        # VS Code

# Windows
notepad kaasflow/backend/.env
```

### Change Port
```bash
# Edit docker-compose.yml
# Find: ports: - "8080:8080"
# Change to: ports: - "8081:8080"

# Update .env
# WHATSAPP_API_URL=http://localhost:8081

# Restart
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml restart
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use

#### Linux/Mac
```bash
# Find process using port 8080
lsof -i :8080

# Kill process (if needed)
kill -9 <PID>
```

#### Windows PowerShell
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (if needed)
taskkill /PID <PID> /F
```

### Clear Docker Cache
```bash
docker system prune -a
```

### Rebuild Everything Fresh
```bash
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down -v
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml up -d
```

---

## 📝 DEPLOYMENT

### Test Before Deployment
```bash
cd kaasflow/backend
python test_whatsapp_integration.py
```

### Deploy to Git
```bash
cd kaasflow
git add .
git commit -m "WhatsApp integration complete"
git push origin main
```

### Deploy Backend to Vercel
```bash
# Ensure environment variables are set in Vercel dashboard
git push origin main
# Vercel will auto-deploy
```

### Deploy Frontend to Vercel
```bash
git push origin main
# Vercel will auto-deploy
```

---

## 🔐 SECURITY

### Generate New API Key
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[System.Guid]::NewGuid().ToString()
```

### Change API Key
```bash
# 1. Generate new key (see above)

# 2. Update .env
# WHATSAPP_API_KEY=<new-key>

# 3. Update docker-compose-whatsapp.yml
# AUTHENTICATION_API_KEY: <new-key>

# 4. Restart
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml restart
```

---

## 📦 DEPENDENCIES

### Install Python Dependencies
```bash
pip install -r kaasflow/backend/requirements.txt
```

### Check Python Version
```bash
python --version
```

### Check Docker Version
```bash
docker --version
docker-compose --version
```

### Update Docker Image
```bash
docker pull atendai/evolution-api:latest
```

---

## 🎯 USEFUL SHORTCUTS

### Create Alias (Linux/Mac)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias kf-start='cd kaasflow/backend && bash start-all.sh'
alias kf-test='cd kaasflow/backend && python test_whatsapp_integration.py'
alias kf-logs='docker logs -f evolution-api'
alias kf-stop='docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down'

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

### Create Batch Files (Windows)
```batch
@echo off
cd kaasflow/backend
python test_whatsapp_integration.py
```

---

## 📊 MONITORING COMMANDS

### CPU & Memory Usage
```bash
docker stats --no-stream evolution-api
```

### Network Activity
```bash
docker logs evolution-api | grep -i "error\|warn\|fail"
```

### Connection Status
```bash
curl -H "apikey: 387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371" \
  http://localhost:8080/instance/connectionState/test_instance
```

---

## 🔍 DEBUG INFORMATION

### System Information
```bash
# Linux/Mac
uname -a
docker --version
python --version

# Windows
systeminfo
docker --version
python --version
```

### Network Connectivity
```bash
# Test connectivity
ping 8.8.8.8

# Check if ports are open
# Linux/Mac
netstat -tuln | grep 8080

# Windows
netstat -ano | findstr 8080
```

### Environment Variables Check
```bash
# Linux/Mac
env | grep WHATSAPP

# Windows PowerShell
Get-ChildItem env:WHATSAPP*
```

---

## 📚 VIEW DOCUMENTATION

### Open Documentation Files
```bash
# Choose your reader
cat kaasflow/WHATSAPP_README.md
less kaasflow/WHATSAPP_SETUP_GUIDE.md
more kaasflow/DEPLOYMENT_CHECKLIST.md

# Or open in editor
code kaasflow/WHATSAPP_README.md
```

---

## 🚨 EMERGENCY COMMANDS

### Emergency Stop Everything
```bash
# Kill all
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down
pkill -f "python app.py"
```

### Reset to Fresh Start
```bash
# Remove everything
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down -v
rm evolution-api-credentials.txt
rm whatsapp_test_results.json

# Start fresh
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml up -d
```

### View All Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

---

## 💾 BACKUP COMMANDS

### Backup Configuration
```bash
# Linux/Mac
cp kaasflow/backend/.env kaasflow/backend/.env.backup
cp kaasflow/backend/docker-compose-whatsapp.yml kaasflow/backend/docker-compose-whatsapp.yml.backup

# Windows
copy kaasflow/backend/.env kaasflow/backend/.env.backup
copy kaasflow/backend/docker-compose-whatsapp.yml kaasflow/backend/docker-compose-whatsapp.yml.backup
```

### Backup Docker Volumes
```bash
docker run --rm -v evolution-data:/data -v $(pwd):/backup alpine tar czf /backup/evolution-backup.tar.gz /data
```

---

## 🆘 GET HELP

### View Error Logs
```bash
docker logs evolution-api 2>&1 | grep -i "error"
```

### Generate Debug Report
```bash
cd kaasflow/backend
echo "=== System Info ===" > debug.log
uname -a >> debug.log
echo "=== Docker ===" >> debug.log
docker --version >> debug.log
docker ps >> debug.log
echo "=== Ports ===" >> debug.log
netstat -tuln >> debug.log
echo "=== Evolution API Logs ===" >> debug.log
docker logs evolution-api >> debug.log 2>&1

cat debug.log
```

---

## 📞 CONTACT SUPPORT

- **WhatsApp:** +91 7904987242
- **Email:** samkassfinance@gmail.com

Share `debug.log` when reporting issues!

---

## 🎯 COMMON WORKFLOWS

### Daily Development
```bash
# Morning - Start everything
bash kaasflow/backend/start-all.sh

# During day - Check status
docker ps
curl http://localhost:8080/health

# Evening - Run tests before commit
python kaasflow/backend/test_whatsapp_integration.py

# Night - Stop services
docker-compose -f kaasflow/backend/docker-compose-whatsapp.yml down
```

### Before Deployment
```bash
# 1. Run all tests
python kaasflow/backend/test_whatsapp_integration.py

# 2. Check status
docker ps

# 3. View logs for errors
docker logs evolution-api

# 4. Commit changes
git add .
git commit -m "Ready for production"

# 5. Push
git push origin main
```

---

**Bookmark this page for quick access to all commands!** 🔖
