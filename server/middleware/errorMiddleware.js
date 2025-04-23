// middleware/errorMiddleware.js
export function errorHandler(err, req, res, next) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
}

// Add 404 handler
export function notFound(req, res, next) {
    console.error('404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
}
  