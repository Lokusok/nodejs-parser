import { EventEmitter } from "events";
import { JSDOM } from "jsdom";

const PARAMS_CHANGE_EVENT = "paramsChange";
const IS_END_CHANGE_EVENT = "isEndChange";

/**
 * Парсер
 */
export class Crawler {
  /**
   * Конструктор, позволяющий установить параметры для дальнейших действий
   */
  constructor({ baseUrl, urlParams, maxPage, dataWriter, logger }) {
    this.baseURL = baseUrl;
    this.urlParams = new URLSearchParams(urlParams);
    this.maxPage = maxPage;
    this.logger = logger ?? console;

    this.makeFullUrl();

    this.emitter = new EventEmitter();
    this.emitter.on(PARAMS_CHANGE_EVENT, () => this.makeFullUrl());
    this.emitter.on(IS_END_CHANGE_EVENT, () => {
      if (this.isEnd) this.logFinal();
    });

    this.setIsEnd(false);

    this.dataWriter = dataWriter;
    this.dataWriter?.writeLine("вакансия,компания,информация,адрес,информация");
  }

  /**
   * Сконструировать полный URL из свойств baseUrl и urlParams
   */
  makeFullUrl() {
    this.fullUrl = this.baseURL + "?" + this.urlParams.toString();
  }

  /**
   * Установить страницу пагинации
   * @param {Number} page
   */
  setPage(page) {
    this.urlParams.set("page", page);
    this.emitter.emit(PARAMS_CHANGE_EVENT);
  }

  /**
   * Установить статус окончания
   * @param {Boolean} isEnd
   */
  setIsEnd(isEnd) {
    this.isEnd = isEnd;
    this.emitter.emit(IS_END_CHANGE_EVENT);
  }

  /**
   * Уведомить в логах об окончании парсинга
   */
  logFinal() {
    this.logger.log(`${new Date().toLocaleString()}: Парсинг завершён`);
  }

  /**
   * Запрос списка сущностей
   * @param parseAlg Один из методов класса Crawler для получения данных
   * @param onParse Действие при получении данных
   */
  async fetchList(parseAlg, onParse) {
    this.logger.log(
      `${new Date().toLocaleString()} Парсинг ${this.urlParams.get(
        "page"
      )} страницы`
    );

    const response = await fetch(this.fullUrl);
    const text = await response.text();
    const html = new JSDOM(text);

    const parseEntitiesList =
      html.window.document.querySelectorAll(".serp-item");

    if (!parseEntitiesList.length) {
      this.setIsEnd(true);
      return;
    }

    Array.from(parseEntitiesList).forEach((entity) =>
      parseAlg(entity, onParse)
    );

    const currentPage = this.urlParams.get("page");
    if (Number(currentPage) < this.maxPage) {
      this.setPage(+this.urlParams.get("page") + 1);
      this.fetchList(Crawler.analyzeVacancy, onParse);
    } else {
      this.setIsEnd(true);
    }
  }

  /**
   * Получить данные о вакансии
   * @param {HTMLDivElement} vacancyHtmlNode
   * @param {Function} onParse
   * @returns
   */
  static analyzeVacancy(vacancyHtmlNode, onParse) {
    const title = vacancyHtmlNode.querySelector(
      ".serp-item__title-link"
    ).textContent;
    const companyName = vacancyHtmlNode.querySelector(
      '[class*="vacancy-serp-item__meta-info-company"]'
    )?.textContent;
    const address = vacancyHtmlNode.querySelector(
      '[data-qa*="vacancy-serp__vacancy-address"]'
    ).textContent;

    const infoList = vacancyHtmlNode.querySelectorAll(
      '[data-qa*="compensation"]'
    );
    const info = Array.from(infoList).reduce(
      (acc, val) => acc + val.textContent,
      ""
    );
    const resInfo = info.length ? info : "Отсутствует";

    onParse({ title, companyName, address, resInfo });
  }
}
