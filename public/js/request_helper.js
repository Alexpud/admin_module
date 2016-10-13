var http = require('http');
var request = function()
{
  this.make_request = function (type,address, port, path, parameter)
  {
    var options =
    {
      host: address,
      port: port,
      path: path + '/' + parameter,
      method: type
    };

    var req = http.request(options, function (res)
    {
      res.setEncoding('utf8');
      res.on('data', function (chunk)
      {
        console.log(chunk);
      });
    });
    req.end();
  };
};

module.exports = request;
