"use strict";

const logger =require('console-server');
const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');

// Define "require"
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);


// aplication internals
const GetFeed = require('./GetFeed.js');

const util = require('util');
const exec = util.promisify(require('child_process').exec);


// application config

const title = process.env.XFEED_TITLE ||"XFeed";
const titleurl = process.env.XFEED_TITLEURL ||"/";
const mode = process.env.XFEED_MODE || 'test';
const PORT = process.env.XFEED_PORT || 8000 ;
const theme = process.env.XFEED_THEME ||"default";
const build = process.env.BUILD || "Unknow"

// application infos 
const infos={"build":build,"port":PORT,"mode":mode}


// express server configuration
const app = express();
app.engine('hbs', handlebars.engine({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Application routing

// app.get('/', (req, res) => {
//    var await feed=GetFeed.getLabels(mode);
//    
//    res.render('home', {title:title, sites:feed});
// });
const distinct = (value,index,self) => {
  return self.indexOf(value) === index;
}

// the main screen 
app.get("/", async (req, res, next) => {
    try {
        GetFeed.getLabels(mode).then(feed => {
            logger.info('request /');
            var tgs=[]
            feed.forEach(function (f) {
              tgs=tgs.concat(f.tags.split(" "));
              tgs.sort();
            })
            logger.debug(tgs)
            res.render('home', {title:title, titleurl:titleurl, sites:feed, tags:tgs.filter(distinct)});
        });
    } catch (err) {
      next(err);
    }
  });

// the json feed  
app.get("/json", async (req, res, next) => {
    try {
        GetFeed.getLabels(mode).then(feed => {
            logger.info('request /json');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(feed));
            
        });
    } catch (err) {
      next(err);
    }
  });

// check server is working
app.get('/health', (req, res) => {
    logger.info('request /health');
    res.end(JSON.stringify(infos));
});

let server = app.listen(PORT, function () {
    logger.info('Xfeed starting :'+JSON.stringify(infos)) ;  
});


// additional startup infos
//  -- verify docker status
async function info() {
    logger.debug('xfeed - Docker Info');
    const res = await exec('docker info');
    logger.debug(`${res.stdout}`);
}
info();

server.timeout = 15000;

