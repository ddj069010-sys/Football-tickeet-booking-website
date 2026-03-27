// ─── GoalBooker Backend — Express Server Entry Point ───
const express = require('express');
const cors = require('cors');
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '../.env') });

// ── DB Connection (auto-connects on require) ──
require("./config/db");

// ── Routes ──
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const teamRoutes = require('./routes/teamRoutes');
const stadiumRoutes = require('./routes/stadiumRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { getMyTickets } = require('./controllers/ticketController');
const { verifyToken } = require('./middleware/auth');

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Core Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ── User-specific shortcuts ──
app.get('/api/users/me/tickets', verifyToken, getMyTickets);

// ── Database Connection Workflow API ──
const dbStatusRoutes = require('./routes/dbStatusRoutes');
app.use('/api/db-connection', dbStatusRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GoalBooker API is running', timestamp: new Date().toISOString() });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
    console.error("Global Error:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// ── Start Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});
