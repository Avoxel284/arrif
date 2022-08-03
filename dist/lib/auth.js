"use strict";
// Avoxel284
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuthToken = exports.generateId = exports.verifyAuthToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
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
        const time = Date.now();
        const bTime = time.toString(8);
        return time;
    }
    return;
}
exports.generateId = generateId;
/**
 * Generate a session token.
 *
 * @param id The user's id
 */
function generateAuthToken(id) {
    return jwt.sign({ id: id }, process.env.AUTH_TOKEN, { expiresIn: "30d" });
}
exports.generateAuthToken = generateAuthToken;
