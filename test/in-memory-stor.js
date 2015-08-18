"use strict";
var rootLevelItems = [
{
  id: "streams",
  title: "All streams",
  itemType: "streamList",
  displayType: "Unknown",
  summary: "Contains test stream definitions",
  canPlay: false,
  canEnumerate: true,
  canAddToFavorites: false,

}
];

var streamChilds = [
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

var streamingRelatedBrowse = [
  {
    parentId: "2",
    item: {
      id:"2related",
      type: "RELATED_ARTISTS"
    }
  },
  {
    parentId: "1",
    item: {
      id: "1related",
      type: "RELATED_SHOW"
    }
  }
];

var streamingRelatedText = [
  {
    parentId: "1",
    item: {
      id: "1text",
      type: "ARTIST_BIO"
    }
  }
];

var lastUpdate = 0;

var inMemoryStor = {
  getLastUpdate: function() {
    return lastUpdate;
  },

  getPollInterval: function() {
    return 5;
  },

  getSessionId: function() {
    return "static-session-id";
  },

  getItemCount: function(id){
    if(id === "root"){
      return rootLevelItems.length;
    }
    if(id === "streams"){
      return streamChilds.length;
    }
    return -1;
  },

  getItems: function(id, index, count, recursive) {
    if(id === "root" && index === 0 ){
      return rootLevelItems;
    }
    if(id === "streams"){
      return streamChilds;
    }
    return null;
  },

  getItem: function(id) {
    if(id === "streams"){
      return rootLevelItems[0];
    }
    for(var x in streamChilds){
      var item = streamChilds[x];
      if(item.id === id){
        return item;
      }
    }
    return null;
  },
  getText: function(id, type){
    if(id === "1text" && type === "ARTIST_BIO") {
      return "Test text";
    }
    return null;
  },
  getMediaUri: function (id, action, secondsSinceExplicit){

  },
  getItemRelatedBrowse: function(id){
    for(var x in streamingRelatedBrowse){
      if(id === streamingRelatedBrowse[x].parentId){
        return [ streamingRelatedBrowse[x].item ];
      }
    }

  },
  getItemRelatedText: function(id){
    for(var x in streamingRelatedText){
      if(id === streamingRelatedText[x].parentId){
        return [ streamingRelatedText[x].item ];
      }
    }
  },
  getItemRelatedPlay: function(id) {
    if(id === "1"){
      return [
      {
        id: "play1",
        type: "stream",
        title:"DBB Radio",
        canPlay: true
      }
      ];
    }
    return null;
  }
};

module.exports = inMemoryStor;