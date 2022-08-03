"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timetable = exports.FormError = exports.User = void 0;
class User {
    constructor(data = {}) {
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.settings = data.settings;
        this.id = data.id;
        this.timetables = data.timetables;
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
class Timetable {
    constructor(data) {
        this.days = data.days;
        this.id = data.id;
        this.ownerId = data.ownerId;
    }
}
exports.Timetable = Timetable;
