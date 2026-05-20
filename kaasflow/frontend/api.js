const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:5000/api'
    : '/api'; // Backend API URL

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Pass stored Supabase session JWT token to backend
    const session = JSON.parse(localStorage.getItem('supabase_session'));
    if (session && session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'API request failed');
        }
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function saveSession(sessionData) {
    if (sessionData.session) {
        localStorage.setItem('supabase_session', JSON.stringify(sessionData.session));
    }
    localStorage.setItem('kf_user', JSON.stringify(sessionData.user));
}