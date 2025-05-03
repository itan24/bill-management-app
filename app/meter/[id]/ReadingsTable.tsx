import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Type for Reading data
type Reading = {
  id: number;
  profile_id: number;
  date: string;
  previous: number;
  current: number;
  consumption: number;
};

// Readings Table Component
const ReadingsTable: React.FC<{
  readings: Reading[];
  onDeleteReading: (readingId: number) => void;
}> = ({ readings, onDeleteReading }) => (
  <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <CardContent>
      <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-gray-100 mb-4">
        Meter Readings
      </h3>
      {readings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No readings available.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Date
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Previous{" "}
                <span className="text-sm align-middle text-gray-500">
                  (units)
                </span>
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Current{" "}
                <span className="text-sm align-middle text-gray-500">
                  (units)
                </span>
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Consumption{" "}
                <span className="text-sm align-middle text-gray-500">
                  (units)
                </span>
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="text-gray-900 dark:text-gray-100">
                    {new Date(reading.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">
                    {reading.previous}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">
                    {reading.current}
                  </TableCell>
                  <TableCell
                    className={`${
                      reading.consumption >= 200
                        ? "text-red-600 dark:text-red-400"
                        : reading.consumption >= 150
                        ? "text-orange-600 dark:text-orange-400"
                        : reading.consumption >= 100
                        ? "text-yellow-900 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {reading.consumption}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Reading</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            Are you sure you want to delete this reading? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteReading(reading.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);

export default ReadingsTable;
