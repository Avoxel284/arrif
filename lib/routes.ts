import express, { application } from "express";
import meta from "../cms.json";
import { authorizeLoginData, encryptLoginData } from "./db";

const router = express.Router();

/** Root */
router.get("/", (req, res) => {
	res.render("index", { meta: meta, path: req.path });
});

/** Login */
router.get("/login", (req, res) => {
	res.render("login", { meta: meta, path: req.path });
});

router.post("/login", (req, res) => {
	res.render("login", {
		meta,
		path: req.path,
		formError: { e: "Username cannot be found", n: "username" },
	});

	// res.redirect("/dashboard");
});

/** Logout */
router.get("/logout", (req, res) => {
	res.redirect("/");
});

/** Register */
router.get("/register", (req, res) => {
	res.render("register", {
		meta: meta,
		path: req.path,
		formError: { e: "Email is already used for another account.", n: "email" },
	});
});

router.post("/register", (req, res) => {
	res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});

/** Dashboard */
router.get("/dashboard", (req, res) => {
	let m = meta;
	let user = {
		username: "username",
	};
	res.render("dashboard", { meta: m, user: user, path: req.path });
});

/** Settings */
router.get("/settings", (req, res) => {
	let m = meta;
	let user = {
		username: "username",
	};
	res.render("settings", { meta: m, user: user, path: req.path });
});

router.get("/img", (req,res)=>{
	console.log(req, res);
	res.sendFile("LogoWhite.png")
})

export default router;
// export router;
