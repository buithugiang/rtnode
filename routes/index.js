
/*
 * GET home page.
 */
var request = require('request');
var cheerio = require('cheerio');
var uu = require('underscore');
var redis = require('redis');
client = redis.createClient();

module.exports = function(io) {
		var routes = {};
		const publish = redis.createClient()
		routes.index = function (req, res) {
		res.render('index', { title: 'Express' });
		var domain = 'http://www.chotot.vn/tp_hồ_chí_minh';
		var string = "";
		if (req.url == '/')
			request(domain, gotHTML);


		io.sockets.on('connection', function(socket) {
			console.log('connected');
			const subscribe = redis.createClient()
			subscribe.subscribe('realtime');
			subscribe.on("message", function(channel, message) {
					socket.emit('message', { channel: channel, data:  message });
			});
		});
	};
	function gotHTML(err, resp, html) {
		if (err) return console.error(err);
		var $ = cheerio.load(html);
		var nimgs = Array();
		var rimgs = Array();
		var multi = client.multi();
		multi.del('imgs')
			$('img').map(function (i,elem){
				var href = $(this).attr('data-original') || $(this).attr('src');
				if (!href.match('thumbs')) return;

				var parent = $(this).parents('a')[0]
				var detail = $(parent).attr('href');
			multi.hsetnx("imgs",href,detail)
				multi.hexists("rimgs",href,function(err,exists){
					if(exists!==1){
						nimgs.push(href);
					}else{
						rimgs.push(href);
					}
				})
			});
		multi.del('rimgs')
			multi.rename("imgs","rimgs")
			multi.exec(function(err){
				if (err) throw err;
				for(var t in nimgs){
					console.log(nimgs[t]);
				}
				console.log("+++++++++++++++++++++++++++++++++++");
				for(var t in rimgs){
					console.log(rimgs[t]);
				}
				publish.publish('realtime', JSON.stringify(nimgs));
			});
	}
	return routes;
};
