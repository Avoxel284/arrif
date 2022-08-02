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
		darkMode: boolean,

	}

	constructor(data: any = {}) {
		this.username = data.username;
		this.password = data.password;
		this.email = data.email;
		this.settings = data.settings;
		this.id = data._id;
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
