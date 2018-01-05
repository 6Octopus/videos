const db = require('../database/index.js');

const views = function updateViewsById(viewsData, callback) {
  viewsData.forEach(({ videoID, additionalViews }) => {
    db.Statistics.findOne({ _id: { $eq: videoID } })
      .then((data) => {
        const doc = data;
        doc.viewCount = (parseInt(data.viewCount, 10) + parseInt(additionalViews, 10)).toString();
        doc.save();
      })
      .then(() => callback());
  });
};

module.exports = {
  views,
};
