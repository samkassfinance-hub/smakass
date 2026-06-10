import requests
import json
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self, api_url, api_key):
        self.api_url = api_url.rstrip('/') if api_url else ''
        self.api_key = api_key
        
    def _headers(self):
        return {
            'Content-Type': 'application/json',
            'apikey': self.api_key
        }

    def create_instance(self, instance_name):
        """Creates a new WhatsApp instance in Evolution API"""
        url = f"{self.api_url}/instance/create"
        payload = {
            "instanceName": instance_name,
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS",
        }
        
        try:
            response = requests.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating WhatsApp instance: {str(e)}")
            return None

    def get_qr_code(self, instance_name):
        """Gets base64 QR code to scan"""
        url = f"{self.api_url}/instance/connect/{instance_name}"
        try:
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching QR code: {str(e)}")
            return None

    def get_connection_status(self, instance_name):
        """Gets instance connection status"""
        url = f"{self.api_url}/instance/connectionState/{instance_name}"
        try:
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            data = response.json()
            return data.get('instance', {}).get('state') == 'open'
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting connection status: {str(e)}")
            return False

    def send_text_message(self, instance_name, phone, message):
        """Sends a text message to a number"""
        url = f"{self.api_url}/message/sendText/{instance_name}"
        
        # Evolution API expects numbers without '+' or spaces, typically with country code
        # We will assume 'phone' is already formatted mostly correctly but strip non-digits just in case
        clean_phone = ''.join(filter(str.isdigit, str(phone)))
        
        payload = {
            "number": clean_phone,
            "options": {
                "delay": 1200,
                "presence": "composing",
                "linkPreview": False
            },
            "textMessage": {
                "text": message
            }
        }
        
        try:
            response = requests.post(url, headers=self._headers(), json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending WhatsApp message: {str(e)}")
            return None

    def disconnect(self, instance_name):
        """Logs out and deletes the instance"""
        url = f"{self.api_url}/instance/logout/{instance_name}"
        try:
            requests.delete(url, headers=self._headers())
            # Evolution API deletes instance on logout or we can call delete separately
            delete_url = f"{self.api_url}/instance/delete/{instance_name}"
            requests.delete(delete_url, headers=self._headers())
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error disconnecting WhatsApp instance: {str(e)}")
            return False
