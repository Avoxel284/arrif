"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
new mongoose_1.Schema({
    /** Username */
    username: String,
    /** Password, still in hashed state obviously */
    password: String,
    /** User's email; */
    email: String,
    /** User Id, same as document id */
    id: String,
    /** Settings */
    settings: {
        /** Super dark mode theme */
        darkMode: Boolean,
    },
    /** Array of the IDs of the user's timetables */
    timetables: Array,
});
