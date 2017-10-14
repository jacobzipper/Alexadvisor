'use strict';
module.change_code = 1;
var _ = require('lodash');
var Skill = require('alexa-app');
var PORTFOLIO_MANAGER_SESSION_KEY = 'portfolio_manager';
var skillService = new Skill.app('PortfolioManager');
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();

skillService.launch(function(request, response) {
  var prompt = 'Welcome to Alexadvisor! If you need help, just ask!';
  response.say(prompt).shouldEndSession(false);
  databaseHelper.init()
});

skillService.intent('AddStockIntent', {
    "slots": {
      "numStocks":"AMAZON.NUMBER",
      "ticker":"LIST_OF_COMMON_STOCKS"
    },
    'utterances': ['add {numStocks} {ticker}']
  },
  function(request, response) {
    response.say("Added " + request.slot("numStocks") + " shares of " + request.slot("ticker") + ".").shouldEndSession(false);
    databaseHelper.addStock(request.userId);
  }
);

skillService.intent('RemoveStockIntent', {
    "slots": {
      "numStocks":"AMAZON.NUMBER",
      "ticker":"LIST_OF_COMMON_STOCKS"
    },
    'utterances': ['remove {numStocks} {ticker}']
  },
  function(request, response) {
    response.say("Removed " + request.slot("numStocks") + " shares of " + request.slot("ticker") + ".").shouldEndSession(false);
  }
);
skillService.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
  },
  function(request, response) {
    var helpOutput = 'To add stocks, for example say "add 10 AAPL". To remove stocks, for example say "remove 10 AAPL". To list your stocks, say "list my stocks". To get info about your portfolio, say "tell me about my portfolio". You can also say stop or exit to quit.';
    var reprompt = "What would you like to do?";
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

skillService.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    var stopOutput = "Don't You Worry. I'll be back.";
    response.say(stopOutput);
  }
);

skillService.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    var cancelOutput = "No problem. Request cancelled.";
    response.say(cancelOutput);
  }
);

module.exports = skillService;
