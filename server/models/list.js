const db = require('../database/index.js');

const error = {
  error: {
    errors: [
      {
        domain: '',
        reason: '',
        message: '',
        locationType: 'parameter',
        location: 'part',
      },
    ],
    code: 400,
    message: '',
  },
};

const list = function videosGetRoute(req, res) {
  if (req.query.id === undefined) {
    const err = error;
    err.error.errors[0].domain = 'youtube.parameter';
    err.error.errors[0].reason = 'missingRequiredParameter';
    err.error.errors[0].message = 'No filter selected. Expected: id';
    err.error.errors[0].locationType = 'parameter';
    err.error.errors[0].location = '';
    err.error.message = 'No filter selected. Expected: id';
    res.send(err);
    return;
  }
  if (req.query.part === undefined) {
    const err = error;
    err.error.errors[0].domain = 'global';
    err.error.errors[0].reason = 'required';
    err.error.errors[0].message = 'Required parameter: part';
    err.error.errors[0].locationType = 'parameter';
    err.error.errors[0].location = 'part';
    err.error.message = 'Required parameter: part';
    res.send(err);
    return;
  }

  const ids = req.query.id.split(/\s*,\s*/);
  const parts = req.query.part.split(/\s*,\s*/);

  for (let i = 0; i < parts.length; i += 1) {
    if (!['snippet', 'contentDetails', 'statistics', 'topicDetails'].some(e => e === parts[i])) {
      const err = error;
      err.error.errors[0].domain = 'youtube.part';
      err.error.errors[0].reason = 'unknownPart';
      err.error.errors[0].message = parts[i] || '{0}';
      err.error.errors[0].locationType = 'parameter';
      err.error.errors[0].location = 'part';
      err.error.message = parts[i] || '{0}';
      res.send(err);
      return;
    }
  }

  const responses = [];

  const match = { $match: { _id: { $in: ids } } };
  const addFields = { $addFields: { __order: { $indexOfArray: [ids, '$_id'] } } };
  const sort = { $sort: { __order: 1 } };
  parts.forEach((part) => {
    responses.push(db.mongoose.model(part).aggregate([match, addFields, sort]));
  });

  Promise.all(responses)
    .then((data) => {
      const response = {
        kind: 'youtube#videoListResponse',
        pageInfo: {
          totalResults: data[0].length,
          resultsPerPage: data[0].length,
        },
        Items: [],
      };

      if (data[0].length > 0) {
        ids.forEach((id, j) => {
          const item = { id };
          parts.forEach((part, i) => {
            const pt = data[i][j];
            delete pt.__order;
            delete pt._id;
            delete pt.__v;
            item[part] = data[i][j];
          });
          response.Items.push(item);
        });
      }
      res.send(response);
    });
};

module.exports = list;
