This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demo environment

Configure `DATABASE_URL` to point to a dedicated demo PostgreSQL database, separate from local development. Set `AUTH_SECRET` to a unique random value containing at least 32 bytes; generate one with `openssl rand -hex 32`. The application rejects missing or undersized secrets and does not use a built-in fallback. Do not commit the generated value.

If using `npm run seed:users`, set all `INITIAL_ADMIN_*`, `INITIAL_USER_*`, and `INITIAL_INACTIVE_*` values in `.env`. Names, usernames, and email addresses must be valid and unique; each password must be a distinct 64-character hex value generated with `openssl rand -hex 32`. The seed script rejects missing/default credentials and does not print passwords or database connection details.

`npm run build` runs an upload check before `next build` and another check after it. The pre-build check rejects any file under `public/uploads/arsip`; files under `storage/uploads/arsip` do not by themselves fail that check. The post-build check compares upload source paths and file names with paths and names found in `.next`. This is a targeted check, not a comprehensive verification of the contents of a deployment package. `outputFileTracingExcludes` excludes upload paths from Next.js server output tracing only; it does not protect files placed in `public/`, which Next.js can serve as public assets. These checks do not guarantee that private documents are safe or verify the final deployment artifact. Archive files and generated Berita Acara PDFs remain on local disk at runtime; persistent private hosting storage must be configured separately before deployment. Run hosting builds from a clean source checkout without uploaded files.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
