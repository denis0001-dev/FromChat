/**
 * @fileoverview Message context menu functionality
 * @description Handles right-click context menu for message actions (edit, delete, reply)
 * @author Cursor
 * @version 1.0.0
 */

import { currentUser, authToken } from "./auth";
import { websocket } from "./websocket";
import type { Message, WebSocketMessage } from "./types";
import { showSuccess, showError } from "./utils/notification";


let menu = document.getElementById("message-context-menu")!;
let editDialog = document.getElementById("edit-message-dialog");
let replyDialog = document.getElementById("reply-message-dialog");
let currentMessage: Message | null = null;

function init() {
    bindEvents();
}

/**
 * Binds event listeners
 * @private
 */
function bindEvents(): void {
    // Context menu events
    menu?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const action = target.closest('.context-menu-item')?.getAttribute('data-action');
        
        if (action && currentMessage) {
            handleAction(action, currentMessage);
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu?.contains(e.target as Node)) {
            hide();
        }
    });

    // Edit dialog events
    const editCancelBtn = editDialog?.querySelector('#edit-cancel');
    const editSaveBtn = editDialog?.querySelector('#edit-save');

    editCancelBtn?.addEventListener('click', () => hideEditDialog());
    editSaveBtn?.addEventListener('click', () => saveEdit());

    // Reply dialog events
    const replyCancelBtn = replyDialog?.querySelector('#reply-cancel');
    const replySendBtn = replyDialog?.querySelector('#reply-send');

    replyCancelBtn?.addEventListener('click', () => hideReplyDialog());
    replySendBtn?.addEventListener('click', () => sendReply());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hide();
            hideEditDialog();
            hideReplyDialog();
        }
    });
}

/**
 * Shows the context menu at the specified position
 * @param {Message} message - The message to show menu for
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function show(message: Message, x: number, y: number): void {
    if (!menu) return;

    currentMessage = message;
    
    // Only show edit and delete for own messages
    const editItem = menu.querySelector('[data-action="edit"]') as HTMLElement;
    const deleteItem = menu.querySelector('[data-action="delete"]') as HTMLElement;
    
    if (message.username === currentUser?.username) {
        editItem.style.display = 'flex';
        deleteItem.style.display = 'flex';
    } else {
        editItem.style.display = 'none';
        deleteItem.style.display = 'none';
    }

    // Calculate menu position
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Default menu size estimates
    const menuWidth = 150;
    const menuHeight = 120;
    
    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position if menu would go off-screen
    if (x + menuWidth > viewportWidth) {
        adjustedX = x - menuWidth;
    }

    // Adjust vertical position if menu would go off-screen
    if (y + menuHeight > viewportHeight) {
        adjustedY = y - menuHeight;
    }

    // Ensure menu doesn't go off the left or top edges
    adjustedX = Math.max(0, adjustedX);
    adjustedY = Math.max(0, adjustedY);

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
    menu.style.display = 'block';
}

/**
 * Hides the context menu
 */
export function hide(): void {
    if (menu) {
        menu.style.display = 'none';
    }
    currentMessage = null;
}

/**
 * Handles context menu actions
 * @param {string} action - The action to perform
 * @param {Message} message - The message to act on
 * @private
 */
function handleAction(action: string, message: Message): void {
    hide();

    switch (action) {
        case 'edit':
            showEditDialog(message);
            break;
        case 'delete':
            deleteMessage(message);
            break;
        case 'reply':
            showReplyDialog(message);
            break;
    }
}

/**
 * Shows the edit dialog
 * @param {Message} message - The message to edit
 * @private
 */
function showEditDialog(message: Message): void {
    if (!editDialog) return;

    const textField = editDialog.querySelector('#edit-message-input') as any;
    if (textField) {
        textField.value = message.content;
    }
    
    currentMessage = message;
    (editDialog as any).open = true;
    
    // Focus the text field
    setTimeout(() => {
        textField?.focus();
    }, 100);
}

