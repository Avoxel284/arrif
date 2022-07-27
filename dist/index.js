"use strict";
// Avoxel284
// Arrif Planner Backend
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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const security_1 = require("./lib/security");
dotenv_1.default.config();
const port = 5001;
const app = (0, express_1.default)();
const apiRouter = express_1.default.Router();
const mango = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`);
mango.connect((err) => {
    const collection = mango.db("test").collection("devices");
    // perform actions on the collection object
    mango.close();
});
apiRouter.get("/user/:userid", (req, res) => {
    res.send("Hello, " + req.params.userid);
});
app.use(`/api/v1`, apiRouter);
app.listen(port, () => {
    console.log(`ARRIF BACKEND STARTED :: PORT: ${port}`);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const loginData = yield (0, security_1.encryptLoginData)({
        username: "myAmazingUsername",
        password: "myAmazingPassword",
    });
    console.log(loginData);
    console.log((0, security_1.authorizeLoginData)());
}))();
