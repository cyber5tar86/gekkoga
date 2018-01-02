import 'babel-polyfill';

import copy from 'copy-to-clipboard';
import toml from 'toml-js';

const ApiEndpoint = {
  RUN_CONFIG: '/run-config',
  STOP_CONFIG: '/stop-config'
};

const ClassName = {
  COPY_TOML: 'copy-toml-button',
  DISABLED: 'disabled',
  RUN_BUTTON: 'run-button',
  STOP_BUTTON: 'stop-button'
};

const EventType = {
  CLICK: 'click'
}

class App {
  constructor() {
    this.socket = io();
    this.socket.on('ui-update', data => console.log(data));

    this.runButtons = document.getElementsByClassName(ClassName.RUN_BUTTON);
    this.stopButtons = document.getElementsByClassName(ClassName.STOP_BUTTON);
    this.tomlButtons = document.getElementsByClassName(ClassName.COPY_TOML);

    this.addEventListeners();
  }

  addEventListeners() {
    for (let button of this.runButtons) {
      button.addEventListener(EventType.CLICK, e => this.onRunButtonClick(e));
    }

    for (let button of this.stopButtons) {
      button.addEventListener(EventType.CLICK, e => this.onStopButtonClick(e));
    }

    for (let button of this.tomlButtons) {
      button.addEventListener(EventType.CLICK, e => this.onTomlButtonClick(e));
    }
  }

  async onRunButtonClick(e) {
    const slug = e.target.dataset.slug;
    e.target.classList.add(ClassName.DISABLED);
    await this.stopConfig()
    await this.runConfig(slug);
    window.location.reload();
  }

  async onStopButtonClick(e) {
    e.target.classList.add(ClassName.DISABLED);
    await this.stopConfig();
    window.location.reload();
  }

  onTomlButtonClick(e) {
    try {
      const json = JSON.parse(e.target.dataset.json);
      const tomlText = toml.dump(json);
      copy(tomlText);
    } catch (e) {
      console.error('Oops somethings wrong here :/');
      console.log(e);
    }
  }

  async runConfig(config) {
    await this.post(ApiEndpoint.RUN_CONFIG, {config});
    await this.wait(2000);
  }

  async stopConfig() {
    await this.post(ApiEndpoint.STOP_CONFIG);
    await this.wait(2000);
  }

  async wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  post(url, data) {
    return new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open(`POST`, url, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener(`load`, () => resolve());
        request.send(JSON.stringify(data));
      });
  }
}

const app = new App();
