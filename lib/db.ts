// Avoxel284
// Functions for authentication and stuff

import { User } from "./classes";
import bcrypt from "bcrypt";
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@arrif.emsgrc7.mongodb.net/?retryWrites=true&w=majority`
).connect();

export async function checkDuplicateAccount() {
	const users = (await client).db("db0").collection("users");

	users.findOne({
		// username: 
	})

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
export async function encryptLoginData(data: any = {}): Promise<any> {
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
export async function authorizeLoginData(data: any = {}, hash: string): Promise<boolean> {
	const match = await bcrypt.compare(data.password, hash).catch((err) => {
		throw err;
	});
	return match;
}
