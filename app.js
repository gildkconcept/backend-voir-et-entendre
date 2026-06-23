const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./app/middleware/errorHandler');

// Routes
const linkRoutes = require('./app/routes/linkRoutes');
const clickRoutes = require('./app/routes/clickRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'https://voir-et-entendre.vercel.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/links', linkRoutes);
app.use('/api/click', clickRoutes);

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        name: 'Voir et Entendre API',
        version: '1.0.0',
        endpoints: {
            links: '/api/links',
            click: '/api/click (POST)',
            health: '/health'
        }
    });
});

// Gestionnaire d'erreurs
app.use(errorHandler);

module.exports = app;