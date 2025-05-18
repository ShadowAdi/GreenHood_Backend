import jwt from "jsonwebtoken";
import { CreateError } from "./CreateError.js";
export const AuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startswith("Bearer ")) {
        throw CreateError(401, "Unauthorized: No token provided");
    }
    const token = authHeader.split(" ")[1]
    try {
        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) {
            throw CreateError(500, "Failed to get The JWT Secret")
        }
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        next()
    }

}