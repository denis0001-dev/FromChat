/**
 * @fileoverview Left panel UI controls and interactions
 * @description Handles chat collapse/expand, chat switching, and profile dialog
 * @author Cursor
 * @version 1.0.0
 */

import type { Dialog } from "mdui/components/dialog";
import { loadProfilePicture } from "./profile/upload";
import { PublicChatPanel } from "../chat/panel";
import { publicChatPanel } from "../chat/chat";

// сварачивание и разворачивание чата
const chatCollapseBtn = document.getElementById('hide-chat')!;
const chat1 = document.getElementById('chat-list-chat-1')!;
const chat2 = document.getElementById('chat-list-chat-2')!;
const chatInner = document.getElementById('chat-inner')!;
const chatName = document.getElementById('chat-name')!;
const profileButton = document.getElementById('profile-open')!;
const dialog = document.getElementById("profile-dialog") as Dialog;
const dialogClose = document.getElementById("profile-dialog-close")!;

/**
 * Sets up chat collapse functionality
 * @private
 */
function setupChatCollapse(): void {
    chatCollapseBtn.addEventListener('click', () => {
        chatCollapseBtn.style.display = 'none';
        chatInner.style.display = 'none';
    });
}

/**
 * Sets up chat switching functionality
 * @private
 */
function setupChatSwitching(): void {
    chat1.addEventListener('click', () => {
        chatCollapseBtn.style.display = 'flex';
        chatInner.style.display = 'flex';
        chatName.textContent = 'общий чат';
        publicChatPanel.activate();
    });
    
    chat2.addEventListener('click', () => {
        chatCollapseBtn.style.display = 'flex';
        chatInner.style.display = 'flex';
        chatName.textContent = 'общий чат 2';
        publicChatPanel.activate();
    });
}

/**
 * Sets up profile dialog functionality
 * @private
 */
function setupProfileDialog(): void {
    profileButton.addEventListener('click', () => {
        dialog.open = true;
        loadProfilePicture();
    });

    dialogClose.addEventListener("click", () => {
        dialog.open = false;
    });
}

setupChatCollapse();
setupChatSwitching();
setupProfileDialog();