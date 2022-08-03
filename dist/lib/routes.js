"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const mongodb_1 = require("mongodb");
const db = __importStar(require("./db"));
const util = __importStar(require("./util"));
const auth_1 = require("./auth");
const router = express_1.default.Router();
router.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a["arrif-session"]) && (0, auth_1.verifyAuthToken)((_b = req.cookies) === null || _b === void 0 ? void 0 : _b["arrif-session"]);
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
router.post("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers["content-type"] !== "application/json")
        return res.status(400).send(`Invalid content type`);
    const checkFormData = yield db.checkFormData(req.body, "login");
    if (checkFormData instanceof classes_1.FormError)
        return res.status(400).send(checkFormData);
    const user = yield db.matchUser(req.body);
    if (user instanceof classes_1.FormError)
        return res.status(400).send(user);
    res.cookie("arrif-session", (0, auth_1.generateAuthToken)(user.id));
    if (req.query.callback)
        return res.redirect(req.query.callback);
    res.sendStatus(200);
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
    const checkFormData = yield db.checkFormData(req.body, "register");
    if (checkFormData instanceof classes_1.FormError)
        return res.status(400).send(checkFormData);
    const checkDupAcc = yield db.checkDupAcc(req.body);
    if (checkDupAcc instanceof classes_1.FormError)
        return res.status(400).send(checkDupAcc);
    const user = yield db.addUser(req.body);
    res.cookie("arrif-session", (0, auth_1.generateAuthToken)(user.id));
    return res.redirect("/dashboard");
    // res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
}));
/** Dashboard */
router.get("/dashboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const token = ((_d = req.cookies) === null || _d === void 0 ? void 0 : _d["arrif-session"]) && (0, auth_1.verifyAuthToken)((_e = req.cookies) === null || _e === void 0 ? void 0 : _e["arrif-session"]);
    if (!token || !(token === null || token === void 0 ? void 0 : token.id))
        return res.redirect("/login");
    const user = yield db.get("users", { id: token.id });
    if (!user)
        return res.redirect("/");
    const hours = new Date().getHours();
    let welcomeText = "Morning";
    if (hours > 12 && hours < 18)
        welcomeText = "Afternoon";
    else if (hours > 18)
        welcomeText = "Evening";
    const tt = yield db.getMultiple("timetables", { ownerId: user.id });
    const upnext = [];
    tt.forEach((t) => {
        console.log(t);
        t.days["Monday"].map((d) => {
            console.log("d", d);
            upnext.push({
                name: d.name,
                desc: `With ${d.desc} in ${d.loc}`,
                time: `${d.dur}:${d.dur}am`,
                footer: `from ${t.id}`,
            });
        });
    });
    for (const t in tt) {
        // for (const  t.days["Monday"])
    }
    console.log("---", upnext);
    let schedule = {
        upnext: upnext,
    };
    res.render("dashboard", { welcomeText: welcomeText, schedule: schedule });
}));
/** Settings */
router.get("/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("settings", {
        settings: [
            {
                l: "Username",
                t: "text",
                n: "username",
            },
            {
                l: "Email",
                t: "email",
                n: "email",
            },
            {
                l: "Password",
                t: "password",
                n: "password",
            },
        ],
    });
}));
router.put("/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db.get("users", { _id: new mongodb_1.ObjectId(req.body.userId) });
    if (!user)
        return res.status(401).send("Could not find requested user");
    db.updateField("users", { _id: user._id }, { settings: { "": "auughhh" } });
    res.sendStatus(200);
}));
/** Timetables */
router.get("/timetable/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (req.params.id != "new") {
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
        // days.map((d)=>{
        // })
        for (let i = 0; i < numPeriods; i++)
            rows.push(`<td class="timetable-period">${i}</td>` + days.map((d) => e(d[1][i])).join(""));
        res.render("timetable", {
            tt: Object.assign(Object.assign({}, timetable), { html: {
                    rows: rows.map((d) => `<tr>${d}</tr>`).join(""),
                    days: days.map((d) => `<th>${d[0]}</th>`).join(""),
                } }),
            path: req.path,
        });
        // const firstRow =
    }
    else {
        const timetable = {
            id: (0, auth_1.generateId)("num"),
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
}));
// /** Timetable event */
// router.get("/timetable/:id/:eid", async (req, res) => {
// 	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// 	if (req.params.id != "new") {
// 		const timetable = await db.get("timetables", { id: req.params.id });
// 		if (!timetable)
// 			return res.status(404).render("error", {
// 				err: "404",
// 				msg: "Couldn't find the timetable you were looking for (maybe deleted)...",
// 			});
// 		const e = (d: any) => `<td class="timetable-event">
// 			<span contenteditable class="timetable-event-title">${d.name}</span>
// 			<span contenteditable class="timetable-event-loc">${d.loc}</span><br>
// 			<span contenteditable class="timetable-event-desc">${d.desc}</span>
// 		</td>`;
// 		const days: any = Object.entries(timetable.days);
// 		const numPeriods = days[0][1].length;
// 		const rows: any = [];
// 		// days.map((d)=>{
// 		// })
// 		for (let i = 0; i < numPeriods; i++)
// 			rows.push(
// 				`<td class="timetable-period">${i}</td>` + days.map((d: any) => e(d[1][i])).join("")
// 			);
// 		res.render("timetable", {
// 			tt: {
// 				...timetable,
// 				html: {
// 					rows: rows.map((d: any) => `<tr>${d}</tr>`).join(""),
// 					days: days.map((d: any) => `<th>${d[0]}</th>`).join(""),
// 				},
// 			},
// 			path: req.path,
// 		});
// 		// const firstRow =
// 	} else {
// 		const timetable = {
// 			id: generateId("num"),
// 			name: "New Timetable",
// 			repeats: 1,
// 			days: [],
// 			html: {
// 				rows: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
// 				headers: ["Day", ...util.genArrayFromRange(0, 6)],
// 			},
// 		};
// 		res.render("timetable", { tt: timetable });
// 	}
// });
exports.default = router;
