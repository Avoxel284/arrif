"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cms_json_1 = __importDefault(require("../cms.json"));
const classes_1 = require("./classes");
const db = __importStar(require("./db"));
const auth = __importStar(require("./auth"));
const router = express_1.default.Router();
router.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a["arrif-session"]) && auth.verifyAuthToken((_b = req.cookies) === null || _b === void 0 ? void 0 : _b["arrif-session"]);
    if (token && (token === null || token === void 0 ? void 0 : token.id))
        res.locals.user = yield db.get("users", { id: token.id });
    res.locals.meta = cms_json_1.default;
    res.locals.path = req.path;
    res.locals.sessionToken = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c["arrif-session"];
    res.locals.debugMenu = process.env.NODE_ENV != "PRODUCTION";
    next();
}));
/** Root */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("index");
}));
/** Login */
router.get("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("onboarding", { formType: "login" });
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers["content-type"] !== "application/json")
        return res.status(400).send(`Invalid content type`);
    if (!res.locals.user) {
        const checkFormData = yield auth.checkFormData(req.body, "login");
        if (checkFormData instanceof classes_1.FormError)
            return res.status(400).send(checkFormData);
        const user = yield db.matchUser(req.body);
        if (user instanceof classes_1.FormError)
            return res.status(400).send(user);
        res.cookie("arrif-session", auth.generateAuthToken(user.id));
    }
    if (req.query.callback)
        return res.redirect(req.query.callback);
    else
        return res.redirect("/dashboard");
    // res.status(200).send("Authenticated");
}));
/** Logout */
router.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("arrif-session");
    res.redirect("/");
}));
/** Register */
router.get("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("onboarding", {
        formType: "register",
    });
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers["content-type"] !== "application/json")
        return res.status(400).send(`Invalid content type`);
    const checkFormData = yield auth.checkFormData(req.body, "register");
    if (checkFormData instanceof classes_1.FormError)
        return res.status(400).send(checkFormData);
    const checkDupAcc = yield db.checkDupAcc(req.body);
    if (checkDupAcc instanceof classes_1.FormError)
        return res.status(400).send(checkDupAcc);
    const user = yield db.addUser(req.body);
    res.cookie("arrif-session", auth.generateAuthToken(user.id));
    return res.redirect("/dashboard");
    // res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
}));
/** Dashboard */
router.get("/dashboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.redirect("/login");
    const hours = new Date().getHours();
    let welcomeText = "Morning";
    if (hours > 12 && hours < 18)
        welcomeText = "Afternoon";
    else if (hours > 18)
        welcomeText = "Evening";
    const tt = yield db.getMultiple("timetables", { ownerId: res.locals.user.id });
    const upnext = [];
    tt.forEach((t) => {
        t.days[0].e.map((d) => {
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
}));
/** Settings */
router.get("/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.redirect("/login");
    let s = cms_json_1.default.forms.settings;
    s.f.forEach((f) => {
        if (f.t != "password")
            f.v = res.locals.user[f.n];
    });
    res.render("settings", {
        settings: s,
    });
}));
router.post("/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.sendStatus(401);
    const checkFormData = yield auth.checkFormData(req.body, "settings");
    if (checkFormData instanceof classes_1.FormError)
        return res.status(400).send(checkFormData);
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
}));
/** Todo */
router.put("/todo/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g;
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    if (((_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.length) == 0 || ((_g = (_f = req.body) === null || _f === void 0 ? void 0 : _f.desc) === null || _g === void 0 ? void 0 : _g.length) == 0)
        return res.sendStatus(400);
    const data = db.updateFields("users", { id: res.locals.user.id, "todo._id": parseInt(req.params.id) }, { "todo.$.name": req.body.name, "todo.$.desc": req.body.desc });
    if (req.query.callback)
        return res.redirect(req.query.callback);
    return res.status(200).send(data);
}));
router.post("/todo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k, _l;
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    if (((_j = (_h = req.body) === null || _h === void 0 ? void 0 : _h.name) === null || _j === void 0 ? void 0 : _j.length) == 0 || ((_l = (_k = req.body) === null || _k === void 0 ? void 0 : _k.desc) === null || _l === void 0 ? void 0 : _l.length) == 0)
        return res.sendStatus(400);
    const id = auth.generateId("num");
    const data = yield db.updateFields("users", { id: res.locals.user.id }, { todo: { name: req.body.name, desc: req.body.desc, _id: id } }, false, "$push");
    if (req.query.callback)
        return res.redirect(req.query.callback);
    return res.status(200).send({ name: req.body.name, desc: req.body.desc, id: id });
}));
router.delete("/todo/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    const data = yield db.updateFields("users", { id: res.locals.user.id }, { todo: { _id: parseInt(req.params.id) } }, false, "$pull");
    if (req.query.callback)
        return res.redirect(req.query.callback);
    return res.sendStatus(204);
}));
/** Timetables */
router.get("/timetable/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    let timetable;
    if (req.params.id == "new") {
        timetable = yield db.addTimetable({ ownerId: res.locals.user.id });
        return res.redirect(`/timetable/${timetable.id}`);
    }
    else
        timetable = yield db.get("timetables", { id: parseInt(req.params.id) });
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
}));
/** Timetable event */
router.post("/timetable/:id/:did", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timetable = yield db.get("timetables", { id: req.params.id });
    if (!timetable)
        return res.status(404).render("error", {
            err: "404",
            msg: "Couldn't find the timetable you were looking for (maybe deleted)...",
        });
    const e = (d) => `<td class="timetable-event">
			<span contenteditable class="timetable-event-title">${d.name}</span>
			<span contenteditable class="timetable-event-loc">${d.loc}</span><br>
			<span contenteditable class="timetable-event-desc">${d.desc}</span>
		</td>`;
    const days = Object.entries(timetable.days);
    const numPeriods = days[0][1].length;
    const rows = [];
}));
router.put("/timetable/:id/:did", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timetable = yield db.get("timetables", { id: parseInt(req.params.id) });
    console.log(timetable);
    if (!timetable)
        return res.sendStatus(404);
    if (!Array.isArray(req.body))
        return res.sendStatus(400);
    console.log(req.body.map((e) => ({
        n: e.name,
        l: e.location,
        d: e.duration,
        e: e.end,
        s: e.start,
    })));
    db.updateFields("timetables", { id: req.params.id, days: 0 }, {
        "days.$.e": req.body.map((e) => ({
            n: e.name,
            l: e.location,
            d: e.duration,
            e: e.end,
            s: e.start,
        })),
    });
    res.sendStatus(200);
}));
exports.default = router;
