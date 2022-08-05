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
	const timetables: any[] = [];

	const today = new Date();
	const todayMidnight = new Date();
	todayMidnight.setHours(0, 0, 0, 0);

	const minSinceMidnight = Math.floor((today.getTime() - todayMidnight.getTime()) / (1000 * 60));

	await tt.forEach((t) => {
		timetables.push({ id: t.id, days: t.days, name: t.name, desc: t.desc });

		t[today.getDay() - 1].forEach((d: any) => {
			if (minSinceMidnight < d.start) {
				d.timetable = t;
				upnext.push(d);
			}
			// const hours = console.log(minSinceMidnight);
			// if (today - day == 3) upnext.push(d);
		});
	});

	const timeText = `${today.getMinutes()}:${today.getHours()} ${today.getDay() + 1}/${
		today.getMonth() + 1
	}/${today.getFullYear()}`;

	res.render("dashboard", {
		welcomeText: welcomeText,
		schedule: {
			upnext: upnext.slice(0, 3),
			todo: res.locals.user.todo,
			timetables: timetables,
		},
	});
});

/** Settings - Not implemented */
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
	if (req.body?.name?.length > 30 || req.body?.desc?.length > 100) return res.sendStatus(400);

	// ugly but works
	const schema: any = {
		"todo.$.name": req.body?.name?.length > 30 ? null : req.body.name?.trim(),
		"todo.$.desc": req.body?.desc?.length > 100 ? null : req.body.desc?.trim(),
		"todo.$.prio": typeof req.body?.priority != "boolean" ? null : req.body.priority,
	};

	for (let p in schema) {
		if (schema[p] == null || (typeof schema[p] == "string" && schema[p].length == 0))
			delete schema[p];
	}

	const data = await db.updateFields(
		"users",
		{ id: res.locals.user.id, "todo._id": parseInt(req.params.id) },
		schema
	);

	if (data.matchedCount == 0) return res.sendStatus(404);
	if (req.query.callback) return res.redirect(req.query.callback as string);
	return res.status(200).send(data);
});

router.post("/todo", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	if (req.body?.name?.length == 0 || req.body?.desc?.length == 0) return res.sendStatus(400);
	if (req.body?.name?.length > 30 || req.body?.desc?.length > 100) return res.sendStatus(400);

	const id = auth.generateId("num");
	const data = await db.updateFields(
		"users",
		{ id: res.locals.user.id },
		{ todo: { name: req.body.name, desc: req.body.desc, _id: id, prio: false } },
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
		timetable = await db.addTimetable({ ownerId: res.locals.user.id, name: "Unnamed timetable" });
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

router.put("/timetable/:id", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	if (!req.body.name || req.body.name.length > 30)
		return res.status(400).send({ err: "Invalid name" });

	const timetable = await db.get("timetables", {
		id: parseInt(req.params.id),
		ownerId: res.locals.user.id,
	});
	if (!timetable) return res.sendStatus(404);

	const data = await db.updateFields(
		"timetables",
		{ id: parseInt(req.params.id) },
		{ name: req.body.name }
	);
	return res.sendStatus(204);
});

router.delete("/timetable/:id", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	const timetable = await db.get("timetables", {
		id: parseInt(req.params.id),
		ownerId: res.locals.user.id,
	});
	if (!timetable) return res.sendStatus(404);

	await db.remove("timetables", { id: parseInt(req.params.id) });
});

/** Timetable event */
router.post("/timetable/:id/new", async (req, res) => {
	const timetable = await db.get("timetables", {
		id: parseInt(req.params.id),
		ownerId: res.locals.user.id,
	});
	if (!timetable) return res.status(404).send("Unknown timetable");
	if (timetable.ownerId != res.locals.user.id) return res.sendStatus(401);
	if (!req.body?.day || req.body?.day > 6 || req.body?.day < 0)
		return res.status(400).send({ fields: ["day"], msg: "Day is invalid" });

	if (parseFloat(req.body.start) >= parseFloat(req.body.end) + 5)
		return res
			.status(400)
			.send({ fields: ["start", "end"], msg: "Event should at least be 5 minutes long" });

	const event = {
		name: req.body.name,
		desc: req.body.desc,
		loc: req.body.loc,
		start: req.body.start,
		end: req.body.end,
		id: auth.generateId("num"),
	};

	db.updateFields(
		"timetables",
		{ id: parseInt(req.params.id) },
		{
			[req.body.day]: event,
		},
		false,
		"$push"
	);

	return res.send(await db.get("timetables", { id: parseInt(req.params.id) }));
});

router.put("/timetable/:id/:eid", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	const timetable = await db.get("timetables", {
		id: parseInt(req.params.id),
		ownerId: res.locals.user.id,
	});
	if (!timetable) return res.status(404).send("Unknown timetable");
	if (!req.body?.day || req.body?.day > 6 || req.body?.day < 0)
		return res.status(400).send({ fields: ["day"], msg: "Day is invalid" });

	const schema: any = {
		[`${req.body.day}.$.name`]: req.body?.name?.length > 40 ? null : req.body.name?.trim(),
		[`${req.body.day}.$.desc`]: req.body?.desc?.length > 100 ? null : req.body.desc?.trim(),
		[`${req.body.day}.$.loc`]: req.body?.loc?.length > 100 ? null : req.body.loc?.trim(),
		[`${req.body.day}.$.start`]: req.body?.start,
		[`${req.body.day}.$.end`]: req.body?.end,
	};

	for (let p in schema) {
		if (schema[p] == null || (typeof schema[p] == "string" && schema[p].length == 0))
			delete schema[p];
	}

	const data = await db.updateFields(
		"timetables",
		{ id: parseInt(req.params.id), [`${req.body.day}.id`]: parseInt(req.params.eid) },
		schema
	);

	res.sendStatus(200);
});

router.delete("/timetable/:id/:eid", async (req, res) => {
	if (!res.locals.user) return res.redirect("/login?callback=" + req.path);

	const timetable = await db.get("timetables", {
		id: parseInt(req.params.id),
		ownerId: res.locals.user.id,
	});
	if (!timetable) return res.status(404).send("Unknown timetable");
	if (!req.body?.day || req.body?.day > 6 || req.body?.day < 0)
		return res.status(400).send({ fields: ["day"], msg: "Day is invalid" });

	const data = await db.updateFields(
		"timetables",
		{ id: parseInt(req.params.id) },
		{ [req.body.day]: { id: parseInt(req.params.eid) } },
		false,
		"$pull"
	);

	return res.sendStatus(200);
});

export default router;
