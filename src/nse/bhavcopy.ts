import moment, {Moment} from 'moment';
import axios, { AxiosResponse } from 'axios';
import pgp from 'pg-promise'
import pool from "../database/pool"

import Application from "../application"




export default (app:Application) => {
    var bi = new BhavcopyImporter();
    bi.import(moment().subtract(1, "days"), false);
    // bi.import(moment("2021-04-02"), false);
    // bi.import(moment("2021-01-26"), false);
}


const db = pgp({capSQL: true})

// https://www1.nseindia.com/content/historical/DERIVATIVES/2010/MAR/fo02MAR2010bhav.csv.zip

class BhavcopyImporter{
    private fullBhavDataUrl = (dy:Moment) => "https://archives.nseindia.com/products/content/sec_bhavdata_full_" + dy.format("DDMMYYYY") + ".csv";

    constructor() {

    }


    private isTradingHoliday(dy:Moment){
        return pool
            .query('SELECT "date", "trading", "clearing" FROM holidays WHERE(date = $1) LIMIT 1 OFFSET 0;', [dy.format('YYYY-MM-DD')])
            .then( res => dy.isoWeekday() == 7 || dy.isoWeekday() == 6 || (res.rows.length > 0 && res.rows[0].trading) )
            .catch((err: Error) => {
                if (err){
                    throw err;
                }
            });
    }

    private isExisting(dy:Moment) :boolean{
        return false;
    }


    public importByDate (date:string, fill:boolean) :void{
        return this.import(moment(date), fill);
    }

    public import (dy:Moment, fill:boolean) :void{
        this.isTradingHoliday(dy)
            .then((isHoliday) => {
                if(isHoliday){
                    if (fill){
                        this.import(dy.subtract(1, 'days'), fill);
                    }
                    return;
                }
                console.log(dy.format("YYYY-MM-DD") + " is not a Holiday, pulling data..");
                axios
                    .get(this.fullBhavDataUrl(dy))
                    .then(this.parseBhavData)
                    .then(this.insertToDatabase)
                ;
            }).catch((err:Error)=>{
                console.log(err.message)
                throw err;
            });
    }

    private insertToDatabase(bhavData:Record<string, any>[]) {
        for( var row of bhavData){
            console.log(row);
            break;
        }
        console.log(bhavData[1].symbol)

        // return db.helpers.insert(bhavData, ['symbol', 'series', 'date1', 'prev_close', 'open_price', 'high_price', 'low_price', 'last_price', 'close_price', 'avg_price', 'ttl_trd_qnty', 'turnover_lacs', 'no_of_trades', 'deliv_qty', 'deliv_per'], 'public.bhavdata');

        // "INSERT INTO public.bhavdata (symbol, series, date1, prev_close, open_price, high_price, low_price, last_price, close_price, avg_price, ttl_trd_qnty, turnover_lacs, no_of_trades, deliv_qty, deliv_per) VALUES"
        // '(${symbol}, ${series}, ${date1}, ${prev_close}, ${open_price}, ${high_price}, ${low_price}, ${last_price}, ${close_price}, ${avg_price}, ${ttl_trd_qnty}, ${turnover_lacs}, ${no_of_trades}, ${deliv_qty}, ${deliv_per})' 
    }

    private parseBhavData(res:AxiosResponse) :Record<string, any>[]{
        var data = res.data.split("\n");
        var bhavData = [];
        if (data.length > 1) {
            let keys:string[] = data.shift()?.split(",")!;
            keys?.forEach((v:string, i:number) => keys[i]=v.trim())
            var row:string[] = data.shift()?.split(",")!;
            while(row){
                var rowD: Record<string, any> = new Map();
                keys.forEach( (k:string, i:number) => rowD.set(k.toLowerCase(), row[i]?.trim()) );
                bhavData.push(rowD);
                row = data.shift()?.split(",")!;
            }
        }
        return bhavData;
    }

    private parseBhavDataJSON( data:string[] ) :Map<string, any>[]{
        var bhavData = [];
        if (data.length > 1) {
            let keys:string[] = data.shift()?.split(",")!;
            keys?.forEach((v:string, i:number) => keys[i]=v.trim())
            var row:string[] = data.shift()?.split(",")!;
            while(row){
                var rowD: Map<string, any> = new Map();
                keys.forEach( (k:string, i:number) => rowD.set(k.toLowerCase(), row[i]?.trim()) );
                bhavData.push(rowD);
                row = data.shift()?.split(",")!;
            }
        }
        return bhavData;
    }
}



// (today)

// check if imported or holiday
// pull the file to data/
// parse and insert to db

// -1 go again



// check if