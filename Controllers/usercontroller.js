import { UserModel } from "../models/userModel.js";
import { registerValidator, loginValidator } from "../validators/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//user registeration
export const register = async (req, res) => {
    try {
        // Validate request
        const { value, error } = registerValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        } 
        const email = value.email
        // check if the user exixt 
        const UserExist = await User.findOne({ email })
        if (UserExist) {
           return res.status(401).send({ message: 'User has already signed Up'})
        } 
        // Encrypt user password
        const hashedPassword = bcrypt.hashSync(value.password, 10);
        // Create user
        await UserModel.create({
            ...value,
            password: hashedPassword
        });
        // Return response
        res.status(201).json('User registered');
    } catch (error) {
        next(error);
    }
}


//Session Login 
export const login = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = loginValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }
        // Find a user with their unique identifier
        const user = await UserModel.findOne({
            $or: [
                { username: value.username },
                { email: value.email },
            ]
        });
        if (!user) {
            return res.status(401).json('User not found');
        }
        // Verify their password
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json('Invalid credentials');
        }
        // Create a session
        req.session.user = { id: user.id }
        // Return response
        res.status(200).json('User logged in');
    } catch (error) {
        next(error);
    }
}

//Token login 
export const token = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = loginValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        }
        // Find a user with their unique identifier
        const user = await UserModel.findOne({
            $or: [
                { username: value.username },
                { email: value.email },
            ]
        });
        if (!user) {
            return res.status(401).json('User not found');
        }
        // Verify their password
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json('Invalid credentials');
        }
        // Create a token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '48h' }
        );
        // Return response
        res.status(200).json({
            message: 'User logged in',
            accessToken: token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName
               
             }
        });
    } catch (error) {
        next(error);
    }
}

//User Profile
export const profile = async (req, res, next) => {
    try {
        // Get user id from session or request
        const id = req.session?.user?.id || req?.user?.id;
        // Find user by id
        const user = await UserModel.findById(id)
            .select({ password: false });
        // Return response
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}
// user logout
export const logout = async (req, res, next) => {
    try {
        // Destroy user session
        await req.session.destroy();
        // Return response
        res.status(200).json('User logged out');
    } catch (error) {
        next(error);
    }
}