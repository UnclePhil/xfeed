// this module grab all xfeed labels from docker service/container or fake infrastructure
// depend on  
// - mode environment variable : swarm/single/test  (default= test)
// Mostly inspired by Flavio stutz code
// =======================================================================================

const util = require('util');
const { spawn } = require('child_process');
const logger = require('console-server');

class GetFeed {


    static async getLabels(mode) {
        return new Promise(async (resolve, reject) => {
            try {
                var feed=[]
                /// Swarm mode
                if (mode == "swarm") {
                    logger.info('Xfeeder request swarm services')
                    //const servicesJson =  GetFeed.getSwarmServices();
                    GetFeed.getSwarmServices().then(servicesJson => {
                        servicesJson.forEach(function (service) {
                            logger.debug("Analyze :" +service.Spec.Name)
                            if (service.Spec != null && service.Spec.Labels != null) {
                                logger.debug("swarm Labels found")
                                var xfound=false
                                var xname=""
                                var xurl=""
                                var xtags=""
                                var xdesc=""
                                for (var key in service.Spec.Labels) {
                                    switch (key.toLowerCase()) {
                                        case 'xfeed-name':
                                            xfound=true;
                                            xname=service.Spec.Labels[key];
                                            break;
                                        case 'xfeed-url':
                                            xfound=true;
                                            xurl=service.Spec.Labels[key];
                                            break;
                                        case 'xfeed-tags':
                                            xfound=true;
                                            xtags=service.Spec.Labels[key]
                                            break;
                                        case 'xfeed-desc':
                                            xfound=true;
                                            xdesc=service.Spec.Labels[key]
                                            break;
                                        default:
                                        //get out
                                    }
                                } // EOF loop key
                                if (xfound){ 
                                    feed.push({
                                        id: service.Id,
                                        src: service.Spec.Name,
                                        name: xname,
                                        desc: xdesc,
                                        url: xurl,
                                        tags: xtags.toLowerCase()
                                    })
                                }
                            }
                        })  // EOF service loop
                        logger.debug(feed)
                        resolve(feed)
                    })
                } else if (mode == "single") {
                    /// single Mode
                    logger.info('Xfeeder request single services');
                    GetFeed.getContainer().then(servicesJson => {
                        servicesJson.forEach(function (service) {
                            logger.debug("Analyze :" +service.Name)
                            if (service.Config != null && service.Config.Labels != null) {
                                logger.debug("single Labels found")
                                logger.debug(service.Name)
                                var xfound=false
                                var xname=""
                                var xurl=""
                                var xtags=""
                                var xdesc=""
                                for (var key in service.Config.Labels) {
                                    switch (key.toLowerCase()) {
                                        case 'xfeed-name':
                                            xfound=true;
                                            xname=service.Config.Labels[key];
                                            break;
                                        case 'xfeed-url':
                                            xfound=true;
                                            xurl=service.Config.Labels[key]
                                            break;
                                        case 'xfeed-tags':
                                            xfound=true;
                                            xtags=service.Config.Labels[key]
                                            break;

                                        case 'xfeed-desc':
                                            xfound=true;
                                            xdesc=service.Config.Labels[key]
                                            break;
                                        default:
                                        //get out
                                    }
                                } // EOF loop key
                                if (xfound){ 
                                    feed.push({
                                        id: service.Id,
                                        src: service.Name,
                                        name: xname,
                                        desc:xdesc,
                                        url: xurl,
                                        tags: xtags.toLowerCase()
                                    })
                                }
                            }
                        })  // EOF service loop
                        resolve(feed)
                    })
                } else {
                    // test mode
                    logger.debug('Xfeeder request test services')
                    feed.push({id:1,name:"google"   ,src:"xfeedApps",url:"https://www.google.com" ,tags:"search, external",desc:"the master in research"});
                    feed.push({id:2,name:"gmail"    ,src:"xfeedApps",url:"https://gmail.com"      ,tags:"mail, external",desc:"the master in spam"});
                    feed.push({id:3,name:"twitter"  ,src:"xfeedApps",url:"https://twitter.com"    ,tags:"msg, external",desc:"the tiny messenger"});
                    feed.push({id:4,name:"unclephil",src:"xfeedApps",url:"http://tc.unclephil.net",tags:"me, internal",desc:"Le bricoleur (Fr)"});
                    resolve (feed)
                }
            } catch(error) {
                reject('ERROR: '+error)
            }
        });
    }


    // get swarm service 
    // from Flavio Stutz with adaptations
    static async getSwarmServices() {
        return new Promise(async (resolve, reject) => {
            try {
                
                //docker service inspect $(docker service ls - q)
                let servicesList = await GetFeed.spawnSync('docker service ls -q');
                String.prototype.replaceAll = function (search, replacement) {
                    var target = this;
                    return target.replace(new RegExp(search, 'g'), replacement);
                };
                servicesList = servicesList.replaceAll('\n', ' ').trim();
                const services = await GetFeed.spawnSync(`docker service inspect ${servicesList}`);
                const servicesJson = JSON.parse(services);
                servicesJson.sort(function (a, b) {
                    return new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime();
                });
                resolve(servicesJson);
                
            } catch (error) {
                reject("ERROR: "+ error);
            }
        });
    }

    // get normal container 
    // From  Flavio Stutz with adaptations
    static async getContainer() {
        return new Promise(async (resolve, reject) => {
            try {

                //docker service inspect $(docker service ls - q)
                let servicesList = await GetFeed.spawnSync('docker ps -q');
                String.prototype.replaceAll = function (search, replacement) {
                    var target = this;
                    return target.replace(new RegExp(search, 'g'), replacement);
                };
                servicesList = servicesList.replaceAll('\n', ' ').trim();
                const services = await GetFeed.spawnSync(`docker inspect ${servicesList}`);
                const servicesJson = JSON.parse(services);
                servicesJson.sort(function (a, b) {
                    return new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime();
                });
                resolve(servicesJson);
                
            } catch (error) {
                reject("ERROR: "+ error);
            }
        });
    }
    
    // from Flavio Stutz
    static async spawnSync(command) {
        return new Promise((resolve, reject)=> {
            const tc = command.split(' ');
            const cmd = tc.shift();
            const shellres = spawn(cmd, tc);

            let result = '';
            shellres.on('error', (error) => {
                console.log(`ERROR: ${error}`);
                reject(error);
            })
            shellres.stdout.on('data', (data) => {
                result += data
            });
            shellres.stderr.on('data', (data) => {
                console.log(`STERR: ${data}`);
                reject(data);
            });
            shellres.on('close', (code) => {
                resolve(result);
            });
        });
    }

}

module.exports = GetFeed