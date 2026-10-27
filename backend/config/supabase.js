const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const rawUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const rawKey = process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.trim() : '';

const isValidHttpUrl = (str) => {
    if (!str) return false;
    try {
        const u = new URL(str);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

const isConfigured = isValidHttpUrl(rawUrl) &&
    !rawUrl.includes('your-project.supabase.co') &&
    !rawUrl.includes('YOUR_SUPABASE_URL') &&
    rawKey &&
    rawKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    rawKey.length > 10;

let supabase = null;

if (isConfigured) {
    try {
        supabase = createClient(rawUrl, rawKey);
        console.log('✅ Supabase Client Initialized with live configuration');
    } catch (err) {
        console.error('❌ Failed to initialize Supabase client:', err.message);
        supabase = null;
    }
} else {
    console.warn('⚠️ WARNING: Supabase URL and Key are not configured in backend/.env. Running with robust local storage fallback.');
}

module.exports = supabase;
