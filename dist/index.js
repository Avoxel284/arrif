"use strict";
// Avoxel284
// Arrif Planner Backend
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./lib/routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "..", "public"));
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public", "static")));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// app.use(authenticateToken);
app.use("/", routes_1.default);
app.listen(80, () => {
    console.log(`ARRIF BACKEND LISTENING :: PORT 80`);
});
app.use((err, req, res, next) => {
    // thx express for not including this one in the typings
    console.error(err);
    res.status(500).render("error", { err: "500", msg: "An internal error occurred..." });
});
app.use(function (req, res, next) {
    res
        .status(404)
        .render("error", { err: "404", msg: "Couldn't find whatever you're looking for..." });
});
