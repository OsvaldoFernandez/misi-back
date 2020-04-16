var express = require('express');
var router = express.Router();
const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
require('dotenv').config()

// TODO: Get this from project, not ENV.
const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, scopes)


async function getData(jwt) {
  const response = await google.analytics('v3').management.accounts.list({'auth': jwt });
  const result = { accountID: response.data.items[0].id };
  return await getProperties(jwt, result);
};

async function getProperties(jwt, result) {
  const response = await google.analytics('v3').management.webproperties.list({
    'auth': jwt,
    'accountId': result.accountID
  });
  result.propertyID = response.data.items[0].id;
  return await getProfiles(jwt, result);
}

async function getProfiles(jwt, result) {
  const response = await google.analytics('v3').management.profiles.list({
    'auth': jwt,
    'accountId': result.accountID,
    'webPropertyId': result.propertyID
  });
  result.profileID = response.data.items[0].id;
  return await getReports(jwt, result);
};

async function getReports(jwt, result) {
  const response = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + result.profileID,
    'start-date': '7daysAgo',
    'end-date': 'today',
    'metrics': 'ga:sessions'
  });
  result.report = response.data;
  return result;
};

router.get('/', function(req, res, next) {
  let title = 'MISI BACKEND - RESULTS';

  jwt.authorize().then(() => {
    getData(jwt).then((resp) => {

      res.render('results', { title: title, result: JSON.stringify(resp, null, 2) });
    });
  });
});


module.exports = router;
