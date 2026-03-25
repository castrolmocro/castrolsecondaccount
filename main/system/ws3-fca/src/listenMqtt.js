"use strict";

var utils = require("../utils");
var mqtt = require('mqtt');
var websocket = require('websocket-stream');
var HttpsProxyAgent = require('https-proxy-agent');
const EventEmitter = require('events');

var identity = () => {};
var form = {};
var getSeqID = () => {};

var topics = [
  "/legacy_web",
  "/webrtc",
  "/rtc_multi",
  "/onevc",
  "/br_sr",
  "/sr_res",
  "/t_ms",
  "/thread_typing",
  "/orca_typing_notifications",
  "/notify_disconnect",
  "/orca_presence",
  "/inbox",
  "/mercury",
  "/messaging_events",
  "/orca_message_notifications",
  "/pp",
  "/webrtc_response",
];

function listenMqtt(defaultFuncs, api, ctx, globalCallback) {

  const sessionID = Math.floor(Math.random() * 999999999);
  const GUID = utils.getGUID();

  const username = {
    u: ctx.userID,
    s: sessionID,
    chat_on: true,
    fg: false,
    d: GUID,
    ct: 'websocket',
    aid: '219994525426954',
    mqtt_sid: '',
    cp: 3,
    ecp: 10,
    st: [],
    pm: [],
    dc: '',
    no_auto_fg: true,
    a: ctx.globalOptions.userAgent
  };

  const cookies = ctx.jar.getCookies('https://www.facebook.com').join('; ');

  const host = `wss://edge-chat.facebook.com/chat?sid=${sessionID}`;

  const options = {
    clientId: 'mqttwsclient',
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    username: JSON.stringify(username),
    clean: true,
    keepalive: 60,
    reconnectPeriod: 3000,
    connectTimeout: 20000,
    wsOptions: {
      headers: {
        Cookie: cookies,
        Origin: 'https://www.facebook.com',
        Referer: 'https://www.facebook.com/',
        "User-Agent": ctx.globalOptions.userAgent,
      }
    }
  };

  if (ctx.globalOptions.proxy) {
    options.wsOptions.agent = new HttpsProxyAgent(ctx.globalOptions.proxy);
  }

  ctx.mqttClient = new mqtt.Client(_ => websocket(host, options.wsOptions), options);
  const mqttClient = ctx.mqttClient;

  function reconnect() {
    console.log("🔄 Reconnecting MQTT...");
    setTimeout(() => {
      listenMqtt(defaultFuncs, api, ctx, globalCallback);
    }, 5000);
  }

  mqttClient.on('connect', () => {
    console.log("✅ MQTT Connected");

    topics.forEach(t => mqttClient.subscribe(t));

    const queue = {
      sync_api_version: 10,
      max_deltas_able_to_process: 1000,
      delta_batch_size: 500,
      encoding: "JSON",
      entity_fbid: ctx.userID
    };

    mqttClient.publish("/messenger_sync_create_queue", JSON.stringify(queue), { qos: 1 });

    mqttClient.publish("/foreground_state", JSON.stringify({ foreground: true }), { qos: 1 });
  });

  mqttClient.on('message', (topic, message) => {
    let json;
    try {
      json = JSON.parse(message);
    } catch {
      return;
    }

    if (topic === "/t_ms") {
      if (json.deltas) {
        json.deltas.forEach(delta => {
          parseDelta(defaultFuncs, api, ctx, globalCallback, { delta });
        });
      }
    }
  });

  mqttClient.on('error', (err) => {
    console.log("❌ MQTT Error:", err.message);
    mqttClient.end();
    reconnect();
  });

  mqttClient.on('close', () => {
    console.log("⚠️ MQTT Closed");
    reconnect();
  });

  mqttClient.on('offline', () => {
    console.log("📴 MQTT Offline");
    reconnect();
  });
}

function parseDelta(defaultFuncs, api, ctx, globalCallback, v) {
  if (v.delta.class === "NewMessage") {
    let msg;
    try {
      msg = utils.formatDeltaMessage(v);
    } catch {
      return;
    }

    if (!msg) return;

    return globalCallback(null, msg);
  }
}

module.exports = function(defaultFuncs, api, ctx) {
  var globalCallback = identity;

  getSeqID = function () {
    defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then((resData) => {

        if (!resData[0].o0.data.viewer.message_threads.sync_sequence_id) {
          throw new Error("No SeqID");
        }

        ctx.lastSeqId = resData[0].o0.data.viewer.message_threads.sync_sequence_id;

        listenMqtt(defaultFuncs, api, ctx, globalCallback);
      })
      .catch((err) => {
        console.log("❌ getSeqID Error:", err);
      });
  };

  return async (callback) => {

    var emitter = new EventEmitter();

    globalCallback = (callback || function (err, msg) {
      if (err) return emitter.emit("error", err);
      emitter.emit("message", msg);
    });

    form = {
      "av": ctx.globalOptions.pageID,
      "queries": JSON.stringify({
        "o0": {
          "doc_id": "3336396659757871",
          "query_params": {
            "limit": 1,
            "tags": ["INBOX"],
            "includeSeqID": true
          }
        }
      })
    };

    getSeqID();

    return emitter;
  };
};
