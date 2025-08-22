import { getAuthHeaders, currentUser, authToken } from "./auth";
import { API_BASE_URL } from "./config";
import { websocket } from "./websocket";
import type { Message, Messages, WebSocketMessage } from "./types";
import { formatTime } from "./utils";


export function addMessage(message: Message, isAuthor: boolean) {
    const messagesContainer = document.querySelector('.chat-messages') as HTMLElement;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add("message");
    if (isAuthor) {
        messageDiv.classList.add("sent");
    } else {
        messageDiv.classList.add("received");
    }
    messageDiv.dataset.id = `${message.id}`;

    const messageInner = document.createElement('div');
    messageInner.classList.add('message-inner');

    // Add profile picture for received messages
    if (!isAuthor) {
        const profilePicDiv = document.createElement('div');
        profilePicDiv.classList.add('message-profile-pic');
        
        const profileImg = document.createElement('img');
        profileImg.src = message.profile_picture || './src/images/default-avatar.png';
        profileImg.alt = message.username;
        profileImg.onerror = () => {
            profileImg.src = './src/images/default-avatar.png';
        };
        
        profilePicDiv.appendChild(profileImg);
        messageDiv.appendChild(profilePicDiv);
    }

    if (!isAuthor) {
        const usernameDiv = document.createElement('div');
        usernameDiv.classList.add('message-username');
        usernameDiv.textContent = message.username;
        messageInner.appendChild(usernameDiv);
    }

    const contentDiv = document.createElement('div');
    contentDiv.textContent = message.content;
    messageInner.appendChild(contentDiv);

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = formatTime(message.timestamp);

    if (isAuthor && message.is_read) {
        const checkIcon = document.createElement('span');
        checkIcon.classList.add("material-symbols", "outlined");
        timeDiv.appendChild(checkIcon);
    }

    messageInner.appendChild(timeDiv);
    messageDiv.appendChild(messageInner);
    messagesContainer.appendChild(messageDiv);

    // Прокрутка к новому сообщению
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function loadMessages() {
    fetch(`${API_BASE_URL}/get_messages`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then((data: Messages) => {
            if (data.messages && data.messages.length > 0) {
                const messagesContainer = document.querySelector('.chat-messages') as HTMLElement;

                const lastMessage = messagesContainer.lastElementChild as HTMLElement
                let lastMessageId: number = 0
                if (lastMessage) {
                    lastMessageId = Number(lastMessage.dataset.id)
                }
                
                // Добавляем только новые сообщения
                data.messages.forEach(msg => {
                    if (msg.id > lastMessageId) {
                        addMessage(msg, msg.username == currentUser!.username);
                    }
                });
            }
        });
}

export function sendMessage() {
    const input = document.querySelector('.message-input') as HTMLInputElement;
    const message = input.value.trim();

    if (message) {
        const payload: WebSocketMessage = {
            data: {
                content: message
            }, 
            credentials: {
                scheme: "Bearer", 
                credentials: authToken!
            },
            type: "sendMessage"
        }

        let callback: ((e: MessageEvent) => void) | null = null
        callback = (e) => {
            websocket.removeEventListener("message", callback!);
            const response: WebSocketMessage = JSON.parse(e.data)
            console.log(response)
            if (!response.error) {
                input.value = "";
            }
        }
        websocket.addEventListener("message", callback);

        websocket.send(JSON.stringify(payload));
    }
}


document.getElementById('message-form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});