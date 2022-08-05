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
    const timetables = [];
    const today = new Date();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const minSinceMidnight = Math.floor((today.getTime() - todayMidnight.getTime()) / (1000 * 60));
    yield tt.forEach((t) => {
        timetables.push({ id: t.id, days: t.days, name: t.name, desc: t.desc });
        t[today.getDay() - 1].forEach((d) => {
            if (minSinceMidnight < d.start) {
                d.timetable = t;
                upnext.push(d);
            }
            // const hours = console.log(minSinceMidnight);
            // if (today - day == 3) upnext.push(d);
        });
    });
    const timeText = `${today.getMinutes()}:${today.getHours()} ${today.getDay() + 1}/${today.getMonth() + 1}/${today.getFullYear()}`;
    res.render("dashboard", {
        welcomeText: welcomeText,
        schedule: {
            upnext: upnext.slice(0, 3),
            todo: res.locals.user.todo.sort((t) => {
                if (t.prio)
                    return -1;
            }),
            timetables: timetables,
        },
    });
}));
/** Settings - Not implemented */
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
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    if (((_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.length) == 0 || ((_g = (_f = req.body) === null || _f === void 0 ? void 0 : _f.desc) === null || _g === void 0 ? void 0 : _g.length) == 0)
        return res.sendStatus(400);
    if (((_j = (_h = req.body) === null || _h === void 0 ? void 0 : _h.name) === null || _j === void 0 ? void 0 : _j.length) > 30 || ((_l = (_k = req.body) === null || _k === void 0 ? void 0 : _k.desc) === null || _l === void 0 ? void 0 : _l.length) > 100)
        return res.sendStatus(400);
    // ugly but works
    const schema = {
        "todo.$.name": ((_o = (_m = req.body) === null || _m === void 0 ? void 0 : _m.name) === null || _o === void 0 ? void 0 : _o.length) > 30 ? null : (_p = req.body.name) === null || _p === void 0 ? void 0 : _p.trim(),
        "todo.$.desc": ((_r = (_q = req.body) === null || _q === void 0 ? void 0 : _q.desc) === null || _r === void 0 ? void 0 : _r.length) > 100 ? null : (_s = req.body.desc) === null || _s === void 0 ? void 0 : _s.trim(),
        "todo.$.prio": typeof ((_t = req.body) === null || _t === void 0 ? void 0 : _t.priority) != "boolean" ? null : req.body.priority,
    };
    for (let p in schema) {
        if (schema[p] == null || (typeof schema[p] == "string" && schema[p].length == 0))
            delete schema[p];
    }
    const data = yield db.updateFields("users", { id: res.locals.user.id, "todo._id": parseInt(req.params.id) }, schema);
    if (data.matchedCount == 0)
        return res.sendStatus(404);
    if (req.query.callback)
        return res.redirect(req.query.callback);
    return res.status(200).send(data);
}));
router.post("/todo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _u, _v, _w, _x, _y, _z, _0, _1;
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    if (((_v = (_u = req.body) === null || _u === void 0 ? void 0 : _u.name) === null || _v === void 0 ? void 0 : _v.length) == 0 || ((_x = (_w = req.body) === null || _w === void 0 ? void 0 : _w.desc) === null || _x === void 0 ? void 0 : _x.length) == 0)
        return res.sendStatus(400);
    if (((_z = (_y = req.body) === null || _y === void 0 ? void 0 : _y.name) === null || _z === void 0 ? void 0 : _z.length) > 30 || ((_1 = (_0 = req.body) === null || _0 === void 0 ? void 0 : _0.desc) === null || _1 === void 0 ? void 0 : _1.length) > 100)
        return res.sendStatus(400);
    const id = auth.generateId("num");
    const data = yield db.updateFields("users", { id: res.locals.user.id }, { todo: { name: req.body.name, desc: req.body.desc, _id: id, prio: false } }, false, "$push");
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
        timetable = yield db.addTimetable({ ownerId: res.locals.user.id, name: "Unnamed timetable" });
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
    let timeline = [];
    for (let i = 0; i < 24; i++) {
        timeline.push(`${i}:00`);
        timeline.push(`${i}:30`);
    }
    res.render("timetable", {
        tt: timetable,
        path: req.path,
        timeline: timeline,
    });
}));
router.put("/timetable/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    if (!req.body.name || req.body.name.length > 30)
        return res.status(400).send({ err: "Invalid name" });
    const timetable = yield db.get("timetables", {
        id: parseInt(req.params.id),
        ownerId: res.locals.user.id,
    });
    if (!timetable)
        return res.sendStatus(404);
    const data = yield db.updateFields("timetables", { id: parseInt(req.params.id) }, { name: req.body.name });
    return res.sendStatus(204);
}));
router.delete("/timetable/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    const timetable = yield db.get("timetables", {
        id: parseInt(req.params.id),
        ownerId: res.locals.user.id,
    });
    if (!timetable)
        return res.sendStatus(404);
    yield db.remove("timetables", { id: parseInt(req.params.id) });
}));
/** Timetable event */
router.post("/timetable/:id/new", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _2, _3, _4;
    const timetable = yield db.get("timetables", {
        id: parseInt(req.params.id),
        ownerId: res.locals.user.id,
    });
    if (!timetable)
        return res.status(404).send("Unknown timetable");
    if (timetable.ownerId != res.locals.user.id)
        return res.sendStatus(401);
    if (!((_2 = req.body) === null || _2 === void 0 ? void 0 : _2.day) || ((_3 = req.body) === null || _3 === void 0 ? void 0 : _3.day) > 6 || ((_4 = req.body) === null || _4 === void 0 ? void 0 : _4.day) < 0)
        return res.status(400).send({ fields: ["day"], msg: "Day is invalid" });
    if (parseFloat(req.body.start) + 5 >= parseFloat(req.body.end))
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
    db.updateFields("timetables", { id: parseInt(req.params.id) }, {
        [req.body.day]: event,
    }, false, "$push");
    return res.send(yield db.get("timetables", { id: parseInt(req.params.id) }));
}));
router.put("/timetable/:id/:eid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18;
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    const timetable = yield db.get("timetables", {
        id: parseInt(req.params.id),
        ownerId: res.locals.user.id,
    });
    if (!timetable)
        return res.status(404).send("Unknown timetable");
    if (!((_5 = req.body) === null || _5 === void 0 ? void 0 : _5.day) || ((_6 = req.body) === null || _6 === void 0 ? void 0 : _6.day) > 6 || ((_7 = req.body) === null || _7 === void 0 ? void 0 : _7.day) < 0)
        return res.status(400).send({ fields: ["day"], msg: "Day is invalid" });
    if (parseFloat(req.body.start) + 5 >= parseFloat(req.body.end))
        return res
            .status(400)
            .send({ fields: ["start", "end"], msg: "Event should at least be 5 minutes long" });
    const schema = {
        [`${req.body.day}.$.name`]: ((_9 = (_8 = req.body) === null || _8 === void 0 ? void 0 : _8.name) === null || _9 === void 0 ? void 0 : _9.length) > 40 ? null : (_10 = req.body.name) === null || _10 === void 0 ? void 0 : _10.trim(),
        [`${req.body.day}.$.desc`]: ((_12 = (_11 = req.body) === null || _11 === void 0 ? void 0 : _11.desc) === null || _12 === void 0 ? void 0 : _12.length) > 100 ? null : (_13 = req.body.desc) === null || _13 === void 0 ? void 0 : _13.trim(),
        [`${req.body.day}.$.loc`]: ((_15 = (_14 = req.body) === null || _14 === void 0 ? void 0 : _14.loc) === null || _15 === void 0 ? void 0 : _15.length) > 100 ? null : (_16 = req.body.loc) === null || _16 === void 0 ? void 0 : _16.trim(),
        [`${req.body.day}.$.start`]: (_17 = req.body) === null || _17 === void 0 ? void 0 : _17.start,
        [`${req.body.day}.$.end`]: (_18 = req.body) === null || _18 === void 0 ? void 0 : _18.end,
    };
    for (let p in schema) {
        if (schema[p] == null || (typeof schema[p] == "string" && schema[p].length == 0))
            delete schema[p];
    }
    const data = yield db.updateFields("timetables", { id: parseInt(req.params.id), [`${req.body.day}.id`]: parseInt(req.params.eid) }, schema);
    res.sendStatus(200);
}));
router.delete("/timetable/:id/:eid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _19, _20, _21;
    if (!res.locals.user)
        return res.redirect("/login?callback=" + req.path);
    const timetable = yield db.get("timetables", {
        id: parseInt(req.params.id),
        ownerId: res.locals.user.id,
    });
    if (!timetable)
        return res.status(404).send("Unknown timetable");
    if (!((_19 = req.body) === null || _19 === void 0 ? void 0 : _19.day) || ((_20 = req.body) === null || _20 === void 0 ? void 0 : _20.day) > 6 || ((_21 = req.body) === null || _21 === void 0 ? void 0 : _21.day) < 0)
        return res.status(400).send({ fields: ["day"], msg: "Day is invalid" });
    const data = yield db.updateFields("timetables", { id: parseInt(req.params.id) }, { [req.body.day]: { id: parseInt(req.params.eid) } }, false, "$pull");
    return res.sendStatus(200);
}));
exports.default = router;
