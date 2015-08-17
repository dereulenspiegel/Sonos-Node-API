"use strict";
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

function throwSoapFault(code, rpcError, reason) {

  throw {
    Fault: {
      Code : {
        Value: code,
        Subcode: { value: rpcError }
      },
      Reason: { Text: reason }
    }
  };

}
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
        console.log("getMediaMetadata: args %j",args);
        if(args.id === "root"){
          return null;
        }
        var item = sourceManager.getItem(args.id);
        if(item === undefined || item === null || isItemCollection(item)){
          console.log("media item does not exist: %s", args.id);
          // FIXME Find out how to respond with errors
          //throwSoapFault("not found","rpc:BadArguments","The item does not exist");
          return null;
        }
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
        var item = sourceManager.getItem(args.id);
        var relatedBrowse = sourceManager.getItemRelatedBrowse(args.id);
        var relatedText = sourceManager.getItemRelatedText(args.id);
        var relatedPlay = sourceManager.getItemRelatedPlay(args.id);
        if(relatedBrowse !== null && relatedBrowse !== undefined ) {
          item["relatedBrowse"] = relatedBrowse;
        }
        if(relatedText !== null && relatedText !== undefined ) {
          item["relatedText"] = relatedText;
        }
        if(relatedPlay !== null && relatedPlay !== undefined ) {
          item["relatedPlay"] = relatedPlay;
        }

        var result = {
          getExtendedMetadataResult: {

          }
        };
        if(isItemCollection(item)){
          result.getExtendedMetadataResult["mediaCollection"] = item;
        } else {
          result.getExtendedMetadataResult["mediaMetadata"] = item;
        }
        return result;
      },

      getExtendedMetadataText: function(args) {
        var text = sourceManager.getText(args.id, args.type);
        return {
          getExtendedMetadataTextResult: text
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

module.exports.service = sonosService;
module.exports.setSourceManager = function(sm) {
  sourceManager = sm;
};