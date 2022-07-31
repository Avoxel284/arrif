// Avoxel284
// Arrif Planner Backend

import dotenv from "dotenv";
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import path from "path";
import { authorizeLoginData, encryptLoginData } from "./lib/security";
import meta from "./meta.json";

dotenv.config();

const port = 5001;
const app = express();
const apiRouter = express.Router();
const mango = new MongoClient(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`
);

app.use(express.static(path.join(__dirname, "..", "public", "static")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "public"));

mango.connect((err) => {
	const collection = mango.db("test").collection("devices");
	// perform actions on the collection object
	mango.close();
});

app.get("/", (req, res) => {
	res.render("index", { meta: meta, psId: 0 });
});

app.get("/login", (req, res) => {
	res.render("login", { meta: meta, psId: 1 });
});

app.post("/login", (req, res) => {
	console.log(req.body);
	res.redirect("/dashboard");
	// res.send(`auughhhhhhh`);
});

app.listen(80, () => {
	console.log(`ARRIF BACKEND LISTENING :: PORT 80`);
});

app.use((err: Error, req: express.Request, res: express.Response, next: Function) => {
	// thx express for not including this one in the typings
	console.error(err);
	res.status(500).render("error", { errorMsg: "An internal error occurred" });
});

app.use(function (req, res, next) {
	res.status(404).render("error", { errorMsg: "404 Not Found" });
});
