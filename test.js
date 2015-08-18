"use strict";

var sonosService = require("./lib/sonos/sonos-service.js");
var sourceManager = require("./test/in-memory-stor.js");

console.log("Setting storage bacend");

sonosService.setStorageManager(sourceManager);
console.log("Starting sonos service");
sonosService.start();

