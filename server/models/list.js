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

const list = function getVideosById({ id, part }) {
  return new Promise((resolve, reject) => {
    if (id === undefined) {
      const err = error;
      err.error.errors[0].domain = 'youtube.parameter';
      err.error.errors[0].reason = 'missingRequiredParameter';
      err.error.errors[0].message = 'No filter selected. Expected: id';
      err.error.errors[0].locationType = 'parameter';
      err.error.errors[0].location = '';
      err.error.message = 'No filter selected. Expected: id';
      reject(err);
      return;
    }
    if (part === undefined) {
      const err = error;
      err.error.errors[0].domain = 'global';
      err.error.errors[0].reason = 'required';
      err.error.errors[0].message = 'Required parameter: part';
      err.error.errors[0].locationType = 'parameter';
      err.error.errors[0].location = 'part';
      err.error.message = 'Required parameter: part';
      reject(err);
      return;
    }

    const parts = part.split(/\s*,\s*/);

    for (let i = 0; i < parts.length; i += 1) {
      if (!['snippet', 'contentDetails', 'statistics', 'topicDetails'].some(e => e === parts[i])) {
        const err = error;
        err.error.errors[0].domain = 'youtube.part';
        err.error.errors[0].reason = 'unknownPart';
        err.error.errors[0].message = parts[i] || '{0}';
        err.error.errors[0].locationType = 'parameter';
        err.error.errors[0].location = 'part';
        err.error.message = parts[i] || '{0}';
        reject(err);
        return;
      }
    }

    const ids = id.split(/\s*,\s*/);

    const responses = [];

    if (ids.length > 1) {
      const match = { $match: { _id: { $in: ids } } };
      const addFields = { $addFields: { __order: { $indexOfArray: [ids, '$_id'] } } };
      const sort = { $sort: { __order: 1 } };
      parts.forEach((prt) => {
        responses.push(db.mongoose.model(prt).aggregate([match, addFields, sort]));
      });
    } else {
      parts.forEach((prt) => {
        responses.push(db.mongoose.model(prt).find({ _id: { $eq: ids[0] } }).limit(1));
      });
    }

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
          ids.forEach((vid, j) => {
            const item = { id: vid };
            parts.forEach((prt, i) => {
              const pt = data[i][j];
              delete pt.__order;
              delete pt._id;
              delete pt.__v;
              item[prt] = data[i][j];
            });
            response.Items.push(item);
          });
        }
        resolve(response);
      });
  });
};

module.exports = list;
