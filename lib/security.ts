// Avoxel284
// Functions for authentication and stuff

import { UserLoginData } from "./classes";
import bcrypt from "bcrypt";

/**
 * Encrypt given login data and return it
 */
export async function encryptLoginData(data: UserLoginData): Promise<UserLoginData> {
	const hash = await bcrypt.hash(data.password, 11).catch((err) => {
		throw err;
	});
	data.password = hash;

	return {
		username: data.username,
		password: data.password,
	};
}

/**
 * Compare given login data to given hash from DB and return boolean if authorized or not
 */
export async function authorizeLoginData(data: UserLoginData, hash: string): Promise<boolean> {
	const match = await bcrypt.compare(data.password, hash).catch((err) => {
		throw err;
	});
	return match;
}
