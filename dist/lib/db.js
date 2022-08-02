"use strict";
// Avoxel284
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
exports.retrieveUserTimetables = exports.retrieveUser = exports.addUser = exports.encryptLoginData = exports.checkDupAcc = exports.checkFormData = exports.getCollection = void 0;
const classes_1 = require("./classes");
const mongodb_1 = require("mongodb");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cms_json_1 = __importDefault(require("../cms.json"));
const client = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`).connect();
function getCollection(col) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield client).db("db0").collection(col);
    });
}
exports.getCollection = getCollection;
//https://www.bezkoder.com/node-js-express-login-mongodb/
function checkFormData(data, formType) {
    return __awaiter(this, void 0, void 0, function* () {
        const nullFields = [];
        const invalidFields = [];
        cms_json_1.default.forms[formType].f.forEach((f) => {
            if (!data[f.n])
                return nullFields.push(f.n);
            if (f.p && !new RegExp(f.p).test(data[f.n]))
                return invalidFields.push(f.n);
        });
        if (nullFields.length > 0)
            return { msg: "Required fields are not filled out", fields: nullFields };
        if (invalidFields.length > 0)
            return { msg: "Field(s) are invalid", fields: invalidFields };
        if (data.password.length < 8)
            return { msg: "Password must at least have 8 characters", fields: "password" };
    });
}
exports.checkFormData = checkFormData;
function checkDupAcc(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getCollection("users");
        // await users.createIndex({ type: 1 }, { collation: { locale: "en", strength: 2 } });
        const dupUser = yield users.findOne({
            $or: [{ username: { $regex: new RegExp(`^${data.username}`, "i") } }, { email: data.email }],
        });
        if (!dupUser)
            return;
        if (dupUser.email.toLowerCase() == data.email.toLowerCase())
            return { msg: "Email is already in use.", fields: ["email"] };
        if (dupUser.username.toLowerCase() == data.username.toLowerCase())
            return { msg: "Username is already taken.", fields: ["username"] };
        return;
    });
}
exports.checkDupAcc = checkDupAcc;
/**
 * Encrypt given login data and return it
 */
function encryptLoginData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = yield bcrypt_1.default.hash(data.password, 11).catch((err) => {
            throw err;
        });
        data.password = hash;
        return {
            username: data.username,
            password: data.password,
        };
    });
}
exports.encryptLoginData = encryptLoginData;
/*
 */
function addUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = yield bcrypt_1.default.hash(data.password, 10).catch((err) => {
            throw err;
        });
        data.password = hash;
        (yield client).db("db0").collection("users").insertOne({
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            password: data.password,
        });
    });
}
exports.addUser = addUser;
/**
 * Compare given login data to given hash from DB and return boolean if authorized or not
 */
function retrieveUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getCollection("users");
        const user = yield users.findOne({
            $or: [{ username: data.username }, { email: data.email }],
        });
        if (!user)
            return new classes_1.FormError("User does not exist", ["username"]);
        const match = yield bcrypt_1.default.compare(data.password, user.password).catch((err) => {
            throw err;
        });
        if (!match)
            return new classes_1.FormError("Incorrect password", ["password"]);
        return new classes_1.User(user);
    });
}
exports.retrieveUser = retrieveUser;
function retrieveUserTimetables(ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const timetables = yield (yield getCollection("timetables")).findOne({
            ownerId: ownerId,
        });
        return timetables;
    });
}
exports.retrieveUserTimetables = retrieveUserTimetables;
