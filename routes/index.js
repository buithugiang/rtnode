
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
		var chn = "";
	var publish = redis.createClient()
	routes.index = function (req, res) {
		res.render('index', { title: 'Express' });
		var domain = 'http://www.chotot.vn/tp_hồ_chí_minh';
		var string = "";
		if (req.url == '/'){
			setInterval(function(){request(domain, gotHTML)},20000);
			if (!req.cookies.id)
				req.cookies.id = new Date().getTime();
			chn = req.cookies.id;
		}
	};
	io.sockets.on('connection', function(socket) {
		console.log('connected');
		const subscribe = redis.createClient()
		subscribe.subscribe('realtime');
		subscribe.on("message", function(channel, message) {
				socket.emit('message', { channel: channel, data:  message });
		});
	});
	function gotHTML(err, resp, html) {
		if (err) return console.error(err);
		var $ = cheerio.load(html);
		var nimgs = Array();
		var rimgs = Array();
		var multi = client.multi();
		multi.del('imgs')
			$('img').map(function (i,elem){
				var href = $(this).attr('data-original') || $(this).attr('src');
				if (!href.match('mob_240')) return;
				var parent = $(this).parents('a')[0]
				var detail = $(parent).attr('href');
			multi.hsetnx("imgs",href,detail)
				multi.hexists("rimgs",href,function(err,exists){
					if(exists!==1){
						var obj = {};
						obj.hash=require('crypto').createHash('sha1').update(href).digest('base64');
						obj.href = href;
						obj.detail = detail;
						nimgs.push(obj);
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
				if (nimgs.length > 0)
					publish.publish('realtime', JSON.stringify(nimgs));
			});
	}
	return routes;
};
