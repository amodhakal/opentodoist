# Open Todoist

**Bulk-add tasks to Todoist using AI-powered text extraction.**

Stop manually creating dozens of tasks one-by-one. Paste your unstructured notes, assignment lists, or brain dumps, and let AI intelligently extract actionable tasks with priorities and due dates. Review and approve before syncing to Todoist.

## Why This Exists

Adding 20+ tasks at the start of a semester (or project, or life event) is tedious. Todoist's UI requires clicking through forms for each task. This tool solves that by:

- **AI extraction** from freeform text (emails, notes, syllabi)
- **Intelligent priority detection** (p1-p4 mapping)
- **Date parsing** (recognizes "next Friday", "Jan 15", etc.)
- **Batch approval workflow** before committing to Todoist

## Features

- 🤖 Google Gemini AI task parsing
- 🔐 Secure Todoist OAuth authentication
- ✅ Review/approve interface before adding tasks
- 📊 Priority and due date auto-detection
- 🚦 Rate limiting (10 processes/week, upgradeable)
- 📱 Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Database**: PostgreSQL (Neon serverless) + Drizzle ORM
- **Auth**: Better Auth with Todoist OAuth
- **AI**: Google Gemini 2.0 Flash
- **APIs**: Todoist REST API v2

## Setup

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (local or Neon)
- Todoist account
- Google AI API key
- Todoist OAuth app credentials

### Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL=

# Gemini Key
GEMINI_API=

# Better Auth Secret
BETTER_AUTH_SECRET=

# Todoist API
TODOIST_ID=
TODOIST_SECRET=
TODOIST_OAUTH_URL=
TODOIST_TOKEN_URL=
TODOIST_REDIRECT_URL=
TODOIST_USERINFO_URL=
```

**Get Todoist OAuth credentials:**
1. Go to https://developer.todoist.com/appconsole.html
2. Create new app
4. Copy Client ID and Secret

### Installation

```bash
# Install dependencies
bun install

# Run database migrations
bun run db:push

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Connect Todoist**: Click "Sign in with Todoist" and authorize
2. **Paste text**: Dump your unstructured task list (emails, notes, bullet points)
3. **AI processes**: Gemini extracts tasks with priorities and dates
4. **Review**: Approve/reject individual tasks or bulk-approve all
5. **Sync**: Approved tasks are created in your Todoist inbox

### Example Input

```
finish cs231n assignment by friday (urgent)
read chapter 4 for next monday
schedule dentist appointment - low priority
buy groceries
email professor about project extension by wednesday
```

### AI Output

| Task | Priority | Due Date |
|------|----------|----------|
| Finish CS231N assignment | P1 (urgent) | This Friday |
| Read chapter 4 | P2 | Next Monday |
| Schedule dentist appointment | P4 | None |
| Buy groceries | P3 | None |
| Email professor about extension | P2 | Wednesday |

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

## Rate Limits

- Free tier: 10 processes per week
- Bypass: Set `bypassRateLimit: true` in admin user config (database edit required)

## Development

```bash
# Database management
bun run db:push         # Push schema changes
bun run db:studio       # Open Drizzle Studio GUI

# Type checking
bun run typecheck

# Linting
bun run lint
```
