"use strict";
var express     = require('express');
var sendMMS     = require('./sendMMS');
var app = express();

// function sayHello() {
    sendMMS.dbSelect();
// }
// sayHello();