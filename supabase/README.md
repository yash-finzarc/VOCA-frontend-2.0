# Supabase Integration

This folder contains all Supabase-related code for the VOCA application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create a `.env.local` file** in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings: https://app.supabase.com/project/_/settings/api

3. **Set up Row Level Security (RLS) policies** in your Supabase dashboard to ensure proper access control.

## Structure

- `client.ts` - Supabase client initialization
- `auth.ts` - Authentication functions (sign up, sign in, sign out, etc.)
- `types.ts` - TypeScript types based on your database schema
- `services/` - Service files for each database table:
  - `organizations.ts` - Organization management
  - `projects.ts` - Project management
  - `calls.ts` - Call data and statistics
  - `messages.ts` - Message data (placeholder - add messages table to schema)
  - `system-prompts.ts` - System prompt management
  - `logs.ts` - Activity logs

## Authentication

The app uses Supabase Auth for user authentication. The auth context (`lib/auth-context.tsx`) has been updated to:
- Sign up new users
- Sign in existing users
- Create user records in the `users` table
- Create organizations for new users
- Load user data from Supabase

## Database Schema

The application expects the following main tables:
- `users` - User accounts
- `organizations` - Organizations
- `organization_members` - User-organization relationships
- `projects` - Projects within organizations
- `calls` - Call records
- `calling_campaigns` - Calling campaigns
- `system_prompts` - AI system prompts
- `activity_logs` - Activity logging
- And more (see the schema provided)

## Usage

Import the services you need:

```typescript
import { getProjectsByOrganization } from "@/supabase/services/projects"
import { getCallsByProject } from "@/supabase/services/calls"
```

## Next Steps

1. **Run the database migrations:**
   - Go to your Supabase SQL Editor: https://app.supabase.com/project/_/sql/new
   - Run `supabase/migrations/001_create_user_trigger.sql` - This automatically creates user records when users sign up
   - Run `supabase/migrations/002_rls_policies.sql` - This sets up Row Level Security policies

2. **Set up RLS policies** (if you didn't run the migration):
   - The migration file includes all necessary RLS policies
   - These policies ensure users can only access their own data and data from their organizations

3. **Add the `messages` table** to your schema if needed

4. **Test authentication flow:**
   - Sign up a new user
   - Sign in
   - Verify user data loads correctly

5. **Test CRUD operations** for projects, calls, etc.

## Troubleshooting

### 406 Errors (Not Acceptable)
- This usually means RLS policies are blocking access
- Make sure you've run the RLS policies migration
- Check that the user is authenticated (has a valid session)

### 400 Errors (Bad Request)
- Check that all required fields are being sent
- Verify the table structure matches the expected schema

### 409 Errors (Conflict)
- Usually means a duplicate entry (e.g., user already exists)
- The code handles these gracefully, but you may see warnings in console

