import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST_NAME,
    user: process.env.DB_USER_NAME,
    password: '',
    database: process.env.DB_NAME
});

// Connect to the database
connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

export default connection;