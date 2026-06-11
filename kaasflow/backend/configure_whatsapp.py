#!/usr/bin/env python3
"""
WhatsApp Evolution API Configuration Script
Automatically configures the .env file with Evolution API credentials
"""

import os
import sys
import secrets
import subprocess
from pathlib import Path
from datetime import datetime

def generate_api_key(length=32):
    """Generate a secure random API key"""
    return secrets.token_hex(length // 2)

def run_docker_compose(port, api_key):
    """Start Evolution API using Docker Compose"""
    docker_compose_content = f"""version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "{port}:8080"
    environment:
      AUTHENTICATION_API_KEY: {api_key}
      AUTHENTICATION_EXPOSE_IN_FETCH_DATA: "true"
      LOG_LEVEL: "debug"
      PROVIDER: "docker"
    volumes:
      - evolution-data:/home/user/evolution
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  evolution-data:
"""
    
    # Write docker-compose file
    compose_file = "docker-compose-whatsapp.yml"
    with open(compose_file, "w") as f:
        f.write(docker_compose_content)
    
    print(f"✓ Created {compose_file}")
    
    # Start the service
    print("🚀 Starting Evolution API container...")
    try:
        result = subprocess.run(
            ["docker-compose", "-f", compose_file, "up", "-d"],
            check=True,
            capture_output=True,
            text=True
        )
        print("✓ Evolution API container started")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Evolution API: {e.stderr}")
        return False

def update_env_file(api_url, api_key):
    """Update the .env file with WhatsApp credentials"""
    env_file = ".env"
    
    if not os.path.exists(env_file):
        print(f"❌ {env_file} not found")
        return False
    
    # Read existing content
    with open(env_file, "r") as f:
        lines = f.readlines()
    
    # Find and update WHATSAPP_API_URL and WHATSAPP_API_KEY
    updated = False
    new_lines = []
    
    url_found = False
    key_found = False
    
    for line in lines:
        if line.startswith("WHATSAPP_API_URL="):
            new_lines.append(f"WHATSAPP_API_URL={api_url}\n")
            url_found = True
            updated = True
        elif line.startswith("WHATSAPP_API_KEY="):
            new_lines.append(f"WHATSAPP_API_KEY={api_key}\n")
            key_found = True
            updated = True
        else:
            new_lines.append(line)
    
    # If not found, append to end
    if not url_found or not key_found:
        if not url_found:
            new_lines.append(f"WHATSAPP_API_URL={api_url}\n")
        if not key_found:
            new_lines.append(f"WHATSAPP_API_KEY={api_key}\n")
        updated = True
    
    # Write back
    with open(env_file, "w") as f:
        f.writelines(new_lines)
    
    print(f"✓ Updated {env_file}")
    return True

def save_credentials(api_url, api_key):
    """Save credentials to a file for reference"""
    credentials_file = "evolution-api-credentials.txt"
    
    content = f"""Evolution API Configuration
============================
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

API URL: {api_url}
API Key: {api_key}

Configuration Status: ✓ COMPLETE

Next Steps:
1. Restart your backend application
2. Test WhatsApp connection in the app
3. For production: Use a managed Evolution API service

File Locations:
- Environment: .env
- Docker Compose: docker-compose-whatsapp.yml
- This file: {credentials_file}

Useful Docker Commands:
- View logs: docker logs evolution-api
- Restart: docker-compose -f docker-compose-whatsapp.yml restart
- Stop: docker-compose -f docker-compose-whatsapp.yml down
- Update image: docker pull atendai/evolution-api:latest

Support:
- WhatsApp: +91 7904987242
- Email: samkassfinance@gmail.com
"""
    
    with open(credentials_file, "w") as f:
        f.write(content)
    
    print(f"✓ Credentials saved to {credentials_file}")

def main():
    print("🚀 WhatsApp Evolution API Configuration")
    print("="*50)
    print()
    
    # Configuration parameters
    port = 8080
    hostname = os.getenv("WHATSAPP_HOSTNAME", "localhost")
    api_key = generate_api_key()
    api_url = f"http://{hostname}:{port}"
    
    print(f"📍 Configuration:")
    print(f"   Hostname: {hostname}")
    print(f"   Port: {port}")
    print(f"   API Key: {api_key[:16]}...")
    print()
    
    # Check Docker
    print("🔍 Checking Docker...")
    try:
        result = subprocess.run(
            ["docker", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✓ {result.stdout.strip()}")
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ Docker not found. Please install Docker first.")
        print("   Visit: https://docs.docker.com/get-docker/")
        sys.exit(1)
    
    print()
    
    # Start Evolution API
    print("🚀 Starting Evolution API...")
    if not run_docker_compose(port, api_key):
        print("❌ Failed to start Evolution API")
        sys.exit(1)
    
    print()
    
    # Wait for service to be ready
    print("⏳ Waiting for Evolution API to be ready...")
    import time
    time.sleep(15)
    
    # Update .env file
    print("📝 Updating .env file...")
    if not update_env_file(api_url, api_key):
        print("❌ Failed to update .env file")
        sys.exit(1)
    
    # Save credentials
    print("💾 Saving credentials...")
    save_credentials(api_url, api_key)
    
    print()
    print("✅ Setup Complete!")
    print("="*50)
    print()
    print("🎯 What's Next:")
    print("   1. Restart your Flask backend")
    print("   2. Open the app and go to Settings")
    print("   3. Click 'Connect WhatsApp'")
    print("   4. Scan the QR code")
    print()
    print(f"📍 API URL: {api_url}")
    print(f"🔑 API Key: {api_key}")
    print()

if __name__ == "__main__":
    main()
