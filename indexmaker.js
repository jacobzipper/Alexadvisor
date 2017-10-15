var rp = require("sync-request");
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'https://search-alexadvisor-znt2yxmcn25y3yw5skwbjvhc4e.us-east-1.es.amazonaws.com',
  log: 'trace'
});
var res = rp("POST","https://alexadvisor.herokuapp.com/init",{json:{userId:"amzn1.ask.account.AHRTQRZJKB7I27DDPNIDPN2YSELEQERJAT4IH6IKJBTP34SFTYUF6XTYSSXZYWCKJGO6SA2LOBGDVMXTXA6AKTQAZY6D76SO6ZA2QDZNXP3TT7VNSU42KRX47JEMD7DG5GRI7RXP6SASTR2XRH6R7B67I42TKFJ3R3UYPX4RLTKEDXAFGTKQPUWIAQFUK256SVV7L3O3XLO7YPQ"}});
port = JSON.parse(res.getBody('utf8'))["port"];
var res = client.index({index:"portfolio",id:"amzn1.ask.account.AHRTQRZJKB7I27DDPNIDPN2YSELEQERJAT4IH6IKJBTP34SFTYUF6XTYSSXZYWCKJGO6SA2LOBGDVMXTXA6AKTQAZY6D76SO6ZA2QDZNXP3TT7VNSU42KRX47JEMD7DG5GRI7RXP6SASTR2XRH6R7B67I42TKFJ3R3UYPX4RLTKEDXAFGTKQPUWIAQFUK256SVV7L3O3XLO7YPQ",type:"portfolio",body:port});
console.log(res);