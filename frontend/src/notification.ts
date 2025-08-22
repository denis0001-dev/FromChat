export type NotificationType = 'success' | 'error';

function showNotification(message: string, type: NotificationType): void {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        z-index: 10000;
        font-family: inherit;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Fade out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

export function showSuccess(message: string): void {
    showNotification(message, 'success');
}

export function showError(message: string): void {
    showNotification(message, 'error');
}
