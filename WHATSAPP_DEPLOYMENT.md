# WhatsApp Automation Deployment Guide (Oracle Cloud VPS)

This guide will walk you through setting up Evolution API (the WhatsApp engine) on a free Oracle Cloud VPS, so it can handle automated payment reminders for SamKass.

## Step 1 — Oracle Cloud Account & VPS Creation

1. **Sign Up**: Go to [Oracle Cloud](https://www.oracle.com/cloud/free/) and create a Free Tier account. You will need a credit card for verification, but you won't be charged.
2. **Create Instance**: Once logged in, go to **Compute > Instances** and click **Create Instance**.
3. **Name**: Give it a name like `samkass-whatsapp`.
4. **Image and Shape**: 
   - Click **Edit** in the "Image and shape" section.
   - For **Image**, select **Canonical Ubuntu 22.04**.
   - For **Shape**, select **Ampere** (ARM) and choose **VM.Standard.A1.Flex**. Allocate **4 OCPUs** and **24 GB RAM**. (This is included in the Always Free tier).
5. **Networking**: Create a new VCN and subnet if you don't have one. Ensure it assigns a public IPv4 address.
6. **SSH Keys**: Download the private key. You will need this to connect to your VPS.
7. **Create**: Click **Create**. It will take a few minutes to provision. Note the **Public IP Address** once it's running.

## Step 2 — VPS Initial Setup

Open your terminal (Command Prompt, PowerShell, or macOS Terminal) and connect to the VPS:

```bash
ssh -i path/to/your/private-key.key ubuntu@<YOUR_PUBLIC_IP>
```

Once connected, run the following commands to update the system and install Docker:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and dependencies
sudo apt install -y git curl docker.io docker-compose

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to the docker group so you don't need sudo for docker commands
sudo usermod -aG docker $USER

# Log out and log back in (or run 'newgrp docker') for the group change to take effect
newgrp docker
```

## Step 3 — Evolution API Installation

Now we will install Evolution API, which will connect to your WhatsApp.

```bash
# Clone the repository
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# The docker-compose.yml in the repository is mostly ready to use.
# You can edit it if you want to change the port or authentication keys.
# We will start it up in detached mode.
docker-compose up -d
```

Evolution API will now be running on port `8080` (or whichever port is configured in `docker-compose.yml`).

## Step 4 — Firewall Configuration

You need to open port `8080` both on the Ubuntu VPS itself and in the Oracle Cloud Dashboard.

### On Ubuntu VPS:
```bash
sudo ufw allow 8080/tcp
```

*(Note: Oracle instances often use `iptables` by default. If `ufw` is not active, you might need to add iptables rules: `sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT` and `sudo netfilter-persistent save`)*

### On Oracle Cloud Dashboard:
1. Go to your Instance details page.
2. Under **Primary VNIC**, click on the **Subnet**.
3. Click on the **Default Security List** for that subnet.
4. Add an **Ingress Rule**:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port Range: `8080`
   - Description: `Evolution API`
5. Save the rule.

## Step 5 — Connecting to Evolution API

Your Evolution API is now ready!
- API Base URL: `http://<YOUR_PUBLIC_IP>:8080`
- API Key: Check your `docker-compose.yml` for the `AUTHENTICATION_API_KEY` (usually defaults to a placeholder or you set it).

### Configure SamKass Environment
Update your `.env` file (or Vercel environment variables) for the Flask backend:
```env
WHATSAPP_API_URL=http://<YOUR_PUBLIC_IP>:8080
WHATSAPP_API_KEY=your_global_api_key_here
```

### Connect WhatsApp in SamKass
1. Go to the SamKass Frontend Settings Page.
2. Under "WhatsApp Automation", click **Connect WhatsApp**.
3. Scan the QR code that appears with your WhatsApp app on your phone (Linked Devices).
4. You are now connected! The backend will automatically use Evolution API to send messages on your behalf.
