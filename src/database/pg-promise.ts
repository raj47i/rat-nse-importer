
const db_connection = {
    host: 'localhost',
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS
}


export default db_connection;

