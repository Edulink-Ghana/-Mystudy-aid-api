# Home Tutoring and Teacher Listing Website Backend Documentation

## Table of Contents

1. [Project Setup](#project-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Authentication and Authorization](#authentication-and-authorization)
5. [Teacher Registration](#teacher-registration)
6. [User Search Functionality](#user-search-functionality)
7. [Teacher Profile Management](#teacher-profile-management)
8. [Dashboards](#dashboards)
9. [Localization and Cultural Sensitivity](#localization-and-cultural-sensitivity)
10. [Additional Features](#additional-features)

---

## Project Setup

### 1. Initialize Project

1. Create a new directory for the project and navigate into it.
    ```sh
    mkdir home-tutoring-website
    cd home-tutoring-website
    ```

2. Initialize a new Node.js project.
    ```sh
    npm init -y
    ```

3. Install necessary packages.
    ```sh
    npm install express mongoose bcrypt jsonwebtoken axios connect-mongo cors dotenv express-session joi multer @reis/mongoose-to-json nodemailer commander
    ```

### 2. Setup Directory Structure

Create the following directory structure for organizing your project files.

```plaintext
home-tutoring-website
├── config
│   └── db.js
├── controllers
│   └── authController.js
│   └── teacherController.js
│   └── userController.js
├── middleware
│   └── authMiddleware.js
├── models
│   └── Teacher.js
│   └── User.js
│   └── Review.js
├── routes
│   └── authRoutes.js
│   └── teacherRoutes.js
│   └── userRoutes.js
├── utils
│   └── email.js
├── .env
├── app.js
└── package.json
```

---

## Environment Configuration

### 1. Create Environment Variables

Create a `.env` file in the root directory and add the following variables.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/home_tutoring
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

---

## Database Setup

### 1. MongoDB Configuration

Create a `db.js` file inside the `config` directory to configure the MongoDB connection.

```js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## Authentication and Authorization

### 1. User Model

Create a `User.js` file inside the `models` directory.

```js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'teacher'],
    default: 'user',
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### 2. Authentication Middleware

Create an `authMiddleware.js` file inside the `middleware` directory.

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
```

### 3. Authentication Controller

Create an `authController.js` file inside the `controllers` directory.

```js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

module.exports = { registerUser, authUser };
```

### 4. Authentication Routes

Create an `authRoutes.js` file inside the `routes` directory.

```js
const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;
```

---

## Teacher Registration

### 1. Teacher Model

Create a `Teacher.js` file inside the `models` directory.

```js
const mongoose = require('mongoose');
const mongooseToJSON = require('@reis/mongoose-to-json');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  subjects: {
    type: [String],
    required: true,
  },
  areas: {
    type: [String],
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  costPerHour: {
    type: Number,
    required: true,
  },
  qualifications: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    enum: ['Assignment Help', 'Home Tutoring', 'Exam Preparation'],
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

teacherSchema.plugin(mongooseToJSON);

module.exports = mongoose.model('Teacher', teacherSchema);
```

### 2. Teacher Controller

Create a `teacherController.js` file inside the `controllers` directory.

```js
const Teacher = require('../models/Teacher');

const registerTeacher = async (req, res) => {
  const { subjects, areas, availability, costPerHour, qualifications, categories } = req.body;
  const teacher = await Teacher.create({
    user: req.user._id,
    subjects,
    areas,
    availability,
    costPerHour,
    qualifications,
    categories,
  });
  if (teacher) {
    res.status(201).json(teacher);
  } else {
    res.status(400).json({ message: 'Invalid teacher data' });
  }
};

const getTeachers = async (req, res) => {
  const teachers = await Teacher.find().populate('user', 'name email');
  res.json(teachers);
};

module.exports = { registerTeacher, getTeachers };
```

### 3. Teacher Routes

Create a `teacherRoutes.js` file inside the `routes` directory.

```js
const express = require('express');
const { registerTeacher, getTeachers } = require('../controllers/teacherController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', protect, registerTeacher);
router.get('/', getTeachers);

module.exports = router;
```

---

## User Search Functionality

### 1. Search Teachers

Update `teacherController.js` to include a search function.

```js
const searchTeachers = async (req, res) => {
  const { subject, location, category, availability, cost } = req.query;
  const query = {};
  if (subject) query.subjects = subject;
  if (location) query.areas = location;
  if (category) query

.categories = category;
  if (availability) query.availability = availability;
  if (cost) query.costPerHour = { $lte: cost };

  const teachers = await Teacher.find(query).populate('user', 'name email');
  res.json(teachers);
};

module.exports = { registerTeacher, getTeachers, searchTeachers };
```

### 2. Search Route

Update `teacherRoutes.js` to include the search route.

```js
router.get('/search', searchTeachers);
```

---

## Teacher Profile Management

### 1. Profile Management

Update `teacherController.js` to include profile management functions.

```js
const getTeacherProfile = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', 'name email');
  if (teacher) {
    res.json(teacher);
  } else {
    res.status(404).json({ message: 'Teacher not found' });
  }
};

const updateTeacherProfile = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (teacher) {
    teacher.subjects = req.body.subjects || teacher.subjects;
    teacher.areas = req.body.areas || teacher.areas;
    teacher.availability = req.body.availability || teacher.availability;
    teacher.costPerHour = req.body.costPerHour || teacher.costPerHour;
    teacher.qualifications = req.body.qualifications || teacher.qualifications;
    teacher.categories = req.body.categories || teacher.categories;

    const updatedTeacher = await teacher.save();
    res.json(updatedTeacher);
  } else {
    res.status(404).json({ message: 'Teacher not found' });
  }
};

module.exports = { registerTeacher, getTeachers, searchTeachers, getTeacherProfile, updateTeacherProfile };
```

### 2. Profile Routes

Update `teacherRoutes.js` to include profile routes.

```js
router.get('/profile', protect, getTeacherProfile);
router.put('/profile', protect, updateTeacherProfile);
```

---

## Dashboards

### 1. Teacher Dashboard

Create functions in `teacherController.js` for teacher dashboard.

```js
const getTeacherDashboard = async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', 'name email');
  if (teacher) {
    res.json(teacher);
  } else {
    res.status(404).json({ message: 'Teacher not found' });
  }
};

module.exports = { registerTeacher, getTeachers, searchTeachers, getTeacherProfile, updateTeacherProfile, getTeacherDashboard };
```

### 2. User Dashboard

Create functions in `userController.js` for user dashboard.

```js
const User = require('../models/User');
const Teacher = require('../models/Teacher');

const getUserDashboard = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const teachers = await Teacher.find({ user: req.user._id });
  res.json({ user, teachers });
};

module.exports = { getUserDashboard };
```

### 3. Dashboard Routes

Create a `userRoutes.js` file inside the `routes` directory.

```js
const express = require('express');
const { getUserDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, getUserDashboard);

module.exports = router;
```

---

## Localization and Cultural Sensitivity

### 1. Payment Methods

Ensure that payment methods such as mobile money, cash on delivery, and bank transfers are considered. Implement payment integrations as needed.

---

## Additional Features

### 1. Curriculum Specification

Update `Teacher.js` to include curriculum specification.

```js
const teacherSchema = new mongoose.Schema({
  // existing fields...
  curriculum: {
    type: String,
    enum: ['Ghanaian', 'British', 'American'],
  },
  // other fields...
});
```

### 2. Group Tutoring Sessions

Add functionality for group tutoring sessions if required. This may include additional fields in the `Teacher.js` model and new routes/controllers for managing group sessions.

---

## Running the Application

1. Start the server.

```sh
node app.js
```

2. Ensure all necessary environment variables are set and MongoDB is running.

3. Test endpoints using Postman or any API testing tool.

---
