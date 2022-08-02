import express from "express";
import meta from "../cms.json";
import { FormError } from "./classes";
import * as db from "./db";
import * as util from "./util";
import * as jwt from "jsonwebtoken"

const router = express.Router();

/** Root */
router.get("/", async (req, res) => {
	res.render("index", { meta: meta, path: req.path });
});

/** Login */
router.get("/login", async (req, res) => {
	res.render("onboarding", { meta: meta, path: req.path, formType: "login" });
});

router.post("/login", async (req, res) => {
	if (req.headers["content-type"] !== "application/json")
		return res.status(400).send(`Invalid content type`);

	const checkFormData = await db.checkFormData(req.body, "login");
	if (checkFormData) return res.status(400).send(checkFormData);

	const user = await db.retrieveUser(req.body);
	if (user instanceof FormError) return res.status(400).send(user);

	// res.sendStatus(200);
	console.log(user.id);
	console.log(await db.retrieveUserTimetables(user.id));

	const jwtoken = jwt.sign({ id: user.id }, `${process.env.AUTH_TOKEN}`, {
        expiresIn: "7d", // 24 hours
      });
	res.cookie("arrif-session", jwtoken)
	

	res.redirect("/dashboard");
});

/** Logout */
router.get("/logout", async (req, res) => {
	res.redirect("/");
});

/** Register */
router.get("/register", async (req, res) => {
	// let authorizeLoginData();

	res.render("onboarding", {
		meta: meta,
		path: req.path,
		formType: "register",
	});
});

router.post("/register", async (req, res) => {
	if (req.headers["content-type"] !== "application/json")
		return res.status(400).send(`Invalid content type`);

	const checkFormData = await db.checkFormData(req.body, "register");
	if (checkFormData) return res.status(400).send(checkFormData);

	const checkDupAcc = await db.checkDupAcc(req.body);
	if (checkDupAcc) return res.status(400).send(checkDupAcc);

	db.addUser(req.body);
	res.cookie("arrif-session", "session");
	return res.redirect("/dashboard");

	// res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});

/** Dashboard */
router.get("/dashboard", async (req, res) => {
	let m = meta;
	let user = {
		username: "username",
	};
	res.render("dashboard", { meta: m, user: user, path: req.path });
});

/** Settings */
router.get("/settings", async (req, res) => {
	let m = meta;
	let user = {
		username: "username",
	};
	res.render("settings", { meta: m, user: user, path: req.path });
});

/** Timetables */
router.get("/timetables", async (req, res) => {
	
});

export default router;
