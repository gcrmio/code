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
  const sql = `SELECT cust_id, phone_no, msg_id, msg_subject_adj, msg_body_text_adj, msg_body_image_adj_file, plan_date, send_date, success_yn, msg_type, msg_admin FROM transmit WHERE success_yn = ''`

  pool.query(sql, (err, res) => {
    if(err){
      console.log(err.stack);
    } else {
      //console.log(res.rows);
      for(const row of res.rows){
        
        var cust_id = row.cust_id;
        var dest = row.phone_no;
        var msg_id = row.msg_id;
        var subject = row.msg_subject_adj;
        var msg = row.msg_body_text_adj;
        var time = row.plan_date;
        time = time.replace(/-|:| /g, '');
        var msg_body_image_adj_file = row.msg_body_image_adj_file;
        var msg_type = row.msg_type;
        var msg_admin = row.msg_admin;
        
        switch(msg_type){
          case 'MMS':
            var bucketParams = {
              Bucket: process.env.AWSS3_bucket, Key: 'APPS/MMSTW/'+msg_id+'/msg/'+msg_id+'-'+dest+'.jpg'
            }
            MMS(subject, msg, dest, time, bucketParams, msg_id, cust_id, msg_admin);
            break;
          case 'SMS':
            sendSMS(subject, msg, dest, time, msg_id, cust_id, msg_admin);
            break;
          default:
            sendSMS(subject, msg, dest, time, msg_id, cust_id, msg_admin);
        } 
      }
    }
  })

function MMS(subject, msg, dest, time, bucketParams, msg_id, cust_id, msg_admin){
  s3.getObject(bucketParams, function(err, data){
    //console.log('Key: '+bucketParams.Key);
    // console.log("");
    if(err){
      console.log("Error", err);
    } else {
      var key = bucketParams.Key;
      var attachment = Buffer.from(data.Body, 'utf8').toString('base64');
      sendMMS(subject, msg, dest, time, attachment, msg_id, cust_id, key, msg_admin);
    }
  });  
}

function sendMMS(subject, msg, dest, time, attachment, msg_id, cust_id, key, msg_admin){
    const uid = process.env.Euid;
    const password = process.env.Epassword;
    const type = 'jpeg';
    switch(msg_admin){
      case('LNG'):
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
      console.log("MMS FUNCTION CALL");
      console.log('key= '+key);
      console.log(msg_admin+'-'+msg_id+': '+cust_id+' MMS DONE =================================');
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var tmp = response.body;
        console.log(tmp);
        var result = tmp.split(',');
        var msg_batch_id = result[4];
        updateBatchId(dest, msg_batch_id, msg_id);
      });
      break;
      default:
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
        console.log("MMS FUNCTION CALL");
        console.log('key= '+key);
        console.log(msg_admin+'-'+msg_id+': '+cust_id+' MMS DONE =================================');
        request(options, function (error, response) {
          if (error) throw new Error(error);
          var tmp = response.body;
          console.log(tmp);
          var result = tmp.split(',');
          var msg_batch_id = result[4];
          updateBatchId(dest, msg_batch_id, msg_id);
        });
    }
}

function sendSMS(subject, msg, dest, time, msg_id, cust_id, msg_admin){
  const uid = process.env.Euid;
  const password = process.env.Epassword;
  switch(msg_admin){
    case('LNG'):
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
      console.log(msg_admin+'-'+msg_id+': '+cust_id+' SMS DONE =================================');
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var tmp = response.body;
        console.log(tmp);
        var result = tmp.split(',');
        var msg_batch_id = result[4];
        updateBatchId(dest, msg_batch_id, msg_id);
      });
      break;
    default:
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
      console.log(msg_admin+'-'+msg_id+': '+cust_id+' SMS DONE =================================');
      request(options, function (error, response) {
        if (error) throw new Error(error);
        var tmp = response.body;
        console.log(tmp);
        var result = tmp.split(',');
        var msg_batch_id = result[4];
        updateBatchId(dest, msg_batch_id, msg_id);
      });
  }
}

function updateBatchId(dest, msg_batch_id, msg_id){
    var phone_no = dest;
    var batch_id = msg_batch_id;
    var msg_id = msg_id;
    console.log('batch_id= '+batch_id);
    console.log('msg_id= '+msg_id);
    const sql = `UPDATE transmit SET phone_no = t.phone_no, batch_id = t.batch_id, success_yn = t.success_yn, msg_id = t.msg_id
                 FROM 
                    (VALUES
                    ('`+phone_no+`', '`+batch_id+`', 'P', '`+msg_id+`')
                )
                AS t(phone_no, batch_id, success_yn, msg_id)
                WHERE transmit.phone_no = t.phone_no AND transmit.msg_id = t.msg_id`
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