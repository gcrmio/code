"use strict";
var pg = require('pg');
var urlencode = require('urlencode');
var request = require('request');
const {Pool, Client} = require('pg');
const AWS = require('aws-sdk');

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

const s3 = new AWS.S3(
  {
      accessKeyId:     process.env.AWSS3_accessKeyId,
      secretAccessKey: process.env.AWSS3_secretAccessKey,
      region:          process.env.AWSS3_region
  }
);

module.exports.dbSelect = function(){
  const sql = `SELECT cust_id, phone_no, msg_id, msg_subject_adj, msg_body_text_adj, msg_body_image_adj_file, plan_date, send_date, success_yn FROM transmit WHERE success_yn != 'S'`

  pool.query(sql, (err, res) => {
    if(err){
      console.log(err.stack);
    } else {
      //console.log(res.rows);
      for(const row of res.rows){
        console.log('01===============================================');
        var cust_id = row.cust_id;
        console.log('cust_id= '+cust_id);
        var dest = row.phone_no;
        console.log('dest= '+dest);
        var msg_id = row.msg_id;
        console.log('msg_id= '+msg_id);
        var subject = row.msg_subject_adj;
        console.log('subject= '+subject);
        var msg = row.msg_body_text_adj;
        console.log('msg= '+msg);
        var time = row.plan_date;
        time = time.replace(/-|:| /g, '');
        console.log('time= '+time);
        var msg_body_image_adj_file = row.msg_body_image_adj_file;
        var msg_type = (msg_body_image_adj_file.length == 0)? 'SMS': 'MMS';
        console.log('msg_type= '+msg_type);
        console.log('02===============================================');

        switch(msg_type){
          case 'MMS':
            var bucketParams = {
              Bucket: process.env.AWSS3_bucket, Key: 'APPS/TEST/MMSTW/'+msg_id+'/msg/'+msg_id+'-'+dest+'.jpg'
            }
            s3.getObject(bucketParams, function(err, data){
              if(err){
                console.log("Error", err);
              } else {
                var attachment = Buffer.from(data.Body, 'utf8').toString('base64');
                sendMMS(subject, msg, dest, time, attachment);
                console.log('SEND MMS TO: '+cust_id);
              }
            });
            break;
          case 'SMS':
            console.log('03'+cust_id+'===============================================');
            sendSMS(subject, msg, dest,time);
            console.log('04'+cust_id+'===============================================');
            break;
          default:
            sendSMS(subject, msg, dest,time);
            console.log('SEND SMS TO: '+cust_id);
            break;
        }
      }
    }
  })

function sendMMS(subject, msg, dest, time, attachment){
    const uid = process.env.Euid;
    const password = process.env.Epassword;
    const type = 'jpeg';
    console.log(dest);
    console.log('dest==================');
    var options = {
      'method': 'GET',
      'url': 'https://oms.every8d.com/API21/HTTP/MMS/sendMMS.ashx',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'UID': process.env.Euid,
        'PWD': process.env.Epassword,
        'SB': subject,
        'MSG': msg,
        'DEST': dest,
        'ST': time,
        'TYPE': type,
        'ATTACHMENT': attachment
      }
    };
    // request(options, function (error, response) {
      // if (error) throw new Error(error);
      // var tmp = response.body;
      // var result = tmp.split(',');
      // var msg_batch_id = result[4];
      // updateBatchId(dest, msg_batch_id);
    // });
}

function sendSMS(subject, msg, dest, time){
  const uid = process.env.Euid;
  const password = process.env.Epassword;
  const type = 'jpeg';
  console.log('SEND SMS===============================================');
  console.log('msg= '+msg);
  console.log("");
  console.log('dest= '+dest);
  console.log("");
  console.log('time= '+time);
  console.log('SEND SMS DONE==========================================');
  var options = {
    'method': 'GET',
    'url': 'https://oms.every8d.com/API21/HTTP/sendSMS.ashx',
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'UID': process.env.Euid,
      'PWD': process.env.Epassword,
      'SB': subject,
      'MSG': msg,
      'DEST': dest,
      'ST': time
    }
  };
  // request(options, function (error, response) {
    // if (error) throw new Error(error);
    // var tmp = response.body;
    // var result = tmp.split(',');
    // var msg_batch_id = result[4];
    // updateBatchId(dest, msg_batch_id);
  // });
}

function updateBatchId(dest, msg_batch_id){
    var phone_no = dest;
    var batch_id = msg_batch_id
    console.log('batch_id= '+batch_id);
    
    const sql = `UPDATE transmit SET phone_no = t.phone_no, batch_id = t.batch_id
                 FROM 
                    (VALUES
                    ('`+phone_no+`', '`+batch_id+`')
                )
                AS t(phone_no, batch_id)
                WHERE transmit.phone_no = t.phone_no`
    console.log(sql);

    pool.query(sql, (err, res) => {
        if(err){
          console.log(err.stack);
        } else {
          console.log("Batch Id Update Completed");
        }
      })
}
}