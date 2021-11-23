"use strict";
var express     = require('express');
var sendMMS     = require('./sendMMS');
var app = express();

function executeApp02() {
    sendMMS.dbSelect();
    console.log('APP02 FINISHED =============================================');
}
executeApp02();