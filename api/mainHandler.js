
let handler = function (eventBus) {
  eventBus.addEventListener("viewer",(event)=>{
        console.log(event)
        console.log(event.detail)
    })
}

module.exports = handler
