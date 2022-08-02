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

router.use(async (req, res, next) => {
	const token = req.cookies?.["arrif-session"] && verifyAuthToken(req.cookies?.["arrif-session"]);
	if (token && token?.id) res.locals.user = await db.get("users", { id: token.id });

	res.locals.meta = meta;
	res.locals.path = req.path;
	res.locals.sessionToken = req.cookies?.["arrif-session"];
	res.locals.debugMenu = process.env.NODE_ENV != "PRODUCTION";
	next();
});

/** Root */
router.get("/", async (req, res) => {
	res.render("index");
});

/** Login */
router.get("/login", async (req, res) => {
	res.render("onboarding", { formType: "login" });
});

router.post("/auth", async (req, res) => {
	if (req.headers["content-type"] !== "application/json")
		return res.status(400).send(`Invalid content type`);

	const checkFormData = await db.checkFormData(req.body, "login");
	if (checkFormData instanceof FormError) return res.status(400).send(checkFormData);

	const user = await db.matchUser(req.body);
	if (user instanceof FormError) return res.status(400).send(user);

	res.cookie("arrif-session", generateAuthToken(user.id));

	if (req.query.callback) return res.redirect(req.query.callback as string);
	res.sendStatus(200);
});

/** Logout */
router.get("/logout", async (req, res) => {
	res.clearCookie("arrif-session");
	res.redirect("/");
});

/** Register */
router.get("/register", async (req, res) => {
	res.render("onboarding", {
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

	const user = await db.addUser(req.body);

	res.cookie("arrif-session", generateAuthToken(user.id));
	return res.redirect("/dashboard");

	// res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});

/** Dashboard */
router.get("/dashboard", async (req, res) => {
	const token = req.cookies?.["arrif-session"] && verifyAuthToken(req.cookies?.["arrif-session"]);

	if (!token || !token?.id) return res.redirect("/login");

	const user = await db.get("users", { id: token.id });
	if (!user) return res.redirect("/");

	const hours = new Date().getHours();
	let welcomeText = "Morning";
	if (hours > 12 && hours < 18) welcomeText = "Afternoon";
	else if (hours > 18) welcomeText = "Evening";

	let schedule = {
		upnext: [
			{
				name: "English",
				desc: "With Mr Chen in D6",
				time: "8:55am",
				footer: "from Week A timetable",
			},
			{
				name: "Math",
				desc: "With Mr Chen in D6",
				time: "10:00am",
				footer: "from Week A timetable",
			},
			{
				name: "Recess",
				desc: "-",
				time: "11:05am",
				footer: "from Week A timetable",
			},
		],
	};

	res.render("dashboard", { welcomeText: welcomeText, schedule: schedule });
});

/** Settings */
router.get("/settings", async (req, res) => {
	res.render("settings", {
		settings: [
			{
				l: "Username",
				t: "text",
				n: "username",
			},
			{
				l: "Password",
				t: "password",
				n: "password",
			},
			{
				l: "Username",
				t: "text",
				n: "username",
			},
		],
	});
});

router.put("/settings", async (req, res) => {
	const user = await db.get("users", { _id: new ObjectId(req.body.userId) });
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

		const e = (d: any) => `<td class="timetable-event">
			<span contenteditable class="timetable-event-title">${d.name}</span>
			<span contenteditable class="timetable-event-loc">${d.loc}</span><br>
			<span contenteditable class="timetable-event-desc">${d.desc}</span>
		</td>`;

		const days: any = Object.entries(timetable.days);
		const numPeriods = days[0][1].length;
		const rows: any = [];

		// days.map((d)=>{

		// })

		for (let i = 0; i < numPeriods; i++)
			rows.push(
				`<td class="timetable-period">${i}</td>` + days.map((d: any) => e(d[1][i])).join("")
			);

		res.render("timetable", {
			tt: {
				...timetable,
				html: {
					rows: rows.map((d: any) => `<tr>${d}</tr>`).join(""),
					days: days.map((d: any) => `<th>${d[0]}</th>`).join(""),
				},
			},
			path: req.path,
		});
		// const firstRow =
	} else {
		const timetable = {
			id: generateId("num"),
			name: "New Timetable",
			repeats: 1,
			days: [],
			html: {
				rows: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
				headers: ["Day", ...util.genArrayFromRange(0, 6)],
			},
		};

		res.render("timetable", { tt: timetable });
	}
});

export default router;
