export class User {
	/** Username */
	username: string;
	/** Password, still in hashed state obviously */
	password: string;
	/** User's email; */
	email: string;

	constructor(data: any = {}) {
		this.username = data.username;
		this.password = data.password;
		this.email = data.email;
	}
}
