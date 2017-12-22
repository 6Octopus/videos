const { views } = require('../models/update');

describe('views', () => {
  test('should return a promise', (done) => {
    expect(views([{ videoID: 'test', additionalViews: '0' }]).constructor).toBe(Promise);
    done();
  });
});
