# Email Integration Guide for Auth Routes

## Overview
This guide explains how to integrate the new `AuthEmailService` with your existing auth routes for:
1. Welcome emails on user signup
2. OTP emails for forgot PIN

## Files Modified/Created

### 1. `auth_email_service.py` (NEW)
- Centralized email service for all auth-related emails
- Handles welcome emails and OTP emails
- Error handling and logging built-in

### 2. `auth/routes.py` (NEEDS UPDATE)
- Import the email service
- Call email methods on signup and forgot PIN

## Integration Steps

### Step 1: Update imports in `auth/routes.py`

Add this at the top of the file:

```python
from auth_email_service import email_service
```

### Step 2: Update Registration Endpoint

Find the `register()` function around line 263 and update the email sending:

**BEFORE:**
```python
try:
    send_welcome_email(email, name)
except Exception as e:
    print(f"Error sending welcome email: {e}")
```

**AFTER:**
```python
# Send welcome email asynchronously
try:
    email_result = email_service.send_welcome_email(email, name)
    if not email_result["success"]:
        print(f"Warning: Welcome email failed: {email_result['error']}")
        # Don't fail the registration if email fails
except Exception as e:
    print(f"Error sending welcome email: {e}")
```

### Step 3: Update Forgot PIN OTP Endpoint

Find the `send_forgot_pin_otp()` function around line 424 and replace the email sending:

**BEFORE:**
```python
email_sent = send_email(email, subject, body)

# Always return success (security best practice)
return jsonify({'success': True, 'message': 'OTP sent to your email. Check your inbox and spam folder.'})
```

**AFTER:**
```python
# Send OTP email using new service
otp_result = email_service.send_otp_email(email, otp)

# Always return success (security best practice - don't reveal if email doesn't exist)
return jsonify({
    'success': True, 
    'message': 'OTP sent to your email. Check your inbox and spam folder.',
    'email_service': 'resend'
})
```

### Step 4: Optional - Update Forgot Password Endpoint

If you also want to update the forgot password flow, find `forgot_password_send_otp()` around line 321:

```python
# Send OTP email using new service
otp_result = email_service.send_otp_email(email, otp)

# Always return success
return jsonify({
    'success': True,
    'message': 'OTP sent to your email. Check your inbox and spam folder.'
})
```

## Email Configuration

Make sure `.env` file has:

```
RESEND_API_KEY=re_6AzZuetp_JXwyGB87X2DAKvr7JWFfiokr
RESEND_FROM_EMAIL=welcome@samkass.site
```

## Testing

### Test Welcome Email
```bash
python -c "from auth_email_service import email_service; email_service.send_welcome_email('test@example.com', 'Test User')"
```

### Test OTP Email
```bash
python -c "from auth_email_service import email_service; email_service.send_otp_email('test@example.com', '123456')"
```

### Full Integration Test
```bash
python kaasflow/backend/auth_email_service.py
```

## Email Templates

### Welcome Email
- **Trigger:** After successful user registration
- **Content:** Founder's message from Mohanakannan S
- **Template:** `get_welcome_email_html(user_name)`

### OTP Email  
- **Trigger:** When user requests forgot PIN or password reset
- **Content:** 6-digit OTP code with expiry info
- **Template:** `get_otp_email_html(otp_code)`

## Features

✅ Sends from `welcome@samkass.site` domain
✅ Professional HTML emails with branding
✅ Error handling without breaking registration
✅ Security: Always return success to prevent email enumeration
✅ Logging for debugging
✅ Async-ready design
✅ Timeout protection (10 seconds)

## Troubleshooting

### Email not sending?
1. Check `.env` file has correct API key
2. Verify `RESEND_FROM_EMAIL=welcome@samkass.site`
3. Check email address is valid
4. Review Resend dashboard for errors

### Email going to spam?
1. Make sure domain is verified in Resend
2. Sender email should match verified domain
3. Check email content for spam triggers

### OTP not arriving?
1. Verify email address in request
2. Check spam folder
3. Review Resend API response for errors

## Next Steps

1. Test the integration with both endpoints
2. Monitor email delivery in Resend dashboard
3. Update frontend to show email confirmation message
4. Consider adding email verification flow

