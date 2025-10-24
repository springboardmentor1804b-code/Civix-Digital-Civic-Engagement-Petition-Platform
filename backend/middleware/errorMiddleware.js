const errorHandler = (err, req, res, next) => {
  // If a status code is already set by controller/middleware, use it
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  res.json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Server error, please try again later"
        : err.message, // show detailed msg only in dev
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
