# Google OAuth & Multi-tenant Data Isolation Architecture

This document provides a detailed breakdown of how to implement a secure "Continue with Google" authentication system while ensuring strict data isolation per user account.

## 1. Authentication Flow (Google OAuth)

To guarantee that each email creates a distinct, unique user account, we implement the following flow:

### 1.1 Identity Provider (IdP) Setup
*   **Provider**: Google Cloud Console (OAuth 2.0 Client IDs).
*   **Scopes**: `openid`, `email`, `profile`.
*   **Callback URL**: `https://your-domain.com/auth/google/callback`.

### 1.2 The Login Process
1.  **Initiation**: User clicks "Continue with Google".
2.  **Consent**: Redirected to Google to authenticate and authorize the app.
3.  **Callback & Verification**: Google redirects back with an authorization code.
4.  **Backend Exchange**: The backend exchanges the code for an ID Token and Access Token.
5.  **Token Validation**: Backend verifies the ID Token signature and audience.
6.  **User Provisioning**:
    *   Extract the `email` and `sub` (Google's unique user ID).
    *   Query the database: `SELECT * FROM users WHERE email = ?`.
    *   **If not found**: Create a NEW user record. Generate a unique `tenant_id` for this user.
    *   **If found**: Retrieve the existing `tenant_id`.

## 2. Session Management

To ensure sessions are strictly tied to the logged-in email and protected against cross-device leakage:

### 2.1 JWT (JSON Web Tokens)
*   **Payload**: Include `user_id`, `email`, and `tenant_id`.
*   **Expiration**: Short-lived access tokens (e.g., 15 minutes) and HTTP-only refresh tokens (e.g., 7 days).

### 2.2 Secure Storage
*   **Never** store sensitive session tokens in `localStorage` or `sessionStorage` where they are vulnerable to XSS.
*   **Use `HttpOnly`, `Secure`, `SameSite=Strict` cookies** for the refresh token and optionally the access token.

### 2.3 Device & Session Tracking
*   When a user logs in on a *new* device, a new session entry is created in the `sessions` table.
*   This does NOT overlap data; both sessions point to the exact same `tenant_id` based strictly on the verified Google email.
*   If another email logs in on the *same* device, the previous session cookies are overwritten/invalidated, completely switching the context to the new `tenant_id`.

## 3. Robust Data Isolation (Multi-Tenancy)

Ensuring user data is *never* shared between accounts is the most critical requirement. We achieve this using a **Pool Model with Row-Level Security (RLS)**.

### 3.1 Database Schema Design
Every table containing user data must have a `tenant_id` column.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    tenant_id UUID UNIQUE NOT NULL
);

CREATE TABLE clients (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES users(tenant_id),
    name VARCHAR(255) NOT NULL
    -- other fields
);
```

### 3.2 Row-Level Security (RLS) - PostgreSQL Example
RLS enforces data isolation at the database kernel level, preventing accidental data leaks from backend application bugs.

```sql
-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create a policy: Users can only see and modify rows where tenant_id matches their session
CREATE POLICY tenant_isolation_policy ON clients
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### 3.3 Backend Middleware Enforcement
1.  On every API request, the authentication middleware extracts the `tenant_id` from the JWT.
2.  The middleware sets the database session context *before* executing any queries:
    ```sql
    SET LOCAL app.current_tenant = 'user-tenant-id-here';
    ```
3.  Any query (e.g., `SELECT * FROM clients`) is automatically filtered by the database to only return rows belonging to that `tenant_id`.

## 4. Summary of Security Guarantees
*   **No Email Spoofing**: We rely completely on Google's cryptographically signed ID tokens to verify the email.
*   **No Data Overlap**: Row-Level Security makes it mathematically impossible for a SQL query to return data from another tenant, even if a developer forgets to add `WHERE tenant_id = ?`.
*   **Device Isolation**: Logging in with a different Google account instantly replaces the `HttpOnly` session cookie, immediately cutting off access to the previous account's data on that device.
