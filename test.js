"use strict";

var sonosService = require("./lib/sonos/sonos-service.js");

var mediaItems = [
  {
    id: "1",
    title: "test-items",
    mimeType: "mpeg3",
    itemType: "stream",
    streamMetadata: {
      currentShowId: "show-id",
      currentShow: "currentshow",
      secondsRemaining: 0,
      secondsToNextShow: 0,
      hasOutOfBandMetadata: false,
      description: "cool uberstream",
      isEphemeral: true
    }
  },

  {
    id: "2",
    title: "another est-items",
    mimeType: "mpeg3",
    itemType: "stream",
    streamMetadata: {
      currentShowId: "show-id2",
      currentShow: "nextshow",
      secondsRemaining: 0,
      secondsToNextShow: 0,
      hasOutOfBandMetadata: false,
      description: "cool uberstream2",
      isEphemeral: true
    }
  }
];

var sourceManager = {
  getLastUpdate: function() {
    return 1;
  },

  getItemCount: function(id){
    return mediaItems.length;
  },

  getItems: function(id, index, count, recursive) {
    if(id === "root" && index===0 ){
      return mediaItems;
    } else {
      console.log("Inavlid id or range id %s, index %d, count %d",id, index, count);
    }
  },

  getItem: function(id) {
    for(var x in mediaItems){
      var item = mediaItems[x];
      if(item.id === id){
        return item;
      }
    }
    return null;
  },
  getText: function(id, type){

  },
  getMediaUri: function (id, action, secondsSinceExplicit){

  },
  getItemRelatedBrowse: function(id){

  },
  getItemRelatedText: function(id){

  },
  getItemRelatedPlay: function(id) {

  }
};

console.log("Setting storage bacend");

sonosService.setStorageManager(sourceManager);
console.log("Starting sonos service");
sonosService.start();

