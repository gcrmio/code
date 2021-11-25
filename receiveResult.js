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

module.exports.listSelect = function(req, res){
const sql = `SELECT msg_id, msg_subject_adj, msg_type, batch_id FROM transmit WHERE success_yn != 'S'`

  pool.query(sql, (err, res) => {
    if(err){
      console.log(err.stack);
    } else {
      //console.log(res.rows);
      for(const row of res.rows){
        
        var msg_id = row.msg_id;
        var msg_type = row.msg_type;
        var batch_id = row.batch_id;

        switch(msg_type){
          case 'MMS':            
            resultMMS(batch_id, msg_id);
            break;
          case 'SMS':
            resultSMS(batch_id, msg_id);
            break;
          default:
            resultSMS(batch_id, msg_id);
        } 
      }
    }
  })

  function resultMMS(batch_id, msg_id){
    const url = 'https://oms.every8d.com/API21/HTTP/MMS/getDeliveryStatus.ashx';
    const uid = process.env.Euid;
    const password = process.env.Epassword;

    var geturl = url+'?UID='+uid+'&PWD='+password+'&BID='+batch_id+'&PNO=';
    console.log(geturl);
    request.get({
        url: geturl
    }, function(error, response, html){
        if(error){
            console.log(error);
        }
        console.log('Received Server Data!');
        var tmp = response.body;
        var result = tmp.replace(/\r?\n|\r/g, `\t`).split(`\t`);
        // var sms_count = result[0];
        // console.log("sms_count= "+sms_count);
        // var sms_name = result[1];
        // console.log("sms_name= "+sms_name);
        var sms_mobile = result[2];
        var sms_send_time = result[3];
        // var sms_cost = result[4];
        // console.log("sms_cost= "+sms_cost);
        var sms_status = result[5];
        updateTransmit(sms_mobile, sms_send_time, sms_status, msg_id);
    })    
}
}

function resultSMS(batch_id, msg_id){
    const url = 'https://oms.every8d.com/API21/HTTP/getDeliveryStatus.ashx';
    const uid = process.env.Euid;
    const password = process.env.Epassword;

    var geturl = url+'?UID='+uid+'&PWD='+password+'&BID='+batch_id+'&PNO=';
    console.log(geturl);
    request.get({
        url: geturl
    }, function(error, response, html){
        if(error){
            console.log(error);
        }
        console.log('Received Server Data!');
        var tmp = response.body;
        var result = tmp.replace(/\r?\n|\r/g, `\t`).split(`\t`);
        // var sms_count = result[0];
        // console.log("sms_count= "+sms_count);
        // var sms_name = result[1];
        // console.log("sms_name= "+sms_name);
        var sms_mobile = result[2];
        var sms_send_time = result[3];
        // var sms_cost = result[4];
        // console.log("sms_cost= "+sms_cost);
        var sms_status = result[5];
        updateTransmit(sms_mobile, sms_send_time, sms_status, msg_id);
    })    
}

function updateTransmit(sms_mobile, sms_send_time, sms_status, msg_id){
    console.log('sms_mobile= '+sms_mobile);
    var phone_no = sms_mobile;
    //var phone_no = sms_mobile.startsWith('+')? sms_mobile:'+'+sms_mobile;
    //console.log('phone_no= '+phone_no);
    var send_date = sms_send_time;
    // var success_yn = sms_status="100"? "S":"F";
    var msg_id = msg_id;
    var success_yn = '';
    var fail_reason = '';
    
    switch(sms_status){
        case '100':
            success_yn = 'S';
            break;
        case '-1':
            success_yn = 'F';
            fail_reason = '[-1] parameter error'
            break;
        case '-2':
            success_yn = 'F';
            fail_reason = '[-2] account or password error';
            break;
        case '-3':
            success_yn = 'F';
            fail_reason = '[-3] Invalid mobile number';
            break;
        case '-4':
            success_yn = 'F';
            fail_reason = '[-4] DT format error or send time has exceeded more than 24 horus';
            break;
        case '-5':
            success_yn = 'F';
            fail_reason = '[-5] Short message length on limit error';
            break;
        case '-6':
            success_yn = 'F';
            fail_reason = '[-6] DT format error';
            break;
        case '101':
            success_yn = 'F';
            fail_reason = '[101] Delivery failure due to mobile terminal factors';
            break;
        case '102':
            success_yn = 'F';
            fail_reason = '[102] Delivery failure due to telecommunications terminal factors';
            break;
        case '103':
            success_yn = 'F';
            fail_reason = '[103] This mobile phone number does not exist.';
            break;
        case '104':
            success_yn = 'F';
            fail_reason = '[104] Delivery failure due to telecommunications terminal factors';
            break;
        case '105':
            success_yn = 'F';
            fail_reason = '[105] Delivery failure due to telecommunications terminal factors';
            break;
        case '106':
            success_yn = 'F';
            fail_reason = '[106] Delivery fail due to telecommunications terminal factors';
            break;
        case '107':
            success_yn = 'F';
            fail_reason = '[107] Received after deadline';
            break;
        case '300':
            success_yn = 'F';
            fail_reason = '[300] Reservation SMS';
            break;
        case '303':
            success_yn = 'F';
            fail_reason = '[303] Canceled';
            break;
        case '500':
            success_yn = 'F';
            fail_reason = '[500] International message delivery failed because the configuration is in closed position.';
            break;
        default:
            console.log('[0] Sent');
            success_yn = 'S';
    }

    const sql = `UPDATE transmit SET phone_no = t.phone_no, send_date = t.send_date, success_yn = t.success_yn, fail_reason = t.fail_reason 
                 FROM 
                    (VALUES
                    ('`+phone_no+`', '`+send_date+`', '`+success_yn+`', '`+fail_reason+ `')
                )
                AS t(phone_no, send_date, success_yn, fail_reason)
                WHERE transmit.phone_no = t.phone_no`;
    console.log(sql);

    pool.query(sql, (err, res) => {
        if(err){
          console.log(err.stack);
        } else {
          console.log("Update Completed");
        }
      })
}