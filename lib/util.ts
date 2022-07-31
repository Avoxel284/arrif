/**
 * Removes an element from an array and returns it
 */
export function arrayRm(arr: any[], index: number) {
	if (index > -1) arr.splice(index, 1);
	return arr;
}
