// Avoxel284
// Arrif Planner Backend

import dotenv from "dotenv";
import express from "express";
import path from "path";
import { authorizeLoginData, encryptLoginData } from "./lib/db";
import bodyParser from "body-parser";
import router from "./lib/routes";

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "public"));
app.use(express.static(path.join(__dirname, "..", "public", "static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);


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
