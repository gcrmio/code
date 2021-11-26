'use strict';
var util = require('util');

//require("dotenv").config();
console.log(process.env.PG_host);

const { Pool, Client } = require('pg');

const pool = new Pool({
    host:       process.env.PG_host,
    user:       process.env.PG_user,
    password:   process.env.PG_password,  
    database:   process.env.PG_database,
    port:       process.env.PG_port,
    ssl: { rejectUnauthorized: false },
});

const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3(
    {
        accessKeyId:     process.env.AWSS3_accessKeyId,
        secretAccessKey: process.env.AWSS3_secretAccessKey,
        region:          process.env.AWSS3_region
    }
);

const puppeteer = require ('puppeteer');
const { createCipheriv } = require('crypto');

// save informations to PG tables


let qry1 =  " insert into message "
         +  " select id_msg_id msg_id, "
         +  "        max(id_msg_desc) msg_desc, "
         +  "        max(id_msg_admin) admin_ofc, "
         +  "        max(id_msg_charge) charger, "
         +  "        max(id_check_coupon) use_coupon , "
         +  "        max(id_check_individual) use_individual, "
         +  "        max(de_id) de_id, "
         +  "        max(id_send_date||' '||id_send_time||':00') send_date, "
         +  "        max(id_reg_date||' '||id_reg_time||':00') reg_date, "
         +  "        to_char(now(), 'YYYY-MM-DD HH24:MI:SS') set_date"
         +  "  from msg_working "
         +  " where proc_yn='N' "
         +  " group by id_msg_id;";

let qry2 = "update msg_working set proc_yn='Y' where proc_yn='N';";


let qry3 =  `INSERT INTO targets
             SELECT id_msg_id, cust_id, cust_id_code, cust_name, phone_no, coupon_id, to_char(now(), 'YYYY-MM-DD HH24:MI:SS') set_date, 'N'
             FROM msg_working
             WHERE proc_yn='N';`;


let qry4 =  `INSERT INTO contents	
                    SELECT id_msg_id 	msg_id, 
                    max(id_display_subject) 	msg_subject, 
                    max(id_display_body) 	msg_body_text, 
                    max(id_display_ctsr)     msg_body_content, 
                    max(id_msg_type) msg_type, 
                    max(id_load_content_type) content_src, 
                    length(case when id_display_subject = '' then NULL else max(id_display_subject) end) msg_subject_length, 
                    length(case when id_display_body = '' then NULL else max(id_display_body) end) msg_body_length, 
                    max(case when id_display_ctsr_size = '' then NULL else to_number(id_display_ctsr_size,'999999999') end) msg_content_size, 
                    to_char(now(), 'YYYY-MM-DD HH24:MI:SS') set_date
                    FROM msg_working 
                    WHERE proc_yn='N'
                    GROUP BY id_msg_id, id_display_subject, id_display_body, id_display_ctsr_size`;      

let qry5 =  `INSERT INTO transmit
                SELECT a.cust_id, a.phone_no, a.msg_id,
                replace(REPLACE (b.msg_subject,   'cust_name', cust_name), 'coupon_id', a.coupon_id) msg_subject_adj,
                replace(REPLACE (b.msg_body_text, 'cust_name', cust_name), 'coupon_id', a.coupon_id) msg_body_text_adj,
                replace(REPLACE (b.msg_body_content, 'cust_name', cust_name), 'coupon_id', a.coupon_id) msg_body_image_adj,
                '' msg_body_image_adj_file,
                b.msg_type,
                c.send_date plan_date,
                '' send_date,
                '' success_yn,
                to_char(now(), 'YYYY-MM-DD HH24:MI:SS') set_date,
                '' batch_id,
                '' fail_reason, 
                c.admin_ofc msg_admin,
                'N' proc_yn
                from targets a, contents b, message c
                where a.proc_yn='N'
                and a.msg_id=b.msg_id
                and b.msg_id=c.msg_id;`;
      
let qry6 = "update targets set proc_yn='Y' where proc_yn='N';";

//(async () => {
//    try{
module.exports.setMMS = function (req, res) {

        pool
            .query(qry1)
            .then(res => {
                console.log('111111');
                pool
                    .query(qry3)
                    .then(res => {  
                        console.log('33333');
                        pool
                            .query(qry4)
                            .then(res => {  
                                console.log('44444');
                                pool
                                    .query(qry2)
                                    .then(res => {  
                                        console.log('22222');
                                        pool
                                            .query(qry5)
                                            .then(res => {  
                                                console.log('55555');
                                                pool
                                                    .query(qry6)
                                                    .then(res => {  
                                                        console.log('66666');
                                                        genIndiImgFile();                                                        
                                                    }) 
                                                    .catch(err => console.error('Error executing query', err.stack)) 
                                            }) 
                                            .catch(err => console.error('Error executing query', err.stack))         
                                    }) 
                                    .catch(err => console.error('Error executing query', err.stack))            
                            }) 
                            .catch(err => console.error('Error executing query', err.stack))        
                    }) 
                    .catch(err => console.error('Error executing query', err.stack))        
            }) 
            .catch(err => console.error('Error executing query', err.stack));
//    }
//    catch(e){
//        console.log(e.stack);
//    }    
//})();
}
    
