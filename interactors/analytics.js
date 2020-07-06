var express = require('express');
var router = express.Router();
const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
var _ = require('lodash');
var moment = require('moment');
require('dotenv').config()

const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), scopes);

const accounts = () => {
  return google.analytics('v3').management.accounts.list({'auth': jwt }).then((response) => {
    return response.data.items;
  });
};

const trackingIds = () => {
  return accounts().then((accountResp) => {
    return google.analytics('v3').management.webproperties.list({
      'auth': jwt,
      'accountId': accountResp[0].id
    }).then((response) => {
      return response.data.items.map((property) => property.id);
    });
  });
};

const getResults = (chromosome) => {
  return accounts().then((accountResp) => {
    return google.analytics('v3').management.profiles.list({
      'auth': jwt, 'accountId': accountResp[0].id, 'webPropertyId': chromosome.trackingId}
    ).then((profile) => {
      const profileID = profile.data.items[0].id;
      const gaParams = {
        'auth': jwt, 'ids': 'ga:' + profileID, 'start-date': moment(chromosome.timeFrom).format('YYYY-MM-DD'), 'end-date': moment(chromosome.timeTo).format('YYYY-MM-DD'),
        'metrics': 'ga:sessions,ga:users,ga:avgSessionDuration,ga:bounceRate,ga:goalStartsAll,ga:goalConversionRateAll,ga:sessionsPerUser'
      };
      return google.analytics('v3').data.ga.get(gaParams).then((response) => {
        return google.analytics('v3').data.ga.get(_.assign({ 'dimensions': 'ga:mobileDeviceInfo' }, gaParams)).then((mobileResponse) => {
          const result = {
            conversions: response.data.totalsForAllResults['ga:goalStartsAll'],
            conversionRate: response.data.totalsForAllResults['ga:goalConversionRateAll'],
            sessions: response.data.totalsForAllResults['ga:sessions'],
            avgSessionDuration: response.data.totalsForAllResults['ga:avgSessionDuration'],
            users: response.data.totalsForAllResults['ga:users'],
            sessionsPerUser: response.data.totalsForAllResults['ga:sessionsPerUser'],
            bounceRate: response.data.totalsForAllResults['ga:bounceRate'],
            mobileSessions: mobileResponse.data.totalsForAllResults['ga:sessions']
          };
          chromosome.results = result;
          return chromosome.save().then(() => {
            return chromosome;
          });
        });
      });
    });
  });
};

const analytics = {
  jwt: jwt,
  accounts: accounts,
  trackingIds: trackingIds,
  getResults: getResults
}

module.exports = analytics;
