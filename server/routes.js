const router = require('express').Router();
const model = require('./models/index.js');

router.get('/videos', model.videos);

router.post('/video', model.video);

router.post('/views', model.views);

module.exports = router;
