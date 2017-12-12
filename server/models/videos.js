const db = require('../database/index.js');

const idMissingError = {
  error: {
    errors: [
      {
        domain: 'youtube.parameter',
        reason: 'missingRequiredParameter',
        message: 'No filter selected. Expected one of: id, myRated, chart',
        locationType: 'parameter',
        location: '',
      },
    ],
    code: 400,
    message: 'No filter selected. Expected one of: id, myRated, chart',
  },
};

const partMissingError = {
  error: {
    errors: [
      {
        domain: 'global',
        reason: 'required',
        message: 'Required parameter: part',
        locationType: 'parameter',
        location: 'part',
      },
    ],
    code: 400,
    message: 'Required parameter: part',
  },
};

const videos = function videosGetRoute(req, res) {
  const { id } = req.query;
  if (id === undefined) {
    res.send(idMissingError);
    return;
  }
  if (req.query.part === undefined) {
    res.send(partMissingError);
    return;
  }
  const parts = req.query.part.split(',');
  const responses = [];

  parts.forEach((part) => {
    responses.push(db.mongoose.model(part).findOne({ _id: id }));
  });

  Promise.all(responses)
    .then((data) => {
      const response = { id };
      parts.forEach((part, i) => { response[part] = data[i]; });
      res.send(response);
    });
};

module.exports = videos;
