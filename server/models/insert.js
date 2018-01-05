const db = require('../database/index.js');

const insert = function addNewVideo(data, callback) {
  const inserts = [];
  inserts[0] = db.Snippet.create(data.video);
  inserts[1] = db.ContentDetails.create({ _id: data.video._id, duration: 'PT10S' });
  inserts[2] = db.Statistics.create({ _id: data.video._id, viewCount: '0' });
  inserts[3] = db.TopicDetails.create({
    _id: data.video._id,
    relevantTopicIds: [],
    topicCategories: [],
  });
  Promise.all(inserts)
    .then(() => callback({ id: data.video._id }));
};

module.exports = insert;
