export type Headers = {[x: string]: string}

export interface ErrorResponse {
    message: string;
}


// App types
export interface Message {
    id: number;
    username: string;
    content: string;
    is_read: boolean;
    timestamp: string;
}

export interface Messages {
    messages: Message[];
}

export interface User {
    id: number;
    created_at: string;
    last_seen: string;
    online: boolean;
    username: string;
}


// ----------
// API models
// ----------

// Requests
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    confirm_password: string;
}

// Responses
export interface LoginResponse {
    user: User;
    token: string;
}

// ---------------
// WebSocket types
// ---------------

export interface WebSocketMessage {
    type: string;
    credentials?: WebSocketCredentials;
    data?: any;
    error?: WebSocketError;
}

export interface WebSocketError {
    code: number;
    detail: string;
}

export interface WebSocketCredentials {
    scheme: string;
    credentials: string;
}