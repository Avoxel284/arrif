"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meta_json_1 = __importDefault(require("../meta.json"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.render("index", { meta: meta_json_1.default, path: req.path });
});
router.get("/login", (req, res) => {
    res.render("login", { meta: meta_json_1.default, path: req.path });
});
router.post("/login", (req, res) => {
    res.redirect("/dashboard");
});
router.get("/register", (req, res) => {
    res.render("register", { meta: meta_json_1.default, path: req.path });
});
router.get("/dashboard", (req, res) => {
    let m = meta_json_1.default;
    let user = {
        username: "username",
    };
    res.render("dashboard", { meta: m, user: user, path: req.path });
});
module.exports = router;
// export router;
