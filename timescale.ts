import { Pool, Client } from 'pg';
import * as credentials from './credentials.json';

export class Timescale {
  private pool: Pool;
  
  constructor() {
    this.pool = new Pool(
      {
        host: credentials.pgHost,
        user: credentials.pgUser,
        port: credentials.pgPort,
        password: credentials.pgPassword,
        database: credentials.pgDbname,
        ssl: true
      }
    );
  }

  async Clear() {
    await this.pool.query('DELETE FROM sentences');
  }

  async Write(time: Date, sessionId: string, sentence: string) {
    await this.pool.query('INSERT INTO sentences(timestamp, sessionId, sentence) VALUES($1, $2, $3)', [time, sessionId, sentence]);
  }

  async Read() {
    await this.pool.query('SELECT * FROM sentences WHERE sessionId=\'6478\'');
  }

  async CleanUp() {
    await this.pool.end();
  }
}