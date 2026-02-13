const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };
        error.message = err.message;

        console.error(err);

        // Prisma - Record not found
        if (err.code === 'P2025') {
            const message = 'Resource not found';
            error = new Error(message);
            error.statusCode = 404;
        }

        // Prisma - Unique constraint violation (duplicate key)
        if (err.code === 'P2002') {
            const fields = err.meta?.target?.join(', ') || 'field';
            const message = `Duplicate value entered for: ${fields}`;
            error = new Error(message);
            error.statusCode = 409;
        }

        // Prisma - Foreign key constraint failed
        if (err.code === 'P2003') {
            const message = 'Related resource not found';
            error = new Error(message);
            error.statusCode = 400;
        }

        // Prisma - Invalid input / validation error
        if (err.code === 'P2000') {
            const message = 'Invalid input data';
            error = new Error(message);
            error.statusCode = 400;
        }

        // JWT errors
        if (err.name === 'JsonWebTokenError') {
            const message = 'Invalid token';
            error = new Error(message);
            error.statusCode = 401;
        }

        if (err.name === 'TokenExpiredError') {
            const message = 'Token has expired';
            error = new Error(message);
            error.statusCode = 401;
        }

        // Custom errors with statusCode (thrown manually in controllers)
        if (err.statusCode) {
            error.statusCode = err.statusCode;
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Server error',
        });
    } catch (catchError) {
        next(catchError);
    }
};

export default errorMiddleware;
