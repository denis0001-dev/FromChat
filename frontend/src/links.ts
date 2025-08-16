import { loadChat, logout, showLogin, showRegister } from "./auth";

const login = document.getElementById("login-link")!;
const register = document.getElementById("register-link")!;
const chat = document.getElementById("chat-link")!;
const logoutLink = document.getElementById("logout-link")!;

login.addEventListener("click", showLogin);
register.addEventListener("click", showRegister);
chat.addEventListener("click", loadChat);
logoutLink.addEventListener("click", logout);
