import { createWriteStream } from 'fs';

export class DataWriter {
  constructor(filename) {
    this.fileStream = createWriteStream(filename ?? 'data.csv');
  }

  writeLine(data) {
    const resLine = data.includes('\n') ? data : data + '\n';
    this.fileStream.write(resLine);
  }

  close() {
    this.fileStream.close();
  }
}
