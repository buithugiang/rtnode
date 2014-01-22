$(document).ready(function() {
	var socket = io.connect('http://ec2-54-213-84-121.us-west-2.compute.amazonaws.com:8080');
	socket.on('message', function(message){
		console.log(message);
	}) ;
});
function NewAdsCtrl($scope)  {
	$scope.links = {};

	$scope.addItem = function(item) {
		$scope.links.push(item);
		$scope.item = {};
	}
}

