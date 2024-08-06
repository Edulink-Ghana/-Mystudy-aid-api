import { ResetToken, User } from "../models/userModel.js";
import { Teacher } from "../models/teacherModel.js";
import { Booking } from "../models/bookingModel.js";
import { registerUserValidator, loginValidator, createUserValidator, updateUserValidator, forgotPasswordValidator, resetPasswordValidator } from "../validators/user.js";
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
        const user = await User.findOne({
            $or: [
                { userName: value.userName },
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
                { userName: value.userName },
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
        const options = { sort: { startDate: -1 } }
        const user = await User.findById(id)
            .select({ password: false })
            .populate({
                path: 'bookings',
                select:"timeslot date grade area subject teacher",
                options
             })
        // Return response
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}



// Get user's bookings
export const getUserBookings = async (req, res, next) => {
    try {
      // Get user ID from session or request
      const userId = req.session?.user?.id || req?.user?.id;
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      // Find bookings associated with the user
      const bookings = await Booking.find({ user: userId })
        .populate({
          path: 'teacher',
          select: 'firstName lastName userName email', // Select teacher fields
        });
  
      // Return response
      res.status(200).json(bookings);
    } catch (error) {
      next(error);
    }
  };
  
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


//forgot Password
export const forgotPassword = async (req, res, next) => {
    try {
        //validate request
        const { value, error } = forgotPasswordValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        }
        //Find a user with provided email
        const user = await User.findOne({ email: value.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        //Generate Reset Token 
        const resetToken = await ResetToken.create({
            userId: user.id,
        });
        // Send reset email
        await mailTransport.sendMail({
            to: value.email,
            from: "emmanuel@laremdetech.com",
            subject: "Reset Password",
            html: `
        <h3>Hello ${user.firstName}</h3>
        <h4> Please follow the link below to reset your Password</h4>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken.id}" > Click Here</a> `
        });
        //Return Response 
        res.status(200).json('Password reset email sent')
    } catch (error) {
        next(error);
    }
}
//Verify Reset Password Token
export const verifyResetToken = async (req, res, next) => {
    try {
        //Find Reset Token by id 
        const resetToken = await ResetToken.findById(req.params.id);
        if (!resetToken) {
            return res.status(404).json({ message: 'Reset Token Not Found' });
        }
        console.log(resetToken)
        //check if token is valid
        if (resetToken.expired || Date.now() > new Date(resetToken.expiredAt).getTime()) {
            return res.status(409).json({ message: 'Invalid Reset Token' });
        }
        //Return Response
        res.status(200).json({ message: 'Valid Reset Token' });

    } catch (error) {
        next(error);
    }
}

// Reset Password

export const resetPassword = async (req, res, next) => {
    try {
        //validate request
        const { value, error } = resetPasswordValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        }
        //Find reset Token By Id
        const resetToken = await ResetToken.findById(value.resetToken);
        if (!resetToken0) {
            return res.status(404).json({ message: 'Reset Token not found' });
        }
        //Check if token is valid 
        if (resetToken.expired || Date.now() > new Date(resetToken.expiredAt).getTime()) {
            return res.status(409).json({ message: 'Invalid Reset Token' });
        }
        //Encrypt user password
        const hashedPassword = bcrypt.hashSync(value.password, 10);
        // Update user password 
        await User.findByIdAndUpdate(resetToken.userId, {
            password: hashedPassword
        });
        //Expire reset password
        await ResetToken.findByIdAndUpdate(value.resetToken, {
            expired: true
        })
    } catch (error) {
        next
    }
}

//update user 

export const updateUser = async (req, res, next) => {
    try {
        // Validate request
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
//Create a User 
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