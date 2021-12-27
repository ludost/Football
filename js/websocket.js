
const wsMaster = new WebSocket('ws://' + location.host + '/');
const incomingEventBus = new EventTarget()

wsMaster.onmessage = (event) => {
  // read msg
  // validate and parse the msg // add try cathc block
  try {
      var msg = JSON.parse(event.data)
      console.log("incoming msg on the client_ws:", msg)
      if (msg.type === "event"){
        let incomingEvent = new CustomEvent(msg.topic, {detail: msg.params});
        incomingEventBus.dispatchEvent(incomingEvent)
      } else{
        console.error("Unknown Json method")
      }
  }
  catch(e) {
    console.error(e)
  }
}

wsMaster.onopen = () => {
  console.log('ws open');
  incomingEventBus.dispatchEvent(new CustomEvent("websocket", {detail: { open: true }}))
}

wsMaster.onclose = () => {
  console.log('ws close')
  incomingEventBus.dispatchEvent(new CustomEvent("websocket", {detail: { open: false }}))
}

module.exports = { inbox:incomingEventBus, websocket:wsMaster }
