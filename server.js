const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const { fork } = require('child_process');
const arraySort = require('array-sort');
const uuidv1 = require('uuid/v1');
const flattenObject = require('flatten-object');
const convert = require('object-array-converter');


app.use('/static', express.static(path.join(__dirname, '/static')));
app.set('views', __dirname + '/templates');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());

/**
 * Run
 */
const PORT = process.env.PORT || 3360;
server.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});

const MAX_HISTORY = 50;

class UIServer {
  constructor() {
    // io.on('new-results', data => {
    //   io.emit('ui-update', data);
    // });
    this.history = null;

    this.isRunningConfig = false;
    this.currentConfig = null;
    this.childProcess = null;
  }

  static getInstance() {
    if (!this.instance_) {
      this.instance_ = new UIServer();
    }

    return this.instance_;
  }

  getConfigOptions() {
    return new Promise(resolve => {
      fs.readdir(__dirname + '/config', (err, data) => {
        const file = data.map(file => file.replace('.js', ''));
        resolve(file);
      });
    });
  }

  getHistoryTransformed() {
    if (!this.history) return [];

    const history = JSON.parse(JSON.stringify(this.history));
    return history.map(item => {
      item.candleSize = item.input.candleSize;
      item.historySize = item.input.historySize;
      item.options = this.getConfigArrayOptions(item.input);
      return item;
    });
  }

  getConfigArrayOptions(input) {
    const duplicate = JSON.parse(JSON.stringify(input));
    delete duplicate.candleSize;
    delete duplicate.historySize;
    const flat = flattenObject(duplicate);
    return convert.toArray(flat);
  }

  runConfig(config) {
    if (!this.isRunningConfig && !this.childProcess) {
      const file = `config/${config}.js`;
      this.isRunningConfig = true;
      this.currentConfig = config;

      this.childProcess = fork('run.js', {silent: true});

      this.childProcess.on('message', (msg) => {
        if (msg.results) {
          this.storeHistory(msg);
        }

        if (msg.needConfig) {
          this.childProcess.send(file);
        }
      });

      this.childProcess.on('close', () => {
        this.isRunningConfig = false;
        this.currentConfig = null;
        this.history = null;
      });
    }
  }

  stopConfig() {
    if (this.childProcess) {
      this.childProcess.kill();
      this.childProcess = null;
      this.history = null;
      this.isRunningConfig = false;
      this.currentConfig = null;
    }
  }

  /**
   * Store the top 50 results in memory AND in file. We will just completely
   * overwrite the file each time it updates. One day, if needed we can add a
   * DB or something.
   */
  async storeHistory(test) {
    const historyFile = `./results/history/${test.configId}.json`;

    if (!this.history) {
      this.history = await this.getHistory(historyFile);
    }

    const id = uuidv1();
    const data = {results: test.results, input: test.input, id};

    // Lets ignore settings that just dont trade.
    if (data.results.trades < 5) return;

    this.history.push(data);
    this.history = arraySort(this.history, 'results.relativeProfit', {reverse: true});

    if (this.history.length > MAX_HISTORY) {
      console.log('updated');
      this.history.pop();
    }

    // Update history if there is a new top 50
    const isTopFifty = !!this.history.find(t => t.id == id);
    if (isTopFifty) {
      fs.writeFile(historyFile, JSON.stringify(this.history), 'utf8');
    }
  }

  async getHistory(file) {
    let history = [];

    await new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (!err && !!data) history = JSON.parse(data);
        resolve();
      });
    });

    return history;
  }
}

const uiServer = UIServer.getInstance();

app.get('/', async (req, res) => {
  const context = {
    isRunningConfig: uiServer.isRunningConfig,
    currentConfig: uiServer.currentConfig,
  };

  uiServer.getConfigOptions()
      .then(data => context.configs = data)
      .then(() => context.history = uiServer.getHistoryTransformed())
      .then(() => res.render('index.html', context))
});

app.post('/run-config', async (req, res) => {
  const config = req.body.config;
  uiServer.runConfig(config);
  res.sendStatus(200);
});

app.post('/stop-config', async (req, res) => {
  uiServer.stopConfig();
  res.sendStatus(200);
});

module.exports = uiServer;
