"use strict";
var soap = require("soap");
var fs = require("fs");
var http = require("http");
var sourceManager = undefined;

var mediaItemTypes = [
	"track",
	"stream",
	"show",
	"other"
];

var collectionItemTypes = [
	"artist",
	"album",
	"genre",
	"playlist",
	"search",
	"program",
	"favorites",
	"favorite",
	"collection",
	"container",
	"albumList",
	"trackList",
	"streamList",
	"artistTrackList",
	"other"
];

var mediaActions = [
	"IMPLICIT",
	"EXPLICIT:PLAY",
	"EXPLICIT:SEEK",
	"EXPLICIT:SKIP_FORWARD",
	"EXPLICIT:SKIP_BACK"
];

function limitStringSize(input, maxSize) {
	if(input.length > maxSize){
		return input.substring(0,maxSize);
	}
	return input;
}

function sanitizeId(item) {
	if(!item.hasOwnProperty("id")){
		// throw some kind of error
		return false;
	}
	item.id = limitStringSize(item.id,128);
	return item;
}

function sanitizeTitle(item) {
	if(!item.hasOwnProperty("title")){
		// throw some kind of error
		return false;
	}
	item.title = limitStringSize(item.title,64);
	return item;
}

function dontSanitize(item){
	return item;
}

var mediaItemProperties = [
	["id", sanitizeId],
	["title", sanitizeTitle],
	["mimeType", dontSanitize],
	["itemType", dontSanitize],
	["displayType", dontSanitize],
	["summary", dontSanitize],
	["trackMetadata", dontSanitize],
	["streamMetadata", dontSanitize]
];

function sanitizeMediaMetadata(item) {
	mediaItemProperties.map(function(value){
		value[1](item);
	});
}

function isItemCollection(item) {
	if(item.hasOwnProperty("streamMetadata") || item.hasOwnProperty("trackMetadata")){
		return false;
	}
	return true;
}

var sonosService = {
	Sonos: {
		SonosSoap: {

			search: function(args){
				sourceManager.search(args.id, args.term, args.index, args.count);
				// TODO split the items to colections and metadata, sanitize and add to result
				return {
					searchResponse: {
						searchResult: {
							mediaCollection: [],
							mediaMetadata: []
						}
					}
				};
			},

			getSessionId: function(args) {
				console.log("SMAPI: getSessionId %j",args);
				return {
					getSessionIdResult: "a-unique-id"
				};
			},

			getMetadata: function(args) {
				console.log("SMAPI: getMetadata %j", args);
				var mediaItems = sourceManager.getItems(args.id, args.index, args.count, args.recursive);
				var totalCount = sourceManager.getItemCount(args.id);
				var mediaMetadata = [];
				var collections = [];

				for(var x in mediaItems) {
					var item = mediaItems[x];
					if(isItemCollection(item)){
						collections.push(item);
					} else {
						sanitizeMediaMetadata(item);
						mediaMetadata.push(item);
					}
				}
				return {
					getMetadataResult: {
						index: limitStringSize(args.index,128),
						count: mediaItems.length,
						total: totalCount,
						mediaMetadata: mediaMetadata,
						mediaCollection: collections
					}
				};
			},

			getMediaMetadata: function(args){
				var item = sourceManager.getItem(args.id);
				console.log("SMAPI: getMediaMetadata %j", args);
				sanitizeMediaMetadata(item);
				return {
					getMediaMetadataResult: item
				};
			},

			getMediaURI: function(args) {
				var mediaUri = sourceManager.getMediaUri(args.id, args.action,args.secondsSinceExplicit);
				return {
					getMediaURIResult: mediaUri
				};
			},

			getExtendedMetadata: function(args) {
				var extendedMetadata = sourceManager.getExtendedMetadata(args.id);
				// TODO differntiate between collection and media
				return {
					getExtendedMetadataTextResult: {
						mediaMetadata: extendedMetadata,
						mediaCollection: extendedMetadata
					}
				};
			},

			getStreamingMetadata: function(args) {
				console.log("SMAPI: getStreamingMetadata %j", args);
				return {
					getStreamingMetadataResult: {
						segmentMetadata: [
							{
								id: "a-unique-id",
								trackId: "a-unique-id",
								track: "PulseSonos",
								artistId: "1",
								artist: "PulseSonos Server",
								showId: "a-unique-id",
								show: "PulseSonos Audio Stream",
								episodeId: "a-unique-id",
								episode: "PulseSonos Audio Stream",
								albumArtURI: "TODO We need an asset URI",
								startTime: "TODO Insert server start time",
								duration:0
							}
						]
					}
				};
			},

			getLastUpdate: function(args){
				console.log("SMAPI: getLastUpdate %j", args);
				return {
					getLastUpdateResult: {
						favorites: sourceManager.getLastUpdate(),
						catalog: sourceManager.getLastUpdate()
					}
				};
			}

		}
	}
};

module.exports = {

	MEDIA_ACTIONS: mediaActions,

	start: function(){
		console.log("Starting Sonos service");
		var sonosWSDL = fs.readFileSync("./lib/sonos/Sonos.wsdl", "utf8");
		var server = http.createServer(function(request,response){
			//console.log("HTTP: received request: %j",request);
			response.end("404: Not Found: "+request.url);
		});

		server.listen(8080);
		soap.listen(server,"/sonos",sonosService,sonosWSDL);
		server.log = function(data, type){
			console.log("Data: " + data + "\n" + "Type: " + type);
		};
	},

	setStorageManager: function(manager){
		// TODO probably signal this somehow?
		sourceManager = manager;
	}
};