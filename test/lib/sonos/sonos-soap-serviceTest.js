"use strict";
var assert = require("assert");
var soapService = require("../../../lib/sonos/sonos-soap-service.js").service;
var inMemoryStor = require("../../in-memory-stor.js");

require("../../../lib/sonos/sonos-soap-service.js").setSourceManager(inMemoryStor);


suite("Soap service object methods", function(){
  test("Metadata is returned correctly for root", function () {
    var args = {
      id: "root",
      index: 0,
      count: 0,
      recursive: false
    };
    var rootLevelItems = soapService.Sonos.SonosSoap.getMetadata(args);
    assert.equal(1, rootLevelItems.getMetadataResult.count);
    assert.equal(rootLevelItems.getMetadataResult.count, (rootLevelItems.getMetadataResult.mediaMetadata.length + rootLevelItems.getMetadataResult.mediaCollection.length));
  });

  test("Get single media item", function() {
    var args = {
      id: "1"
    };
    var firstStreamItem = soapService.Sonos.SonosSoap.getMediaMetadata(args);
    assert.notEqual(undefined,firstStreamItem);
  });

  test("Root can't be queried via getMediaMetadata", function(){
    var args = {
      id: "root"
    };
    var item = soapService.Sonos.SonosSoap.getMediaMetadata(args);
    assert.equal(null, item);
  });

  test("Collections can't be queried via getMediaMetadata", function(){
    var args = {
      id: "streams"
    };
    var item = soapService.Sonos.SonosSoap.getMediaMetadata(args);
    assert.equal(null, item);
  });

  test("getExtendedMetadat", function(){
    var args = {
      id: "1"
    };
    var item = soapService.Sonos.SonosSoap.getExtendedMetadata(args);
    console.log("Item %j", item);
    assert.equal(1,item.getExtendedMetadataResult.relatedBrowse.length);
    assert.equal(1,item.getExtendedMetadataResult.relatedText.length);
    assert.equal(1,item.getExtendedMetadataResult.relatedPlay.length);
  });

  test("getLastUpdate return specific value", function(){
    var item = soapService.Sonos.SonosSoap.getLastUpdate();
    assert.equal(0,item.getLastUpdateResult.catalog);
    assert.equal(0,item.getLastUpdateResult.favorites);   
  });

  test("getExtendedMetadataText", function() {
    var args = {
      id: "1text",
      type: "ARTIST_BIO"
    };

    var item = soapService.Sonos.SonosSoap.getExtendedMetadataText(args);
    assert.equal("Test text", item.getExtendedMetadataTextResult);
  });

  test("getSessionId always returns the correct structure", function(){
    var item = soapService.Sonos.SonosSoap.getSessionId();
    assert.equal("static-session-id", item.getSessionIdResult);
  });
});