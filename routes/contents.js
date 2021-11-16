"use strict";

require("dotenv").config();



//const puppeteer = require ('puppeteer');

const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3(
    {
        accessKeyId:     process.env.AWSS3_accessKeyId,
        secretAccessKey: process.env.AWSS3_secretAccessKey,
        region:          process.env.AWSS3_region
    }
);
const AWSBUCKETNAME = process.env.AWSS3_bucket;

/*
const s3 = new AWS.S3(
    {
        accessKeyId:     'AKIARVGPJVYVHNE3VMHO', //'AKIAVFJQOJVK35PUQROH',
        secretAccessKey: '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', //'lVNhRBjK35lN9SFrwl7adSHAI78etWOQXy+w81Fl',
        region:'us-east-1'
    }
);

const AWSBUCKETNAME = 'bucketeer-bf31af2f-660c-4f16-862f-da542e2d805e';
*/


var request = require('request');

var payload = {
    client_id:      process.env.MC_client_id,
    client_secret:  process.env.MC_client_secret,
    grant_type:     process.env.MC_grant_type,
    account_id:     process.env.MC_account_id
};
/*
var payload = {
    client_id: "sswnqzf9ygtn6ekc1usw3pzj",          // client_id of app
    client_secret: "Cp4RDd349USNaDx1GSvRPRJE",      // client_id of app
    grant_type: "client_credentials",               // type of servertoserver case
    account_id: "526002292"                         // MID
};
*/
const puppeteer = require ('puppeteer');
const { createCipheriv } = require('crypto');


// ----------------------------------------------------------------------------------------------------

module.exports.getContentList = function (req, res) {

    console.log("getContentList ============================================================================");
    console.log(req.body);
    console.log("===========================================================================================");

    var clientServerOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.auth.marketingcloudapis.com/v2/token' ,  //fixed
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };   
    
    function getToken() {

        return new Promise(function(resolve, reject) {
    
            request(clientServerOptions, function (error, response) {
                //console.log("Auth Token Request: ");	
    
                resolve(response);
                //return;
            });
        });
    };

    (async function(){
        await getToken().then(function(response) {
            var tmp = JSON.parse(response.body);
    
            console.log("");
            console.log("Token =====================================================================================================");
            console.log("TOKEN = [ "+tmp.access_token+ " ]");
            console.log("===========================================================================================================");
            console.log("");

            loadContentFolder(tmp.access_token,res);
        });
    })();

    //return res.status(200).json({ message: 'Request Completed' });
};

function loadContentFolder(atoken,res) {
    
    console.log("[ loadContentFolder called ]");

    var ContentOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/asset/v1/content/categories?$pagesize=20' ,
        //body: JSON.stringify(payload2),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + atoken ,
        },
        client_id:      process.env.MC_client_id,
        client_secret:  process.env.MC_client_secret,
        grant_type:     process.env.MC_grant_type,
        account_id:     process.env.MC_account_id
    
        //client_id: "sswnqzf9ygtn6ekc1usw3pzj",
        //client_secret: "Cp4RDd349USNaDx1GSvRPRJE",
        //grant_type: "client_credentials",
        //account_id: "526002292"        
    }

    request(ContentOptions, function (error, response) {
        //console.log("ContentOptions: ");	
        console.log(error,response.body);
        var tmp = JSON.parse(response.body);

        console.log("");
        console.log("Category List =============================================================================================");
        for(const item of tmp.items){
            console.log("ID= "+item.id+" Name= "+item.name+" ParentId= "+item.parentId);
        }
        console.log("===========================================================================================================");

        console.log(tmp.items[0]);
        //return tmp.items[0];

        return res.status(200).json(tmp.items);

    });
    
};




module.exports.getContentItemList = function (req, res) {

    console.log("getContentItemList ========================================================================");
    console.log(req.body);
    console.log("===========================================================================================");
    console.log(JSON.stringify(req.body));

    var tmp2 = req.body;
    console.log(tmp2);    
    console.log(tmp2.catid);    

    var catid=tmp2.catid;


    var clientServerOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.auth.marketingcloudapis.com/v2/token' ,  //fixed
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };   
    
    function getToken() {

        return new Promise(function(resolve, reject) {
    
            request(clientServerOptions, function (error, response) {
                //console.log("Auth Token Request: ");	
    
                resolve(response);
                //return;
            });
        });
    };

    (async function(){
        await getToken().then(function(response) {
            var tmp = JSON.parse(response.body);
    
            console.log("");
            console.log("Token =====================================================================================================");
            console.log("TOKEN = [ "+tmp.access_token+ " ]");
            console.log("===========================================================================================================");
            console.log("");

            loadContentItemList(tmp.access_token,catid,res);
        });
    })();

    //return res.status(200).json({ message: 'Request Completed' });
};

