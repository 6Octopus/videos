const list = require('../models/list');

describe('list', () => {
  test('should return a promise', (done) => {
    expect(list({ id: 'test', part: 'test' }).constructor).toBe(Promise);
    done();
  });
});
