# Spendwise

## Cloud-Based Smart Expense Tracking System

Spendwise is a simple, secure expense tracker for recording and understanding
personal spending. Users can create an account, add expenses in Indian rupees,
view spending summaries, and manage their own expense records from anywhere.

## Features

- Email/password sign up and login
- Add expenses with:
  - Title
  - Amount in Indian rupees (INR)
  - Category
  - Date
- View recent expenses
- Calculate total spending
- Calculate average expense
- Show the most-used expense category
- Delete personal expenses
- Supabase cloud database
- User-specific data protection with Row Level Security
- Responsive interface for desktop and mobile screens
- Free deployment with Vercel

## Technology Stack

| Technology | Purpose |
| --- | --- |
| React | User interface |
| TypeScript | Type-safe application code |
| Vite | Development server and production builds |
| Tailwind CSS | Utility-first styling support |
| Supabase Auth | Email/password authentication |
| Supabase PostgreSQL | Cloud database |
| Supabase Row Level Security | Protects user-owned expenses |
| Git and GitHub | Version control and source-code hosting |
| Vercel | Frontend deployment |

## Application Architecture

```text
User
  |
  v
React + TypeScript frontend
  |
  v
Supabase Authentication
  |
  v
Supabase PostgreSQL database
  |
  v
Vercel deployment
```

The frontend communicates directly with Supabase using the Supabase JavaScript
client. Row Level Security ensures that an authenticated user can access only
the expenses associated with their own user ID.

## Database Schema

The project uses a public `expenses` table with these main columns:

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Unique expense identifier |
| `user_id` | UUID | Owner from Supabase Authentication |
| `title` | Text | Expense title |
| `amount` | Numeric | Expense amount in rupees |
| `category` | Text | Food, Transport, Housing, Shopping, Health, or Other |
| `expense_date` | Date | Date of the expense |
| `created_at` | Timestamp | Record creation time |

The complete table definition and security policies are in
[`supabase/schema.sql`](./supabase/schema.sql).

## Run the Project Locally

### Requirements

- Node.js 18 or later
- npm
- Git
- A Supabase project for cloud authentication and storage

### Installation

Clone the repository:

```powershell
git clone https://github.com/Nikhil-V1/Cloud-Based-Smart-Expense-Tracking-System-.git
Set-Location .\Cloud-Based-Smart-Expense-Tracking-System-
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Create a production build:

```powershell
npm run build
```

## Supabase Configuration

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in the Supabase dashboard.
3. Run the SQL from [`supabase/schema.sql`](./supabase/schema.sql).
4. Copy `.env.example` to `.env.local`.
5. Add your Supabase project URL and public browser key.

Example `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-publishable-key
```

Never add `.env.local` to GitHub. It is excluded by `.gitignore`.

The Supabase service-role key, database password, and other secret keys must
never be placed in frontend code.

## Security

Row Level Security is enabled on the `expenses` table. The access policies
compare the current authenticated user with the expense owner:

```sql
auth.uid() = user_id
```

This protects the following operations:

- Reading personal expenses
- Adding expenses for the current user
- Deleting personal expenses

## Deployment

The application can be deployed for free with Vercel:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Keep the Vite defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables.
5. Deploy the project.
6. Add the Vercel URL in Supabase **Authentication → URL Configuration**.

## Testing Checklist

- [ ] Create a user account
- [ ] Log in and log out
- [ ] Add an expense
- [ ] Confirm the rupee amount and total update
- [ ] Refresh and confirm the expense remains
- [ ] Delete an expense
- [ ] Confirm the row exists in Supabase Table Editor
- [ ] Test that a second user cannot see the first user's expenses
- [ ] Run `npm run build`

## Project Structure

```text
src/
├── App.tsx              # Main dashboard and application logic
├── index.css            # Application styling
├── main.tsx             # React entry point
└── lib/
    └── supabase.ts      # Supabase client configuration

supabase/
└── schema.sql           # Database table and Row Level Security policies

public/
└── favicon.svg          # Spendwise browser icon
```

## Future Improvements

- Edit existing expenses
- Monthly and yearly spending filters
- Charts and reports
- Budget limits and alerts
- CSV or PDF export
- Recurring expenses
- Password reset flow
- Dark mode
- Progressive Web App support

## License

This project is created for educational and demonstration purposes.
