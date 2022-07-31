"use strict";
const express = require("express");
const meta = require("../cms.json");
const db = require("./db");
const router = express.Router();
/** Root */
router.get("/", (req, res) => {
    res.render("index", { meta: meta, path: req.path });
});
/** Login */
router.get("/login", (req, res) => {
    res.render("login", { meta: meta, path: req.path });
});
router.post("/login", (req, res) => {
    res.render("login", {
        meta,
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
    // let authorizeLoginData();
    res.render("register", {
        meta: meta,
        path: req.path,
        formError: { e: "Email is already used for another account.", n: "email" },
    });
});
router.post("/register", (req, res) => {
    res.send(`${req.body.username}:${req.body.password}:${req.body.email}`);
});
/** Dashboard */
router.get("/dashboard", (req, res) => {
    let m = meta;
    let user = {
        username: "username",
    };
    res.render("dashboard", { meta: m, user: user, path: req.path });
});
/** Settings */
router.get("/settings", (req, res) => {
    let m = meta;
    let user = {
        username: "username",
    };
    res.render("settings", { meta: m, user: user, path: req.path });
});
module.exports = router;
