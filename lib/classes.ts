export class User {
	/** Username */
	username: string;
	/** Password, still in hashed state obviously */
	password: string;
	/** User's email; */
	email: string;
	/** User Id, same as document id */
	id: string;
	/** Settings */
	settings: {
		/** Super dark mode theme */
		darkMode: boolean;
	};
	/** Array of the IDs of the user's timetables */
	timetables: number[];
	/** Array of the user's todos */
	todo: {
		name: string;
		desc: string;
	}[];

	constructor(data: any = {}) {
		this.username = data.username;
		this.password = data.password;
		this.email = data.email;
		this.settings = data.settings;
		this.id = data.id;
		this.timetables = data.timetables;
		this.todo = data.todo;
	}
}

export class FormError {
	msg: string;
	fields: string[];
	constructor(msg: string, fields: string[]) {
		this.msg = msg;
		this.fields = fields;
	}
}

export class Timetable {
	/** Array of days containing array of events */
	days: [
		{
			/** Day name */
			n: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
			/** Events */
			e: [
				{
					/** Name of event */
					n: string;
					/** Location of event */
					l: string;
					/** Description of event */
					d: string;
					/** Ending time in minutes since start of day */
					e: number;
					/** Starting time in minutes since start of day */
					s: number;
				}
			];
		}
	];
	/** Timetable Id */
	id: string;
	/** Owner of timetable's Id */
	ownerId: string;

	constructor(data: any) {
		this.days = data.days;
		this.id = data.id;
		this.ownerId = data.ownerId;
	}
}
