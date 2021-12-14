import track1 from '../data/track1.json';
import page1 from '../data/page1.json';
import screen1 from '../data/screen1.json';
import group1 from '../data/group1.json';
import identifies1 from '../data/identifies1.json';
import { app, appClose } from '../../src/app';
import request from 'supertest';

const spyConsoleError: jest.SpyInstance = jest.spyOn(global.console, 'error');

const GOOD_API_KEY = 'GOOD_KEY';

beforeAll(() => {
  process.env.API_KEY = GOOD_API_KEY;
})

afterEach(() => {
  jest.clearAllMocks();
})

afterAll(() => {
  delete process.env.API_KEY;
  appClose();
})


test('should return error if no authorization header sent', () => {
  request(app)
    .post('/')
    .send(track1)
    .set('Accept', '*/*')
    .expect(401, {
      message: 'Authorization header is missing.'
    });
});

test('should return error if API key invalid', () => {
  request(app)
  .post('/')
  .send(track1)
  .set('Accept', '*/*')
  .expect(401, {
    message: 'API key is invalid.'
  });
});

[ { when: { body: track1} },
  { when: { body: page1} },
  { when: { body: screen1} },
  { when: { body: group1} },
  { when: { body: identifies1} },
].forEach(data => {
  const body = data.when.body;
  test(`when ${body.type} event received, then it should return success`, () => {
    request(app)
    .post('/')
    .send(track1)
    .set('Authorization', buildAuthorizationHeader(GOOD_API_KEY))
    .expect(200);
  });
})

function buildAuthorizationHeader(apiKey: String) :string {
  return 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
}
