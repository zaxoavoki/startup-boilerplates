import { createTestServer, startTestServer, stopTestServer } from '../server';

const server = createTestServer();

beforeAll(() => startTestServer(server));
afterAll(() => stopTestServer(server));

describe('Example group of tests', () => {
  it('should add two numbers', () => {
    expect(1 + 1).toBe(2);
  });
});