function loadContentItemList(atoken,catid,res) {
    
    console.log("[ loadContentItemList called ] catid= "+catid);

    var payload_itemlist = {
        "page":
        {
            "page":1,
            "pageSize":50
        },        
        "query":
                {
                    "property": "category.id",
                    "simpleOperator": "equals",
                    //"valueType": "int",
                    "value": catid
                },
        "sort":
        [
            { "property":"id", "direction":"ASC" }
        ],        
        "fields":
        [
            "enterpriseId",
            "memberId",
            "thumbnail",
            "category",
            "content",
            "data"
        ]
    }

    console.log(payload_itemlist);

    var ContentItemListOptions = {
    //uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/asset/v1/content/assets?$page=1&$pagesize=50&$filter=category.id%20eq%2016254',
    uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/asset/v1/content/assets/query' ,
    body: JSON.stringify(payload_itemlist),
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + atoken ,
    },
    client_id:      process.env.MC_client_id,
    client_secret:  process.env.MC_client_secret,
    grant_type:     process.env.MC_grant_type,
    account_id:     process.env.MC_account_id

    //client_id: "sswnqzf9ygtn6ekc1usw3pzj",
    //client_secret: "Cp4RDd349USNaDx1GSvRPRJE",
    //grant_type: "client_credentials",
    //account_id: "526002292"        
    }

    request(ContentItemListOptions, function (error, response) {
        //console.log("ContentOptions: ");	
        console.log(error,response.body);

        if(error){
            res.status=response.status;
            return res.status;
        }
        else{
            var tmp = JSON.parse(response.body);
            return res.status(200).json(tmp.items);    
        }

    });
    
};





module.exports.getContentAsset = function (req, res) {

    console.log("getContentAsset ========================================================================");
    console.log(req.body);
    console.log("===========================================================================================");
    console.log(JSON.stringify(req.body));

    var tmp2 = req.body;
    console.log(tmp2);    
    console.log("ctsid= "+tmp2.ctsid);    

    var ctsid=tmp2.ctsid;


    var clientServerOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.auth.marketingcloudapis.com/v2/token' ,  //fixed
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };   
    
    function getToken() {

        return new Promise(function(resolve, reject) {
    
            request(clientServerOptions, function (error, response) {
                //console.log("Auth Token Request: ");	
    
                resolve(response);
                //return;
            });
        });
    };

    (async function(){
        await getToken().then(function(response) {
            var tmp = JSON.parse(response.body);
    
            console.log("");
            console.log("Token =====================================================================================================");
            console.log("TOKEN = [ "+tmp.access_token+ " ]");
            console.log("===========================================================================================================");
            console.log("");

            loadContentAsset(tmp.access_token,ctsid,res);
        });
    })();

    //return res.status(200).json({ message: 'Request Completed' });
};


function loadContentAsset(atoken, ctsid, res) {

    console.log("[ loadContentAsset called ]");

    
    var ContentOptionsAsset = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/asset/v1/content/assets/'+ctsid ,
        //body: JSON.stringify(payload4),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + atoken ,
        },
        client_id:      process.env.MC_client_id,
        client_secret:  process.env.MC_client_secret,
        grant_type:     process.env.MC_grant_type,
        account_id:     process.env.MC_account_id
    
        //client_id: "sswnqzf9ygtn6ekc1usw3pzj",
        //client_secret: "Cp4RDd349USNaDx1GSvRPRJE",
        //grant_type: "client_credentials",
        //account_id: "526002292"        
    }
    
    var asset = '';
    request(ContentOptionsAsset, function (error, response) {
        //console.log("ContentOptions: ");	
        console.log(error,response.body);

        if(error){
            //return res.status(400);
        }

        var tmp = JSON.parse(response.body);

        console.log("");
        console.log("Content Info ==============================================================================================");

        console.log(tmp.name);
        console.log(tmp.content);
        console.log(tmp.fileProperties.publishedURL);
        //console.log(tmp.data);

        console.log("===========================================================================================================");
        console.log("");

        if(tmp.fileProperties.publishedURL) asset = tmp.fileProperties.publishedURL;
        else if(tmp.content) asset=tmp.content;

        return res.status(200).json(tmp); 
        //return asset;
    });

    //return asset;
    
    //res.status(200).send('addDE response');
};



