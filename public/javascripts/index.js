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
newAds.directive('ngList', function() {
	return function(scope, element, attrs) {
		var toUpdate = [];
		var startIndex = -1;

		scope.$watch('links', function(value){
			toUpdate = _.map(value, function(ob){return ob;});
			console.log(toUpdate);
		},true);
		$(element[0]).sortable({
			items:'div',
			start:function (event, ui) {
				startIndex = ($(ui.item).index());
			},
			stop:function (event, ui) {
				var newIndex = ($(ui.item).index());
				var toMove = toUpdate[startIndex];
				toUpdate.splice(startIndex,1);
				toUpdate.splice(newIndex,0,toMove);
				scope.$apply(scope.links);
			},
			axis: 'x'
		})
	}
}); 
newAds.controller('NewAdsCtrl', function NewAdsCtrl($scope, socket) {
	var toUpdate = [];
	$scope.links = [];
	$scope.$watch('links', function(value){
			toUpdate = value;
		},true);
	socket.on('message', function(message){
		var dts = JSON.parse(message.data);
		var i=0;
		for (var item=dts.length-1; item>=0; item--){
			var link = new Object();
			link.url = dts[item].href;
			i++;
			$scope.links.unshift(link);
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
function arr_diff(a1, a2)
{
	  var a=[];
		  for(var i=0;i<a1.length;i++){
				if (a1[i] != a2[i]){ 	
					a.push(a1[i]);
					a.push(a2[i]);
				}
			}
					  return a;
}
