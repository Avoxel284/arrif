import express from "express";
import meta from "../cms.json";
import { FormError, User } from "./classes";
import { ObjectId } from "mongodb";
import * as db from "./db";
import * as util from "./util";
import * as jwt from "jsonwebtoken";
import { verifyAuthToken, generateAuthToken, generateId } from "./auth";
import * as path from "path";

const router = express.Router();

/** Root */
router.get("/", async (req, res) => {
	res.render("index", { meta: meta, path: req.path });
});

/** Login */
router.get("/login", async (req, res) => {
	res.render("onboarding", { meta: meta, path: req.path, formType: "login" });
});

router.post("/auth", async (req, res) => {
	if (req.headers["content-type"] !== "application/json")
		return res.status(400).send(`Invalid content type`);
	const checkFormData = await db.checkFormData(req.body, "login");
	if (checkFormData instanceof FormError) return res.status(400).send(checkFormData);

	const user = await db.matchUser(req.body);
	if (user instanceof FormError) return res.status(400).send(user);

	if (req.query.callback) return res.redirect(req.query.callback as string);
	res.sendStatus(200);
});

/** Logout */
router.get("/logout", async (req, res) => {
	res.redirect("/");
});

/** Register */
router.get("/register", async (req, res) => {
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
	if (checkFormData instanceof FormError) return res.status(400).send(checkFormData);

	const checkDupAcc = await db.checkDupAcc(req.body);
	if (checkDupAcc instanceof FormError) return res.status(400).send(checkDupAcc);

	db.addUser(req.body);
	res.cookie("arrif-session", "session");
	return res.redirect("/dashboard");

	// res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});

/** Dashboard */
router.get("/dashboard", async (req, res) => {
	const token = req.headers["authorization"] && verifyAuthToken(req.headers["authorization"]);
	if (!token || !token?.id)
		return res
			.status(401)
			.render("error", { err: "401 Unauthorized", msg: "Trying to forge JWTs now huh?" });

	const user = await db.get("users", { id: token.id });
	if (!user) res.redirect("/");

	// const token = authenticateToken(req, res);
	// if (!token) return res.sendStatus(403);
	res.render("dashboard", { meta: meta, user: user, path: req.path });
});

/** Settings */
router.get("/settings", async (req, res) => {
	let m = meta;
	let user = {
		username: "username",
	};
	res.render("settings", { meta: m, user: user, path: req.path });
});

router.put("/settings", async (req, res) => {
	const user = await db.get("users", { _id: new ObjectId(req.body.userId) });
	console.log(req.body.userId);
	if (!user) return res.status(401).send("Could not find requested user");

	db.updateField("users", { _id: user._id }, { settings: { "": "auughhh" } });
	res.sendStatus(200);
});

/** Timetables */
router.get("/timetable/:id", async (req, res) => {
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	if (req.params.id != "new") {
		const timetable = await db.get("timetables", { id: req.params.id });
		if (!timetable)
			return res.status(404).render("error", {
				err: "404",
				msg: "Couldn't find the timetable you were looking for (maybe deleted)...",
			});

		const p = (d: any) => `<td class="timetable-event">
			<span contenteditable class="timetable-event-title">${d.name}</span>
			<span contenteditable class="timetable-event-loc">${d.loc}</span><br>
			<span contenteditable class="timetable-event-desc">${d.desc}</span>
		</td>`;

		const days: any = Object.entries(timetable.days);
		const numPeriods = days[0][1].length;
		const rows: any = [];

		for (let i = 0; i < numPeriods; i++)
			rows.push(
				`<td class="timetable-period">${i}</td>` + days.map((d: any) => p(d[1][i])).join("")
			);

		res.render("timetable", {
			meta: meta,
			tt: {
				...timetable,
				html: {
					rows: rows.map((d: any) => `<tr>${d}</tr>`).join(""),
					days: days.map((d: any) => `<th>${d[0]}</th>`).join(""),
				},
			},
			path: req.path,
		});
	} else {
		const timetable = {
			id: generateId(),
			name: "New Timetable",
			repeats: 1,
			days: {
				Monday: [],
				Tuesday: [],
				Wednesday: [],
				Thursday: [],
				Friday: [],
				Saturday: [],
			},
			html: {},
		};

		res.render("timetable", { meta: meta, path: req.path, tt: timetable });
	}
});

export default router;
