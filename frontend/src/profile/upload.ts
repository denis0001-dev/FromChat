import type { Dialog } from "mdui/components/dialog";
import { ImageCropper } from './image-cropper';
import { uploadProfilePicture } from './api';
import { loadProfile } from './api';
import { showSuccess, showError } from '../notification';

// Global variables
let cropper: ImageCropper | null = null;
let isInitialized = false;

// DOM elements
let cropperDialog: Dialog;
let fileInput: HTMLInputElement;
let uploadBtn: HTMLElement;
let cropSaveBtn: HTMLElement;
let cropCancelBtn: HTMLElement;
let cropperCloseBtn: HTMLElement;
let cropperArea: HTMLElement;

// Setup event listeners
function setupEventListeners(): void {
    if (isInitialized) return;
    
    // Get DOM elements
    cropperDialog = document.getElementById('cropper-dialog') as Dialog;
    fileInput = document.getElementById('pfp-file-input') as HTMLInputElement;
    uploadBtn = document.getElementById('upload-pfp-btn')!;
    cropSaveBtn = document.getElementById('crop-save')!;
    cropCancelBtn = document.getElementById('crop-cancel')!;
    cropperCloseBtn = document.getElementById('cropper-close')!;
    cropperArea = document.getElementById('cropper-area')!;

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

function closeCropper(): void {
    cropperDialog.open = false;
    cropperArea.innerHTML = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    fileInput.value = '';
}

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
        profilePicture.src = result.profile_picture_url + '?t=' + Date.now(); // Cache bust
        
        // Close cropper
        closeCropper();
        
        // Show success message
        showSuccess('Фото профиля обновлено!');
    } else {
        showError('Ошибка при загрузке фото');
    }
}

export async function loadProfilePicture(): Promise<void> {
    const userData = await loadProfile();
    if (userData?.profile_picture) {
        const profilePicture = document.getElementById('profile-picture') as HTMLImageElement;
        profilePicture.src = userData.profile_picture + '?t=' + Date.now(); // Cache bust
    }
}

// Initialize upload functionality
export function initializeProfileUpload(): void {
    setupEventListeners();
}
