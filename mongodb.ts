import { MongoClient, Collection, Document } from 'mongodb';
import * as credentials from './credentials.json';

export class MongoDB {
  private client: MongoClient;
  private sentences: Collection<Document> | undefined;
  
  constructor() {
    this.client = new MongoClient(credentials.mongoUrl);
  }

  async Clear() {
    await this.client.connect();
    this.sentences = this.client.db('main').collection('sentences');
    this.sentences!.drop();
    await this.client.db('main').createCollection(
      "sentences",
      {
         timeseries: {
            timeField: "timestamp",
            metaField: "sessionId",
            granularity: "minutes"
         },
      }
    );
    this.sentences = this.client.db('main').collection('sentences');
  }

  async Write(time: Date, sessionId: string, sentence: string) {
    const doc = { timestamp: time, sessionId: sessionId, sentence: sentence };
    await this.sentences!.insertOne(doc);
  }

  async Read() {
    const query = { sessionId: { $eq: 6478 } };
    await this.sentences!.find(query).toArray();
  }

  async CleanUp() {
    await this.client.close();
  }
}
