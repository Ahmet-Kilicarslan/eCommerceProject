import * as mysql from 'mysql2/promise';
import 'dotenv/config';


if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    throw new Error('Missing required database environment variables. Check your .env file.');
}

export  const pool= mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});







    /*
    change password:
    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourStrongPassword';
    FLUSH PRIVILEGES;


    backup data :
    mysqldump -u root -p frost > backup.sql

    to insert existing data from outside sql file:
    mysql -u root -p frost < /home/ahmet/Desktop/full_backup.sql

        *///tree -I 'node_modules|dist|build'
//A#*s*irP"8@q1n*2
