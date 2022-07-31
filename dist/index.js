"use strict";
// Avoxel284
// Arrif Planner Backend
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
const meta_json_1 = __importDefault(require("./meta.json"));
dotenv_1.default.config();
const port = 5001;
const app = (0, express_1.default)();
const apiRouter = express_1.default.Router();
const mango = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`);
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public", "static")));
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "..", "public"));
mango.connect((err) => {
    const collection = mango.db("test").collection("devices");
    // perform actions on the collection object
    mango.close();
});
app.get("/", (req, res) => {
    res.render("index", { meta: meta_json_1.default, psId: 0 });
});
app.get("/login", (req, res) => {
    res.render("login", { meta: meta_json_1.default, psId: 1 });
});
app.post("/login", (req, res) => {
    console.log(req.body);
    res.redirect("/dashboard");
    // res.send(`auughhhhhhh`);
});
app.listen(80, () => {
    console.log(`ARRIF BACKEND LISTENING :: PORT 80`);
});
app.use((err, req, res, next) => {
    // thx express for not including this one in the typings
    console.error(err);
    res.status(500).render("error", { errorMsg: "An internal error occurred" });
});
app.use(function (req, res, next) {
    res.status(404).render("error", { errorMsg: "404 Not Found" });
});
