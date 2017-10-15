var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts:'https://search-alexadvisor-znt2yxmcn25y3yw5skwbjvhc4e.us-east-1.es.amazonaws.com'
});

client.indices.create({  
  index: 'portfolio'
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});
client.indices.create({  
  index: 'stockanalysis'
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});
client.indices.create({  
  index: 'portfolioanalysis'
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});
