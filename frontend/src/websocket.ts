import { currentUser } from "./auth";
import { addMessage } from "./chat";
import { API_FULL_BASE_URL } from "./config";
import type { WebSocketMessage, Message } from "./types";


export const websocket = new WebSocket(`ws://${API_FULL_BASE_URL}/chat/ws`);

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