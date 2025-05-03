"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navigation } from "@/components/ui/Navigation";
import Link from "next/link";
import ProfileHeader from "./ProfileHeader";
import AddReadingForm from "./AddReadingForm";
import ReadingsTable from "./ReadingsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types for Profile and Reading data
type Reading = {
  id: number;
  profile_id: number;
  date: string;
  previous: number;
  current: number;
  consumption: number;
};

type Profile = {
  id: number;
  user_id: string;
  tenant_name: string;
  meter_number: string;
  last_consumption: number | null;
  last_reading_date: string | null;
  initial_reading: number | null;
};

// Main Meter Details Component
export default function MeterDetails() {
  const { isSignedIn, getToken, userId } = useAuth();
  const params = useParams();
  const profileId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authChecked, setAuthChecked] = useState(false); // New state to track auth check

  // Fetch profile and readings on component mount
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Wait for Clerk to resolve authentication state
      if (isSignedIn === undefined) {
        return; // Don't proceed until isSignedIn is resolved
      }

      setAuthChecked(true); // Mark auth check as complete

      if (!isSignedIn || !userId) {
        setError("Please sign in to view meter details");
        setIsLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: "default" });
        if (!token) throw new Error("Authentication token not found");

        // Fetch profile
        const profileResponse = await fetch(
          `http://localhost:8000/api/profiles/${profileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(
            errorData.detail ||
              `Failed to fetch profile: ${profileResponse.status}`
          );
        }
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch readings
        const readingsResponse = await fetch(
          `http://localhost:8000/api/readings?profile_id=${profileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!readingsResponse.ok) {
          const errorData = await readingsResponse.json();
          throw new Error(
            errorData.detail ||
              `Failed to fetch readings: ${readingsResponse.status}`
          );
        }
        const readingsData = await readingsResponse.json();
        setReadings(readingsData);

        // Clear error state on successful fetch
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [isSignedIn, userId, profileId, getToken]);

  // Handle adding a new reading
  const handleAddReading = (newReading: Reading) => {
    setReadings((prevReadings) => [...prevReadings, newReading]);
    setError(null); // Clear error on successful action
  };

  // Handle deleting a reading
  const handleDeleteReading = async (readingId: number) => {
    if (!isSignedIn || !userId) {
      setError("Please sign in to delete reading");
      return;
    }

    try {
      const token = await getToken({ template: "default" });
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `http://localhost:8000/api/readings/${readingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Failed to delete reading: ${response.status}`
        );
      }

      setReadings((prevReadings) =>
        prevReadings.filter((reading) => reading.id !== readingId)
      );
      setError(null); // Clear error on successful action
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  // Handle updating the initial reading
  const handleUpdateInitialReading = async (initialReading: number) => {
    if (!profile) return;
    try {
      const token = await getToken({ template: "default" });
      if (!token) throw new Error("Authentication token not found");

      const payload = { initial_reading: initialReading };
      const response = await fetch(
        `http://localhost:8000/api/profiles/${profileId}/initial-reading`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            `Failed to update initial reading: ${response.status}`
        );
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setError(null); // Clear error on successful action
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  if (!authChecked) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
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
          to manage readings.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        </div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-6 text-[#1a1a2e] dark:text-gray-100">
            Meter Details
          </h1>
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border-indigo-600 dark:border-indigo-400"
            >
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {error.includes("Session") && (
                  <Link
                    href="/sign-in"
                    className="underline ml-1 text-indigo-600 dark:text-indigo-400"
                  >
                    Sign in again
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}
          {profile && (
            <div>
              <ProfileHeader
                profile={profile}
                onUpdateInitialReading={handleUpdateInitialReading}
                isLoading={isLoading}
              />
              <AddReadingForm
                profile={profile}
                onAddReading={handleAddReading}
                isLoading={isLoading}
                setError={setError}
                getToken={getToken}
                isSignedIn={isSignedIn}
                userId={userId}
              />
              <ReadingsTable
                readings={readings}
                onDeleteReading={handleDeleteReading}
              />
            </div>
          )}
        </motion.div>
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