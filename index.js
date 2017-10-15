'use strict';
module.change_code = 1;
var fs = require('fs');
var stockList = JSON.parse(fs.readFileSync('commonstocks.json', 'utf8'));
var PORTFOLIO_MANAGER_SESSION_KEY = 'portfolio_manager';
var Skill = require('alexa-app');
var skillService = new Skill.app('PortfolioManager');
var rp = require("sync-request");
var esite = 'https://search-alexadvisor-znt2yxmcn25y3yw5skwbjvhc4e.us-east-1.es.amazonaws.com/';
var port;
var perform;
var portAnalysis;
var totMoney = 0;

var kibanifyPortfolio = function(porto) {
  var portfolio = {};
  for(var i in porto) {
    portfolio["ticker-"+i] = porto[i];
  }
  return portfolio;
}

skillService.launch(function(request, response) {
  var prompt = 'Welcome to Alexadvisor! If you need help, say, "alexa help".';
  var res = rp("POST","https://alexadvisor.herokuapp.com/init",{json:{userId:request.userId}});
  port = JSON.parse(res.getBody('utf8'))["port"];
  res = rp("PUT", esite+"portfolio/portfolio/"+request.userId, {json:kibanifyPortfolio(port)});
  response.say(prompt).shouldEndSession(false);
  //init(request.userId);

});

skillService.intent('AddStockIntent', {
    "slots": {
      "numStocks":"AMAZON.NUMBER",
      "ticker":"LIST_OF_COMMON_STOCKS"
    },
    'utterances': ['add {numStocks} {ticker}','add {numStocks} dollars {ticker}','add {numStocks} dollars of {ticker}']
  },
  function(request, response) {
    if(stockList.indexOf(request.slot("ticker"))!=-1) {
      var res = rp("POST","https://alexadvisor.herokuapp.com/addStocks",{json:{userId:request.userId, ticker:request.slot("ticker"), num: parseInt(request.slot("numStocks"))}});
      console.log(res);
      var stocks = Object.keys(port);
      if(stocks.indexOf(request.slot("ticker"))!=-1) {
          port[request.slot("ticker")]+=parseInt(request.slot("numStocks"));
      }
      else {
          port[request.slot("ticker")]=parseInt(request.slot("numStocks"));
      }
      res = rp("PUT", esite+"portfolio/portfolio/"+request.userId, {json:kibanifyPortfolio(port)});
      response.say("Added " + request.slot("numStocks") + " dollars of " + request.slot("ticker") + ".").shouldEndSession(false);
    }
    else {
      response.say("Not a valid ticker provided.").shouldEndSession(false);
    }
    //addStock(request.userId);
  }
);

skillService.intent('RemoveStockIntent', {
    "slots": {
      "numStocks":"AMAZON.NUMBER",
      "ticker":"LIST_OF_COMMON_STOCKS"
    },
    'utterances': ['remove {numStocks} {ticker}','remove {numStocks} dollars {ticker}','remove {numStocks} dollars of {ticker}']
  },
  function(request, response) {
    if(stockList.indexOf(request.slot("ticker"))!=-1) {
      var res = rp("POST","https://alexadvisor.herokuapp.com/subStocks",{json:{userId:request.userId, ticker:request.slot("ticker"), num: parseInt(request.slot("numStocks"))}});
      console.log(res);
      var stocks = Object.keys(port);
      if(stocks.indexOf(request.slot("ticker"))!=-1) {
          port[request.slot("ticker")]-=parseInt(request.slot("numStocks"));
          port[request.slot("ticker")] = port[request.slot("ticker")] > 0 ? port[request.slot("ticker")] : 0;
          if (port[request.slot("ticker")] == 0) {
              delete port[request.slot("ticker")];
          }
      }
      res = rp("PUT", esite+"portfolio/portfolio/"+request.userId, {json:kibanifyPortfolio(port)});
      response.say("Removed " + request.slot("numStocks") + " dollars of " + request.slot("ticker") + ".").shouldEndSession(false);
    }
    else {
      response.say("Not a valid ticker provided.").shouldEndSession(false);
    }
  }
);

skillService.intent('ListStockIntent', {
    "slots": {},
    'utterances': ['list my stocks']
  },
  function(request, response) {
    var says = "You have ";
    if (Object.keys(port).length == 0) {
      says+="0 stocks.";
    }
    else {
      for (var i in port) {
        says+=port[i] + " dollars of " + i + ",";
      }
    }
    response.say(says).shouldEndSession(false);
  }
);

