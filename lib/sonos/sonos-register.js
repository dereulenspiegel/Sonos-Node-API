"use strict";
var http = require('http');
var querystring = require('querystring');
var sonos = require('sonos');
var ip = require('ip');


module.export = {
	register: function() {
		_findFirstSonosAndExecute(function(device,model){
			console.log('Registering service on device with ip ' + device.host);
			var deviceHost = device.host;
			var localIp = ip.address();
			var service = {
				sid = '255',
				uri = 'http://' + localIp + ':8080/sonos',
			}

			_registerService(service, deviceHost); 
		});
	},

	unregister: function() {
		_findFirstSonosAndExecute(function(device,model){
			var deviceHost = device.host;
			_unregisterService(deviceHost);
		});
	}

	_findFirstSonosAndExecute: function(method){
		var firstDevice = null;
		sonos.search(function(device,model){
			if (model === 'BR100' || model === 'ANVIL') {
				return;
			}
			if(firstDevice !== null) {
				return;
			}
			firstDevice = device;
			method(device,model);
		}
	},

	_registerService: function(service, sonosIp){

		var postData = querystring.stringify({
			sid: service.sid,
			name: "PulseSonos",
			uri: service.uri,
			secureUri: service.secureUri || service.uri,
			pollInterval: 120,
			authType: "Anonymous",
			search: false,
			trFavorites: false,
			alFavorites: false,
			ucPlaylists: false,
			logging: false,
			playbackLogging: false,
			accountLogging: false,
			extendedMD: false,
			disableAlarms: true,
			noMultiAccount: true,
			mediaUriActions: false,
			stringsVersion: "",
			presentationMapVersion: "",
			MService: false,
			SoundLab: true
		});
		_postToSonos(postData,sonosIp);
	},

	_unregisterService: function(sonosIp) {
		var postData = querystring.stringify({
			sid: '255'
			uri: ''
		});
		_postToSonos(postData,sonosIp);
	},

	_postToSonos: function(postData, sonosIp){
		var request = http.request({
			host: sonosIp,
			port: 1400,
			path: '/customsd',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		}, function(res){

		});

		request.on('error', function(error){
			console.log('Error while (un)registering custom Music Service: %j', error);
		});

		request.write(service);
		request.end();
	}
}