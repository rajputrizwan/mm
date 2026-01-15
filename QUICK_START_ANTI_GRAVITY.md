# 🚀 Anti-Gravity Design System - Quick Start Guide

## 📦 Installation (5 minutes)

### Step 1: Install Dependencies

```bash
# Navigate to frontend
cd intervau-ai-frontend

# Install required packages
npm install clsx tailwind-merge

# Return to root
cd ..
```

### Step 2: Verify Files Created ✅

The following files have been created for you:

**Frontend:**
- ✅ `src/utils/cn.ts` - Class name utility
- ✅ `src/components/common/AntiGravityCard.tsx` - Example floating card
- ✅ `ANTI_GRAVITY_REFACTOR_PLAN.md` - Complete implementation plan

**Backend:**
- ✅ `src/utils/i18n.ts` - Error codes for i18n-ready API responses

---

## 🎯 Quick Win #1: Use the Card Component (10 minutes)

### Before:
```typescript
// Old hardcoded style in Login.tsx (line 101)
<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
  {/* Content */}
</div>
```

### After:
```typescript
import { AntiGravityCard } from '../components/common/AntiGravityCard';

<AntiGravityCard variant="elevated" padding="lg">
  {/* Content */}
</AntiGravityCard>
```

**Benefits:**
- ✅ Consistent styling across app
- ✅ Automatic dark mode support
- ✅ Hover effects built-in
- ✅ Easier to maintain

---

## 🎯 Quick Win #2: Update Backend Errors (15 minutes)

### Step 1: Import i18n utilities

```typescript
// In authController.ts
import { ErrorCodes, createErrorResponse, createSuccessResponse } from '../utils/i18n';
```

### Step 2: Replace hardcoded error messages

**Before:**
```typescript
return res.status(401).json({
  success: false,
  message: 'Invalid email or password',
});
```

**After:**
```typescript
const errorResponse = createErrorResponse(ErrorCodes.AUTH_INVALID_CREDENTIALS, 401);
return res.status(errorResponse.statusCode).json(errorResponse.body);
```

**Benefits:**
- ✅ Frontend can translate to user's language
- ✅ Consistent error structure
- ✅ Type-safe error codes

---

## 🎯 Quick Win #3: Add Backend Error Translations (10 minutes)

### Update `intervau-ai-frontend/src/locales/en.json`

Add to your existing error section:

```json
{
  "error": {
    "auth": {
      "invalidCredentials": "Invalid email or password. Please try again.",
      "userExists": "An account with this email already exists.",
      "accountDeactivated": "Your account has been deactivated. Contact support.",
      "tokenExpired": "Your session has expired. Please log in again.",
      "invalidToken": "Invalid authentication token.",
      "tokenRequired": "Authentication required.",
      "unauthorized": "You are not authorized to perform this action.",
      "forbidden": "Access denied."
    },
    "validation": {
      "emailRequired": "Email address is required.",
      "emailInvalid": "Please enter a valid email address.",
      "passwordRequired": "Password is required.",
      "passwordWeak": "Password must be at least 6 characters with uppercase, lowercase, and numbers.",
      "passwordMismatch": "Passwords do not match.",
      "nameRequired": "Name is required.",
      "roleRequired": "Please select a role.",
      "roleInvalid": "Invalid role selected.",
      "companyRequired": "Company name is required for HR registration.",
      "invalidLanguage": "The selected language is not supported.",
      "fieldRequired": "This field is required.",
      "invalidInput": "Invalid input. Please check your entries."
    },
    "resource": {
      "notFound": "The requested resource was not found.",
      "alreadyExists": "This resource already exists.",
      "deleted": "This resource has been deleted."
    },
    "file": {
      "tooLarge": "File size exceeds the maximum limit.",
      "invalidType": "Invalid file type. Please upload a valid file.",
      "uploadFailed": "File upload failed. Please try again."
    },
    "internalServer": "An unexpected error occurred. Please try again later.",
    "badRequest": "Invalid request. Please check your input.",
    "serviceUnavailable": "Service temporarily unavailable. Please try again later."
  }
}
```

**Then copy to other languages:**
- `es.json` (Spanish)
- `fr.json` (French)
- `de.json` (German)
- `pt.json` (Portuguese)

---

## 🎯 Quick Win #4: Update Tailwind Config (5 minutes)

