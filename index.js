'use strict';
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var lambda = new AWS.Lambda();
var dns = require ( 'dns' );

console.log('Loading function');

exports.handler = (event, context, callback) => {
  let website = event.company.website;
  extractWebsiteDomain(website, function(err, fullDomain) {
    if (typeof fullDomain !== null && fullDomain !== null) {
      checkAvailable(fullDomain, function(err, result) {
        if (err || result === null || typeof result == 'undefined' || result.length === 0) {
          console.log("URL didn't resolve");
          event.websiteDomainIsValid = false;
        } else {
          event.domainCheckResult = result;
          event.websiteDomainIsValid = true;
        }
        context.done(null, event);
      });
    } else {
      context.done();
    }
  });
};

function checkAvailable(url, done) {
  //uses the core modules to run an IPv4 resolver that returns 'err' on error
  dns.resolve(url, "A", function(err, result) {
      console.log("Error: ", err);
      console.log("Results: ", result);
      done(err, result);
  });
}

function extractWebsiteDomain(website, done) {
  var params = {
    FunctionName: 'extractWebsiteDomainAndTLD',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: '{"website" : ' + JSON.stringify(website) + '}'
  };

  lambda.invoke(params, function(err, data) {
    if (err) {
      console.log("Err: ", err);
      done(err, null);
    } else {
      let info = JSON.parse(data.Payload);
      done(err, info.fullDomain);
    }
  });
}
