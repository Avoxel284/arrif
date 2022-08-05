"use strict";
// Avoxel284
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
exports.remove = exports.updateFields = exports.getMultiple = exports.get = exports.matchUser = exports.addTimetable = exports.addUser = exports.checkDupAcc = exports.getCollection = void 0;
const classes_1 = require("./classes");
const mongodb_1 = require("mongodb");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth = __importStar(require("./auth"));
const client = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`).connect();
function getCollection(col) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield client).db("db0").collection(col);
    });
}
exports.getCollection = getCollection;
function checkDupAcc(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield getCollection("users");
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
/*
 */
function addUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (yield client)
            .db("db0")
            .collection("users")
            .insertOne({
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            password: bcrypt_1.default.hashSync(data.password, 10),
            id: auth.generateId(),
            settings: {
                // never got to implement this but oh well
                darkMode: false,
            },
            todo: [],
        });
        return new classes_1.User(yield get("users", { _id: user.insertedId }));
    });
}
exports.addUser = addUser;
function addTimetable(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (yield client)
            .db("db0")
            .collection("timetables")
            .insertOne({
            id: auth.generateId("num"),
            name: data.name,
            ownerId: data.ownerId,
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": [],
        });
        return yield get("timetables", { _id: user.insertedId });
    });
}
exports.addTimetable = addTimetable;
/**
 * Compare given login data and return User from DB or formError if authorized or not
 */
function matchUser(data) {
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
exports.matchUser = matchUser;
/**
 * Returns a document in a given collection with a given filter
 */
function get(collection, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const coll = yield getCollection(collection);
        return yield coll.findOne(filter);
    });
}
exports.get = get;
/**
 * Returns multiple document in a given collection with a given filter
 */
function getMultiple(collection, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const coll = yield getCollection(collection);
        return yield coll.find(filter);
    });
}
exports.getMultiple = getMultiple;
function updateFields(collection, filter, values, many = false, updater = "$set") {
    return __awaiter(this, void 0, void 0, function* () {
        const coll = yield getCollection(collection);
        if (many)
            return coll.updateMany(filter, { [updater]: values });
        return coll.updateOne(filter, { [updater]: values });
    });
}
exports.updateFields = updateFields;
function remove(collection, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const coll = yield getCollection(collection);
        return yield coll.deleteOne(filter);
    });
}
exports.remove = remove;
