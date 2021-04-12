import { Pool } from 'pg';
import 'dotenv/config';

export default new Pool ({
    max: 10,
    connectionString: 'postgres://'+process.env.DB_USER+':'+process.env.DB_PASS+'@localhost:5432/'+process.env.DB_NAME,
    idleTimeoutMillis: 30000
});