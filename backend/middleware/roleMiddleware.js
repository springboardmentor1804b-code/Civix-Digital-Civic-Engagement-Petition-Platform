// This middleware checks if the logged-in user has the 'Official' role.
// It should run AFTER the 'protect' middleware.

export const isOfficial = (req, res, next) => {
  // The 'protect' middleware should have already added the user object to the request
  if (
    req.user &&
    (req.user.role === "Official" || req.user.role === "Public Official")
  ) {
    next(); // User is an official, so proceed
  } else {
    // If not, block access with a 403 Forbidden error
    res.status(403).json({ message: "Access denied. For officials only." });
  }
};
