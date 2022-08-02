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
const mongodb_1 = require("mongodb");
const db = __importStar(require("./db"));
const auth_1 = require("./auth");
const router = express_1.default.Router();
/** Root */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("index", { meta: cms_json_1.default, path: req.path });
}));
/** Login */
router.get("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("onboarding", { meta: cms_json_1.default, path: req.path, formType: "login" });
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
    if (req.query.callback)
        return res.redirect(req.query.callback);
    res.sendStatus(200);
}));
/** Logout */
router.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect("/");
}));
/** Register */
router.get("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("onboarding", {
        meta: cms_json_1.default,
        path: req.path,
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
    db.addUser(req.body);
    res.cookie("arrif-session", "session");
    return res.redirect("/dashboard");
    // res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
}));
/** Dashboard */
router.get("/dashboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers["authorization"] && (0, auth_1.verifyAuthToken)(req.headers["authorization"]);
    if (!token || !(token === null || token === void 0 ? void 0 : token.id))
        return res
            .status(401)
            .render("error", { err: "401 Unauthorized", msg: "Trying to forge JWTs now huh?" });
    const user = yield db.get("users", { id: token.id });
    if (!user)
        res.redirect("/");
    // const token = authenticateToken(req, res);
    // if (!token) return res.sendStatus(403);
    res.render("dashboard", { meta: cms_json_1.default, user: user, path: req.path });
}));
/** Settings */
router.get("/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let m = cms_json_1.default;
    let user = {
        username: "username",
    };
    res.render("settings", { meta: m, user: user, path: req.path });
}));
router.put("/settings", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db.get("users", { _id: new mongodb_1.ObjectId(req.body.userId) });
    console.log(req.body.userId);
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
        const p = (d) => `<td class="timetable-event">
			<span contenteditable class="timetable-event-title">${d.name}</span>
			<span contenteditable class="timetable-event-loc">${d.loc}</span><br>
			<span contenteditable class="timetable-event-desc">${d.desc}</span>
		</td>`;
        const days = Object.entries(timetable.days);
        const numPeriods = days[0][1].length;
        const rows = [];
        for (let i = 0; i < numPeriods; i++)
            rows.push(`<td class="timetable-period">${i}</td>` + days.map((d) => p(d[1][i])).join(""));
        res.render("timetable", {
            meta: cms_json_1.default,
            tt: Object.assign(Object.assign({}, timetable), { html: {
                    rows: rows.map((d) => `<tr>${d}</tr>`).join(""),
                    days: days.map((d) => `<th>${d[0]}</th>`).join(""),
                } }),
            path: req.path,
        });
    }
    else {
        const timetable = {
            id: (0, auth_1.generateId)(),
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
        res.render("timetable", { meta: cms_json_1.default, path: req.path, tt: timetable });
    }
}));
exports.default = router;
