import pool from "./database/pool"
import bhavcopyExec from "./nse/bhavcopy"

class Application{
    // private app:express;

    constructor() {
        // this.app = express();
        this.config();
        // this.routerConfig();
        this.dbConnect();
    }

    private config() {
        // this.app.use(bodyParser.urlencoded({ extended:true }));
        // this.app.use(bodyParser.json({ limit: '1mb' })); // 100kb default
    }

    private dbConnect() {
        pool.connect(function (err, client, done) {
            if (err){
                throw new Error(err.message);
            }
            console.log('Connected');
        });
    }

    public start = () => {
        bhavcopyExec(this)

        return new Promise((resolve, reject) => {

            // this.app.listen(port, () => {
            //     resolve(port);
            // }).on('error', (err: Object) => reject(err));

        });
    }

}

export default Application;