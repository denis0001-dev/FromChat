/**
 * @fileoverview Settings dialog management and panel navigation
 * @description Handles settings dialog functionality and dynamic panel switching
 * @author Cursor
 * @version 1.0.0
 */

import type { Dialog } from "mdui/components/dialog";

const dialog = document.getElementById('settings-dialog') as Dialog;
const openButton = document.getElementById('settings-open')!;
const closeButton = document.getElementById('settings-close')!;

// Settings panel management
const settingsList = document.querySelector('#settings-menu mdui-list')!;
const settingsPanels = document.querySelectorAll('.settings-panel');

/**
 * Mapping between list item text and their corresponding panel IDs
 * @type {Object.<string, string>}
 */
const panelMapping = {
    'Уведомления': 'notifications-settings',
    'Внешний вид': 'appearance-settings',
    'Безопасность': 'security-settings',
    'Язык': 'language-settings',
    'Хранилище': 'storage-settings',
    'Помощь': 'help-settings',
    'О приложении': 'about-settings'
};

/**
 * Handles click events on settings list items
 * @param {Element} item - The clicked list item element
 * @function handleListItemClick
 * @private
 */
function handleListItemClick(item: Element): void {
    // Remove active class from all items and panels
    const listItems = settingsList.querySelectorAll('mdui-list-item');
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
}

/**
 * Sets up click listeners for all settings list items
 * @function setupSettingsNavigation
 * @private
 */
function setupSettingsNavigation(): void {
    const listItems = settingsList.querySelectorAll('mdui-list-item');
    listItems.forEach((item) => {
        item.addEventListener('click', () => handleListItemClick(item));
    });
}

/**
 * Resets settings dialog to show the first panel
 * @function resetToFirstPanel
 * @private
 */
function resetToFirstPanel(): void {
    const firstItem = settingsList.querySelector('mdui-list-item');
    const firstPanel = document.querySelector('.settings-panel');
    if (firstItem && firstPanel) {
        settingsList.querySelectorAll('mdui-list-item').forEach(li => li.removeAttribute('active'));
        settingsPanels.forEach(panel => panel.classList.remove('active'));
        firstItem.setAttribute('active', '');
        firstPanel.classList.add('active');
    }
}

/**
 * Sets up dialog event listeners
 * @function setupDialogListeners
 * @private
 */
function setupDialogListeners(): void {
    openButton.addEventListener('click', () => {
        dialog.open = true;
        resetToFirstPanel();
    });

    closeButton.addEventListener('click', () => {
        dialog.open = false;
    });
}

setupSettingsNavigation();
setupDialogListeners();