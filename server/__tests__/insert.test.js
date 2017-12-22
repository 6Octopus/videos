const insert = require('../models/insert');

describe('insert', () => {
  test('should return a promise', (done) => {
    expect(insert().constructor).toBe(Promise);
    done();
  });
});
