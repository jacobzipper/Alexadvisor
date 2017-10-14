'use strict';
module.change_code = 1;
var _ = require('lodash');
var Skill = require('alexa-app');
var PORTFOLIO_MANAGER_SESSION_KEY = 'portfolio_manager';
var skillService = new Skill.app('PortfolioManager');
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();

skillService.launch(function(request, response) {
  var prompt = 'Welcome to Alexadvisor! To add stocks, for example say "add 10 AAPL". To remove stocks, for example say "remove 10 AAPL". To list your stocks, say "list my stocks". To get info about your portfolio, say "tell me about my portfolio".';
  response.say(prompt).shouldEndSession(false);
});

skillService.intent('advanceStepIntent', {
    'utterances': ['{next|advance|continue}']
  },
  function(request, response) {
    var portfolioManagerHelper = getPortfolioManagerHelperFromRequest(request);
    portfolioManagerHelper.currentStep++;
    portfolioManagerIntentFunction(portfolioManagerHelper, request, response);
  }
);

skillService.intent('cakeBakeIntent', {
    'utterances': ['{new|start|create|begin|build} {|a|the} cake']
  },
  function(request, response) {
    var portfolioManagerHelper = new PortfolioManagerHelper({});
    portfolioManagerIntentFunction(portfolioManagerHelper, request, response);
  }
  skillService.intent('repeatStepIntent', {
    'utterances': ['{repeat}']
  },
  function(request, response) {
    var portfolioManagerHelper = getPortfolioManagerHelperFromRequest(request);
    portfolioManagerIntentFunction(portfolioManagerHelper, request, response);
  }
);

skillService.launch(function(request, response) {
  var prompt = 'Welcome to Cakebaker!' +
    'To start baking, say bake a cake';
  response.say(prompt).shouldEndSession(false);
});

skillService.intent('loadCakeIntent', {
    'utterances': ['{load|resume} {|a|the} {|last} cake']
  },
  function(request, response) {
    var userId = request.userId;
    databaseHelper.readCakeBakerData(userId).then(function(result) {
      return (result === undefined ? {} : JSON.parse(result['data']));
    }).then(function(loadedCakeBakerData) {
      var portfolioManagerHelper = new CakeBakerHelper(loadedCakeBakerData);
      return portfolioManagerIntentFunction(portfolioManagerHelper, request, response);
    });
    return false;
  }
);

skillService.intent('saveCakeIntent', {
    'utterances': ['{save} {|a|the|my} cake']
  },
  function(request, response) {
    var portfolioManagerHelper = getPortfolioManagerHelperFromRequest(request);
    saveCake(portfolioManagerHelper, request);
    response.say('Your cake progress has been saved!');
    response.shouldEndSession(true).send();
    return false;
}
);

module.exports = skillService;
