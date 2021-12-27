const incomingEventBus = new EventTarget()
class CustomEvent extends Event {
  constructor(message, data) {
    super(message, data)
    this.detail = data.detail
  }
}

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

require('./mainHandler.js')(incomingEventBus)

wss.broadcast = function (message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}
wss.getClientById = function (id){
  return wss.clients.entries.find(client => client.value.id === id)
}

wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

// Handle Websocket requests
wss.on('connection', function connection(ws) {
  ws.id = wss.getUniqueID();
  ws.on('message', function incoming(message) {
    // read msg
    // validate and parse the msg // add try cathc block
    try {
      let msg = JSON.parse(message)
      console.log("incoming msg on the client_ws:", msg)
      if (msg.type === "event"){
        let incomingEvent = new CustomEvent(msg.topic, { detail: { viewer:ws.id, params:msg.params }});
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
