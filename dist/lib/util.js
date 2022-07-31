"use strict";
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
