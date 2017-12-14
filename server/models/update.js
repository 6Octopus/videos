const db = require('../database/index.js');

const views = function updateViewsRoute(req, res) {
  req.body.views.forEach(({ videoID, additionalViews }) => {
    db.Statistics.findOne({ _id: { $eq: videoID } })
      .then((data) => {
        const doc = data;
        doc.viewCount = (parseInt(data.viewCount, 10) + parseInt(additionalViews, 10)).toString();
        doc.save();
      })
      .then(() => res.end());
  });
};

module.exports = {
  views,
};
