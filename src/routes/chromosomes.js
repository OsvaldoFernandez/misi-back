var express = require('express');
var router = express.Router();
var Chromosome = require('../../src/models/chromosome');


router.get('/', function(req, res, next) {
  Chromosome.findAll().then(chromosomes => {
    res.end(JSON.stringify(chromosomes, null, 4));
  });
});

router.post('/', function(req, res, next) {
  Chromosome.sync().then(() => {
    Chromosome.create({ tracking_id: req.query.tracking_id, elements: req.query.elements }).then(chromo => {
      res.end(JSON.stringify(chromo, null, 4));
    });
  });
});

module.exports = router;
