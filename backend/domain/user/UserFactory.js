import User from './User.js'
import Email from './valueObjects/Email.js'
import Password from './valueObjects/Password.js'
import Username from "./valueObjects/Username.js";

export default class UserFactory {

    static createUser(userData) {

        const username = new Username(userData.username);
        const email = new Email(userData.email);
        const password = new Password(userData.password);


        return new User(
            null,
            username,
            password,
            'user',
            email,
        );


    }

    static CreateUserFromDB(row) {
        return new User(
            row.id,
            row.username,
            row.password,
            row.role,
            row.email
        )

    }

    static createAdmin(userData) {
        return this.createUser({
            ...userData,//spread operator used here.this will create user with admin role
            role: 'admin'
        });
    }
}
