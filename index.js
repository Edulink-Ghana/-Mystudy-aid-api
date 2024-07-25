import express from "express";
import { dbConnection } from "./Config/db.js";
import { restartServer } from "./restart_server.js";
import 'dotenv/config'






//create server app
const app = express();








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
