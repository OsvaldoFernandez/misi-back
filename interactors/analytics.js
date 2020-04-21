var express = require('express');
var router = express.Router();
const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
require('dotenv').config()

const jwt = new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), scopes);

const accounts = async () => (await google.analytics('v3').management.accounts.list({'auth': jwt })).data.items;

const trackingIds = async () => {
  const response = await google.analytics('v3').management.webproperties.list({
    'auth': jwt,
    'accountId': (await accounts())[0].id
  });
  return response.data.items.map((property) => property.id);
}

const analytics = {
  jwt: jwt,
  accounts: accounts,
  trackingIds: trackingIds
}

module.exports = analytics;
