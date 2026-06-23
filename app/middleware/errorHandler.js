const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur:', err.message);

    const status = err.status || 500;
    const message = err.message || 'Erreur interne du serveur';

    res.status(status).json({
        error: message,
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler;