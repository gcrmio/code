"use strict";
var express     = require('express');
var setMMS = require('./routes/setmms');
var app = express();

function executeApp01() {
    setMMS.setMMS();
    console.log('APP01 FINISHED =============================================');
}
executeApp01();