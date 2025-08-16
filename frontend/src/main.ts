import './css/style.scss';
import { showLogin, getAuthHeaders } from './auth';
import { API_BASE_URL } from './config';
import type { Message, Messages } from './types';
import "./links";


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
    messageDiv.className = `message ${isAuthor ? 'sent' : 'received'}`;
    messageDiv.dataset.id = `${message.id}`;

    const messageInner = document.createElement('div');
    messageInner.className = 'message-inner';

    if (!isAuthor) {
        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'message-username';
        usernameDiv.textContent = message.username;
        messageInner.appendChild(usernameDiv);
    }

    const contentDiv = document.createElement('div');
    contentDiv.textContent = message.content;
    messageInner.appendChild(contentDiv);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatTime(message.timestamp);

    if (isAuthor && message.is_read) {
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check-double';
        checkIcon.style = 'margin-left: 5px; color: #48BB78;';
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
                        addMessage(msg, msg.is_author);
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
        fetch(`${API_BASE_URL}/send_message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content: message })
        }).then(response => {
            if (response.ok) {
                input.value = '';
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Настройка отправки сообщений
    document.getElementById('message-form')!.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    // Проверка новых сообщений каждые 2 секунды (only when chat is visible)
    setInterval(() => {
        if (document.getElementById('chat-interface')!.style.display !== 'none') {
            loadMessages();
        }
    }, 2000);

    showLogin();
}); 