/**
 * Hides the edit dialog
 * @private
 */
function hideEditDialog(): void {
    if (editDialog) {
        (editDialog as any).open = false;
    }
}

/**
 * Saves the edited message
 * @private
 */
function saveEdit(): void {
    if (!currentMessage || !editDialog) return;

    const textField = editDialog.querySelector('#edit-message-input') as any;
    const newContent = textField?.value?.trim() || '';

    if (!newContent) {
        showError('Message cannot be empty');
        return;
    }

    const payload: WebSocketMessage = {
        type: "editMessage",
        data: {
            message_id: currentMessage.id,
            content: newContent
        },
        credentials: {
            scheme: "Bearer",
            credentials: authToken!
        }
    };

    let callback: ((e: MessageEvent) => void) | null = null;
    callback = (e) => {
        websocket.removeEventListener("message", callback!);
        const response: WebSocketMessage = JSON.parse(e.data);
        
        if (response.error) {
            showError(response.error.detail);
        } else {
            showSuccess('Message edited successfully');
            hideEditDialog();
        }
    };
    websocket.addEventListener("message", callback);
    websocket.send(JSON.stringify(payload));
}

/**
 * Shows the reply dialog
 * @param {Message} message - The message to reply to
 * @private
 */
function showReplyDialog(message: Message): void {
    if (!replyDialog) return;

    const preview = replyDialog.querySelector('#reply-preview') as HTMLElement;
    if (preview) {
        preview.innerHTML = `
            <div class="reply-preview-content">
                <strong>${message.username}</strong>: ${message.content}
            </div>
        `;
    }
    
    currentMessage = message;
    (replyDialog as any).open = true;
    
    // Focus the text field
    setTimeout(() => {
        const textField = replyDialog?.querySelector('#reply-message-input') as any;
        textField?.focus();
    }, 100);
}

/**
 * Hides the reply dialog
 * @private
 */
function hideReplyDialog(): void {
    if (replyDialog) {
        (replyDialog as any).open = false;
    }
}

/**
 * Sends the reply message
 * @private
 */
function sendReply(): void {
    if (!currentMessage || !replyDialog) return;

    const textField = replyDialog.querySelector('#reply-message-input') as any;
    const content = textField?.value?.trim() || '';

    if (!content) {
        showError('Reply cannot be empty');
        return;
    }

    const payload: WebSocketMessage = {
        type: "replyMessage",
        data: {
            content: content,
            reply_to_id: currentMessage.id
        },
        credentials: {
            scheme: "Bearer",
            credentials: authToken!
        }
    };

    let callback: ((e: MessageEvent) => void) | null = null;
    callback = (e) => {
        websocket.removeEventListener("message", callback!);
        const response: WebSocketMessage = JSON.parse(e.data);
        
        if (response.error) {
            showError(response.error.detail);
        } else {
            showSuccess('Reply sent successfully');
            hideReplyDialog();
            if (textField) {
                textField.value = '';
            }
        }
    };
    websocket.addEventListener("message", callback);
    websocket.send(JSON.stringify(payload));
}

/**
 * Deletes a message
 * @param {Message} message - The message to delete
 * @private
 */
function deleteMessage(message: Message): void {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }

    const payload: WebSocketMessage = {
        type: "deleteMessage",
        data: {
            message_id: message.id
        },
        credentials: {
            scheme: "Bearer",
            credentials: authToken!
        }
    };

    let callback: ((e: MessageEvent) => void) | null = null;
    callback = (e) => {
        websocket.removeEventListener("message", callback!);
        const response: WebSocketMessage = JSON.parse(e.data);
        
        if (response.error) {
            showError(response.error.detail);
        } else {
            showSuccess('Message deleted successfully');
        }
    };
    websocket.addEventListener("message", callback);
    websocket.send(JSON.stringify(payload));
}

init();