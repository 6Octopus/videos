const axios = require('axios');
const db = require('../database/index.js');

const insert = function videoPostRoute(req, res) {
  const inserts = [];
  inserts[0] = db.Snippet.create(req.body.video);
  inserts[1] = db.ContentDetails.create({ _id: req.body.video._id, duration: 'PT10S' });
  inserts[2] = db.Statistics.create({ _id: req.body.video._id, viewCount: '0' });
  inserts[3] = db.TopicDetails.create({
    _id: req.body.video._id,
    relevantTopicIds: [],
    topicCategories: [],
  });
  Promise.all(inserts)
    .then(() => {
      if (process.env.ENTRY_URL) {
        axios.post(`http://${process.env.ENTRY_URL}`, { id: req.body.video._id });
      }
      if (process.env.RELATED_URL) {
        axios.post(`http://${process.env.RELATED_URL}`, { id: req.body.video._id });
      }
      res.end();
    });
};

module.exports = insert;
