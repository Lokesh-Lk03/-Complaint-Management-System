const express = require('express');
// Mongoose replaced by Supabase
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Backend API only (separated from frontend)

// Initialize Supabase Client (to verify config is loaded)
const supabase = require('./config/supabase');
if (supabase) console.log('✅ Supabase Client Initialized');

// Root route - simple text for API running indication
app.get('/', (req, res) => {
    res.json({ message: "University ERP Backend API is running." });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'University ERP Backend API',
        database: supabase ? 'supabase_connected' : 'local_mock_store',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Import Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/complaints', require('./routes/complaints.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.message);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Handle port already in use error gracefully
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
        console.error(`   To fix this, run one of the following commands:`);
        console.error(`   → Kill the process:  kill -9 $(lsof -ti tcp:${PORT})`);
        console.error(`   → Or kill all node:  killall node`);
        console.error(`   Then try starting the server again.\n`);
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});
