# Smart Bookmark App

A full-stack bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can sign in with Google, save personal bookmarks, and manage them in real time — all in a clean, professional interface.

---

## Live Demo

[View the deployed application on Vercel](https://smart-bookmark-app-nine-beige.vercel.app/)

---

## Features

- Google OAuth sign-in — no email or password required
- Add bookmarks with a title and URL
- Bookmarks are private — each user only sees their own
- Real-time updates — changes appear instantly without a page refresh
- Delete bookmarks with a single click
- Favicon auto-fetch for each saved link
- Search through saved bookmarks by title or URL
- Responsive and accessible design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Authentication | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime (postgres_changes) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Project Structure

```
/app
  /dashboard        - Main bookmark manager page (protected)
  /login            - Google sign-in page
/lib
  supabaseClient.ts - Supabase client initialization
```

---

## Getting Started Locally

### Prerequisites

- Node.js 18 or higher
- A Supabase account and project
- A Google OAuth app configured in Supabase

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project under Settings > API.

### 4. Set up the database

Run the following SQL in your Supabase SQL editor to create the bookmarks table:

```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);
```

### 5. Enable Row Level Security

Run the following to ensure each user can only access their own bookmarks:

```sql
alter table bookmarks enable row level security;

create policy "Users can manage their own bookmarks"
on bookmarks for all
using (auth.uid() = user_id);
```

### 6. Configure Google OAuth in Supabase

Go to Supabase > Authentication > Providers > Google and follow the setup instructions. Add the following to your allowed redirect URLs:

```
http://localhost:3000/dashboard
```

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

This application is deployed on Vercel.

To deploy your own instance:

1. Push the repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Update the redirect URL in `LoginPage.tsx` from `localhost:3000` to your live Vercel domain
5. Add the Vercel URL to the allowed redirect URLs in Supabase > Authentication > URL Configuration

---

## Challenges and How I Solved Them

### 1. Real-time updates across tabs

The requirement was for bookmarks to sync instantly across multiple open tabs without a page refresh. I implemented this using Supabase Realtime's `postgres_changes` subscription. The channel listens for any insert, update, or delete event on the bookmarks table and re-fetches the list immediately when a change is detected.

### 2. Keeping bookmarks private per user

The initial implementation fetched all bookmarks from the table regardless of which user was logged in. To fix this properly, I enabled Row Level Security (RLS) in Supabase and added a policy that restricts all database operations to rows where the `user_id` column matches the authenticated user's ID. This means privacy is enforced at the database level, not just in the application code.

### 3. Redirect after Google OAuth

After signing in with Google, Supabase redirects the user back to the app. During local development, the redirect pointed to `localhost`. For production on Vercel, the redirect URL needed to be updated to the live domain, and that URL also had to be added to Supabase's allowed redirect list — otherwise Supabase would block the redirect for security reasons.

### 4. Extracting the user's name from Google OAuth

Google OAuth returns user metadata including the full name. I wrote a helper function that reads `user_metadata.full_name` first, falls back to `user_metadata.name`, and then falls back to the email prefix if neither is available — so the greeting always shows something meaningful regardless of what Google provides.

---

## Author

Built as part of a fullstack screening assignment.