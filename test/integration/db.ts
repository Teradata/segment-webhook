import { TeradataConnection } from 'teradata-nodejs-driver'
let teradataConnection: TeradataConnection;

const VANTAGE_HOST = process.env.VANTAGE_HOST || 'localhost';
const VANTAGE_PORT = process.env.VANTAGE_PORT || '1025';
const VANTAGE_USER = process.env.VANTAGE_USER || 'dbc';
const VANTAGE_PASSWORD = process.env.VANTAGE_PASSWORD || 'dbc';

export function connect(): void {
  teradataConnection = new TeradataConnection();

  teradataConnection.connect({
    host: VANTAGE_HOST,
    dbs_port: VANTAGE_PORT,
    user: VANTAGE_USER,
    password: VANTAGE_PASSWORD,
    lob_support: 'true'
  });
}

export function select(sql: string): any[] {
  let cursor;
  let result;
  try {
    cursor = teradataConnection.cursor();
    cursor.execute(sql);
    result = cursor.fetchall();
  } finally {
    if (cursor) cursor.close();
  }
  return result;
}

export function close(): void {
  try {
    teradataConnection.close();
  } catch (error) {
    console.warn(new Error(`Couldn't cleanup connections: ${error}`));
  }
}
