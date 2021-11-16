'use strict';
var util = require('util');

const { Pool, Client } = require('pg');

const pool = new Pool({
    host: 'ec2-107-23-143-66.compute-1.amazonaws.com',
    user: 'scmxwnfzuxmsym',
    password: '000ab390bc3f495b4b530f94e20dd4005028c04b383a04f94e0c397bdf804840',  
    database: 'd6302t8u9u4kpr',
    port: 5432,
    ssl: { rejectUnauthorized: false },
});

const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3(
    {
        accessKeyId:     'AKIARVGPJVYVHNE3VMHO', //'AKIAVFJQOJVK35PUQROH',
        secretAccessKey: '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', //'lVNhRBjK35lN9SFrwl7adSHAI78etWOQXy+w81Fl',
        region:'us-east-1'
    }
);

const puppeteer = require ('puppeteer');
const { createCipheriv } = require('crypto');

const cts = '<div id="IDX1" style="display: table;">'
          + '<div id="IDX2" style="display: table-row;">'
          + '     <img src="https://image.s12.sfmc-content.com/lib/fe3311727364047f771d72/m/1/3ac17aee-6bf7-425a-993a-a8c1875b309f.png">'
          + '</div>'
          + '</div>';

(async () => {
    try{
        //for await (const row of rows) {
            console.log("file in process : "+cts);
            const buffer = await cvtHtmlToImage(cts);
            loadS3(buffer,"FNM004.png","TEST01");
        //}
    }
    catch(e){
        console.log(e.stack);
      }    
})();

/*
await page.goto("https://stackoverflow.com/questions/55225525/how-to-draw-a-bounding-box-on-an-element-with-puppeteer");
const element = await page.$(".question");
await page.evaluate(el => el.style.border = "5px solid red", element);
await element.screenshot({ path: "./question.png"}); 
*/



function cvtHtmlToImage(cts){
    console.log("Convert html to image file: cvtHtmlToImage");

    return new Promise((resolve, reject) => {
        
        (async () => {
            const browser = await puppeteer.launch({
                headless: true, // debug only
                args: ['--no-sandbox']
            })
    
            const page = await browser.newPage()

            await page.setContent( 
                '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><body>'
                + cts
                +'</body></html>'
                );

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
            console.log("height: " + theight+"  width: " + twidth);

            const bodyHandle1 = await page.$('#IDX1');
            const boundingBox1 = await bodyHandle1.boundingBox();
            const theight1 = boundingBox1.height;
            const twidth1  = boundingBox1.width;
            console.log("height: " + theight1+"  width: " + twidth1);

            const bodyHandle2 = await page.$('#IDX2');
            const boundingBox2 = await bodyHandle2.boundingBox();
            const theight2 = boundingBox2.height;
            const twidth2  = boundingBox2.width;
            console.log("height: " + theight2+"  width: " + twidth2);

            let ratio = theight/twidth;

            let tgtHeight = parseInt(ratio*640);

            await page.setViewport({width: twidth1, height: theight1});
    

            const buffer = await page.screenshot({
                fullPage: true,
                type: 'png'
            })

            await page.close();
            await browser.close();
    
            resolve(buffer);            
        })();
      })
}



function loadS3(base64Encodedfile,filename,fpath){

    var buff = base64Encodedfile; //Buffer.from(base64Encodedfile, 'base64');

    console.log('Saved to APPS/TEST/MMSTW/'+fpath+'/'+filename);

    var params = {
        Bucket:'bucketeer-bf31af2f-660c-4f16-862f-da542e2d805e',
        Key: 'APPS/TEST/'+fpath+'/'+filename,
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
