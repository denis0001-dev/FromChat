/**
 * @fileoverview Authentication system implementation
 * @description Handles user authentication, registration, and session management
 * @author Cursor
 * @version 1.0.0
 */

import { loadMessages } from "./chat";
import { initializeProfile } from "./profile";
import type { Headers, ErrorResponse, User, LoginResponse, LoginRequest, RegisterRequest } from "./types";
import { API_BASE_URL } from "./config";

/**
 * Current authenticated user information
 * @type {User | null}
 */
export let currentUser: User | null = null;

/**
 * JWT authentication token
 * @type {string | null}
 */
export let authToken: string | null = null;

/**
 * Generates authentication headers for API requests
 * @param {boolean} json - Whether to include JSON content type header
 * @returns {Headers} Headers object with authentication and content type
 * @function getAuthHeaders
 * @example
 * const headers = getAuthHeaders();
 * fetch('/api/endpoint', { headers });
 */
export function getAuthHeaders(json: boolean = true): Headers {
    const headers: Headers = {};

    if (json) {
        headers["Content-Type"] = "application/json";
    }

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

/**
 * Shows the login form and hides other interfaces
 * @function showLogin
 * @example
 * showLogin();
 */
export function showLogin(): void {
    document.getElementById('login-form')!.style.display = 'flex';
    document.getElementById('register-form')!.style.display = 'none';
    document.getElementById('chat-interface')!.style.display = 'none';
    clearAlerts();
}

/**
 * Shows the registration form and hides other interfaces
 * @function showRegister
 * @example
 * showRegister();
 */
export function showRegister(): void {
    document.getElementById('login-form')!.style.display = 'none';
    document.getElementById('register-form')!.style.display = 'flex';
    document.getElementById('chat-interface')!.style.display = 'none';
    clearAlerts();
}

/**
 * Shows the chat interface and hides authentication forms
 * @function showChat
 * @example
 * showChat();
 */
export function showChat(): void {
    document.getElementById('login-form')!.style.display = 'none';
    document.getElementById('register-form')!.style.display = 'none';
    document.getElementById('chat-interface')!.style.display = 'block';
    loadMessages();
}

/**
 * Clears all alert messages from authentication forms
 * @function clearAlerts
 * @private
 */
export function clearAlerts(): void {
    document.getElementById('login-alerts')!.innerHTML = '';
    document.getElementById('register-alerts')!.innerHTML = '';
}

/**
 * Shows an alert message in the specified container
 * @param {string} containerId - ID of the container to show the alert in
 * @param {string} message - Alert message to display
 * @param {'success' | 'danger'} type - Type of alert (success or danger)
 * @function showAlert
 * @example
 * showAlert('login-alerts', 'Login successful!', 'success');
 */
export function showAlert(containerId: string, message: string, type: "success" | "danger" = 'danger'): void {
    const container = document.getElementById(containerId)!;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    container.appendChild(alertDiv);
}

/**
 * Handles login form submission
 * @async
 * @function handleLogin
 * @param {Event} e - Form submission event
 * @private
 */
async function handleLogin(e: Event): Promise<void> {
    e.preventDefault();

    const usernameElement = document.getElementById('login-username') as HTMLInputElement;
    const passwordElement = document.getElementById('login-password') as HTMLInputElement;
    
    const username = usernameElement.value.trim();
    const password = passwordElement.value.trim();
    
    if (!username || !password) {
        showAlert('login-alerts', 'Пожалуйста, заполните все поля', 'danger');
        return;
    }
    
    try {
        const request: LoginRequest = {
            username: username,
            password: password
        }

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });
        
        if (response.ok) {
            const data: LoginResponse = await response.json();
            // Store the JWT token
            authToken = data.token;
            currentUser = data.user;
            showChat();
            loadMessages(); // Start loading messages
            initializeProfile(); // Initialize profile after login
        } else {
            const data: ErrorResponse = await response.json();
            showAlert('login-alerts', data.message || 'Неверное имя пользователя или пароль', 'danger');
        }
    } catch (error) {
        showAlert('login-alerts', 'Ошибка соединения с сервером', 'danger');
    }
}

/**
 * Handles registration form submission
 * @async
 * @function handleRegister
 * @param {Event} e - Form submission event
 * @private
 */
async function handleRegister(e: Event): Promise<void> {
    e.preventDefault();

    const usernameElement = document.getElementById('register-username') as HTMLInputElement;
    const passwordElement = document.getElementById('register-password') as HTMLInputElement;
    const confirmPasswordElement = document.getElementById('register-confirm-password') as HTMLInputElement;
    
    const username = usernameElement.value.trim();
    const password = passwordElement.value.trim();
    const confirmPassword = confirmPasswordElement.value.trim();
    
    if (!username || !password || !confirmPassword) {
        showAlert('register-alerts', 'Пожалуйста, заполните все поля', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('register-alerts', 'Пароли не совпадают', 'danger');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        showAlert('register-alerts', 'Имя пользователя должно быть от 3 до 20 символов', 'danger');
        return;
    }
    
    if (password.length < 5 || password.length > 50) {
        showAlert('register-alerts', 'Пароль должен быть от 5 до 50 символов', 'danger');
        return;
    }
    
    try {
        const request: RegisterRequest = {
            username: username,
            password: password,
            confirm_password: confirmPassword
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });
        
        if (response.ok) {
            // Registration successful
            showAlert('register-alerts', 'Регистрация прошла успешно! Теперь вы можете войти.', 'success');
            setTimeout(() => {
                showLogin();
            }, 2000);
        } else {
            const data: ErrorResponse = await response.json();
            showAlert('register-alerts', data.message || 'Ошибка при регистрации', 'danger');
        }
    } catch (error) {
        showAlert('register-alerts', 'Ошибка соединения с сервером', 'danger');
    }
}

/**
 * Logs out the current user and clears session data
 * @async
 * @function logout
 * @example
 * await logout();
 */
export async function logout(): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    currentUser = null;
    authToken = null;
    showLogin();
    clearAlerts();
}

/**
 * Loads the chat interface and initializes messaging
 * @function loadChat
 * @example
 * loadChat();
 */
export function loadChat(): void {
    showChat();
    loadMessages();
}

/**
 * Checks authentication status on page load
 * @async
 * @function checkAuthStatus
 * @example
 * await checkAuthStatus();
 */
export async function checkAuthStatus(): Promise<void> {
    // For JWT, we don't have a persistent token on page load
    // So we'll just show the login form
    showLogin();
}

/**
 * Sets up authentication form event listeners
 * @function setupAuthForms
 * @private
 */
function setupAuthForms(): void {
    document.getElementById('login-form-element')!.addEventListener('submit', handleLogin);
    document.getElementById('register-form-element')!.addEventListener('submit', handleRegister);
}

/**
 * Initializes links
 * @function setupLinks
 * @private
 */
function setupLinks(): void {
    document.getElementById("login-link")!.addEventListener("click", showLogin);
    document.getElementById("register-link")!.addEventListener("click", showRegister);
}

// Initialize authentication forms
setupAuthForms();
setupLinks();