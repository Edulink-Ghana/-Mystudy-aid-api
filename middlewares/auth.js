import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Teacher } from "../models/teacherModel.js";
import { roles } from "../Config/role.js";



export const isAuthenticated = async (req, res, next) => {
    // Check if session has user
    if (req.session.user) {
        // Check if user exist in database
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(401).json('User Does Not Exist!');
        }
        // Call next function
        next();
    } else if (req.headers.authorization) {
        try {
            // Extract token from headers
            const token = req.headers.authorization.split(' ')[1];
            // Verify the token to get user and append to request
            req.user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
            // Check if user exist in database
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json('User Does Not Exist!');
            }
            // Call next function
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token expired' });
        }
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
}

export const isAuthenticatedteacher = async (req, res, next) => {
    try {
        // Check if session has user
        if (req.session.user) {
            // Check if user exist in database
            const user = await Teacher.findById(req.session.user.id);
            if (!user) {
                return res.status(401).json('User Does Not Exist!');
            }
            // Call next function
            next();
        } else if (req.headers.authorization) {
            try {
                // Extract token from headers
                const token = req.headers.authorization.split(' ')[1];
                // Verify the token to get user and append to request
                req.user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                // Check if user exist in database
                const user = await Teacher.findById(req.user.id);
                if (!user) {
                    return res.status(401).json('User Does Not Exist!');
                }
                // Call next function
                next();
            } catch (error) {
                res.status(401).json({ error: 'Token expired' });
            }
        } else {
            res.status(401).json({ error: 'User not authenticated' });
        }
    } catch (error) {
        next(error)
    }
}

export const isAuthorized = (Permission) => {
    return async (req, res, next) => {
        try {
            //Get user Id from session or request
            const Id = req.session?.user?.id || req?.user?.id
            // Fond user by id
            const user = await User.findById(Id);
            // Find user role with permission 
            const userRole = roles.find(element => element.role === user.role)
            //Use role to check if user has permission
            if (userRole && userRole.permissions.includes(Permission)) {
                next();
            } else {
                res.status(403).json('Not Authorized')
            }
        } catch (error) {
            next(error)
        }
    }

}