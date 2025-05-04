// Project: Next.js 13.4+ with Clerk Authentication
// // This file is used to create a home page that redirects users to the dashboard if they are already signed in.


'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HomeClient from './HomeClient';

export default function Home() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn && userId) {
      router.push('/dashboard');
    }
  }, [isSignedIn, userId, router]);

  if (isSignedIn && userId) {
    return null; // Avoid rendering while redirecting
  }

  return <HomeClient />;
}


// import { auth } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';
// import HomeClient from './HomeClient';

// export default async function Home() {
//   const { userId } = await auth();
//   if (userId) {
//     redirect('/dashboard');
//   }

//   return <HomeClient />;
// }