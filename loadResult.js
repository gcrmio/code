"use strict";
var request = require('request');
const {Pool, Client} = require('pg');
const pool = new Pool({
    host: process.env.PG_host,
    user: process.env.PG_user,
    password: process.env.PG_password,
    database: process.env.PG_database,
    port: process.env.PG_port,
    ssl: {
      rejectUnauthorized: false
    }
});

module.exports.checkapi = function(req, res){
    var payload = {
        client_id: process.env.MC_client_id,
        client_secret: process.env.MC_client_secret,
        grant_type: "client_credentials",
        account_id: process.env.MC_account_id
    };
    var clientServerOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.auth.marketingcloudapis.com/v2/token',
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    function getToken(){
        return new Promise(function(resolve, reject){
            request(clientServerOptions, function(error, response){
                resolve(response);
            });
        });
    };

    getToken().then(function(response){
        var tmp = JSON.parse(response.body);
        console.log("TOKEN==================================================");
        console.log(tmp.access_token);
        console.log("=======================================================");

        updateDE(tmp.access_token);
    });
    res.status(200).send('CheckAPI Response');
};


var payload2 = [];
function updateDE(access_token, phone_no){

    //Get send complete transmit records
    var selectFrom = function() {
        return new Promise(function(resolve, reject){
            pool.query(`SELECT transmit.msg_id, transmit.cust_id cust_id, transmit.success_yn success_yn, transmit.send_date send_date, message.de_id de_id 
                        FROM transmit
                        LEFT JOIN message ON transmit.msg_id = message.msg_id WHERE transmit.proc_yn = 'N'`, function(err, result) {
                if(err)
                    return reject(err);
                resolve(result.rows);
            })
        });
    }
    
    selectFrom()
    .then(function(result){
        console.log('result');
        console.log(result);
        // console.log('result length= '+result.length);
        for(var i = 0; i < result.length; i++){
            var pKey = {};
            var pValue = {};
            pKey.cust_id = result[i]['cust_id'];
            pValue.send_status_yn = result[i]['success_yn'];
            pValue.send_date = result[i]['send_date'];
            payload2.push({keys:pKey, values:pValue});
            var de_id = result[i]['de_id'];
        }
        console.log('PAYLOAD IS HERE');
        console.log(payload2);
        var DEputOptions = {
            //uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/hub/v1/dataevents/9fc86fa4-4c40-ec11-ba40-f40343ce83b8/rowset',
            uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/hub/v1/dataevents/'+de_id+'/rowset',
            body: JSON.stringify(payload2),
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token,
            },
            client_id: process.env.MC_client_id,
            client_secret: process.env.MC_client_secret,
            grant_type: "client_credentials",
            account_id: process.env.MC_account_id
        }
    
        request(DEputOptions, function(error, response){
            console.log(error, response.body);
            const sql = `UPDATE transmit SET proc_yn = 'Y' WHERE proc_yn = 'N'`
            console.log(sql);
    
            pool.query(sql, (err, res) => {
            if(err){
            console.log(err.stack);
            } else {
            console.log("PG Transmit to MC DE complete!");
            }
            })
        })
    }).catch(function(err){
        console.log(err);   
    });

    // var payload2 = [
        // {
            // "keys":{
                    // "cust_id": "TW702456915"
                    // },
            // "values":{
                    // "send_status_yn": "Y"
                    // }
        // },
        // {
            // "keys": {
                    // "cust_id": "TW702456917"
                    // },
            // "values":{
                    // "send_status_yn": "Y"
                    // }
        // }
    // ]
    

}