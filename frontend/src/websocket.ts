/**
 * @fileoverview WebSocket connection management for real-time chat
 * @description Handles WebSocket connections, message processing, and auto-reconnection
 * @author Cursor
 * @version 1.0.0
 */

import { handleWebSocketMessage } from "./chat";
import { API_FULL_BASE_URL } from "./config";
import type { WebSocketMessage } from "./types";
import { delay } from "./utils/utils";

/**
 * Creates a new WebSocket connection to the chat server
 * @function create
 * @returns {WebSocket} New WebSocket instance
 * @private
 */
function create(): WebSocket {
    let prefix = "ws://";
    if (location.protocol.includes("https")) {
        prefix = "wss://";
    }

    return new WebSocket(`${prefix}${API_FULL_BASE_URL}/chat/ws`);
}

/**
 * Global WebSocket instance
 * @type {WebSocket}
 */
export let websocket: WebSocket = create();

// --------------
// Initialization
// --------------

websocket.addEventListener("message", (e) => {
    const message: WebSocketMessage = JSON.parse(e.data);
    handleWebSocketMessage(message);
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