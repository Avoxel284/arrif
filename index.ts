// Avoxel284
// Arrif Planner Backend

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import router from "./lib/routes";
import { verifyAuthToken } from "./lib/auth";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "public"));
app.use(express.static(path.join(__dirname, "..", "public", "static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(authenticateToken);
app.use("/", router);

app.listen(80, () => {
	console.log(`ARRIF BACKEND LISTENING :: PORT 80`);
});

app.use((err: Error, req: express.Request, res: express.Response, next: Function) => {
	// thx express for not including this one in the typings
	console.error(err);
	res.status(500).render("error", { err: "500", msg: "An internal error occurred..." });
});

app.use(function (req, res, next) {
	res
		.status(404)
		.render("error", { err: "404", msg: "Couldn't find whatever you're looking for..." });
});
