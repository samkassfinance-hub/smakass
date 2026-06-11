# WhatsApp Integration Setup Guide

## Issue Diagnosis

The error you're seeing occurs because the WhatsApp API credentials are not configured in your backend environment variables.

## Root Cause

The backend requires two environment variables to connect to the Evolution API (WhatsApp Business API):
- `WHATSAPP_API_URL` - The URL of your Evolution API server
- `WHATSAPP_API_KEY` - The API key for authentication

## Solution

### Step 1: Set Up Evolution API Server

You need to deploy an Evolution API server. You have two options:

#### Option A: Self-Hosted (Recommended for Production)
1. Deploy Evolution API on your server (Oracle VPS, DigitalOcean, etc.)
2. Follow: https://github.com/EvolutionAPI/evolution-api
3. Use Docker for easy deployment:
   ```bash
   docker run -d \
     -p 8080:8080 \
     -e AUTHENTICATION_API_KEY=your-secure-api-key \
     atendai/evolution-api:latest
   ```

#### Option B: Cloud Hosted Service
1. Use Evolution API hosting services (paid)
2. They provide the URL and API key for you

### Step 2: Configure Environment Variables

#### For Local Development:
1. Edit `kaasflow/backend/.env` file
2. Add these lines:
   ```env
   WHATSAPP_API_URL=http://your-server-ip:8080
   WHATSAPP_API_KEY=your-evolution-api-key
   ```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Add two variables:
   - **Name:** `WHATSAPP_API_URL`  
     **Value:** `http://your-server-ip:8080`
   
   - **Name:** `WHATSAPP_API_KEY`  
     **Value:** `your-evolution-api-key`

4. Redeploy your application

### Step 3: Test the Connection

1. Restart your backend server (if running locally)
2. Open the app and go to Settings
3. Scroll to "WhatsApp Automation" section
4. Click "Connect WhatsApp"
5. Scan the QR code with your WhatsApp

## Verification

After configuration, the error message should be replaced with:
- A QR code to scan
- Status changing from "Not Connected" to "Connected"

## Troubleshooting

### Error: "Failed to create WhatsApp instance"
- Check if Evolution API server is running
- Verify the URL is correct (include http:// or https://)
- Ensure port 8080 (or your custom port) is accessible

### Error: "WhatsApp API credentials not configured"
- Environment variables are not set correctly
- Restart the backend after setting variables
- For Vercel: Ensure variables are saved and redeployed

### QR Code Not Loading
- Evolution API might be down
- Check server logs: `docker logs <container-id>`
- Verify API key is correct

## Cost Consideration

Evolution API is free and open-source, but you need:
- A server to host it (~$5-10/month)
- OR use a managed Evolution API service (~$15-30/month)

## Alternative: Skip WhatsApp Integration

If you don't need WhatsApp automation right now:
1. Simply don't click the "Connect WhatsApp" button
2. The app works fully without it
3. You'll just send reminders manually

## Need Help?

Contact support:
- WhatsApp: +91 7904987242
- Email: samkassfinance@gmail.com
