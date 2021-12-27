
import * as bootstrap from 'bootstrap'
import { inbox, websocket } from './websocket'

inbox.addEventListener("websocket", (event) => {
    if (event.detail.open) {
        console.log("websocket opened.")
        websocket.send(JSON.stringify({ type: 'event', topic: 'viewer', params: { name: 'Ludo' } }))
    }
})
