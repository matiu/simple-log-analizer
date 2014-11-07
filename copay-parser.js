#!/usr/bin/env node

var nginxParser = require('nginxparser');
var program = require('commander');
var moment = require('moment');



program
  .version('0.0.1')
  .option('-p, --path <string>', 'Path / Method filter (contains)')
  .option('-g --group >', 'Group per date / day')
  .option('-d --debug >', 'Show debug')
  .parse(process.argv);

var main = function(program) {
  var config = {
    path: program.path,
    group: program.group,
    debug: program.debug,
  };
  var stats = {
    processed: 0,
    printed: 0,
    perDay: {},
  };

  var parser = new nginxParser('$remote_addr - $remote_user [$time_local] ' + '"$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"');

  console.log('Reading input from stdin...');
  process.stdin.setEncoding('utf8');

  parser.read('-', function(info) {
    processLine(config, info, stats);
  }, function(err) {
    if (err) throw err;
    console.log('\n\nSTATS:\n', stats); //TODO
  });

};

var processLine = function(c, info, stats) {
  if (!((++stats.processed) % 100000)) {
    console.log('\t' + stats.processed + ' lines processed');
  }

  if (c.path && info.request.indexOf(c.path) < 0)
    return;

  if (c.debug)
    console.log(info.request);

  if (c.group) {
    var str = info.time_local.substr(0,11);

    // Unneeded for now
    //var date = moment(str,'DD/MMM/YYYY');
    //console.log('[copay-parser.js.54:date:]', date.format('YYYY-MM-DD'));
    stats.perDay[str] = stats.perDay[str] || 0;
    stats.perDay[str]++;
  }



  stats.printed++;
};

main(program);
