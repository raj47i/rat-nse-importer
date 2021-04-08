import { Pool } from 'pg';

export default new Pool ({
    max: 10,
    connectionString: 'postgres://raj@127.0.0.1:5432/nse_data',
    idleTimeoutMillis: 30000
});