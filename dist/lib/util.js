"use strict";
// Avoxel284
// Util functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayRm = void 0;
/**
 * Removes an element from an array and returns it
 */
function arrayRm(arr, index) {
    if (index > -1)
        arr.splice(index, 1);
    return arr;
}
exports.arrayRm = arrayRm;
/**
 * Returns a given string that has been truncated to a given length
 */
exports.truncateString = (str, len) => {
    if (str == null)
        return null;
    return str.substr(0, length) + "...";
};
