const router = require('express').Router();
const model = require('./models/index.js');

router.get('/videos', model.list);

router.post('/videos', model.insert);

router.put('/videos/views', model.update.views);

module.exports = router;
