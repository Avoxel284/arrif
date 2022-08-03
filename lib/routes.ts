import express from "express";
import meta from "../cms.json";
import { FormError, User } from "./classes";
import { ObjectId } from "mongodb";
import * as db from "./db";
import * as util from "./util";
import * as jwt from "jsonwebtoken";
import * as auth from "./auth";
import * as path from "path";
import * as bcrypt from "bcrypt";

const router = express.Router();

router.use(async (req, res, next) => {
	const token =
		req.cookies?.["arrif-session"] && auth.verifyAuthToken(req.cookies?.["arrif-session"]);
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

router.post("/login", async (req, res) => {
	if (req.headers["content-type"] !== "application/json")
		return res.status(400).send(`Invalid content type`);

	if (!res.locals.user) {
		const checkFormData = await auth.checkFormData(req.body, "login");
		if (checkFormData instanceof FormError) return res.status(400).send(checkFormData);

		const user = await db.matchUser(req.body);
		if (user instanceof FormError) return res.status(400).send(user);

		res.cookie("arrif-session", auth.generateAuthToken(user.id));
	}

	if (req.query.callback) return res.redirect(req.query.callback as string);
	else return res.redirect("/dashboard");
	// res.status(200).send("Authenticated");
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

	const checkFormData = await auth.checkFormData(req.body, "register");
	if (checkFormData instanceof FormError) return res.status(400).send(checkFormData);

	const checkDupAcc = await db.checkDupAcc(req.body);
	if (checkDupAcc instanceof FormError) return res.status(400).send(checkDupAcc);

	const user = await db.addUser(req.body);

	res.cookie("arrif-session", auth.generateAuthToken(user.id));
	return res.redirect("/dashboard");

	// res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});

/** Dashboard */
router.get("/dashboard", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login");

	const hours = new Date().getHours();
	let welcomeText = "Morning";
	if (hours > 12 && hours < 18) welcomeText = "Afternoon";
	else if (hours > 18) welcomeText = "Evening";

	const tt = await db.getMultiple("timetables", { ownerId: res.locals.user.id });
	const upnext: any[] = [];
	tt.forEach((t: any) => {
		t.days[0].e.map((d: any) => {
			upnext.push({
				name: d.name,
				desc: `With ${d.desc} in ${d.loc}`,
				time: `${d.dur}:${d.dur}am`,
				footer: `from ${t.id}`,
			});
		});
	});

	let schedule = {
		upnext: upnext,
		todo: res.locals.user.todo,
	};

	res.render("dashboard", { welcomeText: welcomeText, schedule: schedule });
});

/** Settings */
router.get("/settings", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login");

	let s: any = meta.forms.settings;
	s.f.forEach((f: any) => {
		if (f.t != "password") f.v = res.locals.user[f.n];
	});

	res.render("settings", {
		settings: s,
	});
});

router.post("/settings", async (req, res) => {
	if (!res.locals.user) return res.sendStatus(401);

	const checkFormData = await auth.checkFormData(req.body, "settings");
	if (checkFormData instanceof FormError) return res.status(400).send(checkFormData);

	// db.updateFields(
	// 	"users",
	// 	{ id: res.locals.user.id },
	// 	{
	// 		username: req?.body?.username?.toLowerCase(),
	// 		email: req?.body?.email?.toLowerCase(),
	// 		password: req.body.password ? bcrypt.hashSync(req.body.password, 10) : "",
	// 		settings: {
	// 			darkMode: req?.body?.settings?.darkMode,
	// 		},
	// 	}
	// );
	// res.sendStatus(200);
	return res.status(400).send({ msg: "Not implemented...", fields: [""] });
});

/** Todo */
router.put("/todo/:id", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);
	if (req.body?.name?.length == 0 || req.body?.desc?.length == 0) return res.sendStatus(400);

	const data = db.updateFields(
		"users",
		{ id: res.locals.user.id, "todo._id": parseInt(req.params.id) },
		{ "todo.$.name": req.body.name, "todo.$.desc": req.body.desc }
	);

	if (req.query.callback) return res.redirect(req.query.callback as string);
	return res.status(200).send(data);
});

router.post("/todo", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);
	if (req.body?.name?.length == 0 || req.body?.desc?.length == 0) return res.sendStatus(400);

	const id = auth.generateId("num");
	const data = await db.updateFields(
		"users",
		{ id: res.locals.user.id },
		{ todo: { name: req.body.name, desc: req.body.desc, _id: id } },
		false,
		"$push"
	);

	if (req.query.callback) return res.redirect(req.query.callback as string);
	return res.status(200).send({ name: req.body.name, desc: req.body.desc, id: id });
});

router.delete("/todo/:id", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	const data = await db.updateFields(
		"users",
		{ id: res.locals.user.id },
		{ todo: { _id: parseInt(req.params.id) } },
		false,
		"$pull"
	);

	if (req.query.callback) return res.redirect(req.query.callback as string);
	return res.sendStatus(204);
});

/** Timetables */
router.get("/timetable/:id", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	let timetable: any;
	if (req.params.id == "new") {
		timetable = await db.addTimetable({ ownerId: res.locals.user.id });
		return res.redirect(`/timetable/${timetable.id}`);
	} else timetable = await db.get("timetables", { id: parseInt(req.params.id) });

	if (!timetable)
		return res.status(404).render("error", {
			err: "404",
			msg: "Couldn't find the timetable you were looking for (maybe deleted)...",
		});

	if (timetable.ownerId != res.locals.user.id)
		return res
			.status(401)
			.render("error", { err: "401", msg: "This isn't one of your timetables" });

	console.log(timetable);
	let timeline = [];
	for (let i = 0; i < 23; i++) {
		timeline.push(`${i}:00`);
		timeline.push(`${i}:30`);
	}

	res.render("timetable", {
		tt: timetable,
		path: req.path,
		timeline: timeline,
	});
});

/** Timetable event */
router.post("/timetable/:id/:did", async (req, res) => {
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
});

router.put("/timetable/:id/:did", async (req, res) => {
	const timetable = await db.get("timetables", { id: parseInt(req.params.id) });
	console.log(timetable);
	if (!timetable) return res.sendStatus(404);

	if (!Array.isArray(req.body)) return res.sendStatus(400);

	console.log(
		req.body.map((e: any) => ({
			n: e.name,
			l: e.location,
			d: e.duration,
			e: e.end,
			s: e.start,
		}))
	);

	db.updateFields(
		"timetables",
		{ id: req.params.id, days: 0 },
		{
			"days.$.e": req.body.map((e: any) => ({
				n: e.name,
				l: e.location,
				d: e.duration,
				e: e.end,
				s: e.start,
			})),
		}
	);

	res.sendStatus(200);
});

export default router;
