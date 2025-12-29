export const errorHandler = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message =
    err.isOperational ? err.message : 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
};
