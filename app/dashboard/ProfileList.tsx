import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface for Profile data
interface Profile {
  id: number;
  user_id: string;
  tenant_name: string;
  meter_number: string;
  last_consumption: number | null;
  last_reading_date: string | null;
}

// Helper function to capitalize first letter of each word
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to format date
const formatDate = (date: string | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

// Profile Card Component
const ProfileCard: React.FC<{
  profile: Profile;
  onDelete: (profileId: number) => void;
}> = ({ profile, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: profile.id * 0.1 }}
    whileHover={{ scale: 1.02 }}
    className="group"
    key={profile.id}
  >
    <Card className="bg-white dark:bg-gray-800 w-full h-48 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 flex flex-col border border-transparent group-hover:border-indigo-500/50">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <Link href={`/meter/${profile.id}`} className="flex items-center gap-2 flex-grow">
          <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <CardTitle className="text-lg font-semibold text-[#1a1a2e] dark:text-gray-100 break-words">
            {capitalizeFirstLetter(profile.tenant_name)}
          </CardTitle>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Profile</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete the profile for {capitalizeFirstLetter(profile.tenant_name)}? This will also delete all associated readings and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(profile.id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <Link href={`/meter/${profile.id}`} className="flex-grow">
        <CardContent className="flex-grow flex flex-col justify-between p-2">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-100">
              Meter:{" "}
              <span className="font-medium">{profile.meter_number}</span>
            </p>
            <p className="text-md text-green-500 dark:text-green-400 font-semibold">
              Last Reading:{" "}
              {profile.last_consumption !== null ? (
                <>
                  {profile.last_consumption}{" "}
                  <span className="text-sm text-gray-300 font-normal">
                    Units
                  </span>
                </>
              ) : (
                "N/A"
              )}
            </p>
            <p className="text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Last Reading Date:
              </span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {formatDate(profile.last_reading_date)}
              </span>
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  </motion.div>
);

// Profile List Component
const ProfileList: React.FC<{
  profiles: Profile[];
  onDelete: (profileId: number) => void;
}> = ({ profiles, onDelete }) => (
  <section>
    {profiles.length === 0 ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No meters yet. Add one now!
        </p>
        <Button
          asChild
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Link href="/add-profile">Add Your First Meter</Link>
        </Button>
      </motion.div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </section>
);

export default ProfileList;