# Bugfix Requirements Document

## Introduction

The "Forgot PIN" feature fails to deliver OTP emails to users despite displaying a success message. Users attempting to reset their security PIN cannot receive the verification code needed to proceed, rendering the entire forgot PIN flow non-functional. This bug completely blocks users from recovering access to their accounts when they forget their security PIN.

The application uses the Resend API for email delivery, but emails sent via the `send_email()` function in `auth/routes.py` are not reaching user inboxes. The backend returns "OTP sent to your email" regardless of actual email delivery status, masking the underlying failure.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user requests a forgot PIN OTP via `/forgot-pin/send-otp` THEN the system returns success message "OTP sent to your email" even if email delivery fails

1.2 WHEN the `RESEND_API_KEY` environment variable is missing or invalid THEN the system logs an error but still returns success to the user without delivering the email

1.3 WHEN the Resend API returns an error response (401, 403, 422, timeout, or connection error) THEN the system logs the error but still returns success to the user without delivering the email

1.4 WHEN using "onboarding@resend.dev" as the from address THEN emails may be subject to rate limits or delivery restrictions that prevent inbox delivery

1.5 WHEN the `send_email()` function returns `False` (indicating delivery failure) THEN the `/forgot-pin/send-otp` route ignores this return value and responds with success

### Expected Behavior (Correct)

2.1 WHEN a user requests a forgot PIN OTP via `/forgot-pin/send-otp` THEN the system SHALL verify the `RESEND_API_KEY` is properly configured before attempting to send email

2.2 WHEN the `RESEND_API_KEY` is missing, invalid, or too short (< 30 characters) THEN the system SHALL log detailed error information to backend logs for debugging while returning a generic success message to the user (security practice)

2.3 WHEN the Resend API returns a successful response (status 200 or 201) THEN the system SHALL deliver the OTP email to the user's inbox within seconds

2.4 WHEN using a verified sender domain or appropriate from address THEN emails SHALL be delivered reliably without rate limiting or spam filtering

2.5 WHEN the Resend API returns an error response THEN the system SHALL log comprehensive error details (status code, error message, troubleshooting hints) to backend logs for debugging

2.6 WHEN deployed to Vercel THEN the system SHALL use the `RESEND_API_KEY` environment variable configured in Vercel's environment settings

2.7 WHEN an OTP email is successfully sent THEN the system SHALL log the email ID, recipient, and confirmation from Resend API

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user requests a forgot PIN OTP THEN the system SHALL CONTINUE TO generate a 6-digit random OTP

3.2 WHEN a user requests a forgot PIN OTP THEN the system SHALL CONTINUE TO store the OTP with a 10-minute expiry in the `pin_reset_otps` dictionary

3.3 WHEN a user requests a forgot PIN OTP THEN the system SHALL CONTINUE TO return a success message to the user (security practice to avoid revealing whether an email exists)

3.4 WHEN the email parameter is missing from the request THEN the system SHALL CONTINUE TO return a 400 error with "Email required"

3.5 WHEN a user verifies the OTP via `/forgot-pin/verify-otp` THEN the system SHALL CONTINUE TO validate the OTP against the stored value

3.6 WHEN email sending fails for any reason THEN the system SHALL CONTINUE TO log detailed error information to backend logs without exposing sensitive details to the end user

3.7 WHEN the OTP email HTML template is rendered THEN the system SHALL CONTINUE TO display the 6-digit OTP code prominently with the same styling and formatting
