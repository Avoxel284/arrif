"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptLoginData = void 0;
const crypto_1 = __importDefault(require("crypto"));
function encryptLoginData(data) {
    const init = crypto_1.default.randomBytes(16);
    const key = crypto_1.default.randomBytes(32);
    const password = crypto_1.default
        .createCipheriv("aes-256-cbc", key, init)
        .update(data.password, "utf-8", "hex");
    return {
        username: data.username,
        password: password,
    };
}
exports.encryptLoginData = encryptLoginData;
