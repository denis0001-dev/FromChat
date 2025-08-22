import { updateProfile } from './api';
import { loadProfile } from './api';
import { showSuccess, showError } from '../notification';
import type { TextField } from 'mdui/components/text-field';

// DOM elements
let profileForm: HTMLElement;
let nicknameField: TextField; // MDUI TextField
let descriptionField: TextField; // MDUI TextField
let isInitialized = false;

export function setUsernameValue(value: string): void {
    if (nicknameField && nicknameField.value !== undefined) {
        nicknameField.value = value;
    }
}

export function setDescriptionValue(value: string): void {
    if (descriptionField && descriptionField.value !== undefined) {
        descriptionField.value = value;
    }
}

export function getUsernameValue(): string {
    if (nicknameField && nicknameField.value !== undefined) {
        return nicknameField.value;
    }
    return '';
}

export function getDescriptionValue(): string {
    if (descriptionField && descriptionField.value !== undefined) {
        return descriptionField.value;
    }
    return '';
}

export async function loadProfileData(): Promise<void> {
    const userData = await loadProfile();
    if (userData) {
        if (userData.nickname) {
            setUsernameValue(userData.nickname);
        }
        if (userData.description) {
            setDescriptionValue(userData.description);
        }
    }
}

// Setup form submission handler
function setupFormHandler(): void {
    if (isInitialized) return;
    
    // Get DOM elements
    profileForm = document.getElementById('profile-form')!;
    nicknameField = document.getElementById('username-field') as any; // MDUI TextField
    descriptionField = document.getElementById('description-field') as any; // MDUI TextField

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nickname = getUsernameValue();
        const description = getDescriptionValue();
        
        if (nickname || description) {
            const success = await updateProfile({ 
                nickname: nickname || undefined,
                description: description || undefined
            });
            
            if (success) {
                showSuccess('Профиль обновлен!');
            } else {
                showError('Ошибка при обновлении профиля');
            }
        }
    });

    isInitialized = true;
}

// Initialize editor functionality
export function initializeProfileEditor(): void {
    setupFormHandler();
}
