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

PortfolioManagerHelper.prototype.init = function(userId) {
  portfolioTable().insert({
    userId: userId,
    data: {
      portfolio: {}
    }
  }).catch(function(error) {
    console.log(error);
  });

};

PortfolioManagerHelper.prototype.addStock = function(userId, numShares, ticker) {
    var portfolioCopy = this.getPortfolio();
    var stocks = Object.keys(portfolioCopy);
    if(stocks.indexOf(ticker) != -1) {
      portfolioCopy[ticker] += parseInt(numShares);
      portfolioTable().update(userId, {
        portfolio: portfolioCopy
      })
      .then(function(resp) {
        console.log(resp);
      });
    }
    else {
      portfolioCopy[ticker] = parseInt(numShares);
      portfolioTable().update(userId, {
        portfolio: portfolioCopy
      })
      .then(function(resp) {
        console.log(resp);
      });
    }
};

PortfolioManagerHelper.prototype.getPortfolio = function(userId) {
  return portfolioTable().find(userId)
    .then(function(result) {
      return result.portfolio;
    })
    .catch(function(error) {
      console.log(error);
    });
};

module.exports = PortfolioManagerHelper;
