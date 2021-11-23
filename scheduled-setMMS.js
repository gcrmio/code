"use strict";
var setMMS = require('./routes/setmms');
const { Pool, Client } = require('pg');

const pool = new Pool({
    host:       process.env.PG_host,
    user:       process.env.PG_user,
    password:   process.env.PG_password,  
    database:   process.env.PG_database,
    port:       process.env.PG_port,
    ssl: { rejectUnauthorized: false },
});

let qry = `SELECT app_name, status, last_run_date FROM scheduler WHERE app_name = 'app01'`
module.exports.getResult = function (req, res) {
    pool.query(qry, (err, res) => {
        console.log(res);
    })
}

//setMMS.setMMS();
//console.log('APP01 FINISHED =============================================');