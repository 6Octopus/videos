const db = require('../database/index.js');

const views = function updateViewsRoute(req, res) {
  req.body.views.forEach(({ id, viewCount }) => {
    db.Statistics.findOne({ _id: { $eq: id } })
      .then((data) => {
        const doc = data;
        doc.viewCount = (parseInt(data.viewCount, 10) + parseInt(viewCount, 10)).toString();
        doc.save();
      })
      .then(() => res.end());
  });
};

module.exports = {
  views,
};