module.exports.getContentBinaryBase64EncodedFile = function (req, res) {

    console.log("getContentAsset ========================================================================");
    console.log(req.body);
    console.log("===========================================================================================");
    console.log(JSON.stringify(req.body));

    console.log("ctsid= "+req.body.ctsid);    

    var ctsid=req.body.ctsid;
    var fileext=req.body.fileext;
    var filegroup=req.body.filegroup;


    var clientServerOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.auth.marketingcloudapis.com/v2/token' ,  //fixed
        body: JSON.stringify(payload),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };   
    
    function getToken() {
        return new Promise(function(resolve, reject) {  
            request(clientServerOptions, function (error, response) {
                //console.log("Auth Token Request: ");	
                if(error){
                    return req.status(400);
                }
                resolve(response);
            });
        });
    };

    (async function(){
        await getToken().then(function(response) {
            var tmp = JSON.parse(response.body);
    
            //loadContentFile(tmp.access_token,ctsid,fileext,filegroup,res);
        });
    })();

    //return res.status(200).json({ message: 'Request Completed' });
};

/*

///asset/v1/content/assets/{id}/file
function loadContentFile(atoken, ctsid,fileext,filegroup, res) {

    console.log("[ loadContentFile called ===============================================] ctsId= "+ctsid);

    
    var ContentOptions = {
        uri: 'https://mcycnrl05rhxlvjpny59rqschtx4.rest.marketingcloudapis.com/asset/v1/content/assets/'+ctsid+'/file' ,
        //body: JSON.stringify(payload4),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + atoken ,
        },
        client_id: "sswnqzf9ygtn6ekc1usw3pzj",
        client_secret: "Cp4RDd349USNaDx1GSvRPRJE",
        grant_type: "client_credentials",
        account_id: "526002292"        
    }
    
    var asset = '';
    request(ContentOptions, function (error, response) {
       
        console.log("**********************************************************************");
        console.log("**********************************************************************");
        console.log(error,response.body);
        console.log("**********************************************************************");
        console.log("**********************************************************************");

        if(error){
            return res.status(400);
        }

        var FILE = Buffer.from(response.body, 'base64'); 
        var filename = filegroup+"-"+ctsid +"."+fileext;
        //loadS3(FILE,filename);


        ;(async () => {
            const buffer = await cvtHtmlToImage("http://mmstw10.herokuapp.com")
            //fs.writeFileSync('screenshot.png', buffer.toString('binary'), 'binary')
            loadS3(buffer,'screenshot3.png');
          })()

        //cvtHtmlToImage("http://mmstw10.herokuapp.com");

        return res.status(200); 
        //return asset;
    });

};


function cvtHtmlToImage(url){
    console.log("cvtHtmlToImage01");
    return new Promise((resolve, reject) => {
        (async () => {
            const browser = await puppeteer.launch({
                // headless: true, // debug only
            args: ['--no-sandbox']
            })

            console.log("cvtHtmlToImage02");
    
            const page = await browser.newPage()

            await page.setContent(
                '<html>'
                +'<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
                +'<body>'
                + '<div style="width:100px; height:100px;overflow:hidden">'
                + '<div><b>Hello world!</b></div>'
                + '<img src="https://image.s12.sfmc-content.com/lib/fe3311727364047f771d72/m/1/52fd3626-5eeb-4490-abc6-6e36600804ba.png">'
                + '</div>'
                +'</body></html>'
                );

                //await page.goto(url, {
                //    waitUntil: ['load', 'networkidle0', 'domcontentloaded']
                //})

            await page.waitFor(1000);

            await page.emulateMedia('screen');
            await page.setViewport({width: 100, height: 100});

            const buffer = await page.screenshot({
                fullPage: true,
                type: 'png'
            })

            await browser.close();
    
            resolve(buffer);
            
        })()
      })
    return;
}
*/

module.exports.uploadImage = function (req, res) {

    //console.log("uploadImage ===============================================================================");
    //console.log(req.files.myFile.name);
    //console.log("===========================================================================================");

    //console.log("file name= "+req.files.myFile.name); 
    console.log(req.files);
    //console.log("-------------------------------------------------------------------------------------------");
    
    var fileB = Buffer.from(req.files.myFile.data, 'base64');  
    //console.log("Request: "+req.files.path+" "+req.files.fname);

    loadToS3(fileB,"public/APPS/MMSTW/raw",req.files.myFile.name);    // for temporary url use

    res.status(200).send({path: 'Image file uploaded'+req.files.myFile.name});

};


