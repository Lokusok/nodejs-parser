import { createWriteStream } from 'fs';

export class Logger {
  constructor(fileName) {
    this.logFileStream = createWriteStream(fileName, { flags: 'a' });
  }

  log(message) {
    this.logFileStream.write(
      `${new Date().toLocaleString('ru-RU')}: ${message}\n`
    );
  }
}
