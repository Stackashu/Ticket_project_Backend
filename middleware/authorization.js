import jwt from "jsonwebtoken";

// NOTE: The original code was missing the 'next' parameter, so 'next()' wouldn't work.
// Also, it was not catching typical token format errors very explicitly.

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Access denied. No Authorization header provided." });
    }
    // Bearer <token>
    const [scheme, token] = authHeader.split(" ");

    if (!token || scheme !== "Bearer") {
      return res.status(401).json({ error: "Access denied. Invalid token format." });
    }

    // Debug: If you keep getting 'Invalid token',
    // check that the JWT_SECRET matches EXACTLY when signing and verifying the token.
    // Also, ensure that the token is not expired and is signed properly.
    // Try console.log(process.env.JWT_SECRET, token) here if debugging.

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // For detailed error diagnostics, you can uncomment below for more info:
    // console.error("Auth error:", error.name, error.message);
    return res.status(401).json({ error: "Invalid token", message: error.message });
  }
};
