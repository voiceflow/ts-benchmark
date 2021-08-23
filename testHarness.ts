import { SlowBuffer } from 'buffer';
import fs from 'fs';

interface TimeSeriesDB {
  Write(time: Date, sessionId: string, sentence: string): Promise<void>;
  Read(): Promise<void>;
  Clear(): Promise<void>;
  CleanUp(): Promise<void>;
}

export class TestHarness {
  private recordsWritten: number
  private sentenceArr: Array<string>;
  db: TimeSeriesDB
  recordLen: number

  constructor(sentenceFile: string, db: TimeSeriesDB) {
    this.recordsWritten = 0;
    this.sentenceArr = fs.readFileSync(sentenceFile,
                            {encoding:'utf8', flag:'r'}).split('\n');
    this.db = db;
    this.recordLen = 5000000
  }

  async readWriteLatency(idx: number) {
    const row = this.sentenceArr[idx].split(','); // Get sentence
    const sessionId = row[0];
    const sentence = row[1];
    const time = new Date();

    // Start timer
    const wstart = process.hrtime();
    // Write to database
    await this.db.Write(time, sessionId, sentence);
    // Stop timer
    const wend = process.hrtime(wstart);
    const wNs = wend[0] * 1e9 + wend[1];

    // Start timer
    const rstart = process.hrtime();

    // Read from database
    await this.db.Read();

    // Stop timer
    const rend = process.hrtime(rstart);
    const rNs = rend[0] * 1e9 + rend[1];
    if (this.recordsWritten % 1 == 0){
      //console.log(this.recordsWritten);
      console.log(this.recordsWritten + "," + wNs + "," + rNs);
    }
    this.recordsWritten++;
  }

  async RWBenchmark(entries: number) {
    console.log("Total entries: " + entries);
    for (let i = 0; i < entries; i++) {
      await this.readWriteLatency(i);
    }
  }

  async RunBenchmark() {
    try {
      await this.db.Clear();
      console.log("starting benchmark...");
      await this.RWBenchmark(this.recordLen);
      console.log("Benchmark complete!");
      
    } catch (err) {
      console.error(err);
    } finally {
      await this.db.CleanUp();
      console.log("Goodbye!");
    }
  }
}
