// 'use client';

// import Link from 'next/link';
// import { Moon, Sun } from 'lucide-react';
// import { useTheme } from 'next-themes';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// import { useAuth } from '@clerk/nextjs';

// function Navigation() {
//   const { theme, setTheme } = useTheme();
//   const { isSignedIn } = useAuth();

//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/dashboard', label: 'Dashboard' },
//     // { href: '/calculate', label: 'Calculate Readings' },
//   ];

//   return (
//     <nav className="bg-gray-800 dark:bg-gray-950 py-5 shadow-sm" key={isSignedIn ? 'signed-in' : 'signed-out'}>
//       <div className="container mx-auto px-4">
//         <ul className="flex items-center justify-between">
//           <div className="flex items-center gap-8">
//             {navLinks.map((link) => (
//               <motion.li
//                 key={link.href}
//                 whileHover={{ scale: 1.05, opacity: 0.8 }}
//                 transition={{ type: 'spring', stiffness: 300 }}
//                 className="list-none"
//               >
//                 <Button
//                   variant="ghost"
//                   className="text-gray-100 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-lg hover:bg-gray-700/50 dark:hover:bg-gray-900/50 transition-colors duration-300"
//                 >
//                   <Link href={link.href}>{link.label}</Link>
//                 </Button>
//               </motion.li>
//             ))}
//           </div>
//           <div className="flex items-center gap-4">
//             <SignedIn>
//               <motion.li
//                 whileHover={{ scale: 1.05, opacity: 0.8 }}
//                 transition={{ type: 'spring', stiffness: 300 }}
//                 className="list-none"
//               >
//                 <UserButton afterSignOutUrl="/" />
//               </motion.li>
//             </SignedIn>
//             <SignedOut>
//               <motion.li
//                 whileHover={{ scale: 1.05, opacity: 0.8 }}
//                 transition={{ type: 'spring', stiffness: 300 }}
//                 className="list-none"
//               >
//                 <Button variant="ghost" asChild>
//                   <Link href="/sign-in">Sign In</Link>
//                 </Button>
//               </motion.li>
//             </SignedOut>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//               className="text-gray-100 dark:text-gray-200"
//             >
//               {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//             </Button>
//           </div>
//         </ul>
//       </div>
//     </nav>
//   );
// }

// export { Navigation };


'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

function Navigation() {
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  // Fallback UI without theme-dependent icons to avoid mismatch
  if (!mounted) {
    return (
      <nav className="bg-gray-800 py-5 shadow-sm">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="list-none"
                >
                  <Button
                    variant="ghost"
                    className="text-gray-100 hover:text-indigo-600 hover:bg-gray-700/50 transition-colors duration-300 text-lg"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                </motion.li>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <SignedIn>
                <motion.li
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="list-none"
                >
                  <UserButton afterSignOutUrl="/" />
                </motion.li>
              </SignedIn>
              <SignedOut>
                <motion.li
                  whileHover={{ scale: 1.05, opacity: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="list-none"
                >
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </motion.li>
              </SignedOut>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-100"
                disabled // Disable button in fallback to avoid interaction
              >
                {/* Placeholder icon or empty to avoid mismatch */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  {/* Neutral placeholder path */}
                  <circle cx="12" cy="12" r="0" />
                </svg>
              </Button>
            </div>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 dark:bg-gray-950 py-5 shadow-sm" key={isSignedIn ? 'signed-in' : 'signed-out'}>
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.li
                key={link.href}
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="list-none"
              >
                <Button
                  variant="ghost"
                  className="text-gray-100 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-lg hover:bg-gray-700/50 dark:hover:bg-gray-900/50 transition-colors duration-300"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </motion.li>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              <motion.li
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="list-none"
              >
                <UserButton afterSignOutUrl="/" />
              </motion.li>
            </SignedIn>
            <SignedOut>
              <motion.li
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="list-none"
              >
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </motion.li>
            </SignedOut>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-gray-100 dark:text-gray-200"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </ul>
      </div>
    </nav>
  );
}

export { Navigation };