"""
Example: How to integrate subscription validation into existing client routes.

This file shows how to add subscription checks to your client management endpoints.
Copy these patterns to your actual client routes.
"""

from flask import Blueprint, request, jsonify
from subscription_manager import subscription_manager

# Create a blueprint for client routes
clients_bp = Blueprint('clients', __name__)


# ─────────────────────────────────────────────────────────────────────
# Example 1: GET list of clients (no subscription check needed)
# ─────────────────────────────────────────────────────────────────────
@clients_bp.route('/api/clients/list', methods=['GET'])
def list_clients():
    """
    Get all clients for a user.
    No subscription check needed - free users can view their existing 20 clients.
    """
    user_email = request.headers.get('X-User-Email') or request.args.get('email')
    
    if not user_email:
        return {'error': 'User email required'}, 401
    
    try:
        # Query database for user's clients
        # Example: SELECT * FROM clients WHERE user_email = user_email
        clients = []  # Replace with actual database query
        
        return {'success': True, 'clients': clients}, 200
    
    except Exception as e:
        print(f"❌ Error listing clients: {e}")
        return {'error': str(e)}, 500


# ─────────────────────────────────────────────────────────────────────
# Example 2: POST add new client (SUBSCRIPTION CHECK REQUIRED)
# ─────────────────────────────────────────────────────────────────────
@clients_bp.route('/api/clients/add', methods=['POST'])
def add_client():
    """
    Add a new client. MUST validate subscription before allowing.
    
    RULES:
    - Free tier: max 20 clients
    - Paid tier (active): unlimited clients
    - Expired tier: reverts to free (20 client limit)
    
    Request:
    {
        "name": "Client Name",
        "email": "client@example.com",
        "phone": "9876543210"
    }
    
    Response:
    {
        "success": true,
        "client_id": 123,
        "message": "Client added successfully"
    }
    
    Error Response (if limit reached):
    {
        "success": false,
        "error": "Client limit reached",
        "plan": "Free Plan",
        "limit": 20,
        "current_count": 20,
        "upgrade_url": "/upgrade"
    }
    
    Error Response (if expired):
    {
        "success": false,
        "error": "Subscription expired",
        "expiry_time": "2025-02-14T15:45:00Z",
        "renew_url": "/renew"
    }
    """
    user_email = request.headers.get('X-User-Email')
    data = request.get_json() or {}
    
    # ─────────────────────────────────────────────────────────────────
    # STEP 1: Validate user email
    # ─────────────────────────────────────────────────────────────────
    if not user_email:
        return {'error': 'User email required (X-User-Email header)'}, 401
    
    # ─────────────────────────────────────────────────────────────────
    # STEP 2: Validate request data
    # ─────────────────────────────────────────────────────────────────
    client_name = data.get('name', '').strip()
    client_email = data.get('email', '').strip()
    client_phone = data.get('phone', '').strip()
    
    if not all([client_name, client_email, client_phone]):
        return {'error': 'Missing required fields: name, email, phone'}, 400
    
    # ─────────────────────────────────────────────────────────────────
    # STEP 3: Check subscription status (NEW)
    # ─────────────────────────────────────────────────────────────────
    subscription = subscription_manager.get_user_subscription(user_email)
    
    # If subscription expired, block (unless free tier originally)
    if subscription['is_expired'] and subscription['plan_type'] != 'free':
        return {
            'success': False,
            'error': 'Subscription expired. Please renew to add clients.',
            'expiry_time': subscription['expiry_time'],
            'plan': subscription['plan_name']
        }, 403
    
    # ─────────────────────────────────────────────────────────────────
    # STEP 4: Check client limit (NEW)
    # ─────────────────────────────────────────────────────────────────
    current_client_count = subscription_manager.get_client_count(user_email)
    can_add, limit_info = subscription_manager.check_client_limit(
        user_email,
        current_client_count
    )
    
    if not can_add:
        return {
            'success': False,
            'error': f'Client limit reached. You have {limit_info["current_count"]} of {limit_info["limit"]}.',
            'plan': limit_info['plan_name'],
            'limit': limit_info['limit'],
            'current_count': limit_info['current_count'],
            'reason': f'Upgrade to {limit_info["plan_name"]} to add more clients'
        }, 400
    
    # ─────────────────────────────────────────────────────────────────
    # STEP 5: Add client to database (OLD)
    # ─────────────────────────────────────────────────────────────────
    try:
        # Example: INSERT INTO clients (user_email, name, email, phone) VALUES (...)
        # Replace with your actual database insertion logic
        
        new_client = {
            'id': 123,  # From database
            'user_email': user_email,
            'name': client_name,
            'email': client_email,
            'phone': client_phone,
            'created_at': '2025-01-15T10:30:00Z'
        }
        
        # Actually insert into database here
        # client_id = database.insert_client(...)
        
        return {
            'success': True,
            'client_id': new_client['id'],
            'message': f'Client "{client_name}" added successfully',
            'client': new_client
        }, 201
    
    except Exception as e:
        print(f"❌ Error adding client: {e}")
        return {'error': f'Failed to add client: {str(e)}'}, 500


