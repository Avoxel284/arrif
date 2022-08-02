// Avoxel284
// Util functions

/**
 * Removes an element from an array and returns it
 */
export function arrayRm(arr: any[], index: number) {
	if (index > -1) arr.splice(index, 1);
	return arr;
}

/**
 * Returns a given string that has been truncated to a given length
 */
exports.truncateString = (str: string, len: number) => {
	if (str == null) return null;
	return str.substr(0, length) + "...";
};
