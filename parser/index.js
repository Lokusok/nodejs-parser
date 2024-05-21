import process from 'node:process';
import path from 'node:path';

import { Crawler } from './crawler/index.js';
import { DataWriter } from './data-writer/index.js';

export class Parser {
  constructor({ baseUrl, urlParams, maxPage, logger }) {
    this.dataWriter = new DataWriter(
      path.resolve(process.cwd(), 'vacancies.csv')
    );
    this.crawler = new Crawler({
      baseUrl,
      urlParams,
      maxPage,
      dataWriter: this.dataWriter,
      logger,
    });
  }

  /**
   * Начать процесс парсинга
   */
  start() {
    this.crawler.fetchList(
      Crawler.analyzeVacancy,
      ({ title, companyName, address, resInfo }) => {
        this.dataWriter.writeLine(
          `${title},${companyName},${address},${resInfo}`
        );
      }
    );
  }
}
