import { clearAlerts } from "./auth/auth";
import { loadMessages } from "./chat/chat";

/**
 * Shows the login form and hides other interfaces.
 */
export function showLogin(): void {
    document.getElementById('login-form')!.style.display = 'flex';
    document.getElementById('register-form')!.style.display = 'none';
    document.getElementById('chat-interface')!.style.display = 'none';
    clearAlerts();
    document.getElementById("electron-title-bar")!.classList.add("color-surface");
}

/**
 * Shows the registration form and hides other interfaces.
 */
export function showRegister(): void {
    document.getElementById('login-form')!.style.display = 'none';
    document.getElementById('register-form')!.style.display = 'flex';
    document.getElementById('chat-interface')!.style.display = 'none';
    clearAlerts();
    document.getElementById("electron-title-bar")!.classList.add("color-surface");
}

/**
 * Shows the chat interface and hides authentication forms.
 */
export function showChat(): void {
    document.getElementById('login-form')!.style.display = 'none';
    document.getElementById('register-form')!.style.display = 'none';
    document.getElementById('chat-interface')!.style.display = 'block';
    loadMessages();
    document.getElementById("electron-title-bar")!.classList.remove("color-surface");
}

/**
 * Loads the chat interface and initializes messaging.
 */
export function loadChat(): void {
    showChat();
    loadMessages();
}