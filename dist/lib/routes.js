"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cms_json_1 = __importDefault(require("../cms.json"));
const router = express_1.default.Router();
/** Root */
router.get("/", (req, res) => {
    res.render("index", { meta: cms_json_1.default, path: req.path });
});
/** Login */
router.get("/login", (req, res) => {
    res.render("login", { meta: cms_json_1.default, path: req.path });
});
router.post("/login", (req, res) => {
    res.render("login", {
        meta: cms_json_1.default,
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
        meta: cms_json_1.default,
        path: req.path,
        formError: { e: "Email is already used for another account.", n: "email" },
    });
});
router.post("/register", (req, res) => {
    res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});
/** Dashboard */
router.get("/dashboard", (req, res) => {
    let m = cms_json_1.default;
    let user = {
        username: "username",
    };
    res.render("dashboard", { meta: m, user: user, path: req.path });
});
/** Settings */
router.get("/settings", (req, res) => {
    let m = cms_json_1.default;
    let user = {
        username: "username",
    };
    res.render("settings", { meta: m, user: user, path: req.path });
});
router.get("/img", (req, res) => {
    console.log(req, res);
    res.sendFile("LogoWhite.png");
});
exports.default = router;
// export router;
