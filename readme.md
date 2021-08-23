# Time-series Database Comparison

Date: Aug 22, 2021  
Author: Frank Gu <<frank@voiceflow.com>>

# Usage
1. Set up a `credentials.json` file in this directory with the following format: 
```json
{
  "mongoUrl": "",
  "pgHost": "",
  "pgUser": "",
  "pgPort": 1234,
  "pgDbname": "",
  "pgPassword": "",
  "s3Bucket": ""
}
```
2. Run `yarn generate` to generate the `sentences.txt` seed data (5M entries) to ensure data consistency between tests.
3. Run `yarn benchmark` to run the benchmark

### Changing database backends
Comment/Uncomment the corresponding harness in the `index.ts` to change database backend under test.  