skillService.intent('PortfolioInfoIntent', {
    "slots": {},
    'utterances': ['tell me about my portfolio']
  },
  function(request, response) {
    var strStocks = Object.keys(port).join(',');
    var ident = "";
    totMoney=0;
    for(var i in port) {
      totMoney+=parseInt(port[i]);
    }
    var totPercent = 0;
    for(var i in port) {
      var percent = Math.floor(100*(parseInt(port[i])/totMoney));
      ident+=i+"~"+percent+"|";
      totPercent+=percent;
    }
    if(totPercent < 100) {
      ident+="CASH-USD~"+Math.floor(100-totPercent)+"|";
    }
    var res = rp("GET","https://www.blackrock.com/tools/hackathon/portfolio-analysis",{qs:{positions:ident}});
    portAnalysis=JSON.parse(res.getBody('utf8'));
    //res = rp("PUT", esite+"portfolioanalysis/portfolioanalysis/"+request.userId, {json:portAnalysis});
    var says = "Your portfolio is ";
    console.log(portAnalysis["resultMap"]["PORTFOLIOS"]);
    var stuff = portAnalysis["resultMap"]["PORTFOLIOS"][0]["portfolios"][0]["returns"];
    var percentUp = Math.floor(100*((stuff["upMonths"]-stuff["downMonths"])/stuff["totalMonths"]));
    if(percentUp > 0) {
      says+="doing well so far. It closes upward "+percentUp+" percent more months than it closes down. Regardless, your two year Sharpe ratio indicates ";
    }
    else {
      says+="doing not so well so far. It closes downward "+(-percentUp)+" percent more months than it closes upward. Regardless, your two year Sharpe ratio indicates ";
    }
    if(stuff["monthEndPerf"]["twoYearSharpeRatio"] < 1) {
      says+="that you like to play on the wild side. Consider being a little more cautious.";
    }
    else {
      says+="that you are a responsible and cautious person. Keep doing what you're doing and I am sure you will do well in the future.";
    }
    response.say(says).shouldEndSession(false);
  }
);

skillService.intent('StocksInfoIntent', {
    "slots": {},
    'utterances': ['tell me about my stocks']
  },
  function(request, response) {
    var strStocks = Object.keys(port).join(',');
    var res = rp("GET","https://www.blackrock.com/tools/hackathon/performance",{qs:{identifiers:strStocks}});
    perform=JSON.parse(res.getBody('utf8'));
    //res = rp("PUT", esite+"stockanalysis/stockanalysis/"+request.userId, {json:perform});
    var says = "";
    var stuff = perform["resultMap"]["RETURNS"];
    for(var i in stuff) {
      var cur = stuff[i];
      var ticker = cur["ticker"];
      var percentUp = Math.floor(100*((cur["upMonths"]-cur["downMonths"])/cur["totalMonths"]));
      if(percentUp > 0) {
        says+=ticker+" has closed upward "+percentUp+" percent more months than it has closed down. It's Sharpe ratio indicates that ";
      }
      else {
        says+=ticker+" has closed downward "+(-percentUp)+" percent more months than it has closed upward. It's Sharpe ratio indicates that ";
      }
      if(cur["monthEndPerf"]["twoYearSharpeRatio"] < 1) {
        says+="it's not a great risk to reward. ";
      }
      else {
        says+="it's a great risk to reward. ";
      }
    }
    response.say(says).shouldEndSession(false);
  }
);

skillService.intent('WhatIntent', {
    "slots": {},
    'utterances': ['what should I do']
  },
  function(request, response) {
    var strStocks = Object.keys(port).join(',');
    var res = rp("GET","https://www.blackrock.com/tools/hackathon/performance",{qs:{identifiers:strStocks}});
    perform=JSON.parse(res.getBody('utf8'));
    var says = "";
    var stuff = perform["resultMap"]["RETURNS"];
    if(stuff.length < 3) {
      says = "You really aren't diversified enough for me to make a judgement about you. Please diversify your portfolio if you want to be a smart and safe investor.";
    }
    else {
      var worstTicker = stuff[0]["ticker"];
      var worstScore = Math.floor(100*((stuff[0]["upMonths"]-stuff[0]["downMonths"])/stuff[0]["totalMonths"]))+Math.floor(100*(stuff[0]["monthEndPerf"]["twoYearSharpeRatio"]-1));
      var bestTicker = stuff[0]["ticker"];
      var bestScore = Math.floor(100*((stuff[0]["upMonths"]-stuff[0]["downMonths"])/stuff[0]["totalMonths"]))+Math.floor(100*(stuff[0]["monthEndPerf"]["twoYearSharpeRatio"]-1));
      for(var i in stuff) {
        var cur = stuff[i];
        var ticker = cur["ticker"];
        var percentUp = Math.floor(100*((cur["upMonths"]-cur["downMonths"])/cur["totalMonths"]));
        var score = percentUp+Math.floor(100*(cur["monthEndPerf"]["twoYearSharpeRatio"]-1));
        if(score > bestScore) {
          bestScore = score;
          bestTicker = ticker;
        }
        else if(score < worstScore) {
          worstScore = score;
          worstTicker = ticker;
        }
      }
      says = "Your worst stock is " + worstTicker + " with a score of " + worstScore + " and your best stock is " + bestTicker + " with a score of " + bestScore + " determined by our proprietary algorithm. You should consider selling " + worstTicker + " for more of " + bestTicker + "."
    }
    response.say(says).shouldEndSession(false);
  }
);

skillService.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
  },
  function(request, response) {
    var helpOutput = 'To add stocks, for example say, "add 1000 dollars of AAPL". To remove stocks, for example say, "remove 1000 dollars of AAPL". To list your stocks, say "list my stocks". To get info about your portfolio, say "tell me about my portfolio". You can also say stop or exit to quit.';
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
