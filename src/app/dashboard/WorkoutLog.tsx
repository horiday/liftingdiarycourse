"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { WorkoutWithExercises } from "@/data/workouts";

export default function WorkoutLog({
  workouts,
}: {
  workouts: WorkoutWithExercises[];
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const filtered = workouts.filter((w) => isSameDay(w.startedAt, date));
  const workoutDates = workouts.map((w) => new Date(w.startedAt));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Log</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/dashboard/workout/new?date=${format(date, "yyyy-MM-dd")}`}>Log New Workout</Link>
          </Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  setOpen(false);
                }
              }}
              modifiers={{ hasWorkout: workoutDates }}
              modifiersClassNames={{
                hasWorkout:
                  "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary relative",
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((workout) => (
          <Link key={workout.id} href={`/dashboard/workout/${workout.id}`} className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Dumbbell className="h-4 w-4" />
                  {workout.name ?? "Untitled Workout"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {workout.exercises.map((exercise) => (
                    <li key={exercise} className="text-sm text-muted-foreground">
                      {exercise}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No workouts logged for {format(date, "do MMM yyyy")}.
          </p>
        )}
      </div>
    </main>
  );
}
