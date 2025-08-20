import type { Dialog } from "mdui/components/dialog";

// сварачивание и разворачивание чата
const but = document.getElementById('chat-recrol')!;
const but_list1 = document.getElementById('chat1but')!;
const but_list2 = document.getElementById('chat1but2')!;
const cont1 = document.getElementById('conteinerchat')!;
const namechat = document.getElementById('namechat')!;

but.addEventListener('click', () => {
    but.style.display = 'none';
    cont1.style.display = 'none';
});
but_list1.addEventListener('click', () => {
    but.style.display = 'flex';
    cont1.style.display = 'flex';
    namechat.textContent = 'общий чат';
});
but_list2.addEventListener('click', () => {
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