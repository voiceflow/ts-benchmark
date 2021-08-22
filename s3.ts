const aws = require('aws-sdk');
import * as credentials from './credentials.json';
import { AthenaExpress } from 'athena-express';

export class S3 {
  private s3: AWS.S3;  
  private athena: AthenaExpress<unknown>;
  
  constructor() {
    aws.config.update({region: 'us-east-1'});
    this.s3 = new aws.S3({apiVersion: '2006-03-01'});
    const athenaExpressConfig = {
      aws,
      s3: "s3://" + credentials.s3Bucket+"/", /* optional */
      db: "interact", /* optional */
      getStats: true /* optional default=false */
    };
    this.athena = new AthenaExpress(athenaExpressConfig);
  }

  async Clear() {
  }

  async Write(time: Date, sessionId: string, sentence: string) {
    // Write each individual record as a single file to S3
    await this.s3.putObject({
      Bucket: credentials.s3Bucket,
      Key: time.getTime().toString(),
      Body: JSON.stringify({
        time: time.getTime(), 
        sessionId, 
        sentence,
      }),
      ContentType: 'application/json; charset=utf-8'
    }).promise();
  }

  async Read() {
    await this.athena.query('SELECT * FROM sentences WHERE sessionId=\'6478\'');
  }

  async CleanUp() {
  }
}