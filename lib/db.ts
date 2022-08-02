// Avoxel284

import { FormError, User } from "./classes";
import { Collection, MongoClient, ReturnDocument, ServerApiVersion } from "mongodb";
import bcrypt from "bcrypt";
import meta from "../cms.json";
import * as jwt from "jsonwebtoken";
import * as auth from "./auth";

const client = new MongoClient(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`
).connect();

export async function getCollection(col: string) {
	return (await client).db("db0").collection(col);
}

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
	const users = await getCollection("users");
	// await users.createIndex({ type: 1 }, { collation: { locale: "en", strength: 2 } });

	const dupUser = await users.findOne({
		$or: [{ username: { $regex: new RegExp(`^${data.username}`, "i") } }, { email: data.email }],
	});

	if (!dupUser) return;
	if (dupUser.email.toLowerCase() == data.email.toLowerCase())
		return { msg: "Email is already in use.", fields: ["email"] };
	if (dupUser.username.toLowerCase() == data.username.toLowerCase())
		return { msg: "Username is already taken.", fields: ["username"] };
	return;
}

/*
 */
export async function addUser(data: any) {
	const user = await (
		await client
	)
		.db("db0")
		.collection("users")
		.insertOne({
			username: data.username.toLowerCase(),
			email: data.email.toLowerCase(),
			password: bcrypt.hashSync(data.password, 10),
			id: auth.generateId(),
			// token: auth.generateUserToken(),
		});

	return new User(user);
}

/**
 * Compare given login data and return User from DB or formError if authorized or not
 */
export async function matchUser(data: any): Promise<User | FormError> {
	const users = await getCollection("users");

	const user = await users.findOne({
		$or: [{ username: data.username }, { email: data.email }],
	});

	if (!user) return new FormError("User does not exist", ["username"]);
	const match = await bcrypt.compare(data.password, user.password).catch((err: Error) => {
		throw err;
	});
	if (!match) return new FormError("Incorrect password", ["password"]);

	return new User(user);
}

/**
 * Returns a document in a given
 */
export async function get(collection: string, filter: object) {
	const coll = await getCollection(collection);
	return await coll.findOne(filter);
}

export async function updateField(collection: string, filter: any, values: any) {
	const coll = await getCollection(collection);
	coll.updateOne(filter, { $set: values });
}

export async function retrieveUserTimetables(ownerId: string) {
	const timetables = await (
		await getCollection("timetables")
	).findOne({
		ownerId: ownerId,
	});
	return timetables;
}
