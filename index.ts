import { Timescale } from './timescale';
import { S3 } from './s3';
import { MongoDB } from './mongodb';
import { TestHarness } from './testHarness';

// const tsdb = new Timescale();
// const harness = new TestHarness('./sentences.txt', tsdb);

// const mdb = new MongoDB();
// const harness = new TestHarness('./sentences.txt', mdb);

const s3 = new S3();
const harness = new TestHarness('./sentences.txt', s3);

(async () => {
  await harness.RunBenchmark();
})();