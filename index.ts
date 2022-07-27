// Avoxel284
// Arrif Planner Backend

import dotenv from "dotenv";
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import { authorizeLoginData, encryptLoginData } from "./lib/security";

dotenv.config();

const port = 5001;
const app = express();
const apiRouter = express.Router();
const mango = new MongoClient(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`
);

mango.connect((err) => {
	const collection = mango.db("test").collection("devices");
	// perform actions on the collection object
	mango.close();
});

apiRouter.get("/user/:userid", (req, res) => {
	res.send("Hello, " + req.params.userid);
});

app.use(`/api/v1`, apiRouter);
app.listen(port, () => {
	console.log(`ARRIF BACKEND STARTED :: PORT: ${port}`);
});

(async () => {
	const loginData = await encryptLoginData({
		username: "myAmazingUsername",
		password: "myAmazingPassword",
	});
	console.log(loginData);

	console.log(authorizeLoginData())
})();


