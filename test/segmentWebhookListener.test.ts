import track1 from './data/track1.json';
import page1 from './data/page1.json';
import screen1 from './data/screen1.json';
import group1 from './data/group1.json';
import identifies1 from './data/identifies1.json';

let executeMock = jest.fn();

jest.mock('teradata-nodejs-driver', () => {
  return {
    TeradataConnection: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn(),
        close: jest.fn(),
        cursor: jest.fn(() => ({
          execute: executeMock,
          close: jest.fn()
        }))
      }
    })
  }
});

const httpResponseMockStatus = jest.fn();
const httpResponseMockSend = jest.fn();
const httpResponse = {
  status: httpResponseMockStatus.mockReturnValue({
    send: httpResponseMockSend,
  }),
  end: jest.fn()
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


test('given a request without authorization header, when request is sent, then the listener should fail with 401', async () => {
  (await import('../src/segmentWebhookListener')).segmentWebhookListener(
    { body: track1, headers: { Accept: '*/*' } } as any, httpResponse as any
  );
  expect(httpResponseMockStatus).toBeCalledWith(401);
  expect(httpResponseMockSend).toBeCalledWith({ message: 'Authorization header is missing.' });
});

test('given a request with a wrong api key, when request is sent, then the listener should fail with 401', async () => {
  (await import('../src/segmentWebhookListener')).segmentWebhookListener(
    { body: track1, headers: { authorization: 'BAD_KEY' } } as any, httpResponse as any
  );
  expect(httpResponseMockStatus).toBeCalledWith(401);
  expect(httpResponseMockSend).toBeCalledWith({ message: 'API key is invalid.' });
});

[{
  when: { body: track1 },
  then: {
    query: 'insert into segment.tracks (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'xrnXb0orfN',
      '2021-12-10T21:01:45Z',
      '2021-12-10T21:01:45Z',
      'Adb1mOTsQU',
      'Pm68bQLAFf',
      '{"app":{"name":"Quote-Cof","version":"359.5223","namespace":"example.info"},"device":{"id":"e782174b-39e2-4e89-87e7-712a42690759","advertisingId":"97f92e74-68c2-4ffe-a5a4-1ee940793fc2","manufacturer":"Warmjayin","model":"Unistring","type":"android"},"ip":"67.186.73.44","locale":"nl-NL","os":{"version":"-427.5644"}}',
      '{"title":"Intro to Analytics"}',
      'track',
      'Course Clicked']
  }
},
{
  when: { body: page1 },
  then: {
    query: 'insert into segment.pages (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'WyOJTdWpGU',
      '2021-12-10T21:01:45Z',
      '2021-12-10T21:01:45Z',
      null,
      'nXPjMULTLF',
      '{"title":"Welcome | Initech","url":"example.org"}',
      'Home']
  }
},
{
  when: { body: screen1 },
  then: {
    query: 'insert into segment.screens (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'puCRDISZKK',
      '2021-12-11T01:52:35Z',
      '2021-12-11T01:52:35Z',
      'rhWppQB43u',
      'tEHH0qRdHu',
      '{"title":"Welcome | Initech"}',
      'Home']
  }
},
{
  when: { body: group1 },
  then: {
    query: 'insert into segment.groups (?, ?, ?, ?, ?, ?, ?)',
    queryParams: [
      'xTAAYCUC3V',
      '2021-12-11T01:52:35Z',
      '2021-12-11T01:52:35Z',
      'Oyo3fOJieC',
      'yal38bMeV0',
      '{"website":"example.org"}',
      'MvEWy5dOSw'
    ]
  }
},
{
  when: { body: identifies1 },
  then: {
    query: 'insert into segment.identifies (?, ?, ?, ?, ?, ?)',
    queryParams: [
      'zPV3xOop6D',
      '2021-12-11T01:52:35Z',
      '2021-12-11T01:52:35Z',
      'Onn2qoQPno',
      'KY0vLZWnRF',
      '{"address":{"city":"San Francisco","country":"US","postalCode":"94111","state":"CA"}}',
    ]
  }
}
].forEach(data => {
  const body = data.when.body;
  const query = data.then.query;
  const queryParams = data.then.queryParams;
  test(`when ${body.type} event received, then it should return success`, async () => {
    (await import('../src/segmentWebhookListener')).segmentWebhookListener(
      { body, headers: { authorization: buildAuthorizationHeader(GOOD_API_KEY) } } as any, httpResponse as any
    );
    expect(executeMock).toBeCalledWith(query, queryParams);
    expect(httpResponseMockStatus).toBeCalledWith(200);
  });
})

test('should log error if unable to update Vantage', async () => {
  const body = identifies1;
  const error = "unknown error";
  executeMock.mockImplementation(() => {throw new Error('unknown error')});
  (await import('../src/segmentWebhookListener')).segmentWebhookListener(
    { body, headers: { authorization: buildAuthorizationHeader(GOOD_API_KEY) } } as any, httpResponse as any
  );
  executeMock.mockImplementation();
  expect(spyConsoleError.mock.calls[0][0].message).toStrictEqual(expect.stringContaining(`Unable to save segment data to Vantage: Error: ${error}`));
  expect(httpResponseMockStatus).toBeCalledWith(500);
  expect(httpResponseMockSend).toBeCalledWith({message: 'Unable to save segment data to Vantage.'});
});

function buildAuthorizationHeader(apiKey: String): String {
  return 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
}
