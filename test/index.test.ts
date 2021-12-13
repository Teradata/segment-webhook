import track1 from './data/track1.json';
import page1 from './data/page1.json';
import screen1 from './data/screen1.json';
import group1 from './data/group1.json';
import identifies1 from './data/identifies1.json';
import { exportedForTesting as app} from '../src/';

const httpResponseMockSendStatus = jest.fn();
const httpResponseMockStatus = jest.fn();
const httpResponseMockSend = jest.fn();
const httpResponse = {
  sendStatus: httpResponseMockSendStatus,
  status: httpResponseMockStatus.mockReturnValue({
    send: httpResponseMockSend
  })
}

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
})


test('should return error if no authorization header sent', async () => {
  app.segmentWebhookListener(
    { body: track1, headers: {Accept: '*/*'} } as any, httpResponse as any
  );
  expect(httpResponseMockStatus).toBeCalledWith(401);
  expect(httpResponseMockSend).toBeCalledWith({ message: 'Authorization header is missing.' });
});

test('should return error if API key invalid', async () => {
  app.segmentWebhookListener(
    { body: track1, headers: {authorization: 'BAD_KEY'} } as any, httpResponse as any
  );
  expect(httpResponseMockStatus).toBeCalledWith(401);
  expect(httpResponseMockSend).toBeCalledWith({ message: 'API key is invalid.' });
});

[ { when: { body: track1} },
  { when: { body: page1} },
  { when: { body: screen1} },
  { when: { body: group1} },
  { when: { body: identifies1} },
].forEach(data => {
  const body = data.when.body;
  test(`when ${body.type} event received, then it should return success`, async () => {
    app.segmentWebhookListener(
      { body, headers: {authorization: buildAuthorizationHeader(GOOD_API_KEY)} } as any, httpResponse as any
    );
    expect(httpResponseMockSendStatus).toBeCalledWith(200);
  });
})

function buildAuthorizationHeader(apiKey: String) :String {
  return 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
}

/* test('should log error if unable to update Vantage', async () => {
  const error = "unknown error";
  await (await import('../../src/fn/segmentWebhook')).default(
    { body: { test: 'test' }, headers: {authorization: 'GOOD_KEY'}  } as any, httpResponse as any
  );
  expect(spyConsoleError.mock.calls[0][0].message).toStrictEqual(expect.stringContaining(`Unable to save segment data to Vantage: ${error}`));
  expect(httpResponseMockStatus).toBeCalledWith(500);
  expect(httpResponseMockSend).toBeCalledWith('Unable to save segment data to Vantage.');
}); */
