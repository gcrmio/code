/*
*/

"use strict";

//require("dotenv").config();

const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3(
    {
        accessKeyId:     process.env.AWSS3_accessKeyId,
        secretAccessKey: process.env.AWSS3_secretAccessKey,
        region:          process.env.AWSS3_region
    }
);

const { Pool, Client } = require('pg');

const pool = new Pool({
    host:       process.env.PG_host,
    user:       process.env.PG_user,
    password:   process.env.PG_password,  
    database:   process.env.PG_database,
    port:       process.env.PG_port,
    ssl: { rejectUnauthorized: false },
});

/*
pool.query('INSERT INTO mms_list VALUES( $1, $2, $3)', ['10','999','MMM'], (err, res) => {
    console.log(res); // Hello World!
    pool.end();
  });
*/

module.exports.getmsgid = function (req, res) {
    var msg='';
    let msg_id = "";
    let seq = 0;
    let set_date="";

    let qry = "select 'MMS-TW-'||to_char(current_date, 'YYYY')||'-'||lpad((count(*)+1)::text,4,'0') msg_id, count(*)+1 seq, "
    +"to_char(current_timestamp,'YYYYMMDD HH24MISS') set_date from gen_msg_id;";

    //console.log(qry);

    pool.query( qry, (err, result) => {

        if(err){
            console.log("query error:  "+err);
            res.status(404);      
        }
        console.log(result); // gen_msg_id
        console.log(result.rows[0].msg_id); // gen_msg_id

        msg_id  = result.rows[0].msg_id;
        seq     =  result.rows[0].seq;
        set_date=  result.rows[0].set_date;

        //return res.status(200).json(JSON.stringify(result.rows[0]));    
        //pool.end();
        pool.query( "insert into gen_msg_id values('"+msg_id+"',"+seq+",'"+set_date+"');", (err, result) => {
            //pool.end();    
        });
    
        return res.status(200).json(JSON.stringify(result.rows[0])); 
    });

    res.status(200);          
}


module.exports.uploadwork = function (req, res) {


    console.log("getContentItemList ========================================================================");
    console.log(req.body);
    console.log("===========================================================================================");
    //console.log(JSON.stringify(req.body));

    var tmp = req.body;
    console.log(tmp2);    

/*
    var msg='';
    pool.query( "select 'MMS-TW-'||to_char(current_date, 'YYYY')||'-'||lpad(count(*)::text,4,'0') msg_id, count(*) seq, "
               +"to_char(current_timestamp,'YYYYMMDD HH24MISS') set_date from gen_msg_id;", (err, result) => {
        console.log(result.rows); // gen_msg_id
        console.log(result.rows[0].msg_id); // gen_msg_id

        //for (msg_id in result.rows){
            console.log("Sql Return "+JSON.stringify(result.rows[0]));
            
            msg=JSON.stringify(result.rows[0]);

            console.log("msg = " + msg);
        //}
        return res.status(200).json(JSON.stringify(result.rows[0]));    
        //pool.end();
        
      });
      //res.body=msg;
*/      
      return res.status(200); //.json(msg.msg_id);  
}