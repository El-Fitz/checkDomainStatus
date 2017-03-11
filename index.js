'use strict';
var dns = require ( 'dns' )

console.log('Loading function');

exports.handler = (event, context, callback) => {
  let website = event.company.website;
  extractWebsiteDomain(website, function(err, fullDomain) {
    if (typeof fullDomain !== null && fullDomain !== null) {
      checkAvailable(website, function(err, addresses) {
        if (err || addresses === null || typeof addresses == 'undefined' || addresses.length === 0) {
          console.log("URL didn't resolve");
          event.websiteDomainIsValid = false;
        } else {
          event.domainARecords = addresses;
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
  dns.resolve4(url, function(err, addresses) {
      done(err, addresses);
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
