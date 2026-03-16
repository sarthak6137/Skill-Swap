const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
    try {
        // Get token from cookie, body, or Authorization header
        const token =
            req.cookies.token ||
            req.body.token ||
            req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token not found",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to req
        req.user = decoded;

        next(); // Proceed to the next function (controller)
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }
};
