import { currentUser } from "./auth";
import { addMessage } from "./chat";
import { API_FULL_BASE_URL } from "./config";
import type { WebSocketMessage, Message } from "./types";
import { delay } from "./utils";

function create() {
    return new WebSocket(`ws://${API_FULL_BASE_URL}/chat/ws`);
}

export let websocket = create();

// --------------
// Initialization
// --------------

websocket.addEventListener("message", (e) => {
    const message: WebSocketMessage = JSON.parse(e.data);
    switch (message.type) {
        case "newMessage": {
            const newMessage: Message = message.data;
            addMessage(newMessage, newMessage.username == currentUser!.username);
            break;
        }
    }
});

websocket.addEventListener("error", async () => {
    console.warn("WebSocket disconnected, retrying in 3 seconds...");
    await delay(3000);
    websocket = create();

    let listener: () => void | null;
    listener = () => {
        console.log("WebSocket successfully reconnected!");
        websocket.removeEventListener("open", listener);
    }

    websocket.addEventListener("open", listener);
});