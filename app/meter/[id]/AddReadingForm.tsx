import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Types for Profile and Reading data
type Profile = {
  id: number;
  user_id: string;
  tenant_name: string;
  meter_number: string;
  last_consumption: number | null;
  last_reading_date: string | null;
  initial_reading: number | null;
};

type Reading = {
  id: number;
  profile_id: number;
  date: string;
  previous: number;
  current: number;
  consumption: number;
};

// Zod schema for form validation
const formSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    previous: z
      .string()
      .min(1, "Previous reading is required")
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "Previous reading must be a positive integer",
      }),
    current: z
      .string()
      .min(1, "Current reading is required")
      .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
        message: "Current reading must be a positive integer",
      }),
  })
  .refine(
    (data) => {
      const previous = parseInt(data.previous);
      const current = parseInt(data.current);
      return current >= previous;
    },
    {
      message: "Current reading must be greater than or equal to previous reading",
      path: ["current"],
    }
  );

// Add Reading Form Component
const AddReadingForm: React.FC<{
  profile: Profile;
  onAddReading: (newReading: Reading) => void;
  isLoading: boolean;
  setError: (error: string | null) => void;
  getToken: () => Promise<string | null>;
  isSignedIn: boolean;
  userId: string | null;
}> = ({ profile, onAddReading, isLoading, setError, getToken, isSignedIn, userId }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      previous: profile.initial_reading?.toString() || "",
      current: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isSignedIn || !userId) {
      setError("Please sign in to add a reading");
      return;
    }

    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");

      const payload = {
        profile_id: profile.id,
        date: values.date,
        previous: parseInt(values.previous),
        current: parseInt(values.current),
      };

      const response = await fetch("http://localhost:8000/api/readings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Failed to add reading: ${response.status}`
        );
      }

      const newReading = await response.json();
      onAddReading(newReading);
      form.reset({
        date: new Date().toISOString().split("T")[0],
        previous: profile.initial_reading?.toString() || "",
        current: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mb-8"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg text-gray-600 dark:text-gray-300">
                    Date
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <Input
                        type="date"
                        {...field}
                        className="border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="previous"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg text-gray-600 dark:text-gray-300">
                    Previous Reading{" "}
                    <span className="text-sm align-middle text-gray-500">
                      (units)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <Input
                        placeholder="Enter previous reading"
                        {...field}
                        className="border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="current"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg text-gray-600 dark:text-gray-300">
                    Current Reading{" "}
                    <span className="text-sm align-middle text-gray-500">
                      (units)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <Input
                        placeholder="Enter current reading"
                        {...field}
                        className="border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
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
                  "Add Reading"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddReadingForm;