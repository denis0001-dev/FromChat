import './css/style.scss';
import "mdui/mdui.css";
import { showLogin, getAuthHeaders, authToken, currentUser } from './auth';
import { API_BASE_URL, API_FULL_BASE_URL, PRODUCT_NAME } from './config';
import type { Message, Messages, WebSocketMessage } from './types';
import "./links";
import "./material";
import type { Dialog } from 'mdui/components/dialog.js';

const websocket = new WebSocket(`ws://${API_FULL_BASE_URL}/chat/ws`);


// Функция для форматирования времени
function formatTime(dateString: string) {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const hoursString = hours < 10 ? '0' + hours : hours;
    const minutesString = minutes < 10 ? '0' + minutes : minutes;
    return hoursString + ':' + minutesString;
}

// Добавление нового сообщения в чат
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

// Загрузка сообщений
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

// Отправка сообщения
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

showLogin();

document.getElementById('message-form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

document.getElementById("productname")!.textContent = PRODUCT_NAME;
document.title = PRODUCT_NAME;


// сварачивание и разворачивание чата
const but = document.getElementById('chat-recrol')!;
const but_list1 = document.getElementById('chat1but')!;
const but_list2 = document.getElementById('chat1but2')!;
const cont1 = document.getElementById('conteinerchat')!;
const logout = document.getElementById('logouts')!;
const namechat = document.getElementById('namechat')!;

but.addEventListener('click',() => {
    but.style.display = 'none';
    cont1.style.display = 'none';
    logout.style.display = 'flex';
});
but_list1.addEventListener('click',() => {
    but.style.display = 'flex';
    cont1.style.display = 'flex';
    namechat.textContent = 'общий чат';
});
but_list2.addEventListener('click',() => {
    but.style.display = 'flex';
    cont1.style.display = 'flex';
    namechat.textContent = 'общий чат 2';
});

// открытие профиля
const butprofile = document.getElementById('profbut')!;
const dialog = document.getElementById("profile-dialog") as Dialog;
const dialogClose = document.getElementById("profile-dialog-close")!;

butprofile.addEventListener('click', () => {
    dialog.open = true;
});

dialogClose.addEventListener("click", () => {
    dialog.open = false;
});