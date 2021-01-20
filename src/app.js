"use strict";

const logger = require('console-server');
const express = require('express');
const bodyParser  = require('body-parser');
const exphbs  = require('express-handlebars');

// aplication internals
const GetFeed = require('./GetFeed');

// application config

const title = process.env.XFEED_TITLE ||"XFeed";
const mode = process.env.XFEED_MODE || 'test';
const PORT = process.env.XFEED_PORT || 8000 ;
const theme = process.env.XFEED_THEME ||"default" ;

// express server configuration
const app = express();
app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
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
            res.render('home', {title:title, sites:feed, tags:tgs.filter(distinct)});
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
    res.send('OK');
});

let server = app.listen(PORT, function () {
    logger.info(`Xfeed running on port ${PORT}`);
    logger.info('Xfeed on mode '+mode)
});

const util = require('util');
const exec = util.promisify(require('child_process').exec);

// additional startup infos
//  -- verify docker status
async function info() {
    logger.debug('xfeed - Docker Info');
    const res = await exec('docker info');
    logger.debug(`${res.stdout}`);
}
info();

server.timeout = 15000;

