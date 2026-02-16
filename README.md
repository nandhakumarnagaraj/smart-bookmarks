
# Smart Bookmark App

This is a Next.js application that allows users to manage their bookmarks privately. It uses Supabase for Authentication (Google OAuth) and Realtime Database updates.

## Features
- **Google Login**: Secure authentication using `auth-helpers`.
- **Private Bookmarks**: Row Level Security ensures users see only their own data.
- **Real-time Updates**: Bookmarks sync across tabs instantly without refresh.
- **Premium UI**: Modern dark mode design with glassmorphism effects.

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Once created, go to **Project Settings > API**.
3. Copy the `Project URL` and `anon public` key.

### 2. Configure Environment Variables
Inside `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database Schema
Go to the **SQL Editor** in your Supabase dashboard and run the following script:

```sql
-- Create bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.bookmarks enable row level security;

-- Create Policies
create policy "Users can view their own bookmarks"
on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can create their own bookmarks"
on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookmarks"
on public.bookmarks for update using (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
on public.bookmarks for delete using (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
alter publication supabase_realtime add table public.bookmarks;
```

### 4. Configure Google Auth
1. Go to **Authentication > Providers** in Supabase.
2. Enable **Google**.
3. You will need a Google Cloud Project with OAuth credentials.
   - Authorized Javascript Origins: `https://<your-project>.supabase.co`
   - Authorized Redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
4. Enter the Client ID and Secret in Supabase settings.

### 5. Deployment on Vercel
1. Push this repo to GitHub.
2. Log in to Vercel and import the project.
3. Automatically detection should work (Next.js).
4. Add the **Environment Variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel project settings.
5. Deploy!

## Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React