### Update `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Add design tokens
      colors: {
        // Neutral palette for light mode
        neutral: {
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Dark mode palette
        dark: {
          0: '#0a0a0a',
          50: '#0f0f0f',
          100: '#171717',
          200: '#1f1f1f',
          300: '#2a2a2a',
          400: '#3a3a3a',
          500: '#525252',
          600: '#737373',
          700: '#a3a3a3',
          800: '#d4d4d4',
          900: '#e5e5e5',
        },
      },
      // Enhanced shadows for floating effect
      boxShadow: {
        'float-sm': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)',
        'float-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'float-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'float-xl': '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
      },
      // Animation for micro-interactions
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 🧪 Test Your Changes (5 minutes)

### 1. Start the development servers

```bash
# Terminal 1 - Backend
cd intervau-ai-backend
npm run dev

# Terminal 2 - Frontend
cd intervau-ai-frontend
npm run dev
```

### 2. Test the AntiGravityCard

Create a test page or update an existing one:

```typescript
import { AntiGravityCard } from '@/components/common/AntiGravityCard';

export function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <AntiGravityCard variant="flat">
        <h3>Flat Card</h3>
        <p>No shadow, minimal elevation</p>
      </AntiGravityCard>

      <AntiGravityCard variant="elevated">
        <h3>Elevated Card (Default)</h3>
        <p>Subtle shadow - Anti-Gravity default</p>
      </AntiGravityCard>

      <AntiGravityCard variant="floating" hover>
        <h3>Floating Card with Hover</h3>
        <p>Maximum elevation with hover effect</p>
      </AntiGravityCard>
    </div>
  );
}
```

### 3. Test backend error response

Make a login request with wrong credentials and check the response:

```json
{
  "success": false,
  "messageKey": "error.auth.invalidCredentials",
  "timestamp": "2026-01-16T01:00:00.000Z"
}
```

---

## 📚 Next Steps

Now that you have the foundation, proceed with the full refactor:

### Week 1: Components
- [ ] Refactor `Button.tsx` with design tokens
- [ ] Refactor `Input.tsx` with consistent styling
- [ ] Create `Modal.tsx` with floating effect
- [ ] Update `Navbar.tsx` and `Sidebar.tsx`

### Week 2: Pages
- [ ] Update `Login.tsx` and `Register.tsx`
- [ ] Update `Dashboard.tsx` and `HRDashboard.tsx`
- [ ] Update `ProfileSettings.tsx`

### Week 3: Features & Polish
- [ ] Migrate all feature pages
- [ ] Test dark mode thoroughly
- [ ] Verify all 5 languages work
- [ ] Run accessibility audit

---

## 🔍 Troubleshooting

### Issue: `cn` function not found
**Solution:** Make sure you installed `clsx` and `tailwind-merge`:
```bash
npm install clsx tailwind-merge
```

### Issue: Dark mode colors not working
**Solution:** Verify tailwind.config.js has `darkMode: 'class'` and restart dev server

### Issue: TypeScript errors on imports
**Solution:** Check your `tsconfig.json` has path aliases configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 💡 Pro Tips

1. **Start Small**: Refactor one component at a time
2. **Test Both Modes**: Always check light AND dark mode
3. **Use VSCode**: Install Tailwind CSS IntelliSense extension
4. **Keep git commits small**: Commit after each component refactor
5. **Document as you go**: Add comments for future team members

---

## 📞 Support

If you get stuck:
1. Check `ANTI_GRAVITY_REFACTOR_PLAN.md` for detailed guidance
2. Review example components in `src/components/common/`
3. Test in both light and dark modes
4. Verify browser console for errors

---

## ✅ Pre-implementation Checklist

Before you start the full migration:

- [ ] Dependencies installed (`clsx`, `tailwind-merge`)
- [ ] Tailwind config updated with new design tokens
- [ ] `cn.ts` utility working
- [ ] `AntiGravityCard.tsx` renders correctly
- [ ] Backend `i18n.ts` created
- [ ] Error translations added to locales
- [ ] Dev servers running without errors
- [ ] Team briefed on design system approach

---

**Status**: ✅ Ready to begin implementation
**Estimated Time**: 3-4 weeks for full migration
**Impact**: High (unified design, better UX, easier maintenance)

Let's build something amazing! 🚀
