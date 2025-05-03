// Project: Next.js 13.4+ with Clerk Authentication
// // This file is used to create a home page that redirects users to the dashboard if they are already signed in.

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import HomeClient from './HomeClient';

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return <HomeClient />;
}