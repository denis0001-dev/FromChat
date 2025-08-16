import { loadMessages } from "./main";
import type { Headers, ErrorResponse, User, LoginResponse, LoginRequest, RegisterRequest } from "./types";
import { API_BASE_URL } from "./config";

// Authentication and navigation handling
export let currentUser: User | null = null;
let authToken: string | null = null;


// Helper function to get auth headers
export function getAuthHeaders(): Headers {
    const headers: Headers = {
        'Content-Type': 'application/json',
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

// Show login form
export function showLogin() {
    document.getElementById('login-form')!.style.display = 'flex';
    document.getElementById('register-form')!.style.display = 'none';
    document.getElementById('chat-interface')!.style.display = 'none';
    clearAlerts();
}

// Show register form
export function showRegister() {
    document.getElementById('login-form')!.style.display = 'none';
    document.getElementById('register-form')!.style.display = 'flex';
    document.getElementById('chat-interface')!.style.display = 'none';
    clearAlerts();
}

// Show chat interface
export function showChat() {
    document.getElementById('login-form')!.style.display = 'none';
    document.getElementById('register-form')!.style.display = 'none';
    document.getElementById('chat-interface')!.style.display = 'block';
}

// Clear all alerts
export function clearAlerts() {
    document.getElementById('login-alerts')!.innerHTML = '';
    document.getElementById('register-alerts')!.innerHTML = '';
}

// Show alert message
export function showAlert(containerId: string, message: string, type: "success" | "danger" = 'danger') {
    const container = document.getElementById(containerId)!;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    container.appendChild(alertDiv);
}

// Handle login form submission
document.getElementById('login-form-element')!.addEventListener('submit', async (e) => {
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
            currentUser = { username: data.username };
            showChat();
            loadMessages(); // Start loading messages
        } else {
            const data: ErrorResponse = await response.json();
            showAlert('login-alerts', data.message || 'Неверное имя пользователя или пароль', 'danger');
        }
    } catch (error) {
        showAlert('login-alerts', 'Ошибка соединения с сервером', 'danger');
    }
});

// Handle register form submission
document.getElementById('register-form-element')!.addEventListener('submit', async (e) => {
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
});

// Handle logout
export async function logout() {
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

// Load chat interface
export function loadChat() {
    showChat();
    loadMessages();
}

// Check authentication status on page load
export async function checkAuthStatus() {
    // For JWT, we don't have a persistent token on page load
    // So we'll just show the login form
    showLogin();
}
