"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormError = exports.User = void 0;
class User {
    constructor(data = {}) {
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.settings = data.settings;
        this.id = data.id;
        this.todo = data.todo;
    }
}
exports.User = User;
class FormError {
    constructor(msg, fields) {
        this.msg = msg;
        this.fields = fields;
    }
}
exports.FormError = FormError;
