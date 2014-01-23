var newAds = angular.module('newAds', []);
newAds.factory('socket', function ($rootScope) {
	var socket = io.connect('http://ec2-54-213-84-121.us-west-2.compute.amazonaws.com:8080');
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
	emit: function (eventName, data, callback) {
		socket.emit(eventName, data, function () {
			var args = arguments;
			$rootScope.$apply(function () {
				if (callback) {
					callback.apply(socket, args);
				}
			});
		})
	}
	};
});
newAds.controller('NewAdsCtrl', function NewAdsCtrl($scope, socket) {
	$scope.links = [];
	socket.on('message', function(message){
		var dts = JSON.parse(message.data);
		for (item in dts){
			$scope.links.unshift(dts[item]);
			sleep(200);
		}
	});
});
function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}
