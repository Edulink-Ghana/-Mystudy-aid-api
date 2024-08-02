import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { dbConnection } from "./Config/db.js";
import {teacherRouter} from "./routes/teacher.js";
import userRouter from "./routes/user.js";
import { restartServer } from "./restart_server.js";
import expressOasGenerator from "@mickeymond/express-oas-generator";
import mongoose from "mongoose";
import 'dotenv/config'






//create server app
const app = express();
expressOasGenerator.handleResponses(app, {
    alwaysServeDocs: true,
    tags: [],
    mongooseModels: mongoose.modelNames(),
});

//middlewares
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL
    })
}))

//Use Routes
app.use('/api/v1', userRouter)
app.use('/api/v1', teacherRouter)


expressOasGenerator.handleRequests();
app.use((req, res) => res.redirect('/api-docs/'));





//to create a functin to wake  render after 13mins
app.get("/api/v1/health", (req, res) => {
    res.json({ status: "UP" });
});

//robot to restart the serve at a time interval to prevent it from sleeping
const reboot = async () => {
    setInterval(restartServer, process.env.INTERVAL)
}

// connect to database & listen to the server
const PORT = process.env.PORT || 5000;
dbConnection().then(() => {
    app.listen(PORT, () => {
        reboot().then(() => {
            console.log(`Server Restarted`);
        });
        console.log(`Server is connected to Port ${PORT}`);
    });
})
    .catch((err) => {
        console.log(err);
        process.exit(-1);
    });
