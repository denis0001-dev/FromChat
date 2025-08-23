/**
 * @fileoverview User profile dialog functionality
 * @description Handles displaying user profiles in a modal dialog
 * @author Cursor
 * @version 1.0.0
 */

import { getAuthHeaders, currentUser } from "./auth";
import { API_BASE_URL } from "./config";
import type { UserProfile } from "./types";
import { showError, showSuccess } from "./utils/notification";
import { formatTime } from "./utils/utils";

/**
 * User profile dialog class
 * @class UserProfileDialog
 */
class UserProfileDialog {
    private dialog: HTMLElement | null = null;
    private currentProfile: UserProfile | null = null;
    private isOwnProfile: boolean = false;

    constructor() {
        this.createDialog();
        this.bindEvents();
    }

    /**
     * Creates the profile dialog using MDUI components
     * @private
     */
    private createDialog(): void {
        this.dialog = document.createElement('mdui-dialog');
        this.dialog.id = 'user-profile-dialog';
        this.dialog.setAttribute('close-on-overlay-click', '');
        this.dialog.setAttribute('close-on-esc', '');
        this.dialog.innerHTML = `
            <div class="profile-dialog-content">
                <div class="profile-picture-section">
                    <img class="profile-picture" src="" alt="Profile Picture">
                </div>
                <div class="profile-info">
                    <div class="username-section">
                        <h4 class="username"></h4>
                        <div class="online-status"></div>
                    </div>
                    <div class="bio-section">
                        <label>Bio:</label>
                        <div class="bio-display"></div>
                        <mdui-text-field 
                            id="bio-edit-field"
                            label="Bio" 
                            variant="outlined" 
                            multiline 
                            rows="3" 
                            placeholder="Write something about yourself..."
                            maxlength="500"
                            style="display: none;">
                        </mdui-text-field>
                        <div class="bio-actions" style="display: none;">
                            <mdui-button id="save-bio-btn">Save</mdui-button>
                            <mdui-button id="cancel-bio-btn" variant="outlined">Cancel</mdui-button>
                        </div>
                        <mdui-button id="edit-bio-btn" variant="outlined" style="display: none;">Edit Bio</mdui-button>
                    </div>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-label">Member since:</span>
                            <span class="stat-value member-since"></span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Last seen:</span>
                            <span class="stat-value last-seen"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.dialog);
    }

    /**
     * Binds event listeners
     * @private
     */
    private bindEvents(): void {
        // Edit bio events
        const editBioBtn = this.dialog?.querySelector('#edit-bio-btn');
        const saveBioBtn = this.dialog?.querySelector('#save-bio-btn');
        const cancelBioBtn = this.dialog?.querySelector('#cancel-bio-btn');

        editBioBtn?.addEventListener('click', () => this.startEditBio());
        saveBioBtn?.addEventListener('click', () => this.saveBio());
        cancelBioBtn?.addEventListener('click', () => this.cancelEditBio());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog?.getAttribute('open') !== null) {
                this.hide();
            }
        });
    }

    /**
     * Shows the profile dialog for a specific user
     * @param {string} username - Username to show profile for
     */
    public async show(username: string): Promise<void> {
        if (!this.dialog) return;

        try {
            const response = await fetch(`${API_BASE_URL}/user/${username}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load user profile');
            }

