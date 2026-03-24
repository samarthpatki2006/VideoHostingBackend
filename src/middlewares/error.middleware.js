import { ApiError } from "../utils/ApiError.js";
const errorMiddleware = (err, req, res, next) => {
    // Check if the error is an instance of our custom ApiError
    let { statusCode, message } = err;

    if (!(err instanceof ApiError)) {
        // If it's a generic error (like a DB crash), set it to 500
        statusCode = err.statusCode || 500;
        message = err.message || "Internal Server Error";
    }

    const response = {
        success: false,
        message,
        errors: err.errors || [],
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    };

    res.status(statusCode).json(response);
};

export { errorMiddleware };