function loadToS3(binaryFile,path,filename){

    let ctsType = getContentTypeByFile(filename);
    console.log("Upload Content Type = "+ctsType);

    var params = {
        Bucket: AWSBUCKETNAME,
        //Bucket: 'bucketeer-bf31af2f-660c-4f16-862f-da542e2d805e',
        Key: path+'/'+filename,
        //ACL:'public-read',
        Body:binaryFile,
        //ContentEncoding: 'base64',
        ContentType: ctsType // image/jpg, text/html, application/json, 
    };
    console.log(params);

    s3.putObject(params, function (perr, pres) {
        if (perr) {
            console.log("Error uploading data: ", perr);
        } else {
            console.log("Successfully uploaded to "+path+"/"+filename);
        }
    });

    return;
}

async function saveToS3(binaryFile,path,filename){

    return new Promise((resolve, reject) => {
        
        (async () => {

            let ctsType = getContentTypeByFile(filename);
            console.log("Upload Content Type = "+ctsType);
        
            var params = {
                Bucket: AWSBUCKETNAME,
                //Bucket:'bucketeer-bf31af2f-660c-4f16-862f-da542e2d805e',
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
/*
    let ctsType = getContentTypeByFile(filename);
    console.log("Upload Content Type = "+ctsType);

    var params = {
        Bucket:'bucketeer-bf31af2f-660c-4f16-862f-da542e2d805e',
        Key: path+'/'+filename,
        //ACL:'public-read',
        Body:binaryFile,
        //ContentEncoding: 'base64',
        ContentType: ctsType // image/jpg, text/html, application/json, 
    };
    //console.log(params);

    s3.putObject(params, function (perr, pres) {
        if (perr) {
            console.log("Error uploading data: ", perr);
        } else {
            console.log("Successfully uploaded to "+path+"/"+filename);
        }
    });

    return;
*/    
}




module.exports.getUploadContentInfo = function (req, res) {

    return new Promise((resolve, reject) => {

        console.log("getUploadContentInfo ======================================================================");
        console.log(req.body);
        console.log("===========================================================================================");
        console.log(JSON.stringify(req.body));
    
        var tmp = req.body;
        console.log(tmp);    
        console.log("msgid= "+tmp.msg_id);    
    
        var msg_id   = tmp.msg_id;
        var filename = msg_id+"-"+tmp.filename;
        var path     = tmp.path;
        var cts      = tmp.cts;
    
        //console.log(filename);
        //console.log("search: "+filename.search("."));

        let reDot = /[.]/g
        let m = filename.search(reDot);

        if(m==-1){
            m = filename.length;
        }
        //console.log(filename.substring(0,m));
        let filenameF = filename.substring(0,m)+".jpg";

        //console.log("filename change: "+filename +"  >  "+ filenameF + "  LOC: " + m);

        let width = 0;
        let height = 0;
        let filesize = 0;
    
    
    (async () => {
        try{
               const output = await cvtHtmlToImage(cts);
               let buffer = output[0];
               width  = output[1];
               height = output[2];

               //console.log("Changed Image width: "+width+" height: "+height);

               await saveToS3(buffer,path,filenameF);
               
               console.log("loadToS3 finish");
               //file info
               var params = {
                Bucket: AWSBUCKETNAME,
                Key: path+'/'+filenameF,
                //ACL:'public-read',
                //Body:binaryFile,
                //ContentEncoding: 'base64',
                //ContentType: getContentTypeByFile(cts) // image/jpg, text/html, application/json, 
               };

               let objSize = await getSize(path+'/'+filenameF, AWSBUCKETNAME)
               .then(size =>{
                console.log('objSize');
                console.log(size);
                    filesize=size;
                    //console.log("filesize= "+filesize);
                    //res.status(200).send(rts);
               });

               let rts = {
                    width: width,
                    height: height,
                    size: filesize,
                    filename: path+'/'+filenameF
                };
                resolve(res.status(200).send(rts));
                //res.status(200).send(rts);
        }
        catch(e){
            console.log(e.stack);
          }    
    })();    //async
    
    });//promise

    //res.status(200).send(rts);
}

async function getSize(key, bucket) {
    //console.log('getSize');
    return s3.headObject({ Key: key, Bucket: bucket })
        .promise()
        .then(res => res.ContentLength);
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

//console.log(html);

            await page.waitForTimeout(1000);

            await page.emulateMediaType('screen');

            //const element1 = await page.$("#IDX1");
            //await page.evaluate(el => el.style.border = "5px solid red", element1);

            //const element2 = await page.$("#IDX2");
            //await page.evaluate(el => el.style.border = "5px solid blue", element2);

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
    

            let cType = getContentTypeByFile(cts);

            console.log("cType: "+cType+" Final height: " + theight1+"  Final width: " + twidth1);

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
  