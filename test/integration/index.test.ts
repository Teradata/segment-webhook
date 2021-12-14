import track1 from '../data/track1.json';
import page1 from '../data/page1.json';
import screen1 from '../data/screen1.json';
import group1 from '../data/group1.json';
import identifies1 from '../data/identifies1.json';
import * as app from '../../src/app';
import request from 'supertest';
import * as db from './db';

const spyConsoleError: jest.SpyInstance = jest.spyOn(global.console, 'error');

const GOOD_API_KEY = 'GOOD_KEY';

beforeAll(() => {
  process.env.API_KEY = GOOD_API_KEY;
  db.connect();
})

afterEach(() => {
  jest.clearAllMocks();
})

afterAll(() => {
  delete process.env.API_KEY;
  app.close();
  db.close();
})


test('should return error if no authorization header sent', async () => {
  const trackLogsBefore = db.select('SEL count(*) FROM segment.tracks')[0];
  const pageLogsBefore = db.select('SEL count(*) FROM segment.pages')[0];
  const screenLogsBefore = db.select('SEL count(*) FROM segment.screens')[0];
  const groupLogsBefore = db.select('SEL count(*) FROM segment.groups')[0];
  const identifyLogsBefore = db.select('SEL count(*) FROM segment.identifies')[0];
  await request(app.app)
    .post('/')
    .send(track1)
    .set('Accept', '*/*')
    .expect(401, {
      message: 'Authorization header is missing.'
    });
  expect(db.select('SEL count(*) FROM segment.tracks')[0]).toEqual(trackLogsBefore);
  expect(db.select('SEL count(*) FROM segment.pages')[0]).toEqual(pageLogsBefore);
  expect(db.select('SEL count(*) FROM segment.screens')[0]).toEqual(screenLogsBefore);
  expect(db.select('SEL count(*) FROM segment.groups')[0]).toEqual(groupLogsBefore);
  expect(db.select('SEL count(*) FROM segment.identifies')[0]).toEqual(identifyLogsBefore);
});

test('should return error if API key invalid', async () => {
  const trackLogsBefore = db.select('SEL count(*) FROM segment.tracks')[0][0];
  const pageLogsBefore = db.select('SEL count(*) FROM segment.pages')[0][0];
  const screenLogsBefore = db.select('SEL count(*) FROM segment.screens')[0][0];
  const groupLogsBefore = db.select('SEL count(*) FROM segment.groups')[0][0];
  const identifyLogsBefore = db.select('SEL count(*) FROM segment.identifies')[0][0];
  await request(app.app)
    .post('/')
    .send(track1)
    .set('Authorization', 'Basic BAD_KEY')
    .expect(401, {
      message: 'API key is invalid.'
    });
  expect(db.select('SEL count(*) FROM segment.tracks')[0][0]).toEqual(trackLogsBefore);
  expect(db.select('SEL count(*) FROM segment.pages')[0][0]).toEqual(pageLogsBefore);
  expect(db.select('SEL count(*) FROM segment.screens')[0][0]).toEqual(screenLogsBefore);
  expect(db.select('SEL count(*) FROM segment.groups')[0][0]).toEqual(groupLogsBefore);
  expect(db.select('SEL count(*) FROM segment.identifies')[0][0]).toEqual(identifyLogsBefore);
});

[{ when: { body: track1, table: 'tracks' } },
{ when: { body: page1, table: 'pages' } },
{ when: { body: screen1, table: 'screens' } },
{ when: { body: group1, table: 'groups' } },
{ when: { body: identifies1, table: 'identifies' } },
].forEach(data => {
  const body = data.when.body;
  const table = data.when.table;
  test(`when ${body.type} event is received, then it should return success`, async () => {
    const before = db.select(`SEL count(*) FROM segment.${table}`)[0][0];
    await request(app.app)
      .post('/')
      .send(body)
      .set('Authorization', buildAuthorizationHeader(GOOD_API_KEY))
      .expect(200);
    expect(db.select(`SEL count(*) FROM segment.${table}`)[0][0]).toEqual(parseInt(before)+1);
  });
})

function buildAuthorizationHeader(apiKey: String): string {
  return 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
}
