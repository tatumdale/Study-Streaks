# Supabase API Key Migration Guide

## Overview

Supabase has introduced a new API key system that replaces the legacy JWT-based `anon` and `service_role` keys. This guide explains how to migrate to the new system while maintaining backward compatibility.

## Key Differences

### Legacy System (JWT-based)
- **Anon Key**: `eyJhbGciOiJIUzI1NiIs...` (JWT format)
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIs...` (JWT format)
- Tied to project's JWT secret
- Limited rotation capabilities

### New System (API Keys)
- **Publishable Key**: `sb_publishable_[random-string]` (safe for frontend)
- **Secret Key**: `sb_secret_[random-string]` (server-side only)
- Independent of JWT secret
- Easy rotation and management
- More granular security controls

## Migration Steps

### 1. Create New API Keys in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings → API Keys**
3. Click **"Create New Key"** or look for key generation options
4. Create two keys:
   - **Publishable Key** (for frontend/client-side use)
   - **Secret Key** (for backend/server-side use)

### 2. Update Environment Variables

Add the new keys to your `.env.local` file:

```bash
# NEW API KEYS (Recommended)
SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key_here"
SUPABASE_SECRET_KEY="sb_secret_your_key_here"

# CLIENT-SIDE (Frontend)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key_here"

# LEGACY KEYS (Keep for fallback during migration)
SUPABASE_ANON_KEY="your_legacy_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_legacy_service_role_key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_legacy_anon_key"
```

### 3. Code Changes

The StudyStreaks codebase has been updated to support both systems with automatic fallback:

#### Database Client (`packages/database/src/client.ts`)
```typescript
// Automatically uses new keys if available, falls back to legacy
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY!,
  { /* config */ }
);

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY!,
  { /* config */ }
);
```

#### Environment Configuration (`packages/config/src/env.ts`)
- Added validation for new `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`
- Made legacy keys optional to support gradual migration
- Added client-side `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 4. Testing the Migration

1. **Test with Legacy Keys** (current state):
   ```bash
   # Only set legacy keys
   SUPABASE_ANON_KEY="your_legacy_key"
   SUPABASE_SERVICE_ROLE_KEY="your_legacy_service_key"
   npm run dev
   ```

2. **Test with New Keys**:
   ```bash
   # Set new keys (legacy as fallback)
   SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
   SUPABASE_SECRET_KEY="sb_secret_..."
   npm run dev
   ```

3. **Verify Functionality**:
   - Authentication flows work
   - Database operations function
   - Real-time subscriptions active
   - Admin operations (if using server-side client)

### 5. Complete Migration

Once new keys are working:

1. **Update Production Environment**:
   - Add new keys to production environment variables
   - Deploy and verify functionality

2. **Remove Legacy Keys** (optional):
   - After confirming new keys work, you can remove legacy keys
   - Update environment configuration to require new keys

3. **Revoke Legacy Keys** (security):
   - In Supabase dashboard, revoke the old JWT-based keys
   - This prevents any unauthorized use of the exposed keys

## Security Benefits

### New API Key Advantages:
- **Easier Rotation**: Can be rotated without system-wide changes
- **Granular Control**: Different keys for different environments
- **Better Security**: Secret keys can't be used in browsers
- **Audit Trail**: Better tracking of key usage

### Frontend Security:
- Publishable keys are safe for public use
- No risk of exposing server-side capabilities
- Automatic browser protection for secret keys

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**:
   - Verify key format (`sb_publishable_` or `sb_secret_`)
   - Check that key is active in Supabase dashboard
   - Ensure correct environment variable names

2. **Authentication Failures**:
   - Verify Row Level Security (RLS) policies
   - Check that new keys have same permissions as legacy keys
   - Test with legacy keys to isolate issue

3. **Environment Variable Issues**:
   - Check that new variables are loaded correctly
   - Verify `NEXT_PUBLIC_` prefix for client-side variables
   - Restart development server after adding new variables

### Rollback Plan:
If issues occur, you can immediately rollback by:
1. Removing new API key environment variables
2. Keeping legacy keys active
3. The code will automatically fallback to legacy system

## Best Practices

1. **Key Management**:
   - Use different keys for development/staging/production
   - Rotate keys regularly
   - Monitor key usage in Supabase dashboard

2. **Environment Setup**:
   - Always use environment variables, never hardcode keys
   - Use `.env.local` for local development
   - Keep `.env.example` with placeholder values

3. **Security**:
   - Never expose secret keys in frontend code
   - Use publishable keys only for client-side operations
   - Implement proper error handling for key validation

## Current Status

✅ **Environment Configuration**: Updated to support both systems  
✅ **Database Client**: Supports automatic fallback  
✅ **Type Safety**: New keys included in environment validation  
⚠️ **Migration Needed**: Create new keys in Supabase dashboard  
⚠️ **Testing Required**: Verify functionality with new keys  

## Next Steps

1. **Immediate**: Create new API keys in Supabase dashboard
2. **Update**: Add new keys to your local `.env.local` file
3. **Test**: Verify all functionality works with new keys
4. **Deploy**: Update production environment variables
5. **Cleanup**: Revoke legacy keys once migration is complete

This migration ensures the StudyStreaks platform uses the latest, most secure Supabase API key system while maintaining compatibility during the transition period.