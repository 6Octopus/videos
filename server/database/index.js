const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongoUri = `mongodb://${process.env.MONGO_URL}:27017/videos`;
// const mongoUri = 'mongodb://mongo:27017/videos';
// const mongoUri = 'mongodb://localhost:27017/videos';

mongoose.connect(mongoUri, { useMongoClient: true });

const Snippet = mongoose.model('snippet', {
  _id: String,
  publishedAt: Date,
  channelId: String,
  title: String,
  description: String,
  thumbnails: {
    default: {
      url: String,
    },
  },
  tags: [{ type: String }],
  categoryId: String,
});

const ContentDetails = mongoose.model('contentDetails', {
  _id: String,
  duration: String,
});

const Statistics = mongoose.model('statistics', {
  _id: String,
  viewCount: String,
});

const TopicDetails = mongoose.model('topicDetails', {
  _id: String,
  relevantTopicIds: [{ type: String }],
  topicCategories: [{ type: String }],
});

module.exports = {
  mongoose,
  Snippet,
  ContentDetails,
  Statistics,
  TopicDetails,
};
