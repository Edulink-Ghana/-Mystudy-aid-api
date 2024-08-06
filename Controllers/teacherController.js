import { Teacher } from "../models/teacherModel.js";
import { loginValidator, registerValidator, teacherValidator } from "../validators/teacher.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// teacher registration
export const registerTeacher= async (req, res, next) => {
    try {
        //validate request
        // const { value, error } = registerValidator.validate(req.body);
        // if (error){
        //     return res.status(422).json(error.details[0].message);
        // }
            const email = req.body.email
            // check if the user exixt 
            const UserExist = await Teacher.findOne({ email })
            if (UserExist) {
               return res.status(401).send({ message: 'User has already signed Up'})
            } 
            // Encrypt user password
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            // Create user
            await Teacher.create({
                ...req.body,
                password: hashedPassword
            });
            // Return response
            res.status(201).json({ message: 'Teacher registered'});
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
        const user = await Teacher.findOne({
            $or: [
                { userName: value.userName },
                { email: value.email },
            ]
        });
        if (!user) {
            return res.status(401).json({ message:'User not found'});
        }
        // Verify their password
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json({ message:'Invalid credentials'});
        }
        // Create a session
        req.session.user = { id: user.id }
        // Return response
        res.status(200).json({ message: 'User logged in succesfull',
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
        const user = await Teacher.findOne({
            $or: [
                { userName: value.userName },
                { email: value.email },
            ]
        });
        if (!user) {
            return res.status(401).json({ message:'User not found'});
        }
        // Verify their password
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        if (!correctPassword) {
            return res.status(401).json({ message:'Invalid credentials'});
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

//Teacher Profile
export const profile = async (req, res, next) => {
    try {
        // Get user id from session or request
        const id = req.session?.user?.id || req?.user?.id;
        // Find user by id
        const teacher = await Teacher.findById(id)
            .select({ password: false });
        // Return response
        res.status(200).json(teacher);
    } catch (error) {
        next(error);
    }
}

// Get  teachers 
export const getteachers = async (req, res, next) => {
    try {
        //Get query params
        const { filter = "{}"} = req.query
    
        // Get all  teacher
        const allEvent = await EventModel.find(JSON.parse(filter))
        //return response
        res.status(200).json(allEvent);
    } catch (error) {
        next(error);
    }
}


// Teacher logout
export const logout = async (req, res, next) => {
    try {
        // Destroy user session
        await req.session.destroy();
        // Return response
        res.status(200).json({ message: 'User logged out'});
    } catch (error) {
        next(error);
    }
}