# Smart Bookmark App

A modern, real-time bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**.

## Features

- **Google OAuth Login**: Secure, passwordless authentication.
- **Real-time Sync**: Bookmarks appear instantly across all tabs and devices without refreshing (powered by Supabase Realtime).
- **Private & Secure**: Row Level Security (RLS) ensures users can only access their own data.
- **Premium UI**: Dark mode aesthetic with glassmorphism, gradients, and smooth animations using Framer Motion.
- **Responsive**: Fully optimized for mobile and desktop.

## Technlogy Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React

---

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/nandhakumarnagaraj/smart-bookmarks.git
cd smart-bookmarks
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Supabase Setup
1. **Create a Project**: Go to [database.new](https://database.new).
2. **Run SQL**: Execute the following SQL in the Supabase SQL Editor to create the table and security policies:

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

-- Policies for security
create policy "Users can view their own bookmarks"
on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can create their own bookmarks"
on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
on public.bookmarks for delete using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.bookmarks;
```

3. **Configure Google Auth**:
   - Go to **Authentication > Providers > Google**.
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).
   - Set **Authorized Redirect URI** to `https://<your-project>.supabase.co/auth/v1/callback`.
   - Add Client ID and Secret to Supabase.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Challenges Faced & Solutions

### 1. Real-time Updates with RLS
**Challenge**: Initially, new bookmarks wouldn't appear instantly for other clients because the real-time subscription wasn't filtering by the specific user ID, and RLS policies were blocking broad subscriptions.
**Solution**: I implemented a specific Postgres change filter in the frontend subscription: `filter: 'user_id=eq.${userId}'`. This ensures the client only listens for changes relevant to the logged-in user, working perfectly with RLS safety.

### 2. Tailwind CSS v4 Integration
**Challenge**: The latest Create Next App installed Tailwind v4, but the default configuration files generated were for v3, leading to unstyled pages.
**Solution**: I updated `globals.css` to use the new `@import "tailwindcss";` syntax instead of the deprecated `@tailwind` directives, resolving the build issue immediately.

### 3. Google OAuth Redirects
**Challenge**: Handling redirects correctly between local development (`localhost`) and production domains.
**Solution**: I created a dynamic route handler at `/auth/callback` that checks the origin. It correctly exchanges the code for a session and redirects the user back to the correct domain, ensuring smooth logins in both environments.

### 4. Preventing Layout Shift
**Challenge**: Loading states caused jarring layout shifts when fetching bookmarks.
**Solution**: I implemented optimistic UI updates in the React components while the Server Action processes the request, and used `framer-motion` for `layout` animations to make list reordering smooth and natural.

## Additional Resources

- [Resource 1](https://drive.google.com/file/d/1tIIFpRATD1NjnqEV3DFVgvnVyNIocQpb/view?usp=drive_link)
- [Resource 2](https://drive.google.com/file/d/1oPYth0sF0L_qoqOL7e9BZYYHKi2Bg6FP/view?usp=drive_link)
- [Resource 3](https://drive.google.com/file/d/15cQgmFk7pLgBfvIaa2VOQfaQNGcUZNnJ/view?usp=drive_link)
