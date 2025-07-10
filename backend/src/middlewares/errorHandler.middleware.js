
const errorHandler = (err, req, res, next) => {
    statusCode = err.statusCode || 500
    message = err.message || "Internal Server Error "
    errors = err.errors || []

    return res.status(statusCode).json({
        success: false,
        message,
        errors
    })
}


export default errorHandler;