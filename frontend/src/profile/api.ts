import { getAuthHeaders } from '../auth';
import type { ProfileData, UploadResponse } from './types';

export async function loadProfile(): Promise<ProfileData | null> {
    try {
        const response = await fetch('/api/user/profile', {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            return await response.json();
        }
        
        return null;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

export async function uploadProfilePicture(file: Blob): Promise<UploadResponse | null> {
    try {
        const formData = new FormData();
        formData.append('profile_picture', file, 'profile_picture.jpg');

        const response = await fetch('/api/upload-profile-picture', {
            method: 'POST',
            body: formData,
            headers: getAuthHeaders(false)
        });

        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Upload error:', error);
        return null;
    }
}

export async function updateProfile(data: Partial<ProfileData>): Promise<boolean> {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        return response.ok;
    } catch (error) {
        console.error('Error updating profile:', error);
        return false;
    }
}
