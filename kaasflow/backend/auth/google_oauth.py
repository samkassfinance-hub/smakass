import requests
import os

def verify_google_token(token: str):
    """
    Verify the Google ID token using Google's tokeninfo endpoint.
    Returns the user information if the token is valid, else None.
    """
    client_id = os.environ.get('GOOGLE_CLIENT_ID') or '1008709235007-vh9u2526ol0haffogibri3kno6rtjejl.apps.googleusercontent.com'
    try:
        # Verify the ID token via Google's API
        response = requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={token}',
            timeout=5
        )
        
        if response.status_code != 200:
            print(f"Google tokeninfo API returned status {response.status_code}: {response.text}")
            return None
            
        id_info = response.json()
        
        # Verify audience (aud) matches our Client ID
        if id_info.get('aud') != client_id:
            print(f"Google Token verification failed: audience mismatch. Expected: {client_id}, got: {id_info.get('aud')}")
            return None
            
        # Optional: Check issuer (iss)
        if id_info.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
            print(f"Google Token verification failed: invalid issuer {id_info.get('iss')}")
            return None
            
        return id_info
    except Exception as e:
        print(f"Error verifying Google token: {e}")
        return None
