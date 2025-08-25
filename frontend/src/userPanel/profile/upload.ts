/**
 * @fileoverview Profile picture upload functionality
 * @description Handles file selection, image cropping, and profile picture upload
 * @author Cursor
 * @version 1.0.0
 */

import type { Dialog } from "mdui/components/dialog";
import { ImageCropper } from './imageCropper';
import { uploadProfilePicture } from './api';
import { loadProfile } from './api';
import { showSuccess, showError } from '../../utils/notification';

/**
 * Global image cropper instance
 * @type {ImageCropper | null}
 */
let cropper: ImageCropper | null = null;

/**
 * Initialization state flag
 * @type {boolean}
 */
let isInitialized = false;

let cropperDialog = document.getElementById('cropper-dialog') as Dialog;
let fileInput = document.getElementById('pfp-file-input') as HTMLInputElement;
let uploadBtn = document.getElementById('upload-pfp-btn')!;
let cropSaveBtn = document.getElementById('crop-save')!;
let cropCancelBtn = document.getElementById('crop-cancel')!;
let cropperCloseBtn = document.getElementById('cropper-close')!;
let cropperArea = document.getElementById('cropper-area')!;

/**
 * Opens the image cropper with the selected file
 * @param {File} file - The image file to crop
 * @private
 */
async function openCropper(file: File): Promise<void> {
    // Clear previous cropper
    cropperArea.innerHTML = '';
    
    // Create new cropper
    cropper = new ImageCropper(cropperArea);
    
    // Load image
    await cropper.loadImage(file);
    
    // Open dialog
    cropperDialog.open = true;
}

/**
 * Closes the image cropper and cleans up resources
 * @private
 */
function closeCropper(): void {
    cropperDialog.open = false;
    cropperArea.innerHTML = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    fileInput.value = '';
}

/**
 * Saves the cropped image and uploads it to the server
 * @private
 */
async function saveCroppedImage(): Promise<void> {
    if (!cropper) return;

    const croppedImageData = cropper.getCroppedImage();
    
    // Convert data URL to blob
    const response = await fetch(croppedImageData);
    const blob = await response.blob();
    
    const result = await uploadProfilePicture(blob);
    
    if (result) {
        // Update profile picture display
        const profilePicture = document.getElementById('profile-picture') as HTMLImageElement;
        profilePicture.src = `${result.profile_picture_url}?t=${Date.now()}`; // Cache bust
        
        // Close cropper
        closeCropper();
        
        // Show success message
        showSuccess('Фото профиля обновлено!');
    } else {
        showError('Ошибка при загрузке фото');
    }
}

/**
 * Sets up event listeners for upload functionality
 * @private
 */
function setupEventListeners(): void {
    if (isInitialized) return;

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            openCropper(file);
        }
    });

    cropSaveBtn.addEventListener('click', () => {
        saveCroppedImage();
    });

    cropCancelBtn.addEventListener('click', () => {
        closeCropper();
    });

    cropperCloseBtn.addEventListener('click', () => {
        closeCropper();
    });

    isInitialized = true;
}

/**
 * Loads and displays the user's profile picture
 * @async
 */
export async function loadProfilePicture(): Promise<void> {
    const userData = await loadProfile();
    if (userData?.profile_picture) {
        const url = `${userData.profile_picture}?t=${Date.now()}`;

        const profilePicture = document.getElementById('profile-picture') as HTMLImageElement;
        const profilePicture2 = document.getElementById("preview1") as HTMLImageElement;
        profilePicture.src = url;
        profilePicture2.src = url;
    }
}

/**
 * Initializes profile upload functionality
 */
export function initializeProfileUpload(): void {
    setupEventListeners();
}
