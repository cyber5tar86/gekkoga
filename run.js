const Ga = require('./');
const fs = require('fs');

var runGA = require('commander');

runGA
  .version('0.1.0')
  .option('-c, --config <config file>', 'config')
  .option('-u, --ui', 'UI')
  .parse(process.argv);

if(!runGA.ui && (!runGA.config||!fs.existsSync(runGA.config))){
  console.warn("\n"," error: option `-c --config <config file>' argument or file missing","\n");

  process.on('message', msg => {
    runWithConfig(msg);
    process.send(msg);
  });

  process.send({needConfig: true});
}


if (runGA.ui) {
  const server = require('./server.js');

} else if (runGA.config) {
  runWithConfig(runGA.config);
}

function runWithConfig(configFile) {
  const config = require(__dirname + '/' + configFile);
  console.log(config.notifications, config);
  const ga = new Ga(config, configFile, false);
  ga.run().catch(err => console.error(err) );
}
