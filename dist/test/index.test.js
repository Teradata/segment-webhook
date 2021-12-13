"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const track1_json_1 = __importDefault(require("./data/track1.json"));
const page1_json_1 = __importDefault(require("./data/page1.json"));
const screen1_json_1 = __importDefault(require("./data/screen1.json"));
const group1_json_1 = __importDefault(require("./data/group1.json"));
const identifies1_json_1 = __importDefault(require("./data/identifies1.json"));
const src_1 = require("../src/");
const httpResponseMockSendStatus = jest.fn();
const httpResponseMockStatus = jest.fn();
const httpResponseMockSend = jest.fn();
const httpResponse = {
    sendStatus: httpResponseMockSendStatus,
    status: httpResponseMockStatus.mockReturnValue({
        send: httpResponseMockSend
    })
};
const spyConsoleError = jest.spyOn(global.console, 'error');
const GOOD_API_KEY = 'GOOD_KEY';
beforeAll(() => {
    process.env.API_KEY = GOOD_API_KEY;
});
afterEach(() => {
    jest.clearAllMocks();
});
afterAll(() => {
    delete process.env.API_KEY;
});
test('should return error if no authorization header sent', async () => {
    src_1.exportedForTesting.segmentWebhookListener({ body: track1_json_1.default, headers: { Accept: '*/*' } }, httpResponse);
    expect(httpResponseMockStatus).toBeCalledWith(401);
    expect(httpResponseMockSend).toBeCalledWith({ message: 'Authorization header is missing.' });
});
test('should return error if API key invalid', async () => {
    src_1.exportedForTesting.segmentWebhookListener({ body: track1_json_1.default, headers: { authorization: 'BAD_KEY' } }, httpResponse);
    expect(httpResponseMockStatus).toBeCalledWith(401);
    expect(httpResponseMockSend).toBeCalledWith({ message: 'API key is invalid.' });
});
[{ when: { body: track1_json_1.default } },
    { when: { body: page1_json_1.default } },
    { when: { body: screen1_json_1.default } },
    { when: { body: group1_json_1.default } },
    { when: { body: identifies1_json_1.default } },
].forEach(data => {
    const body = data.when.body;
    test(`when ${body.type} event received, then it should return success`, async () => {
        src_1.exportedForTesting.segmentWebhookListener({ body, headers: { authorization: buildAuthorizationHeader(GOOD_API_KEY) } }, httpResponse);
        expect(httpResponseMockSendStatus).toBeCalledWith(200);
    });
});
function buildAuthorizationHeader(apiKey) {
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
//# sourceMappingURL=index.test.js.map