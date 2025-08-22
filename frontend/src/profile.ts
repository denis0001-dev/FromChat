import type { Dialog } from "mdui/components/dialog";
import { loadProfileData } from './profile/editor';
import { loadProfilePicture, initializeProfileUpload } from "./profile/upload";
import { initializeProfileEditor } from './profile/editor';

// Handle profile form submission
const form = document.getElementById("profile-form")!;
const dialog = document.getElementById("profile-dialog") as Dialog;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // TODO: Process form data if needed
    // For now, just close the dialog
    dialog.open = false;
});

// Initialize profile functionality after login
export function initializeProfile(): void {
    // Initialize profile modules
    initializeProfileUpload();
    initializeProfileEditor();
    
    // Load profile data
    Promise.all([
        loadProfilePicture(),
        loadProfileData()
    ]).catch(error => {
        console.error('Error initializing profile:', error);
    });
}