"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navigation } from "@/components/ui/Navigation";
import { useRouter } from "next/navigation";
import ProfileList from "./ProfileList";

// Interface for Profile data
interface Profile {
  id: number;
  user_id: string;
  tenant_name: string;
  meter_number: string;
  last_consumption: number | null;
  last_reading_date: string | null;
}

// Component for Add Profile Card
const AddProfileCard: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-12"
  >
    <Card className="bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md">
      <CardContent className="text-center pt-6">
        <h2 className="text-2xl font-semibold text-[#1a1a2e] dark:text-gray-100 mb-4">
          Calculate and Track Meter Readings
        </h2>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          whileHover={{ scale: 1.1 }}
          className="w-[150px] h-[150px] bg-gray-200/80 dark:bg-gray-700/80 border-2 border-indigo-600 dark:border-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <Button asChild variant="ghost" size="icon" className="h-full w-full">
            <Link href="/add-profile">
              <Plus className="h-18 w-18 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </Link>
          </Button>
        </motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Click to add a new meter
        </p>
      </CardContent>
    </Card>
  </motion.section>
);

// Main Dashboard Component
export default function Dashboard() {
  const { isSignedIn, getToken } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false); // New state to track auth check
  const router = useRouter();

  // Fetch profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      // Wait for Clerk to resolve authentication state
      if (isSignedIn === undefined) {
        return; // Don't proceed until isSignedIn is resolved
      }

      setAuthChecked(true); // Mark auth check as complete

      if (!isSignedIn) {
        setError("Please sign in to view your dashboard");
        setIsLoading(false);
        router.push("/sign-in");
        return;
      }

      try {
        const token = await getToken({ template: "default" });
        if (!token) throw new Error("Authentication token not found");
        const response = await fetch("http://localhost:8000/api/profiles", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Session expired, please sign in again"
              : "Failed to fetch profiles"
          );
        }

        const data = await response.json();
        setProfiles(Array.isArray(data) ? data : []);
        setError(null); // Clear error on successful fetch
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [isSignedIn, getToken, router]);

  // Handle profile deletion
  const handleDeleteProfile = async (profileId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken({ template: "default" });
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `http://localhost:8000/api/profiles/${profileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to delete profile: ${response.status}`);
      }

      // Update state without full page refresh
      setProfiles((prevProfiles) =>
        prevProfiles.filter((profile) => profile.id !== profileId)
      );
      setError(null); // Clear error on successful action
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 p-4">
        <Navigation />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 p-4">
        <Navigation />
        <p className="text-center text-gray-600 dark:text-gray-300">
          Please{" "}
          <Link
            href="/sign-in"
            className="text-indigo-600 dark:text-indigo-400 underline"
          >
            sign in
          </Link>{" "}
          to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AddProfileCard />

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Loading meters...
            </p>
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 max-w-3xl mx-auto border-indigo-600 dark:border-indigo-400"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("Session") && (
                <Link
                  href="/sign-in"
                  className="underline ml-2 text-indigo-600 dark:text-indigo-400"
                >
                  Sign in again
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <ProfileList profiles={profiles} onDelete={handleDeleteProfile} />
        )}
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