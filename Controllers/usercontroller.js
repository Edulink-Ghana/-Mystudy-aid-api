import { ResetToken, User, VerificationToken } from "../models/userModel.js";
import { Booking } from "../models/bookingModel.js";
import { Teacher } from "../models/teacherModel.js";
import { registerUserValidator, loginValidator, createUserValidator, updateUserValidator, forgotPasswordValidator, resetPasswordValidator } from "../validators/user.js";
import { reviewValidator } from "../validators/review.js";
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
        const newUser = await User.create({
            ...value,
            password: hashedPassword
        });

        // Generate a verification token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '1h' });
        const verifyEmailToken = await VerificationToken.create({
            userId: newUser._id,
            token: token
        });

        // Send verification email
        await mailTransport.sendMail({
            to: value.email,
            from: "emmanuel@laremdetech.com",
            subject: "Verify Your Email",
            html: `
              <h3>Hello ${newUser.firstName}</h3>
              <p>Please verify your email by clicking on the following link:</p>
              <a href="${process.env.FRONTEND_URL}/verify-email/${verifyEmailToken}">Verify Email</a>
            `,
        });
        // Return response
        res.status(201).json({ message: 'User created successfully. Please check your email for verification.' });
    } catch (error) {
        next(error);
        res.status(500).json({ message: 'Failed to create user' });

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
                select: "timeslot date grade area subject teacher",
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
            .select("-user ")
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


// Email Verification Route
export const verifyEmail = async (req, res) => {
    try {
        // Find the verification token by ID
        const token = await VerificationToken.findById(req.params.id);

        if (!token) {
            return res.status(404).json({ message: 'Verification token not found' });
        }

        // Extract the JWT token string from the database object
        const jwtToken = token.token;

        // Verify the JWT token
        const decoded = jwt.verify(jwtToken, process.env.JWT_PRIVATE_KEY);

        // Find the user by ID
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's verified status
        user.verified = true;
        await user.save();

        // Delete the verification token after successful verification
        await token.deleteOne();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else {
            console.error(error);
            return res.status(500).json({ error: 'Failed to verify email' });
        }
    }
};

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
        if (!resetToken) {
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
        res.status(200).json({ message: 'Password reset successful' });
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


// Create a review 
export const createReview = async (req, res, next) => {
    try {
        // Validate the request body
        const { value, error } = reviewValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error.details[0].message);
        }

        // Get the teacher ID from the request parameters
        const teacherId = req.params.id;

        // Get the user ID from the session or request
        const userId = req.session?.user?.id || req?.user?.id;

        // Find the teacher
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).send({ error: 'Teacher not found' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Check if the user has already reviewed this teacher
        const existingReview = teacher.reviews.find(review => review.user.toString() === userId);
        if (existingReview) {
            return res.status(400).send({ error: 'You have already reviewed this teacher' });
        }

        // Create the new review
        const newReview = {
            user: userId,
            rating: value.rating,
            comment: value.comment,
            date: new Date(), // Add the current date
            userName: `${user.firstName} ${user.lastName}`, // Add the user's full name
        };

        // Add the review to the teacher's reviews array
        teacher.reviews.push(newReview);
        await teacher.save();

        // Add the review to the user's reviews array
        user.reviews.push({
            teacher: teacherId, // Reference the teacher
            rating: value.rating,
            comment: value.comment,
            date: new Date(), // Add the current date
        });
        await user.save();

        // Return a success response
        res.status(201).json({ message: 'Review created successfully', review: newReview });
    } catch (error) {
        next(error);
    }
};




