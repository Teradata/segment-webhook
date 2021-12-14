import { TeradataConnection } from 'teradata-nodejs-driver'
import express from "express";
import { TeradataCursor } from 'teradata-nodejs-driver/teradata-cursor';
const API_KEY = process.env.API_KEY || 'GOOD_KEY';
const VANTAGE_HOST = process.env.VANTAGE_HOST || 'localhost';
const VANTAGE_PORT = process.env.VANTAGE_PORT || '1025';
const VANTAGE_USER = process.env.VANTAGE_USER || 'dbc';
const VANTAGE_PASSWORD = process.env.VANTAGE_PASSWORD || 'dbc';
const base64EncodedApiKey = 'Basic ' + Buffer.from(API_KEY + ':').toString('base64');
let teradataConnection:TeradataConnection = new TeradataConnection();

teradataConnection.connect({
  host: VANTAGE_HOST,
  dbs_port: VANTAGE_PORT,
  user: VANTAGE_USER,
  password: VANTAGE_PASSWORD,
  lob_support: 'true'
});

export function segmentWebhookListener (
  request: express.Request,
  response: express.Response
) {
  const authorization = request.headers.authorization;
  const requestData = request.body;

  if (!authorization) {
    response.status(401).send({ message: 'Authorization header is missing.' });
    return;
  }

  if (authorization != base64EncodedApiKey) {
    response.status(401).send({ message: 'API key is invalid.' });
    return;
  }

  try {
    switch(requestData.type) {
      case 'track':
        insertTrack(requestData);
        break;

      case 'page':
        insertPage(requestData);
        break;

      case 'screen':
        insertScreen(requestData);
        break;

      case 'group':
        insertGroup(requestData);
        break;

      case 'identify':
        insertIdentifies(requestData);
        break;


      default:
        throw new Error(`Unknown event type: ${requestData.type}`);

    }
    response.status(200).send();
    return;
  } catch (error) {
    console.error(new Error(`Unable to save segment data to Vantage: ${error}`));
    response.status(500).send({ message: 'Unable to save segment data to Vantage.' });
    return;
  }
}

function insertTrack(requestData: any) {
  const data: any[] = [
        /* id */ requestData.messageId,
        /* received_at */ requestData.receivedAt,
        /* sent_at */ requestData.timestamp,
        /* user_id */ requestData.userId,
        /* anonymous_id */ requestData.anonymousId,
        /* context */ JSON.stringify(requestData.context),
        /* properties */ JSON.stringify(requestData.properties),
        /* event */ requestData.type,
        /* event_text */ requestData.event
  ];
  execute('insert into segment.tracks (?, ?, ?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertPage(requestData: any) {
  const data: any[] = [
        /* id */ requestData.messageId,
        /* received_at */ requestData.receivedAt,
        /* sent_at */ requestData.timestamp,
        /* user_id */ requestData.userId,
        /* anonymous_id */ requestData.anonymousId,
        /* properties */ JSON.stringify(requestData.properties),
        /* page */ requestData.name
  ];
  execute('insert into segment.pages (?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertScreen(requestData: any) {
  const data: any[] = [
        /* id */ requestData.messageId,
        /* received_at */ requestData.receivedAt,
        /* sent_at */ requestData.timestamp,
        /* user_id */ requestData.userId,
        /* anonymous_id */ requestData.anonymousId,
        /* properties */ JSON.stringify(requestData.properties),
        /* screen */ requestData.name
  ];
  execute('insert into segment.screens (?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertGroup(requestData: any) {
  const data: any[] = [
        /* id */ requestData.messageId,
        /* received_at */ requestData.receivedAt,
        /* sent_at */ requestData.timestamp,
        /* user_id */ requestData.userId,
        /* anonymous_id */ requestData.anonymousId,
        /* traits */ JSON.stringify(requestData.traits),
        /* group_id */ requestData.groupId
  ];
  execute('insert into segment.groups (?, ?, ?, ?, ?, ?, ?)', data);
  return;
}

function insertIdentifies(requestData: any) {
  const data: any[] = [
        /* id */ requestData.messageId,
        /* received_at */ requestData.receivedAt,
        /* sent_at */ requestData.timestamp,
        /* user_id */ requestData.userId,
        /* anonymous_id */ requestData.anonymousId,
        /* traits */ JSON.stringify(requestData.traits)
  ];
  execute('insert into segment.identifies (?, ?, ?, ?, ?, ?)', data);
  return;
}

export function execute(sql: string, data: any[]): void {
  let cursor;
  try {
    cursor = teradataConnection.cursor();
    cursor.execute(sql, data);
  } finally {
    if (cursor) cursor.close();
  }
  return;
}

export function connectionClose() {
  try {
    teradataConnection.close();
  } catch(error) {
    console.warn(new Error(`Couldn't cleanup connections: ${error}`));
  }
}
