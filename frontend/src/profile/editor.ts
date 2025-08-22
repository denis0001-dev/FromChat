/**
 * @fileoverview Profile editing functionality
 * @description Handles profile form editing and MDUI text field integration
 * @author Cursor
 * @version 1.0.0
 */

import { updateProfile } from './api';
import { loadProfile } from './api';
import { showSuccess, showError } from '../utils/notification';
import type { TextField } from 'mdui/components/text-field';

let profileForm = document.getElementById('profile-form')!;
let nicknameField = document.getElementById('username-field') as unknown as TextField;
let descriptionField = document.getElementById('description-field') as unknown as TextField;

/**
 * Initialization state flag
 * @type {boolean}
 */
let isInitialized = false;

/**
 * Sets the username field value
 * @param {string} value - The username value to set
 * @function setUsernameValue
 * @example
 * setUsernameValue('John Doe');
 */
export function setUsernameValue(value: string): void {
    if (nicknameField && nicknameField.value !== undefined) {
        nicknameField.value = value;
    }
}

/**
 * Sets the description field value
 * @param {string} value - The description value to set
 * @function setDescriptionValue
 * @example
 * setDescriptionValue('Software Developer');
 */
export function setDescriptionValue(value: string): void {
    if (descriptionField && descriptionField.value !== undefined) {
        descriptionField.value = value;
    }
}

/**
 * Gets the current username field value
 * @returns {string} The current username value
 * @function getUsernameValue
 * @example
 * const username = getUsernameValue();
 * console.log('Current username:', username);
 */
export function getUsernameValue(): string {
    if (nicknameField && nicknameField.value !== undefined) {
        return nicknameField.value;
    }
    return '';
}

/**
 * Gets the current description field value
 * @returns {string} The current description value
 * @function getDescriptionValue
 * @example
 * const description = getDescriptionValue();
 * console.log('Current description:', description);
 */
export function getDescriptionValue(): string {
    if (descriptionField && descriptionField.value !== undefined) {
        return descriptionField.value;
    }
    return '';
}

/**
 * Loads profile data from the server and populates the form fields
 * @async
 * @function loadProfileData
 * @example
 * await loadProfileData();
 */
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

/**
 * Handles profile form submission
 * @async
 * @function handleFormSubmission
 * @param {Event} e - Form submission event
 * @private
 */
async function handleFormSubmission(e: Event): Promise<void> {
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
}

/**
 * Sets up form submission handler
 * @function setupFormHandler
 * @private
 */
function setupFormHandler(): void {
    if (isInitialized) return;
    
    // Get DOM elements
    profileForm = document.getElementById('profile-form')!;
    nicknameField = document.getElementById('username-field') as any;
    descriptionField = document.getElementById('description-field') as any;

    profileForm.addEventListener('submit', handleFormSubmission);

    isInitialized = true;
}

/**
 * Initializes profile editor functionality
 * @function initializeProfileEditor
 * @example
 * initializeProfileEditor();
 */
export function initializeProfileEditor(): void {
    setupFormHandler();
}
