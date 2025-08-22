# Profile Module Structure

This directory contains the modularized profile functionality for the FromChat application.

## Structure

```
profile/
├── types.ts              # Type definitions
├── notification.ts       # Notification system
├── image-cropper.ts      # Image cropping functionality
├── profile-service.ts    # API service layer
├── profile-upload.ts     # Upload management
├── profile-editor.ts     # Profile editing functionality
└── README.md            # This file
```

## Modules

### `types.ts`
Contains all TypeScript interfaces and types used across the profile module:
- `ProfileData` - User profile data structure
- `UploadResponse` - API response for uploads
- `NotificationType` - Notification types
- `CropPosition` - Image cropping position
- `DragStart` - Drag operation start position

### `notification.ts`
Top-level notification functions for displaying success/error messages:
- `showSuccess(message: string)` - Show success notification
- `showError(message: string)` - Show error notification

### `image-cropper.ts`
Canvas-based image cropper for profile pictures:
- `ImageCropper` - Main cropper class with touch/mouse support
- Handles circular cropping with drag functionality

### `profile-service.ts`
API service layer for profile operations:
- `loadProfile()` - Load user profile data
- `uploadProfilePicture(file: Blob)` - Upload profile picture
- `updateProfile(data: Partial<ProfileData>)` - Update profile data

### `profile-upload.ts`
Manages profile picture upload workflow:
- `loadProfilePicture()` - Load and display profile picture
- Global variables and event listeners for upload UI
- Handles file selection, cropping, and upload

### `profile-editor.ts`
Manages profile text editing (nickname, description):
- `loadProfileData()` - Load profile text data
- `setNicknameValue(value: string)` - Set nickname value
- `setDescriptionValue(value: string)` - Set description value
- `getNicknameValue()` - Get current nickname
- `getDescriptionValue()` - Get current description
- Global event listeners for edit buttons
- Supports Enter to save, Escape to cancel

## Usage

### Direct Imports
```typescript
// Import specific functions from each module
import { loadProfile, uploadProfilePicture, updateProfile } from './profile/profile-service';
import { loadProfilePicture } from './profile/profile-upload';
import { loadProfileData, setNicknameValue } from './profile/profile-editor';
import { showSuccess, showError } from './profile/notification';
import { ImageCropper } from './profile/image-cropper';
```

### Loading Profile Data
```typescript
// Load profile picture
await loadProfilePicture();

// Load profile text data
await loadProfileData();
```

### Uploading Profile Picture
The upload process is handled automatically by the global event listeners in `profile-upload.ts` when users interact with the upload UI.

### Editing Profile Text
The editing process is handled automatically by the global event listeners in `profile-editor.ts` when users interact with the edit buttons.

### Showing Notifications
```typescript
showSuccess('Operation completed successfully!');
showError('Something went wrong!');
```

### API Operations
```typescript
// Load profile data
const profileData = await loadProfile();

// Update profile
const success = await updateProfile({ nickname: 'New Name' });

// Upload profile picture
const result = await uploadProfilePicture(blob);
```

## Benefits of This Structure

1. **Separation of Concerns**: Each module has a single responsibility
2. **Reusability**: Functions can be used independently
3. **Maintainability**: Easier to find and fix issues
4. **Testability**: Each function can be tested in isolation
5. **Type Safety**: Strong TypeScript typing throughout
6. **Top-level Functions**: Simple function calls instead of class instances
7. **Direct Imports**: Import only what you need from specific modules
8. **No Index File**: Direct imports reduce complexity and improve tree shaking

## Migration from Original Files

The original `profile.ts` and `profile-upload.ts` files have been refactored to use this modular structure. The functionality remains the same, but it's now better organized and more maintainable.
