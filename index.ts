import { Timescale } from './timescale';
import { MongoDB } from './mongodb';
import { TestHarness } from './testHarness';

// const tsdb = new Timescale();
// const tsHarness = new TestHarness('./sentences.txt', tsdb);

const mdb = new MongoDB();
const mgHarness = new TestHarness('./sentences.txt', mdb);

(async () => {
  await mgHarness.RunBenchmark();
})();