# ─────────────────────────────────────────────────────────────────────
# Example 3: DELETE client (no subscription check, user owns it)
# ─────────────────────────────────────────────────────────────────────
@clients_bp.route('/api/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    """
    Delete a client. No subscription check needed - user can delete their own data.
    """
    user_email = request.headers.get('X-User-Email')
    
    if not user_email:
        return {'error': 'User email required'}, 401
    
    try:
        # Verify ownership: only user who created client can delete it
        # client = database.get_client(client_id)
        # if client['user_email'] != user_email:
        #     return {'error': 'Unauthorized'}, 403
        
        # Delete from database
        # database.delete_client(client_id)
        
        return {'success': True, 'message': 'Client deleted'}, 200
    
    except Exception as e:
        print(f"❌ Error deleting client: {e}")
        return {'error': str(e)}, 500


# ─────────────────────────────────────────────────────────────────────
# Example 4: Batch import clients (SUBSCRIPTION CHECK REQUIRED)
# ─────────────────────────────────────────────────────────────────────
@clients_bp.route('/api/clients/import', methods=['POST'])
def import_clients():
    """
    Batch import multiple clients.
    
    Request:
    {
        "clients": [
            { "name": "Client 1", "email": "...", "phone": "..." },
            { "name": "Client 2", "email": "...", "phone": "..." },
            ...
        ]
    }
    """
    user_email = request.headers.get('X-User-Email')
    data = request.get_json() or {}
    clients_to_import = data.get('clients', [])
    
    if not user_email:
        return {'error': 'User email required'}, 401
    
    if not clients_to_import:
        return {'error': 'No clients to import'}, 400
    
    # ─────────────────────────────────────────────────────────────────
    # Check subscription ONCE before importing multiple
    # ─────────────────────────────────────────────────────────────────
    current_count = subscription_manager.get_client_count(user_email)
    
    # Check if user will exceed limit after import
    total_after_import = current_count + len(clients_to_import)
    can_add, limit_info = subscription_manager.check_client_limit(
        user_email,
        total_after_import - 1  # Check if next addition would work
    )
    
    if not can_add:
        return {
            'success': False,
            'error': f'Cannot import {len(clients_to_import)} clients. Would exceed limit of {limit_info["limit"]}.',
            'current_count': current_count,
            'import_count': len(clients_to_import),
            'limit': limit_info['limit'],
            'available_slots': limit_info['limit'] - current_count
        }, 400
    
    # ─────────────────────────────────────────────────────────────────
    # Add all clients
    # ─────────────────────────────────────────────────────────────────
    imported = []
    failed = []
    
    for client_data in clients_to_import:
        try:
            # Validate each client
            if not all([client_data.get('name'), client_data.get('email'), client_data.get('phone')]):
                failed.append({'data': client_data, 'error': 'Missing required fields'})
                continue
            
            # Insert into database
            # client_id = database.insert_client(...)
            imported.append({'id': 123, 'name': client_data.get('name')})
        
        except Exception as e:
            failed.append({'data': client_data, 'error': str(e)})
    
    return {
        'success': True,
        'imported_count': len(imported),
        'failed_count': len(failed),
        'imported': imported,
        'failed': failed if failed else None
    }, 201


# ─────────────────────────────────────────────────────────────────────
# Example 5: GET subscription status for UI (NEW)
# ─────────────────────────────────────────────────────────────────────
@clients_bp.route('/api/clients/status', methods=['GET'])
def get_client_status():
    """
    Get current client status (count, limit, plan).
    Used by frontend to show in UI: "12 / 20 clients"
    """
    user_email = request.headers.get('X-User-Email') or request.args.get('email')
    
    if not user_email:
        return {'error': 'User email required'}, 401
    
    subscription = subscription_manager.get_user_subscription(user_email)
    client_count = subscription_manager.get_client_count(user_email)
    can_add, limit_info = subscription_manager.check_client_limit(user_email, client_count)
    
    return {
        'plan': subscription['plan_name'],
        'is_expired': subscription['is_expired'],
        'client_count': client_count,
        'client_limit': limit_info['limit'],
        'can_add_client': can_add,
        'slots_remaining': limit_info['limit'] - client_count if limit_info['limit'] != 'Unlimited' else 'Unlimited'
    }, 200


# ─────────────────────────────────────────────────────────────────────
# SUMMARY: Key Integration Points
# ─────────────────────────────────────────────────────────────────────
"""
1. GET endpoints (list, view, export):
   - No subscription check needed
   - User can always view their existing data
   
2. POST endpoints (create, add, import):
   - ALWAYS check subscription
   - Verify not expired
   - Check client limit
   - Return 400 if limit reached, 403 if expired
   
3. PUT/PATCH endpoints (update, edit):
   - May need subscription check if it enables premium features
   - No check if just updating existing client data
   
4. DELETE endpoints (remove, archive):
   - No subscription check needed
   - User can delete their own data
   
5. Response Format:
   - Include plan name and limit info in error responses
   - Frontend can show: "Upgrade to Monthly to add more clients"
   - Make it easy for user to understand what to do next
   
6. Status Codes:
   - 200: Success
   - 201: Created
   - 400: Bad request / client limit reached
   - 401: Unauthorized (no email)
   - 403: Forbidden (subscription expired)
   - 500: Server error
"""
