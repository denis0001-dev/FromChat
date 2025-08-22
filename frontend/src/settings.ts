import type { Dialog } from "mdui/components/dialog";

const dialog = document.getElementById('settings-dialog') as Dialog;
const openButton = document.getElementById('settings-open')!;
const closeButton = document.getElementById('settings-close')!;

// Settings panel management
const settingsList = document.querySelector('#settings-menu mdui-list')!;
const settingsPanels = document.querySelectorAll('.settings-panel');

// Initialize settings
function initializeSettings() {
    // Add click listeners to all list items
    const listItems = settingsList.querySelectorAll('mdui-list-item');
    
    // Create a mapping between list items and their corresponding panels
    const panelMapping = {
        'Уведомления': 'notifications-settings',
        'Внешний вид': 'appearance-settings',
        'Безопасность': 'security-settings',
        'Язык': 'language-settings',
        'Хранилище': 'storage-settings',
        'Помощь': 'help-settings',
        'О приложении': 'about-settings'
    };
    
    listItems.forEach((item) => {
        item.addEventListener('click', () => {
            // Remove active class from all items and panels
            listItems.forEach(li => li.removeAttribute('active'));
            settingsPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked item
            item.setAttribute('active', '');
            
            // Show corresponding panel using the mapping
            const itemText = item.textContent?.trim();
            const panelId = panelMapping[itemText as keyof typeof panelMapping];
            
            if (panelId) {
                const targetPanel = document.getElementById(panelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            }
        });
    });
}

// Dialog event listeners
openButton.addEventListener('click', () => {
    dialog.open = true;
    // Reset to first panel when opening
    const firstItem = settingsList.querySelector('mdui-list-item');
    const firstPanel = document.querySelector('.settings-panel');
    if (firstItem && firstPanel) {
        settingsList.querySelectorAll('mdui-list-item').forEach(li => li.removeAttribute('active'));
        settingsPanels.forEach(panel => panel.classList.remove('active'));
        firstItem.setAttribute('active', '');
        firstPanel.classList.add('active');
    }
});

closeButton.addEventListener('click', () => {
    dialog.open = false;
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
    initializeSettings();
}
