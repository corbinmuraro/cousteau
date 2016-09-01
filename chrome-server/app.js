var config = require('./config');

var MsTranslator = require('mstranslator');
// Second parameter to constructor (true) indicates that
// the token should be auto-generated.
var client = new MsTranslator({
  client_id: config.client_id,
  client_secret: config.client_secret
}, true);

// var params = {
//   text: 'How are you?',
//   from: 'en',
//   to: 'zh-CHS'
// };

// Don't worry about access token, it will be auto-generated if needed.
// client.translate(params, function(err, data) {
//   console.log(data);
// });

var io = require('socket.io').listen(8888);

io.sockets.on('connection', function(socket) {

	socket.on('pre-translate', function(data) {

		console.log(data.value + "  " + data.from + "  " + data.to);

		var params = {
			text: data.value,
			from: data.from,
			to: data.to
		};

		var translatedText = "";

		client.translate(params, function(err, data) {
			console.log(data);

			socket.emit('post-translate', {
	    		value: data
	   		});
		});
	});
});