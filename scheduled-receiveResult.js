"use strict";
var receiveResult = require('./receiveResult');
const { Pool, Client } = require('pg');

const pool = new Pool({
    host:       process.env.PG_host,
    user:       process.env.PG_user,
    password:   process.env.PG_password,  
    database:   process.env.PG_database,
    port:       process.env.PG_port,
    ssl: { rejectUnauthorized: false },
});

let qry1 = `SELECT app_name, status, last_run_date FROM scheduler WHERE app_name = 'app03'`;
let qry2 = `UPDATE scheduler SET status = 'OFF', last_run_date = to_char(now() at time zone 'KST', 'YYYY-MM-DD HH24:MI:SS') WHERE app_name = 'app03'`;
let qry3 = `UPDATE scheduler SET status = 'ON', last_run_date = to_char(now() at time zone 'KST', 'YYYY-MM-DD HH24:MI:SS') WHERE app_name = 'app03'`;

//module.exports.getResult = function (req, res) {    
    pool
	.query(qry1)
	.then(res => {
		console.log('11111');
		for(const row of res.rows){
            var status = row.status;
          
            switch(status){
                case('ON'):
                executeApp03();            
                break;
                case('OFF'):
                    console.log('App03 is still running');
                    break;
                default:
                    console.log("");
            }
        }
	}) 
	.catch(err => console.error('Error executing query', err.stack));
// }

function executeApp03(){
    pool
        .query(qry2)
        .then(res => {  
            console.log('22222');
            receiveResult.listSelect();
            pool
                .query(qry3)
                .then(res => {  
                    console.log('APP03 FINISHED =============================================');                                
                }) 
                .catch(err => console.error('Error executing query', err.stack))        
        }) 
        .catch(err => console.error('Error executing query', err.stack))
}