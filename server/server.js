const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files (HTML, CSS, JS) from the project root
app.use(express.static(path.join(__dirname, '..')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected to', process.env.MONGODB_URI))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('   Make sure MongoDB is running: brew services start mongodb-community');
        process.exit(1);
    });

// Root route — redirect to the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Import Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/complaints', require('./routes/complaints.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

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
