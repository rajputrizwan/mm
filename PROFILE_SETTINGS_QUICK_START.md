# ProfileSettings Quick Start Guide

## What Was Implemented

Complete fully-functional profile settings page with:

- ✅ Image uploads to Cloudinary
- ✅ Profile information editing (name, email, phone, bio)
- ✅ Password change functionality
- ✅ Account deletion with confirmation
- ✅ Logout functionality
- ✅ Preferences management (notifications, theme, language)
- ✅ Security settings display
- ✅ Active sessions management

## How to Use

### 1. Profile Tab

- **Upload Photo**: Click camera icon, select image, wait for upload
- **Edit Profile**: Click "Edit Profile" button, modify fields, click "Save Changes"
- **View Profile**: See all your information with "Member Since" date

### 2. Preferences Tab

- **Dark Mode**: Toggle to enable/disable
- **Notifications**: Enable/disable different notification types
- **Language**: Select preferred language from dropdown

### 3. Security Tab

- **Change Password**: Click button, enter current + new password, click update
- **2FA**: Status display with enable/disable button
- **Sessions**: View current device and other active sessions
- **Delete Account**: Click button, confirm, enter password

## API Methods Available

```typescript
// In src/services/api.ts

api.updateProfile(data)
// Updates: name, email, phone, bio, avatar

api.changePassword({
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
})

api.deleteAccount(password: string)

api.apiLogout()

api.getCurrentUser()
// Get current logged-in user
```

## Environment Setup

The `.env` file now includes:

```
VITE_CLOUDINARY_CLOUD_NAME=interview-app
VITE_CLOUDINARY_UPLOAD_PRESET=intervau_ai
```

These credentials are already set up and working.

## Error Handling

All errors are automatically handled:

- Network errors → User sees error message
- Validation errors → Form shows error feedback
- Server errors → Error message displayed
- Upload failures → Clear error shown

## Success Feedback

After successful operations:

- Success message appears for 3 seconds
- "Profile updated successfully!"
- "Password changed successfully!"
- "Account deleted. Redirecting..."
- etc.

## Integration Points

The component integrates with:

- `AuthContext` - Gets current user and logout method
- `useNavigate` - Handles redirects after logout/delete
- `api` service - All backend communication

## Building & Deployment

Build the frontend:

```bash
npm run build
```

Development server:

```bash
npm run dev
```

All TypeScript checks pass, no errors.

## Testing Features

1. **Image Upload**

   - Select image file
   - Watch loading spinner
   - See success message
   - Image saves to Cloudinary and profile

2. **Profile Update**

   - Edit any field
   - Click save
   - Data persists to backend

3. **Password Change**

   - Fill password form
   - Submit
   - Next login uses new password

4. **Logout**

   - Click sign out
   - Confirm
   - Redirects to login

5. **Delete Account**
   - Two confirmations required
   - Password verification needed
   - Account permanently removed

## File Structure

```
src/
├── pages/
│   └── ProfileSettings.tsx (FULLY FUNCTIONAL)
├── services/
│   └── api.ts (with new profile methods)
├── contexts/
│   └── AuthContext.tsx (used for user data)
└── types/
    └── index.ts (User type)

.env (with Cloudinary config)
vite.config.ts (with path aliases)
tsconfig.app.json (with path aliases)
```

## Common Issues & Solutions

| Issue                    | Solution                                      |
| ------------------------ | --------------------------------------------- |
| Image upload fails       | Check Cloudinary credentials in .env          |
| Path aliases not working | Restart dev server after vite config change   |
| Form submission fails    | Verify backend server is running on port 3000 |
| User data not loading    | Check AuthContext is providing user object    |

## Next Development

When adding more features:

1. Add new API methods to `api.ts`
2. Import and use in components
3. Handle loading/error states
4. Show user feedback messages

All patterns are already established and ready to follow.

---

**Status**: Production Ready ✅
**Build**: Successful ✅  
**Tests**: Pass ✅
