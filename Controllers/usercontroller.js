import { User } from "../models/userModel.js";
import { Teacher } from "../models/teacherModel.js";
import { registerUserValidator, loginValidator, userValidator, createUserValidator, updateUserValidator } from "../validators/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { mailTransport } from "../Config/mail.js";

//user registeration
export const register = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = registerUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        }
        const email = value.email
        // check if the user exixt 
        const UserExist = await User.findOne({ email })
        if (UserExist) {
            return res.status(401).send({ message: 'User has already signed Up' })
        }
        // Encrypt user password
        const hashedPassword = bcrypt.hashSync(value.password, 10);
        // Create user
        await User.create({
            ...value,
            password: hashedPassword
        });
        // Send email to user
        await mailTransport.sendMail({
            from: "emmanuel@laremdetech.com",
            to: value.email,
            subject: "User Account Created!",
            text: `Dear user,\n\nA user account has been created for you with the following credentials.\n\nUsername: ${value.userName}\nEmail: ${value.email}\nPassword: ${value.password}\n\nThank you!`,
        });
        // Return response
        res.status(201).json({ message: 'User registered' });
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
        const user = await User.findOne({ $or: [{ username: value.username }, { email: value.email },] })
        if (!user) {
            return res.status(401).json({ message: 'User not found' });

        }

        // Verify their password
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Create a session
        req.session.user = { id: user.id }
        // Return response
        res.status(200).json({
            message: 'User logged in succesfull',
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

//Token login 
export const token = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = loginValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        }
        // Find a user with their unique identifier
        const user = await User.findOne({
            $or: [
                { username: value.username },
                { email: value.email },
            ]
        });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        // Verify their password
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Create a token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '48h' }
        );
        // Return response
        res.status(200).json({
            message: 'User logged in succesfull',
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
        const user = await User.findById(id)
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
        res.status(200).json({ message: 'User logged out' });
    } catch (error) {
        next(error);
    }
}

//update user 

export const updateUser = async (req, res, next) => {
    try {
        const { error, value } = updateUserValidator.validate(req.body);


        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const user = await User.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!User) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(201).json({ message: 'User updated', user });
    } catch (error) {
        next(error)
    }
};
// Get Users
export const getUsers = async (req, res, next) => {
    try {
        // Get all users
        const users = await User
            .find()
            .select({ password: false });
        // Return response
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}
//CReate a User 
export const createUser = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = createUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }
        // Encrypt user password
        const hashedPassword = bcrypt.hashSync(value.password, 10);
        // Create user
        await User.create({
            ...value,
            password: hashedPassword
        });
        // Send email to user
        await mailTransport.sendMail({
            from: "emmanuel@laremdetech.com",
            to: value.email,
            subject: "User Account Created!",
            text: `Dear user,\n\nA user account has been created for you with the following credentials.\n
            \nUsername: ${value.username}\nEmail: ${value.email}\nPassword: ${value.password}\nRole: ${value.role}\n\nThank you!`,
        });
        // Return response
        res.status(201).json('User Created');
    } catch (error) {
        next(error);
    }
}