"use strict";
var soap = require("soap");
var fs = require("fs");
var http = require("http");
var sonosService = require("./sonos-soap-service.js").service;

module.exports = {

	start: function(opts, httpServer){
		var options = opts || {
			url: "/sonos",
			port: 8080
		};

		console.log("Starting Sonos service");
		var sonosWSDL = fs.readFileSync("./lib/sonos/Sonos.wsdl", "utf8");
		var server = httpServer || http.createServer(function(request,response){
			//console.log("HTTP: received request: %j",request);
			response.end("404: Not Found: "+request.url);
		});
		server.listen(options.port);
		soap.listen(server,options.url,sonosService,sonosWSDL);
		soap.log = function(data, type){
			console.log("Data: " + data + "\n" + "Type: " + type);
		};
	},

	setStorageManager: function(manager){
		// TODO probably signal this somehow?
		require("./sonos-soap-service.js").setSourceManager(manager);
	}
};