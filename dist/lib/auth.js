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
exports.checkFormData = exports.generateAuthToken = exports.generateId = exports.verifyAuthToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const classes_1 = require("./classes");
const crypto = __importStar(require("crypto"));
const cms_json_1 = __importDefault(require("../cms.json"));
function verifyAuthToken(token) {
    try {
        return jwt.verify(token, process.env.AUTH_TOKEN);
    }
    catch (err) {
        return null;
    }
}
exports.verifyAuthToken = verifyAuthToken;
/**
 * Generate a random user id
 */
function generateId(type = "hex") {
    if (type == "hex")
        return crypto.randomBytes(26).toString("hex");
    else if (type == "num") {
        // hi-tech numeric id generation right here
        const time = Date.now() + Math.floor(Math.random() * 10);
        return parseInt(time.toString(8));
    }
    return;
}
exports.generateId = generateId;
/**
 * Generate a session token
 */
function generateAuthToken(id) {
    return jwt.sign({ id: id }, process.env.AUTH_TOKEN, { expiresIn: "30d" });
}
exports.generateAuthToken = generateAuthToken;
/**
 * Check user form data
 */
function checkFormData(data, formType) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const nullFields = [];
        const invalidFields = [];
        cms_json_1.default.forms[formType].f.forEach((f) => {
            data[f.n] = data[f.n];
            if (formType != "settings" && !data[f.n])
                return nullFields.push(f.n);
            if (f.p && data[f.p] && !new RegExp(f.p).test(data[f.n]))
                return invalidFields.push(f.n);
        });
        if (nullFields.length > 0)
            return new classes_1.FormError("Required fields are not filled out", nullFields);
        if (invalidFields.length > 0)
            return new classes_1.FormError("Field(s) are invalid", invalidFields);
        if (((_a = data === null || data === void 0 ? void 0 : data.password) === null || _a === void 0 ? void 0 : _a.length) < 8)
            return new classes_1.FormError("Password must contain at least 8 characters", ["password"]);
    });
}
exports.checkFormData = checkFormData;
