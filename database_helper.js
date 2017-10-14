'use strict';
var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
};
module.change_code = 1;
var _ = require('lodash');
var PORTFOLIOTABLE = 'PortfolioTable';
var dynasty = require('dynasty')(credentials);

function PortfolioManagerHelper() {}
var portfolioTable = function() {
  return dynasty.table(PORTFOLIOTABLE);
};

PortfolioManagerHelper.prototype.createCakeBakerTable = function() {
  return dynasty.describe(PORTFOLIOTABLE)
    .catch(function(error) {
      return dynasty.create(PORTFOLIOTABLE, {
        key_schema: {
          hash: ['userId', 'string']
        }
      });
    });
};

PortfolioManagerHelper.prototype.storeCakeBakerData = function(userId, cakeBakerData) {
  return portfolioTable().insert({
    userId: userId,
    data: cakeBakerData
  }).catch(function(error) {
    console.log(error);
  });
};

PortfolioManagerHelper.prototype.readCakeBakerData = function(userId) {
  return portfolioTable().find(userId)
    .then(function(result) {
      return result;
    })
    .catch(function(error) {
      console.log(error);
    });
};

module.exports = PortfolioManagerHelper;
