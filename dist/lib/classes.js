"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(data = {}) {
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
    }
}
exports.User = User;