            const profile: UserProfile = await response.json();
            this.currentProfile = profile;
            this.isOwnProfile = profile.username === currentUser?.username;
            this.populateDialog(profile);
            (this.dialog as any).open = true;

        } catch (error) {
            showError('Failed to load user profile');
            console.error('Error loading user profile:', error);
        }
    }

    /**
     * Populates the dialog with user data
     * @param {UserProfile} profile - User profile data
     * @private
     */
    private populateDialog(profile: UserProfile): void {
        if (!this.dialog) return;

        // Profile picture
        const profilePic = this.dialog.querySelector('.profile-picture') as HTMLImageElement;
        profilePic.src = profile.profile_picture || './src/images/default-avatar.png';
        profilePic.onerror = () => {
            profilePic.src = './src/images/default-avatar.png';
        };

        // Username
        const usernameEl = this.dialog.querySelector('.username') as HTMLElement;
        usernameEl.textContent = profile.username;

        // Online status
        const onlineStatus = this.dialog.querySelector('.online-status') as HTMLElement;
        if (profile.online) {
            onlineStatus.innerHTML = '<span class="online-indicator"></span> Online';
            onlineStatus.className = 'online-status online';
        } else {
            onlineStatus.innerHTML = `<span class="offline-indicator"></span> Last seen ${formatTime(profile.last_seen)}`;
            onlineStatus.className = 'online-status offline';
        }

        // Bio
        const bioDisplay = this.dialog.querySelector('.bio-display') as HTMLElement;
        const bioEdit = this.dialog.querySelector('#bio-edit-field') as any;
        
        if (profile.bio) {
            bioDisplay.textContent = profile.bio;
        } else {
            bioDisplay.textContent = this.isOwnProfile ? 'No bio yet. Click "Edit Bio" to add one!' : 'No bio available.';
        }

        if (bioEdit) {
            bioEdit.value = profile.bio || '';
        }

        // Stats
        const memberSince = this.dialog.querySelector('.member-since') as HTMLElement;
        const lastSeen = this.dialog.querySelector('.last-seen') as HTMLElement;
        
        memberSince.textContent = formatTime(profile.created_at);
        lastSeen.textContent = formatTime(profile.last_seen);

        // Show/hide edit button for own profile
        const editBioBtn = this.dialog.querySelector('#edit-bio-btn') as HTMLElement;
        editBioBtn.style.display = this.isOwnProfile ? 'block' : 'none';
    }

    /**
     * Starts editing the bio
     * @private
     */
    private startEditBio(): void {
        if (!this.dialog) return;

        const bioDisplay = this.dialog.querySelector('.bio-display') as HTMLElement;
        const bioEdit = this.dialog.querySelector('#bio-edit-field') as any;
        const bioActions = this.dialog.querySelector('.bio-actions') as HTMLElement;
        const editBioBtn = this.dialog.querySelector('#edit-bio-btn') as HTMLElement;

        bioDisplay.style.display = 'none';
        if (bioEdit) bioEdit.style.display = 'block';
        bioActions.style.display = 'flex';
        editBioBtn.style.display = 'none';

        if (bioEdit) {
            bioEdit.focus();
            bioEdit.setSelectionRange(bioEdit.value.length, bioEdit.value.length);
        }
    }

    /**
     * Saves the bio
     * @private
     */
    private async saveBio(): Promise<void> {
        if (!this.dialog || !this.currentProfile) return;

        const bioEdit = this.dialog.querySelector('#bio-edit-field') as any;
        const newBio = bioEdit?.value?.trim() || '';

        try {
            const response = await fetch(`${API_BASE_URL}/user/bio`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bio: newBio })
            });

            if (!response.ok) {
                throw new Error('Failed to update bio');
            }

            const result = await response.json();
            this.currentProfile.bio = result.bio;
            this.populateDialog(this.currentProfile);
            this.cancelEditBio();
            showSuccess('Bio updated successfully');

        } catch (error) {
            showError('Failed to update bio');
            console.error('Error updating bio:', error);
        }
    }

    /**
     * Cancels bio editing
     * @private
     */
    private cancelEditBio(): void {
        if (!this.dialog) return;

        const bioDisplay = this.dialog.querySelector('.bio-display') as HTMLElement;
        const bioEdit = this.dialog.querySelector('#bio-edit-field') as any;
        const bioActions = this.dialog.querySelector('.bio-actions') as HTMLElement;
        const editBioBtn = this.dialog.querySelector('#edit-bio-btn') as HTMLElement;

        bioDisplay.style.display = 'block';
        if (bioEdit) bioEdit.style.display = 'none';
        bioActions.style.display = 'none';
        editBioBtn.style.display = this.isOwnProfile ? 'block' : 'none';

        // Reset bio edit to current value
        if (bioEdit) {
            bioEdit.value = this.currentProfile?.bio || '';
        }
    }

    /**
     * Hides the dialog
     */
    public hide(): void {
        if (this.dialog) {
            (this.dialog as any).open = false;
        }
        this.currentProfile = null;
        this.isOwnProfile = false;
    }
}

// Export singleton instance
export const userProfileDialog = new UserProfileDialog();
