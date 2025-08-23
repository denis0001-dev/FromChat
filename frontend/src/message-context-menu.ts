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

/**
 * Message context menu class
 * @class MessageContextMenu
 */
class MessageContextMenu {
    private menu: HTMLElement | null = null;
    private editDialog: HTMLElement | null = null;
    private replyDialog: HTMLElement | null = null;
    private currentMessage: Message | null = null;

    constructor() {
        this.createMenu();
        this.createDialogs();
        this.bindEvents();
    }

    /**
     * Creates the context menu element
     * @private
     */
    private createMenu(): void {
        this.menu = document.createElement('div');
        this.menu.className = 'message-context-menu';
        this.menu.innerHTML = `
            <div class="context-menu-item" data-action="reply">
                <span class="material-symbols">reply</span>
                Reply
            </div>
            <div class="context-menu-item" data-action="edit">
                <span class="material-symbols">edit</span>
                Edit
            </div>
            <div class="context-menu-item" data-action="delete">
                <span class="material-symbols">delete</span>
                Delete
            </div>
        `;
        document.body.appendChild(this.menu);
    }

    /**
     * Creates the dialogs using MDUI components
     * @private
     */
    private createDialogs(): void {
        // Create edit dialog
        this.editDialog = document.createElement('mdui-dialog');
        this.editDialog.id = 'edit-message-dialog';
        this.editDialog.setAttribute('close-on-overlay-click', '');
        this.editDialog.setAttribute('close-on-esc', '');
        this.editDialog.innerHTML = `
            <div class="dialog-content">
                <h3>Edit Message</h3>
                <mdui-text-field 
                    id="edit-message-input"
                    label="Edit Message" 
                    variant="outlined" 
                    multiline 
                    rows="4" 
                    placeholder="Edit your message..."
                    maxlength="1000">
                </mdui-text-field>
                <div class="dialog-actions">
                    <mdui-button id="edit-cancel" variant="outlined">Cancel</mdui-button>
                    <mdui-button id="edit-save">Save</mdui-button>
                </div>
            </div>
        `;
        document.body.appendChild(this.editDialog);

        // Create reply dialog
        this.replyDialog = document.createElement('mdui-dialog');
        this.replyDialog.id = 'reply-message-dialog';
        this.replyDialog.setAttribute('close-on-overlay-click', '');
        this.replyDialog.setAttribute('close-on-esc', '');
        this.replyDialog.innerHTML = `
            <div class="dialog-content">
                <h3>Reply to Message</h3>
                <div class="reply-preview" id="reply-preview"></div>
                <mdui-text-field 
                    id="reply-message-input"
                    label="Reply" 
                    variant="outlined" 
                    multiline 
                    rows="4" 
                    placeholder="Type your reply..."
                    maxlength="1000">
                </mdui-text-field>
                <div class="dialog-actions">
                    <mdui-button id="reply-cancel" variant="outlined">Cancel</mdui-button>
                    <mdui-button id="reply-send">Send Reply</mdui-button>
                </div>
            </div>
        `;
        document.body.appendChild(this.replyDialog);
    }

