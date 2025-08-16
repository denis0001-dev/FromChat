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
    is_author: boolean;
    timestamp: string;
}

export interface Messages {
    messages: Message[];
}

export interface User {
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
    username: string;
    token: string;
}