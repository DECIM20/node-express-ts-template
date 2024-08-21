import express from "express"
const router = express.Router()

router.ws("/", function (ws, req) {
  //an event listener is set up for incoming WebSocket messages.
  ws.on("message", (msg: string) => {
    if (msg === "Is this working ?") {
      ws.send("Websocket seems to be working fine :)")
    }

    // Close the connection once something is done
    // ws.close()

    // Disconnect the client on close
    ws.on("close", () => {
      console.log("Client disconnected!!")
    })
  })
})

export default router
