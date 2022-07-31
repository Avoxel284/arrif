"use strict";
// Avoxel284
// Functions for authentication and stuff
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
exports.authorizeLoginData = exports.encryptLoginData = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Encrypt given login data and return it
 */
function encryptLoginData(data = {}) {
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
/**
 * Compare given login data to given hash from DB and return boolean if authorized or not
 */
function authorizeLoginData(data = {}, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const match = yield bcrypt_1.default.compare(data.password, hash).catch((err) => {
            throw err;
        });
        return match;
    });
}
exports.authorizeLoginData = authorizeLoginData;
