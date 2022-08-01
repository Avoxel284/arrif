// Avoxel284

import { User } from "./classes";
import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcrypt";
import meta from "../cms.json";

const client = new MongoClient(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`
).connect();

export async function checkFormData(data: any, formType: "register" | "login") {
	const nullFields: any[] = [];
	const invalidFields: any[] = [];
	meta.forms[formType].f.forEach((f) => {
		if (!data[f.n]) return nullFields.push(f.n);
		if (f.p && !new RegExp(f.p).test(data[f.n])) return invalidFields.push(f.n);
	});
	if (nullFields.length > 0)
		return { msg: "Required fields are not filled out", fields: nullFields };
	if (invalidFields.length > 0) return { msg: "Field(s) are invalid", fields: invalidFields };
	if (data.password.length < 8)
		return { msg: "Password must at least have 8 characters", fields: "password" };
}

export async function checkDupAcc(data: any) {
	const users = (await client).db("db0").collection("users");
	await users.createIndex({ type: 1 }, { collation: { locale: "en", strength: 2 } });

	const dupUser = await users.findOne({
		$or: [{ username: { $regex: new RegExp(`^${data.username}`, "i") } }, { email: data.email }],
	});

	if (!dupUser) return;
	if (dupUser.email.toLowerCase() == data.email.toLowerCase())
		return { msg: "Email is already in use.", fields: ["email"] };
	if (dupUser.username.toLowerCase() == data.username.toLowerCase())
		return { msg: "Username is already taken.", fields: ["username"] };
	return;

	// // Username
	// User.findOne({
	// 	username: req.body.username,
	// }).exec((err, user) => {
	// 	if (err) {
	// 		res.status(500).send({ message: err });
	// 		return;
	// 	}
	// 	if (user) {
	// 		res.status(400).send({ message: "Failed! Username is already in use!" });
	// 		return;
	// 	}
	// 	// Email
	// 	User.findOne({
	// 		email: req.body.email,
	// 	}).exec((err, user) => {
	// 		if (err) {
	// 			res.status(500).send({ message: err });
	// 			return;
	// 		}
	// 		if (user) {
	// 			res.status(400).send({ message: "Failed! Email is already in use!" });
	// 			return;
	// 		}
	// 		next();
	// 	});
	// });
}

/**
 * Encrypt given login data and return it
 */
export async function encryptLoginData(data: any) {
	const hash = await bcrypt.hash(data.password, 11).catch((err: Error) => {
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
export async function authorizeLoginData(data: any, hash: string) {
	const match = await bcrypt.compare(data.password, hash).catch((err: Error) => {
		throw err;
	});
	return match;
}
