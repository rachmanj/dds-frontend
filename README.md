# DDS Portal Frontend

This is the frontend application for the DDS Portal, built with Next.js, NextAuth.js, and Shadcn UI. It connects to a Laravel Sanctum backend for authentication and API access.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the setup script to create development environment variables:
   ```
   npm run setup
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Production Deployment

### Option 1: Using the deployment script

1. Run the deployment setup script:

   ```
   npm run deploy-setup
   ```

   This will prompt you for your production URLs and generate a secure secret.

2. Build the application:

   ```
   npm run build
   ```

3. Deploy the following files to your production server:

   - `.next/` folder
   - `public/` folder
   - `package.json`
   - `.env.production`

4. On your production server, install production dependencies:

   ```
   npm install --production
   ```

5. Start the production server:
   ```
   npm start
   ```

### Option 2: Manual deployment

1. Create a `.env.production` file with the following variables:

   ```
   NEXTAUTH_URL=https://your-production-domain.com
   NEXTAUTH_SECRET=your-secure-secret-key
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-api-domain.com
   ```

2. Build the application:

   ```
   npm run build
   ```

3. Follow steps 3-5 from Option 1 to deploy and run the application.

## Environment Variables

- `NEXTAUTH_URL`: The base URL of your frontend application
- `NEXTAUTH_SECRET`: A secure secret key for NextAuth.js
- `NEXT_PUBLIC_BACKEND_URL`: The URL of your Laravel backend API

## Default Test User

The application comes with a default test user:

- Email: dadsdevteam@example.com
- Password: dds2024

## Features

- Authentication with Laravel Sanctum
- Protected routes with NextAuth.js middleware
- Modern UI with Shadcn UI components
- Responsive design
- Type-safe with TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Laravel backend running on http://localhost:8000

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with the following content:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Authentication Flow

This application uses Next-Auth to authenticate with a Laravel Sanctum backend:

1. User enters credentials on the login page
2. Next-Auth sends a request to the Laravel backend to authenticate
3. If successful, the user is redirected to the dashboard
4. Protected routes are handled by middleware

## Available Login Credentials

- Email: dadsdevteam@example.com
- Password: dds2024

## Project Structure

- `src/app/api/auth/[...nextauth]/route.ts` - Next-Auth API route
- `src/app/login/page.tsx` - Login page
- `src/app/dashboard/page.tsx` - Dashboard page (protected)
- `src/middleware.ts` - Authentication middleware
- `src/app/providers.tsx` - Context providers for the application

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
