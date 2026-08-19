# FoodConnect Direct

Built in [Lovable](https://lovable.dev), backed by [Supabase](https://supabase.com). This repo can be developed locally with your own IDE; changes pushed here also sync back to Lovable.

## Local setup

Prerequisites: Node.js 20+ and npm.

```sh
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# then fill in .env with your Supabase project's URL and anon/publishable key
# (Supabase dashboard > Project Settings > API)

# 3. Start the dev server
npm run dev
```

The app talks directly to your live Supabase project for auth, the database, and edge functions (`scan-product`, `website-bot`) — there's no local database to set up. The edge functions are deployed and managed in the Supabase project, not run locally; they depend on a `LOVABLE_API_KEY` secret configured in the Supabase project's edge function settings.

Other scripts: `npm run build`, `npm run lint`, `npm run test`, `npm run preview`.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Visit the Lovable project dashboard and start prompting — changes made via Lovable are committed automatically to this repo.

**Use your preferred IDE**

Follow the local setup steps above. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
