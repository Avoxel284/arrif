// Avoxel284

import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { FormError, User } from "./classes";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import meta from "../cms.json";

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

/**
 * Check user form data
 */
export async function checkFormData(data: any, formType: "register" | "login" | "settings") {
	const nullFields: any[] = [];
	const invalidFields: any[] = [];
	meta.forms[formType].f.forEach((f) => {
		data[f.n] = data[f.n] as string;
		if (formType != "settings" && !data[f.n]) return nullFields.push(f.n);
		if (f.p && data[f.p] && !new RegExp(f.p).test(data[f.n])) return invalidFields.push(f.n);
	});
	if (nullFields.length > 0) return new FormError("Required fields are not filled out", nullFields);
	if (invalidFields.length > 0) return new FormError("Field(s) are invalid", invalidFields);
	if (data?.password?.length < 8)
		return new FormError("Password must contain at least 8 characters", ["password"]);
}
