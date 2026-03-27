const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @desc Register flat schema user
const register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, existing) => {
        if (err) return res.status(500).json({ error: 'Database check failed.' });
        if (existing.length > 0) return res.status(409).json({ error: 'Email already registered.' });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error('Registration DB error:', err);
                        return res.status(500).json({ error: 'Registration failed: ' + err.message });
                    }

                    const token = jwt.sign(
                        { id: result.insertId, email, role: 'user' }, 
                        process.env.JWT_SECRET, 
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'Registration successful.',
                        token,
                        user: { id: result.insertId, name, email, role: 'user' }
                    });
                }
            );
        } catch (hashError) {
            console.error('Hashing error:', hashError);
            res.status(500).json({ error: 'Secure hashing failed.' });
        }
    });
};

// @desc Login flat schema user
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database login fetch failed.' });
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

        const user = rows[0];
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful.',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } catch (compareError) {
            res.status(500).json({ error: 'Password validation failed.' });
        }
    });
};

const getProfile = (req, res) => {
    db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Could not fetch profile.' });
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: rows[0] });
    });
};

const switchRole = (req, res) => {
    res.status(400).json({ error: 'Role modification explicitly detached in the simplified schema structure natively.' });
};

module.exports = { register, login, getProfile, switchRole };
