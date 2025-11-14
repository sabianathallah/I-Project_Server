const errorHandler = (err, req, res, next) => {
    let status = 500
    let message = 'Internal Server Error'

    // Log error for debugging (optional, can be removed in production)
    console.error('Error:', err.name, err.message);

    // Sequelize Validation Errors
    if (err.name == 'SequelizeValidationError') {
        status = 400
        message = err.errors[0].message
    }

    if (err.name == 'SequelizeUniqueConstraintError') {
        status = 400
        message = err.errors[0].message
    }

    if (err.name == 'SequelizeDatabaseError' || err.name == 'SequelizeForeignKeyConstraintError') {
        status = 400
        message = 'Invalid input'
    }

    // Custom Application Errors
    if (err.name == 'BadRequest') {
        message = err.message || 'Please input email or password'
        status = 400
    }

    if (err.name == 'LoginError') {
        message = 'Invalid email or password'
        status = 401
    }

    // JWT Errors
    if (err.name == 'Unauthorized' || err.name == 'JsonWebTokenError') {
        message = 'Please login first'
        status = 401
    }

    if (err.name == 'TokenExpiredError') {
        message = 'Token has expired, please login again'
        status = 401
    }

    if (err.name == 'Forbidden') {
        message = 'You dont have any access'
        status = 403
    }

    if (err.name == 'NotFound') {
        status = 404
        message = err.message || 'Data not found'
    }

    // Multer Errors (File Upload)
    if (err.name == 'MulterError') {
        status = 400
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size is too large'
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded'
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected field name in file upload'
        } else {
            message = 'File upload error'
        }
    }

    // Payload Too Large Error
    if (err.type === 'entity.too.large' || err.name === 'PayloadTooLargeError') {
        status = 413
        message = 'Request body is too large'
    }

    // Midtrans API Errors
    if (err.httpStatusCode || err.ApiResponse) {
        status = err.httpStatusCode || 400
        message = err.message || err.ApiResponse?.status_message || 'Payment gateway error'
    }

    // Handle Google OAuth errors
    if (err.name === 'GoogleAuthError') {
        status = 401
        message = 'Invalid or expired Google token'
    }

    // Handle errors with custom statusCode property
    if (err.statusCode && !status) {
        status = err.statusCode
    }

    // Handle errors with custom message
    if (err.message && status === 500 && !message.includes('Internal')) {
        message = err.message
    }

    res.status(status).json({
        message
    })
}

module.exports = errorHandler