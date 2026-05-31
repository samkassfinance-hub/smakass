// KaasFlow Auth Logic — with strict per-user data isolation

let API_BASE = 'https://www.samkass.site/api';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_BASE = 'http://127.0.0.1:5000/api';
} else if (window.location.port === '5500') {
    API_BASE = `http://${window.location.hostname}:5000/api`;
} else if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    API_BASE = window.location.origin + '/api';
}

/**
 * USER-SCOPED DATA ISOLATION
 * All app data keys that must be isolated per user.
 * When a different email logs in, these keys are cleared so no data leaks.
 */
const USER_SCOPED_KEYS = [
    'kf_settings',
    'kf_subscription',
    'kf_clients',
    'kf_loans',
    'kf_payments',
    'kf_notifications',
    'kf_pin_set',
    'kf_app_pin',
    'kf_theme',
    'kf_lang',
    'kf_last_sync',
    'kf_backup_data'
];

/**
 * Returns the email of the currently stored session, or null.
 */
function getCurrentSessionEmail() {
    try {
        const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
        return session?.user?.email || null;
    } catch {
        return null;
    }
}

/**
 * Clears all user-scoped data from localStorage.
 * Called when a different user logs in to prevent data crossover.
 */
function clearUserScopedData() {
    USER_SCOPED_KEYS.forEach(key => localStorage.removeItem(key));

    // Also clear any dynamic user-specific subscription keys (kf_subscription_<identifier>)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('kf_subscription_') || k.startsWith('kf_backup_'))) {
            keysToRemove.push(k);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
}

/**
 * Saves the session and enforces isolation.
 * If the incoming email differs from the stored session email, all previous
 * user data is wiped before the new session is written.
 */
function saveSession(token, user) {
    const incomingEmail = user?.email || null;
    const existingEmail = getCurrentSessionEmail();

    if (existingEmail && incomingEmail && existingEmail.toLowerCase() !== incomingEmail.toLowerCase()) {
        // Different user — wipe all previous user data
        clearUserScopedData();
    }

    localStorage.setItem('kf_session', JSON.stringify({ token, user }));
}

document.addEventListener('DOMContentLoaded', () => {
    const tabPassword = document.getElementById('tab-password');
    const tabMagic = document.getElementById('tab-magic');
    const passwordForm = document.getElementById('password-form');
    const magicLinkForm = document.getElementById('magic-link-form');
    const errorBox = document.getElementById('error-box');
    const successBox = document.getElementById('success-box');

    // Tab Switching Logic
    tabPassword.addEventListener('click', () => {
        tabPassword.classList.add('active');
        tabMagic.classList.remove('active');
        passwordForm.style.display = 'block';
        magicLinkForm.style.display = 'none';
        clearMessages();
    });

    tabMagic.addEventListener('click', () => {
        tabMagic.classList.add('active');
        tabPassword.classList.remove('active');
        magicLinkForm.style.display = 'block';
        passwordForm.style.display = 'none';
        clearMessages();
    });

    function clearMessages() {
        errorBox.style.display = 'none';
        successBox.style.display = 'none';
    }

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        successBox.style.display = 'none';
    }

    function showSuccess(msg) {
        successBox.textContent = msg;
        successBox.style.display = 'block';
        errorBox.style.display = 'none';
    }

    // Password Login Handler
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember_me: rememberMe })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Login successful! Redirecting...');
                saveSession(data.token, data.user);
                setTimeout(() => { window.location.href = '/'; }, 1000);
            } else {
                showError(data.error || 'Login failed');
            }
        } catch (err) {
            showError('Network error. Please check your connection.');
        }
    });

    // Magic Link Request Handler
    magicLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('magic-email').value;

        try {
            const response = await fetch(`${API_BASE}/magic-link/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(data.message || 'Check your email for the magic link!');
                if (data.link) {
                    console.log('Dev Magic Link:', data.link);
                }
            } else {
                showError(data.error || 'Failed to send magic link');
            }
        } catch (err) {
            showError('Network error. Please try again.');
        }
    });
});

// Google GIS Callback — called by Google Identity Services after user picks account
async function handleCredentialResponse(response) {
    const errorBox = document.getElementById('error-box');
    const successBox = document.getElementById('success-box');

    try {
        const res = await fetch(`${API_BASE}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            successBox.textContent = 'Google login successful! Redirecting...';
            successBox.style.display = 'block';

            // Enforce isolation: clear previous user's data if email changed
            saveSession(data.token, data.user);

            setTimeout(() => { window.location.href = '/'; }, 1000);
        } else {
            errorBox.textContent = data.error || 'Google authentication failed';
            errorBox.style.display = 'block';
        }
    } catch (err) {
        errorBox.textContent = 'Network error during Google login';
        errorBox.style.display = 'block';
    }
}
