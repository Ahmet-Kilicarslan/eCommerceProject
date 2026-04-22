import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import mysql from 'mysql2/promise';
import 'dotenv/config';
//import EmployeeRoute from './api/EmployeeRoute.js';
import ProductRoute from '../backend/api/ProductRoute.js';
import SupplierRoute from "./api/SupplierRoute.js";
import UserRoute from "./api/UserRoute.js";
import PurchaseRoute from "./api/PurchaseRoute.js";
import multer from 'multer';
import UploadsRoute from "./api/UploadsRoute.js";
import path from 'path';


const MysqlStore = new MySQLStoreFactory(session);
//create an express app
const app = express();

//enable express to parse incoming requests
app.use(express.json());
app.use("/images", express.static(path.join(process.cwd(), "public")));

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true, // This allows cookies to be sent back and forth
    methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],

}));

//enable express to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), '../uploads')));

const sessionStoreOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}


const sessionStore=new MysqlStore(sessionStoreOptions);
// Session middlewares configuration
app.use(session({
    key: 'sessionId', // This will be the cookie name in browser
    secret: process.env.SESSION_SECRET,
    store: sessionStore, // Use our MySQL store
    resave: false, // Don't save session if nothing changed
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Browser JavaScript cannot access this cookie (security)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        sameSite: 'lax' // CSRF protection
    }
}));



//app.use('/Employee', EmployeeRoute);
app.use('/Product', ProductRoute);
app.use('/User', UserRoute);
app.use('/Supplier', SupplierRoute);
app.use('/Purchase',PurchaseRoute);
app.use('/Uploads',UploadsRoute);
//app.use(handleMulterError);


async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Database connection successful!');

        // Test a simple query
        const [rows] = await connection.execute('SELECT DATABASE() as current_db');
        console.log('Current database:', rows[0]);

        await connection.end();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error errno:', error.errno);
    }
}


await testDatabaseConnection();


export default app;


