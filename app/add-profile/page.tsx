'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Hash } from 'lucide-react';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {Navigation} from '@/components/ui/Navigation';
import Link from 'next/link';

// Form validation schema
const formSchema = z.object({
  tenant_name: z.string().min(1, 'Tenant name is required'),
  meter_number: z.string().min(1, 'Meter number is required'),
});

export default function AddProfile() {
  const { isSignedIn, getToken, userId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenant_name: '',
      meter_number: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isSignedIn || !userId) {
      setError('Please sign in to add a profile');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken({ template: 'default' });
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch('http://localhost:8000/api/profiles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_name: values.tenant_name,
          meter_number: values.meter_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add profile');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 p-4">
        <Navigation />
        <p className="text-center text-gray-600 dark:text-gray-300">
          Please{' '}
          <Link href="/sign-in" className="text-indigo-600 dark:text-indigo-400 underline">
            sign in
          </Link>{' '}
          to add a profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col">
      <header className="bg-[#1a1a2e] text-white text-3xl font-bold text-center py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Meter Readings Tracker
        </motion.div>
      </header>
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[#1a1a2e] dark:text-gray-100">
                Add New Meter Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 border-indigo-600 dark:border-indigo-400"
                >
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="tenant_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg text-gray-600 dark:text-gray-300">
                          Tenant Name
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <Input
                              placeholder="Enter tenant name"
                              {...field}
                              className="border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meter_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg text-gray-600 dark:text-gray-300">
                          Meter Number
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <Input
                              placeholder="Enter meter number (e.g., MTR123456)"
                              {...field}
                              className="border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg bg-gradient-to-r from-indigo-600 to-indigo-700"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add Profile'
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.section>
      </main>
      <footer className="bg-[#1a1a2e] text-white text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          © 2025 Meter Readings Tracker. All rights reserved.
        </motion.div>
      </footer>
    </div>
  );
}