import { Parser } from "./parser/index.js";
import { Logger } from "./logger/index.js";

const logger = new Logger("logs.txt");
const parser = new Parser({
  baseUrl: "https://hh.ru/search/vacancy",
  urlParams:
    "?from=suggest_post&search_field=name&search_field=company_name&search_field=description&text=React&enable_snippets=false&L_save_area=true&page=0",
  maxPage: Infinity,
  logger,
});
parser.start();
