
let viewers = {}

let handler = function (inbox,outbox) {
    inbox.addEventListener("viewer",(event)=>{
      console.log("Viewer event received:", event)
      //event: { wsid: <id>, params: { type:<register|getList|list>, name:<name> }
      //register new viewer
      switch (event.detail.params.type) {
        case "register":
          console.log("Registering new viewer:"+ event.detail.params.name)
          viewers[event.detail.params.name] = { wsid:event.detail.wsid, name:event.detail.params.name }
          break
        case "getList":
          //send viewers list to requester
          console.log("Return viewer list:"+ JSON.stringify(viewers))
          outbox.sendEventToId(event.detail.wsid, 'viewer', { type:"list", list:Object.values(viewers) }).
          then(() => console.log("Message sent.")).
          catch((error) => console.log("Failed to send message:", error))
          break
        default:
          console.log("Unknown request for viewers eventhandler")
      }
    })
}

module.exports = handler
