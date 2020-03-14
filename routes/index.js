var express = require('express');
var router = express.Router();
//const Sequelize = require('sequelize');

router.get('/', function(req, res, next) {
  let title = 'MISI BACKEND';
  //database();

  res.render('index', { title: title });
});

module.exports = router;


// const database = () => {
//   // TODO: Connection pool
//   const sequelize = new Sequelize('postgres://osvaldo:@localhost:5432/misi');
//   sequelize.authenticate()
//     .then(() => {
//       console.log('Connection has been established successfully.');
//     })
//     .catch(err => {
//       console.error('Unable to connect to the database:', err);
//     });
// }
