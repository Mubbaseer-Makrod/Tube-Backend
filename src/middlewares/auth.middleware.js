import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";


/* 
problem: Verify JWT
solution:
1. fetch cookie from req
2. decode the cookie (get _id from cookie)
3. call database and fetch user from it
4. return this user in req.user
5. call next handler 
*/
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token) {
            throw new ApiError(401, "Token not available in request")
        }
    
        const decodedToken = await Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken) {
            throw new ApiError(401, "decoded Token not available")
        }
    
        const user = await User.findById(decodedToken?._id)?.select("-password -refreshToken")
        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})