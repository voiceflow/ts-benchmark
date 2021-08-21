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
  private readNum: number
  private sentenceArr: Array<string>;
  db: TimeSeriesDB

  constructor(sentenceFile: string, db: TimeSeriesDB) {
    this.recordsWritten = 0;
    this.readNum = 50;
    this.sentenceArr = fs.readFileSync(sentenceFile,
                            {encoding:'utf8', flag:'r'}).split('\n');
    this.db = db;
  }

  private printStats(type: string, total: number, written: number, min: number, avg: number, max: number) {
    // Print statistics
    console.log("\n");
    console.log(">>>>>>>>>>>>>>>>>>>>" + type + ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log("Current entries: " + total);
    console.log("New records written: " + written);
    console.log("Average: " + avg / 1e6 + " ms");
    console.log("Min: " + min / 1e6 + " ms");
    console.log("Max: " + max / 1e6 + " ms");
    console.log("<<<<<<<<<<<<<<<<<<<<" + type + "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    console.log("\n");
  }
  
  // Test how long it takes to write entries
  async writeBenchmark(target: number) {
    let sumNs = 0;
    let minNs = 10e9;
    let maxNs = 0;
    const recordsToWrite = target - this.recordsWritten;
    let promiselist = [];
    
    for (let i = 0; i < recordsToWrite - this.readNum; i++) {
      const row = this.sentenceArr[this.recordsWritten].split(','); // Get sentence
      const sessionId = row[0];
      const sentence = row[1];
      const time = new Date();

      // Write to database
      promiselist.push(this.db.Write(time, sessionId, sentence));

      this.recordsWritten++;
    }

    await Promise.all(promiselist);
    console.log('Starting timer benchmarks')

    for (let i = 0; i < this.readNum; i++) {
      const row = this.sentenceArr[this.recordsWritten].split(','); // Get sentence
      const sessionId = row[0];
      const sentence = row[1];
      const time = new Date();

      // Start timer
      const hrstart = process.hrtime();
      // Write to database
      await this.db.Write(time, sessionId, sentence);
      // Stop timer
      const hrend = process.hrtime(hrstart);
      const runNs = hrend[0] * 1e9 + hrend[1];

      // Calculate stats
      sumNs += runNs;
      if (runNs < minNs) {
        minNs = runNs;
      } else if (runNs > maxNs) {
        maxNs = runNs; 
      }
      this.recordsWritten++;
    }
    const avgNs = sumNs / this.readNum;  // Average INSERT duration
    
    this.printStats("WRITE", this.recordsWritten, recordsToWrite, minNs, avgNs, maxNs);
  }

  // Test query latency for the given dataset
  async readBenchmark() {
    let sumNs = 0;
    let minNs = 10e9;
    let maxNs = 0;
    for (let i = 0; i < this.readNum; i++) {
      // Start timer
      const hrstart = process.hrtime();

      // Read from database
      await this.db.Read();

      // Stop timer
      const hrend = process.hrtime(hrstart);
      const runNs = hrend[0] * 1e9 + hrend[1];

      // Calculate stats
      sumNs += runNs;
      if (runNs < minNs) {
        minNs = runNs;
      } else if (runNs > maxNs) {
        maxNs = runNs; 
      }
    }
    const avgNs = sumNs / this.readNum;  // Average INSERT duration

    this.printStats("READ", this.recordsWritten, 0, minNs, avgNs, maxNs);
  }

  async readWriteLatency() {
    const row = this.sentenceArr[this.recordsWritten].split(','); // Get sentence
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
    console.log(this.recordsWritten, wNs/1e6, rNs/1e6);
    this.recordsWritten++;
  }

  async RWBenchmark(entries: number) {
    for (let i = 0; i < entries; i++) {
      await this.readWriteLatency();
    }
  }

  async RunBenchmark() {
    try {
      await this.db.Clear();
      console.log("starting benchmark...");
      await this.RWBenchmark(10000);
      // await this.writeBenchmark(100);
      // await this.readBenchmark();

      // await this.writeBenchmark(20000);
      // await this.readBenchmark();

      // await this.writeBenchmark(50000);
      // await this.readBenchmark();

      // await this.writeBenchmark(500000);
      // await this.readBenchmark();

      // await this.writeBenchmark(1000000);
      // await this.readBenchmark();

      // await this.writeBenchmark(2000000);
      // await this.readBenchmark();

      // await this.writeBenchmark(5000000);
      // await this.readBenchmark();

      // await this.writeBenchmark(10000000);
      // await this.readBenchmark();

      console.log("Benchmark complete!");
      
    } catch (err) {
      console.error(err);
    } finally {
      await this.db.CleanUp();
      console.log("Goodbye!");
    }
  }
}