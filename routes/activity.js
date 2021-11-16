'use strict';
var util = require('util');

require("dotenv").config();

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
const pool = new Pool({
    host: 'ec2-107-23-143-66.compute-1.amazonaws.com',
    user: 'scmxwnfzuxmsym',
    password: '000ab390bc3f495b4b530f94e20dd4005028c04b383a04f94e0c397bdf804840',  
    database: 'd6302t8u9u4kpr',
    port: 5432,
    ssl: { rejectUnauthorized: false },
});
*/

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var http = require('https');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path, 
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {

    //console.log("Edited: "+req.body.inArguments[0]);      
    console.log( "Edit body =======================================================================================" );
    console.log( req.body );
    console.log( "Edit ============================================================================================" );

    // Data from the req and put it in an array accessible to the main app.
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    //console.log("Saved: "+req.body.inArguments[0]);      
    console.log( "Save body =======================================================================================" );
    console.log( req.body );
    console.log( "Save ============================================================================================" );

    // Data from the req and put it in an array accessible to the main app.
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {


    console.log("Execute");	

     JWT(req.body, process.env.jwtSecret, (err, decoded) => {

         // verification error -> unauthorized request
         if (err) {
             console.error(err);
             return res.status(401).end();
         }

         if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            
             // decoded in arguments
             var decodedArgs = decoded.inArguments[0];
             console.log("Executed: ----------------------------------------------------------------------------");
             console.log("Executed: ",decodedArgs);
             console.log("Executed: ----------------------------------------------------------------------------");

            //load to table
            // 01. check msg_id existence
            // 02. None --> save table: message, content, target

            let id_msg_id               = decodedArgs.id_msg_id;
            let id_display_subject      = decodedArgs.id_display_subject;
            let id_display_body         = decodedArgs.id_display_body;
            let id_display_cts          = decodedArgs.id_display_cts;
            let id_display_ctsr         = decodedArgs.id_display_ctsr;
            let id_display_ctsr_srctype = decodedArgs.id_display_ctsr_srctype;
            let id_display_ctsr_size    = decodedArgs.id_display_ctsr_size;
            let id_display_ctsr_width   = decodedArgs.id_display_ctsr_width;
            let id_display_ctsr_height  = decodedArgs.id_display_ctsr_height;
            let id_reg_date             = decodedArgs.id_reg_date;
            let id_reg_time             = decodedArgs.id_reg_time;
            let id_msg_desc             = decodedArgs.id_msg_desc;
            let id_msg_admin            = decodedArgs.id_msg_admin;
            let id_msg_charge           = decodedArgs.id_msg_charge;
            let id_send_date            = decodedArgs.id_send_date;
            let id_send_time            = decodedArgs.id_send_time;
            let id_check_coupon         = decodedArgs.id_check_coupon;
            let id_check_individual     = decodedArgs.id_check_individual;
            let id_load_content         = decodedArgs.id_load_content;
            let id_load_content_type    = decodedArgs.id_load_content_type;
            let de_id                   = decodedArgs.de_id;

            let cust_id                 = decodedArgs.cust_id;
            let cust_id_code            = decodedArgs.cust_id_code;
            let cust_name               = decodedArgs.cust_name;
            let phone_no                = decodedArgs.phone_no;
            let coupon_id               = decodedArgs.coupon_id;

            let qry = "insert into msg_working values('"+id_msg_id+"','"+id_display_subject+"','"+id_display_body+"','"
            +id_display_cts+"','"+id_display_ctsr+"','"+id_display_ctsr_srctype+"','"+id_display_ctsr_size+"','"
            +id_display_ctsr_width+"','"+id_display_ctsr_height+"','"+id_reg_date+"','"+id_reg_time+"','"
            +id_msg_desc+"','"+id_msg_admin+"','"+id_msg_charge+"','"+id_send_date+"','"+id_send_time+"','"+id_check_coupon+"','"
            +id_check_individual+"','"+id_load_content+"','"+id_load_content_type+"','"+de_id+"','"+cust_id+"','"+cust_id_code+"','"
            +cust_name+"','"+phone_no+"','"+coupon_id+"',to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),'N');";

            pool.query( qry, (err, result) => {

                if(err){
                    console.log("query error:  "+err);
                    //res.status(404);  do not return error for continuity
                }
                else{
                    console.log("Insert: "+id_msg_id+" "+cust_id);
                }

            });
         
             //logData(req);
             res.send(200, 'Execute');
         } else {
             console.error('inArguments invalid.');
             return res.status(400).end();
         }
     });


/*

    console.log("5 -- For Execute");	
    console.log("4");	
    console.log("3");	
    console.log("2");	
    console.log("1");	
    //console.log("Executed: "+req.body.inArguments[0]);

    res.send(200, 'Publish');
    
    var requestBody = req.body.inArguments[0];

    const accountSid = requestBody.accountSid;
    const authToken = requestBody.authToken;
    const to = requestBody.to;
    const from = requestBody.messagingService;
    const body = requestBody.body;;

    const client = require('twilio')(accountSid, authToken); 
     
    client.messages 
          .create({ 
             body: body,
             messagingService: messagingService,
             to: to
           }) 
          .then(message => console.log(message.sid)) 
          .done();



    // FOR TESTING
    logData(req);
    res.send(200, 'Publish');
*/
    // Used to decode JWT
    // JWT(req.body, process.env.jwtSecret, (err, decoded) => {

    //     // verification error -> unauthorized request
    //     if (err) {
    //         console.error(err);
    //         return res.status(401).end();
    //     }

    //     if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            
    //         // decoded in arguments
    //         var decodedArgs = decoded.inArguments[0];
            
    //         logData(req);
    //         res.send(200, 'Execute');
    //     } else {
    //         console.error('inArguments invalid.');
    //         return res.status(400).end();
    //     }
    // });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {

    //console.log("Published: "+req.body.inArguments[0]);        
    console.log( "publish body =======================================================================================" );
    console.log( req.body );
    console.log( "publish ============================================================================================" );

    //Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
     res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {

    //console.log("Validated: "+req.body.inArguments[0]);       
    console.log( "validate body =======================================================================================" );
    console.log( req.body );
    console.log( "validate ============================================================================================" );
    
    //Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
    res.send(200, 'Validate');
};
