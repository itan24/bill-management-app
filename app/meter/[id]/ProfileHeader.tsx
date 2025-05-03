import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Interface for Profile data
type Profile = {
  id: number;
  user_id: string;
  tenant_name: string;
  meter_number: string;
  last_consumption: number | null;
  last_reading_date: string | null;
  initial_reading: number | null;
};

// Helper function to capitalize first letter of each word
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Profile Header Component
const ProfileHeader: React.FC<{
  profile: Profile;
  onUpdateInitialReading: (initialReading: number) => void;
  isLoading: boolean;
}> = ({ profile, onUpdateInitialReading, isLoading }) => {
  const [initialReadingInput, setInitialReadingInput] = useState<string>(
    profile.initial_reading?.toString() || ""
  );

  const handleSaveInitialReading = () => {
    if (
      !initialReadingInput ||
      isNaN(parseInt(initialReadingInput)) ||
      parseInt(initialReadingInput) < 0
    ) {
      return;
    }
    onUpdateInitialReading(parseInt(initialReadingInput));
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-[#1a1a2e] dark:text-gray-100">
          {capitalizeFirstLetter(profile.tenant_name)} ({profile.meter_number})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="text-lg text-gray-600 dark:text-gray-300">
            Initial Reading (kWh)
          </label>
          <div className="flex items-center gap-2 mt-2">
            <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <Input
              placeholder="Enter initial reading for the month"
              value={initialReadingInput}
              onChange={(e) => setInitialReadingInput(e.target.value)}
              className="border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 max-w-xs"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                onClick={handleSaveInitialReading}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;