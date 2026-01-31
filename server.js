require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const passport = require('./backend/config/passport');
const authRoutes = require('./backend/routes/auth');
const roadmapRoutes = require('./backend/routes/roadmap');
const assessmentRoutes = require('./backend/routes/assessment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS Configuration - CRITICAL for cross-origin session cookies
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
}));

// Session Configuration - CRITICAL for authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid', // Explicit cookie name
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Prevent XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax', // Allow cross-origin with navigation
        path: '/', // Cookie available on all paths
        domain: undefined // Don't set domain for localhost
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/assessment', assessmentRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'InSight Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Comprehensive status check with MongoDB
app.get('/api/status', async (req, res) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const status = {
        server: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        database: 'UNKNOWN'
    };

    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        status.database = 'CONNECTED';
        status.message = 'Server and database are operational';
    } catch (error) {
        status.database = 'DISCONNECTED';
        status.message = 'Server is running but database connection failed';
        status.error = error.message;
    } finally {
        await prisma.$disconnect();
    }

    const httpStatus = status.database === 'CONNECTED' ? 200 : 503;
    res.status(httpStatus).json(status);
});

// Root route - serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai-mainpage.htm'));
});

// Dashboard route - serves new dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai-formpagenew.htm'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 InSight Backend running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || `http://localhost:${PORT}`}`);
});
