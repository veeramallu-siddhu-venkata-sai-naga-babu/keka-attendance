# Keka Attendance Automation

Automated clock-in and clock-out on Keka (via Microsoft SSO login) using Playwright, scheduled with GitHub Actions.

## How it works

- `clock-in.js` runs Monday–Friday at ~9:23 AM IST (plus 0–7 min random jitter)
- `clock-out.js` runs Monday–Friday at ~7:37 PM IST (plus 0–7 min random jitter)
- `keepalive.yml` makes an empty commit every 45 days so GitHub doesn't auto-disable the schedules after 60 days of repo inactivity

## Setup

### 1. Create a private GitHub repository

Keep it **private** — the repo name and workflow logs reference your company's Keka portal.

### 2. Push this project

```bash
cd keka-attendance
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<your-username>/keka-attendance.git
git push -u origin main
```

### 3. Add secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name     | Value                        |
| --------------- | ---------------------------- |
| `KEKA_EMAIL`    | Your Microsoft/Keka email    |
| `KEKA_PASSWORD` | Your Microsoft/Keka password |

### 4. Test manually

Go to the **Actions** tab → select **Clock In** (or **Clock Out**) → **Run workflow**. Manual runs skip the random delay, so they execute immediately.

If a run fails, download the `failure-screenshot` artifact from the run page to see what the page looked like.

### 5. Done

The schedules take over from here. A failed run sends you an email notification from GitHub.

## Changing the schedule

Cron in GitHub Actions is **UTC**. IST = UTC + 5:30, so subtract 5 hours 30 minutes from your desired IST time.

Examples:

| IST time | Cron (UTC)       |
| -------- | ---------------- |
| 9:00 AM  | `30 3 * * 1-5`   |
| 9:30 AM  | `0 4 * * 1-5`    |
| 6:00 PM  | `30 12 * * 1-5`  |
| 7:00 PM  | `30 13 * * 1-5`  |

Edit the `cron:` line in `.github/workflows/clock-in.yml` and `clock-out.yml`.

Note: scheduled runs can start 5–30 minutes late during GitHub's busy periods — the schedule is a "not before" time, not an exact time.

## Running locally

```bash
npm install
npx playwright install chromium
KEKA_EMAIL="you@company.com" KEKA_PASSWORD="..." npm run clock-in
```

## Known limitations

- **Holidays / leave days are not handled.** The scripts will still try to clock in on public holidays and fail (or worse, succeed). Add a holiday list check at the top of the scripts, or disable the workflows before going on leave (Actions tab → workflow → ⋯ → Disable workflow).
- **MFA will break this.** The flow assumes plain email + password Microsoft login. If your org enforces MFA/Authenticator prompts, headless login won't work as-is.
- **Selectors are text-based.** If Keka changes button labels ("Web Clock-In", "Clock-out"), update the locators in the scripts.
