const router = require('express').Router();
const model = require('./models/index.js');

router.get('/videos', model.list);

router.post('/videos', model.insert);

router.put('/videos', model.update);

module.exports = router;
