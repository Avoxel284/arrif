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

export async function checkDupAcc(data: any) {
	const users = await getCollection("users");

	const dupUser = await users.findOne({
		$or: [{ username: data.username }, { email: data.email }],
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
			settings: {
				// never got to implement this but oh well
				darkMode: false,
			},
			todo: [],
		});

	return new User(await get("users", { _id: user.insertedId }));
}

export async function addTimetable(data: any) {
	const user = await (
		await client
	)
		.db("db0")
		.collection("timetables")
		.insertOne({
			id: auth.generateId("num") as string,
			name: data.name,
			ownerId: data.ownerId,
			"0": [],
			"1": [],
			"2": [],
			"3": [],
			"4": [],
			"5": [],
			"6": [],
		});

	return await get("timetables", { _id: user.insertedId });
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
 * Returns a document in a given collection with a given filter
 */
export async function get(collection: string, filter: object) {
	const coll = await getCollection(collection);
	return await coll.findOne(filter);
}

/**
 * Returns multiple document in a given collection with a given filter
 */
export async function getMultiple(collection: string, filter: object) {
	const coll = await getCollection(collection);
	return await coll.find(filter);
}

export async function updateFields(
	collection: string,
	filter: any,
	values: any,
	many = false,
	updater = "$set"
) {
	const coll = await getCollection(collection);
	if (many) return coll.updateMany(filter, { [updater]: values });
	return coll.updateOne(filter, { [updater]: values });
}

export async function remove(collection: string, filter: object) {
	const coll = await getCollection(collection);
	return await coll.deleteOne(filter);
}
