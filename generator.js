const randomSentence = require('random-sentence');
const fs = require('fs');

let content = "";
const entries = 5000000;
const mockSessions = 500000;
const outputFile = "./sentences.txt";

for (let i = 0; i < entries; i++) {
  if (i % 1000 == 0) {
    console.log(i);
  }
  const sentence = randomSentence({min: 1, max: 12});
  const sessionId = Math.floor(Math.random() * (mockSessions + 1));
  content += sessionId + "," + sentence + "\n";
}

try {
  fs.writeFileSync(outputFile, content)
  //file written successfully
} catch (err) {
  console.error(err)
}

console.log("Done!");
