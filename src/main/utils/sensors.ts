import appManager from '../core/manager';
import { delay } from '../utils';
import log from '../utils/logger';

const logger = log.scope('Utils::Sensors');

class Sensors {
  constructor() {
    this.#trackList = [];
    this.#isInit = false;
    this.#isRunning = false;
  }
  #isInit: boolean;
  #isRunning: boolean;
  #trackList: { event: keyof SensorsTrack; properties: SensorsTrack[keyof SensorsTrack] }[];

  track<Event extends keyof SensorsTrack>(event: Event, properties: SensorsTrack[Event]) {
    this.#trackList.push({ event, properties });
    if (!this.#isRunning) {
      this.run();
    }
  }

  init() {
    this.#isInit = true;
    if (!this.#isRunning) {
      this.run();
    }
  }

  async run() {
    if (!this.#isInit) {
      return;
    }
    this.#isRunning = true;
    const trackData = this.#trackList.shift();
    if (trackData) {
      logger.info('SENSORS_TRACK', trackData);
      appManager.getLastFocusedWindow()?.homepage.postMessageToWeb({ message: 'SENSORS_TRACK', data: trackData });
      await delay(100);
      this.run();
    } else {
      this.#isRunning = false;
    }
  }
}

export const sensors = new Sensors();
