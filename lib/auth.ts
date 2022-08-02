// Avoxel284

import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "./classes";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

export function verifyAuthToken(token: string) {
	try {
		return jwt.verify(token, process.env.AUTH_TOKEN as string) as any;
	} catch (err) {
		return null;
	}
}

/**
 * Generate a random user id
 */
export function generateId(type: "num" | "hex" = "hex") {
	if (type == "hex") return crypto.randomBytes(26).toString("hex");
	else if (type == "num") {
		const time = Date.now();
		const bTime = time.toString(8);
		return time;
	}
	return;
}

/**
 * Generate a session token.
 *
 * @param id The user's id
 */
export function generateAuthToken(id: string) {
	return jwt.sign({ id: id }, process.env.AUTH_TOKEN as string, { expiresIn: "30d" });
}
