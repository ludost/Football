//Server setup:
const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const WebSocket = require('ws');

let port = normalizePort(process.env.PORT || '3000');
let app = express()
app.use(cors())
const http = require('http')
const server = http.createServer(app)
server.listen(port);
app.set('port', port);
server.on('error', onError);
server.on('listening', onListening);
let wss = new WebSocket.Server({server})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../dist')))


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('API server, listening on ' + bind);
}

//Incoming message handling: Eventbus for routing event messages
const outBus = {}
const incomingEventBus = new EventTarget()
class CustomEvent extends Event {
  constructor (message, data) {
    super(message, data)
    this.detail = data.detail
  }
}
require('./viewersHandler.js')(incomingEventBus,outBus)
outBus.sendEventToClient = function (client, topic, params){
  return outBus.sendToClient(client, JSON.stringify({ type:"event", topic: topic, params: params }))
}
outBus.sendEventToId = function (id, topic, params){
  return outBus.sendToId(id, JSON.stringify({ type:"event", topic: topic, params: params }))
}
outBus.sendToClient = function (client, message){
  if (client.readyState === WebSocket.OPEN) {
    console.log("Sending message:" + message)
    client.send(message)
    return Promise.resolve()
  } else {
    return Promise.reject("Client not ready!")
  }
}
outBus.sendToId = function (id, message){
  return new Promise((resolve, reject) => {
    outBus.getClientById(id).then(
      (client) => {
        outBus.sendToClient(client, message).then(()=>resolve()).catch((error)=>reject(error))
      }
    ).catch (
      (error) => reject(error)
    )
  })
}
outBus.broadcast = function (message) {
  let promises = []
  wss.clients.forEach(function each(client) {
     promises.push(outBus.sendToClient(client,message))
  })
  return Promise.all(promises)
}
outBus.getClientById = function (id){
  return new Promise((resolve, reject) => {
    wss.clients.forEach(function each (client) {
      if (client.wsid == id) {
        resolve(client)
      }
    })
    reject("Client not found!")
  })
}
//Websocket handling
wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

// Handle Websocket requests
wss.on('connection', function connection(ws) {
  ws.wsid = wss.getUniqueID();
  ws.on('message', function incoming(message) {
    // read msg
    // validate and parse the msg // add try cathc block
    try {
      let msg = JSON.parse(message)
      console.log("incoming msg on the client_ws:", msg)
      if (msg.type === "event"){
        let incomingEvent = new CustomEvent(msg.topic, { detail: { wsid:ws.wsid, params:msg.params }});
        incomingEventBus.dispatchEvent(incomingEvent)
      } else{
        console.error("Unknown Json method")
      }
    }
    catch(e) {
      console.error(e)
    }
  })
})
