# Docker Xfeed  (read: Cross feed)
HTTP endpoints for fetching various feeds from Swarm  or any single docker instances

## (re)author
Ph. Koenig - UnclePhil

Made in Belgium, Europe, Earth 
- http://tc.unclephil.net
- ph.koenig@koenig.ph


## Inspirations
### Feeder
Flavio Stutz swarm feed (https://github.com/flaviostutz/docker-swarm-feeds), 

But more generic, to be used with any ingress server, and with more flexible outpout 

### Css filtering
https://webdesign.tutsplus.com/tutorials/how-to-build-a-filtering-component-in-pure-css--cms-33111

And some pain  !!!!

## Usage
### Examples
* docker-compose-yml for single docker 
* docker-stack.yml for swarm cluster 

### Environment variable
* XFEED_TITLE : the html presentation title (default (Xfeed))
* XFEED_MODE  : the working mode (default: test)
* XFEED_PORT  : Server listen port (default 8000) 

### Working mode
* test : return a predefined set of 4 url
* single : on single docker, return all containers with xfeed-<...> labels 
* swarm : on swarm cluster , return all services with xfeed-<...> labels

### Endpoints

* /       : return html presentation page 
* /json   : return feed as json    
* /health : return ok

### Target definition
On service/container to represent in feed, 

set 

```
labels:
   - xfeed-name : the visible name ( take it short, for nice dashboard)
   - xfeed-url  : the main access to 
   - xfeed-tags : space separate list of tags
   - xfeed-desc : a description 
```
Any other container or services will be ignored

## Todo
* Theming 
  * more than 1 theme by default
  * ability to add personalized theme through volume mount or config
* Evolution to ingress and proxy front-end 
  * caddy combination maybe ?? ) 
  * inner frame (cf home-assistant front-end)
* Ability to show more than the local feed  (master mode)
  * other xfeeder
  * static json
* more environment dynamic
   no need to refresh to have the last list 