function genIndiImgFile(){

    //read data
    let qry = `select msg_id, phone_no, msg_body_image_adj cts from transmit where msg_body_image_adj_file='' AND msg_type = 'MMS';`;


    pool.query(qry)
    .then(result => {
        const rows = result.rows;
        var length = rows.length;
        switch(length){
            case 0:
                console.log('SMS-- skipping genIndiImgFile()');
                break;
            default:
                console.log("data: size= "+rows.length + "  msg_id= " +rows[0].msg_id);

            (async () => {
                try{
                    for await (const row of rows) {
                        let fnm = row.msg_id + '-' + row.phone_no + '.jpg';
                        console.log("file in process : fnm "+fnm+" msg_id "+row.msg_id);
                        
                        const output = await cvtHtmlToImage(row.cts);
                        let buffer = output[0];
                        let width  = output[1];
                        let height = output[2];

                        let path = "APPS/MMSTW/"+row.msg_id+"/msg";
                        await saveToS3(buffer,path,fnm);

                        pool.query("update transmit set msg_body_image_adj_file='"+fnm+"' where msg_id='"+ row.msg_id+"' and phone_no='"+row.phone_no+"'");
                    }
                }
                catch(e){
                    console.log(e.stack);
                }    
            })();
        }
     })
    .catch(err => console.error('Error executing query', err.stack));

}    



async function saveToS3(binaryFile,path,filename){

    return new Promise((resolve, reject) => {
        
        (async () => {

            let ctsType = getContentTypeByFile(filename);
            console.log("Upload Content Type = "+ctsType);
        
            var params = {
                Bucket:process.env.AWSS3_bucket,
                Key: path+'/'+filename,
                //ACL:'public-read',
                Body:binaryFile,
                //ContentEncoding: 'base64',
                ContentType: ctsType // image/jpg, text/html, application/json, 
            };
            //console.log(params);
        
            s3.putObject(params, function (perr, pres) {
                if (perr) {
                    console.log("Error uploading data: "+ perr);
                } 
                else {

                    let tgt = path+"/"+filename;
                    console.log("saved: "+tgt);
                    resolve(tgt);        
                }
            });

        })();
    });
}

// Set Individual MMS tables

function loadS3(base64Encodedfile,filename,fpath){

    var buff = base64Encodedfile; //Buffer.from(base64Encodedfile, 'base64');

    console.log("Buffer Size: "+Buffer.byteLength(buff));
    console.log('Saved to APPS/MMSTW/'+fpath+'/msg/'+filename);

    var params = {
        Bucket:process.env.AWSS3_bucket,
        Key: 'APPS/MMSTW/'+fpath+'/msg/'+filename,
        //ACL:'public-read',
        Body:buff,
        //ContentEncoding: 'base64',
        ContentType:'image/jpg'
    };
    //console.log(params);

    s3.putObject(params, function (perr, pres) {
        if (perr) {
            console.log("Error uploading data: ", perr);
        } else {
            console.log("Successfully uploaded");
        }
    });

    return;
}



function cvtHtmlToImage(cts){
    //console.log("Convert html to image file: cvtHtmlToImage");

    return new Promise((resolve, reject) => {
        
        (async () => {
            const browser = await puppeteer.launch({
                headless: true, // debug only
                args: ['--no-sandbox']
            })
    
            const page = await browser.newPage()

            const html = '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><body>'
            +'<div id="IDX-MAIN" style="display: table" >'+cts+'</div>'
            +'</body></html>';

            await page.setContent(html);


            await page.waitForTimeout(1000);

            await page.emulateMediaType('screen');


            const bodyHandle = await page.$('body');
            const boundingBox = await bodyHandle.boundingBox();
            const theight = boundingBox.height;
            const twidth  = boundingBox.width;
            //console.log("height: " + theight+"  width: " + twidth);

            const bodyHandle1 = await page.$('#IDX-MAIN');
            const boundingBox1 = await bodyHandle1.boundingBox();
            const theight1 = boundingBox1.height;
            const twidth1  = boundingBox1.width;
            //console.log("height: " + theight1+"  width: " + twidth1);

            const bodyHandle2 = await page.$('#IDX-SUB');
            const boundingBox2 = await bodyHandle2.boundingBox();
            const theight2 = boundingBox2.height;
            const twidth2  = boundingBox2.width;
            //console.log("height: " + theight2+"  width: " + twidth2);

            let ratio = theight/twidth;

            let tgtHeight = parseInt(ratio*640);

            await page.setViewport({width: twidth1, height: theight1});
    

            //let cType = getContentTypeByFile(cts);

            console.log(" Final height: " + theight1+"  Final width: " + twidth1);

            const buffer = await page.screenshot({
                //fullPage: true,
                clip: { x:8, y:8, width:twidth1, height:theight1},
                type: 'jpeg'
            })

            await page.close();
            await browser.close();

            let width  = twidth1;
            let height = theight1;

            resolve([buffer, width, height]);            
        })();
      })
}


function getContentTypeByFile(fileName) {
    var rc = 'application/octet-stream';
    var fn = fileName.toLowerCase();

    if (fn.indexOf('.html') >= 0) rc = 'text/html';
    else if (fn.indexOf('.css') >= 0) rc = 'text/css';
    else if (fn.indexOf('.json') >= 0) rc = 'application/json';
    else if (fn.indexOf('.js') >= 0) rc = 'application/x-javascript';
    else if (fn.indexOf('.png') >= 0) rc = 'image/png';
    else if (fn.indexOf('.jpg') >= 0) rc = 'image/jpg';

    return rc;
  }
  