    /**
     * Binds event listeners
     * @private
     */
    private bindEvents(): void {
        // Context menu events
        this.menu?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const action = target.closest('.context-menu-item')?.getAttribute('data-action');
            
            if (action && this.currentMessage) {
                this.handleAction(action, this.currentMessage);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.menu?.contains(e.target as Node)) {
                this.hide();
            }
        });

        // Edit dialog events
        const editCancelBtn = this.editDialog?.querySelector('#edit-cancel');
        const editSaveBtn = this.editDialog?.querySelector('#edit-save');

        editCancelBtn?.addEventListener('click', () => this.hideEditDialog());
        editSaveBtn?.addEventListener('click', () => this.saveEdit());

        // Reply dialog events
        const replyCancelBtn = this.replyDialog?.querySelector('#reply-cancel');
        const replySendBtn = this.replyDialog?.querySelector('#reply-send');

        replyCancelBtn?.addEventListener('click', () => this.hideReplyDialog());
        replySendBtn?.addEventListener('click', () => this.sendReply());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
                this.hideEditDialog();
                this.hideReplyDialog();
            }
        });
    }

    /**
     * Shows the context menu at the specified position
     * @param {Message} message - The message to show menu for
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    public show(message: Message, x: number, y: number): void {
        if (!this.menu) return;

        this.currentMessage = message;
        
        // Only show edit and delete for own messages
        const editItem = this.menu.querySelector('[data-action="edit"]') as HTMLElement;
        const deleteItem = this.menu.querySelector('[data-action="delete"]') as HTMLElement;
        
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

        this.menu.style.left = `${adjustedX}px`;
        this.menu.style.top = `${adjustedY}px`;
        this.menu.style.display = 'block';
    }

    /**
     * Hides the context menu
     */
    public hide(): void {
        if (this.menu) {
            this.menu.style.display = 'none';
        }
        this.currentMessage = null;
    }

    /**
     * Handles context menu actions
     * @param {string} action - The action to perform
     * @param {Message} message - The message to act on
     * @private
     */
    private handleAction(action: string, message: Message): void {
        this.hide();

        switch (action) {
            case 'edit':
                this.showEditDialog(message);
                break;
            case 'delete':
                this.deleteMessage(message);
                break;
            case 'reply':
                this.showReplyDialog(message);
                break;
        }
    }

    /**
     * Shows the edit dialog
     * @param {Message} message - The message to edit
     * @private
     */
    private showEditDialog(message: Message): void {
        if (!this.editDialog) return;

        const textField = this.editDialog.querySelector('#edit-message-input') as any;
        if (textField) {
            textField.value = message.content;
        }
        
        this.currentMessage = message;
        (this.editDialog as any).open = true;
        
        // Focus the text field
        setTimeout(() => {
            textField?.focus();
        }, 100);
    }

    /**
     * Hides the edit dialog
     * @private
     */
    private hideEditDialog(): void {
        if (this.editDialog) {
            (this.editDialog as any).open = false;
        }
    }

    /**
     * Saves the edited message
     * @private
     */
    private saveEdit(): void {
        if (!this.currentMessage || !this.editDialog) return;

        const textField = this.editDialog.querySelector('#edit-message-input') as any;
        const newContent = textField?.value?.trim() || '';

        if (!newContent) {
            showError('Message cannot be empty');
            return;
        }

        const payload: WebSocketMessage = {
            type: "editMessage",
            data: {
                message_id: this.currentMessage.id,
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
                this.hideEditDialog();
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
    private showReplyDialog(message: Message): void {
        if (!this.replyDialog) return;

        const preview = this.replyDialog.querySelector('#reply-preview') as HTMLElement;
        if (preview) {
            preview.innerHTML = `
                <div class="reply-preview-content">
                    <strong>${message.username}</strong>: ${message.content}
                </div>
            `;
        }
        
        this.currentMessage = message;
        (this.replyDialog as any).open = true;
        
        // Focus the text field
        setTimeout(() => {
            const textField = this.replyDialog?.querySelector('#reply-message-input') as any;
            textField?.focus();
        }, 100);
    }

    /**
     * Hides the reply dialog
     * @private
     */
    private hideReplyDialog(): void {
        if (this.replyDialog) {
            (this.replyDialog as any).open = false;
        }
    }

    /**
     * Sends the reply message
     * @private
     */
    private sendReply(): void {
        if (!this.currentMessage || !this.replyDialog) return;

        const textField = this.replyDialog.querySelector('#reply-message-input') as any;
        const content = textField?.value?.trim() || '';

        if (!content) {
            showError('Reply cannot be empty');
            return;
        }

        const payload: WebSocketMessage = {
            type: "replyMessage",
            data: {
                content: content,
                reply_to_id: this.currentMessage.id
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
                this.hideReplyDialog();
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
    private deleteMessage(message: Message): void {
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
}

// Export singleton instance
export const messageContextMenu = new MessageContextMenu();
