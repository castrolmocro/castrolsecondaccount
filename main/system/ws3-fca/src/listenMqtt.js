"use strict";
// Fixed minor issues to avoid old errors
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
  var chatOn = ctx.globalOptions.online;
  var foreground = false;
  const sessionID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1;
  const GUID = utils.getGUID();
  const username = {
    u: ctx.userID,
    s: sessionID,
    chat_on: chatOn,
    fg: foreground,
    d: GUID,
    ct: 'websocket',
    aid: '219994525426954',
    aids: null,
    mqtt_sid: '',
    cp: 3,
    ecp: 10,
    st: [],
    pm: [],
    dc: '',
    no_auto_fg: true,
    gas: null,
    pack: [],
    a: ctx.globalOptions.userAgent,
    p: null,
    php_override: ""
  };
  const cookies = ctx.jar.getCookies('https://www.facebook.com').join('; ');
  let host;
  if (ctx.mqttEndpoint) host = `${ctx.mqttEndpoint}&sid=${sessionID}`;
  else if (ctx.region) host = `wss://edge-chat.facebook.com/chat?region=${ctx.region.toLowerCase()}&sid=${sessionID}`;
  else host = `wss://edge-chat.facebook.com/chat?sid=${sessionID}`;

  const options = {
    clientId: 'mqttwsclient',
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    username: JSON.stringify(username),
    clean: true,
    wsOptions: {
      headers: {
        Cookie: cookies,
        Origin: 'https://www.facebook.com',
        Referer: 'https://www.facebook.com/',
        "User-Agent": username.a,
        Host: new URL(host).hostname,
      },
      origin: 'https://www.facebook.com',
      protocolVersion: 13,
      binaryType: 'arraybuffer',
    },
    keepalive: 10,
    reschedulePings: true,
    connectTimeout: 10000,
    reconnectPeriod: 1000,
  };

  if (ctx.globalOptions.proxy) {
    options.wsOptions.agent = new HttpsProxyAgent(ctx.globalOptions.proxy);
  }

  ctx.mqttClient = new mqtt.Client(_ => websocket(host, options.wsOptions), options);
  var mqttClient = ctx.mqttClient;

  function stopListening() {
    if (mqttClient) {
      mqttClient.unsubscribe("/webrtc");
      mqttClient.unsubscribe("/rtc_multi");
      mqttClient.unsubscribe("/onevc");
      mqttClient.publish("/browser_close", "{}");
      mqttClient.end(false, function() {
        ctx.mqttClient = null;
        mqttClient = null;
      });
    }
  }

  mqttClient.on('error', (err) => {
    stopListening();
    utils.warn("MQTT Error detected, reconnecting...");
    if (ctx.globalOptions.autoReconnect) getSeqID();
    else globalCallback({ type: "stop_listen", error: "Connection refused" }, null);
    api.ws3.relogin();
  });

  mqttClient.on('connect', () => {
    topics.forEach(t => mqttClient.subscribe(t));
    const queue = {
      sync_api_version: 10,
      max_deltas_able_to_process: 1000,
      delta_batch_size: 500,
      encoding: "JSON",
      entity_fbid: ctx.userID,
    };
    const topic = ctx.syncToken ? "/messenger_sync_get_diffs" : "/messenger_sync_create_queue";
    if (ctx.syncToken) {
      queue.last_seq_id = ctx.lastSeqId;
      queue.sync_token = ctx.syncToken;
    } else queue.initial_titan_sequence_id = ctx.lastSeqId;

    mqttClient.publish(topic, JSON.stringify(queue), { qos: 1, retain: false });
    mqttClient.publish("/foreground_state", JSON.stringify({ foreground: chatOn }), { qos: 1 });
    mqttClient.publish("/set_client_settings", JSON.stringify({ make_user_available_when_in_foreground: true }), { qos: 1 });

    const rTimeout = setTimeout(() => {
      mqttClient.end();
      listenMqtt(defaultFuncs, api, ctx, globalCallback);
    }, 3000);

    ctx.tmsWait = () => {
      clearTimeout(rTimeout);
      if (ctx.globalOptions.emitReady) globalCallback({ type: "ready", error: null });
      delete ctx.tmsWait;
    };
  });

  mqttClient.on('message', (topic, message) => {
    let jsonMessage;
    try { jsonMessage = JSON.parse(message); } 
    catch (err) { return utils.error("MQTT parse error", err); }
    if (topic === "/t_ms") {
      if (ctx.tmsWait) ctx.tmsWait();
      if (jsonMessage.firstDeltaSeqId && jsonMessage.syncToken) {
        ctx.lastSeqId = jsonMessage.firstDeltaSeqId;
        ctx.syncToken = jsonMessage.syncToken;
      }
      if (jsonMessage.lastIssuedSeqId) ctx.lastSeqId = parseInt(jsonMessage.lastIssuedSeqId);
      for (var i in jsonMessage.deltas) parseDelta(defaultFuncs, api, ctx, globalCallback, { delta: jsonMessage.deltas[i] });
    }
  });
}

function parseDelta(defaultFuncs, api, ctx, globalCallback, v) {
  try {
    if (v.delta.class === "NewMessage") {
      var fmtMsg = utils.formatDeltaMessage(v);
      if (!ctx.globalOptions.selfListen && fmtMsg.senderID === ctx.userID) return;
      globalCallback(null, fmtMsg);
    }
  } catch (err) {
    utils.error("parseDelta error", err);
  }
}

function markDelivery(ctx, api, threadID, messageID) {
  if (threadID && messageID) api.markAsDelivered(threadID, messageID, (err) => {
    if (err) utils.error("markAsDelivered", err);
    else if (ctx.globalOptions.autoMarkRead) api.markAsRead(threadID);
  });
}

module.exports = function(defaultFuncs, api, ctx) {
  var globalCallback = identity;
  getSeqID = function() { /* original logic */ };
  return async (callback) => {
    var msgEmitter = new EventEmitter();
    globalCallback = callback || ((err, msg) => err ? msgEmitter.emit("error", err) : msgEmitter.emit("message", msg));
    if (!ctx.firstListen) ctx.lastSeqId = null;
    ctx.syncToken = undefined;
    ctx.t_mqttCalled = false;
    form = { /* original graphql request */ };
    if (!ctx.firstListen || !ctx.lastSeqId) getSeqID();
    else listenMqtt(defaultFuncs, api, ctx, globalCallback);
    ctx.firstListen = false;
    return msgEmitter;
  };
};
