"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell, CheckCircle, PlusCircle, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkoutDetail } from "@/data/workouts";
import type { Exercise } from "@/db/schema";
import {
  addExerciseAction,
  logSetAction,
  completeWorkoutAction,
  updateWorkoutNameAction,
} from "./actions";

type Props = {
  workout: WorkoutDetail;
  exercises: Exercise[];
};

function AddSetForm({
  workoutExerciseId,
  nextSetNumber,
  onSuccess,
}: {
  workoutExerciseId: string;
  nextSetNumber: number;
  onSuccess: () => void;
}) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const repsNum = parseInt(reps);
    const weightStr = parseFloat(weight).toFixed(2);
    if (!repsNum || repsNum < 1) {
      setError("Enter valid reps");
      return;
    }
    if (!weight || isNaN(parseFloat(weight))) {
      setError("Enter valid weight");
      return;
    }
    setPending(true);
    const result = await logSetAction({
      workoutExerciseId,
      setNumber: nextSetNumber,
      reps: repsNum,
      weight: weightStr,
    });
    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Failed to log set");
      setPending(false);
    } else {
      setReps("");
      setWeight("");
      setPending(false);
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Reps</Label>
        <Input
          type="number"
          min={1}
          placeholder="10"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Weight (kg)</Label>
        <Input
          type="number"
          min={0}
          step={0.5}
          placeholder="60"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="h-8">
        {pending ? "..." : `Add Set ${nextSetNumber}`}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

export default function WorkoutDetail({ workout, exercises }: Props) {
  const router = useRouter();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [addingExercise, setAddingExercise] = useState(false);
  const [addExerciseError, setAddExerciseError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(workout.name ?? "");
  const [savingName, setSavingName] = useState(false);
  async function handleSaveName() {
    if (!nameValue.trim()) return;
    setSavingName(true);
    await updateWorkoutNameAction({ workoutId: workout.id, name: nameValue.trim() });
    setSavingName(false);
    setEditingName(false);
    router.refresh();
  }

  function handleCancelName() {
    setNameValue(workout.name ?? "");
    setEditingName(false);
  }

  async function handleAddExercise() {
    if (!selectedExerciseId) return;
    setAddingExercise(true);
    setAddExerciseError(null);
    const result = await addExerciseAction({
      workoutId: workout.id,
      exerciseId: selectedExerciseId,
    });
    if (result?.error) {
      setAddExerciseError(typeof result.error === "string" ? result.error : "Failed to add exercise");
      setAddingExercise(false);
      return;
    }
    setSelectedExerciseId("");
    setAddingExercise(false);
    router.refresh();
  }

  async function handleComplete() {
    setCompleting(true);
    await completeWorkoutAction({ workoutId: workout.id });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 shrink-0" />
            {editingName ? (
              <>
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="h-8 text-2xl font-bold w-56"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelName();
                  }}
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={savingName} className="h-8 w-8">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelName} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{workout.name ?? "Untitled Workout"}</h1>
                <Button size="icon" variant="ghost" onClick={() => setEditingName(true)} className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(workout.startedAt, "do MMM yyyy")}
            {workout.completedAt && (
              <span className="ml-2 text-green-600">
                · Completed {format(workout.completedAt, "do MMM yyyy")}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!workout.completedAt && (
            <Button
              onClick={handleComplete}
              disabled={completing}
              variant="default"
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {completing ? "Completing..." : "Complete Workout"}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back</Link>
          </Button>
        </div>
      </div>

      {/* Add exercise */}
      {!workout.completedAt && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Add Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select
                value={selectedExerciseId}
                onValueChange={setSelectedExerciseId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddExercise}
                disabled={!selectedExerciseId || addingExercise}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {addingExercise ? "Adding..." : "Add"}
              </Button>
            </div>
            {addExerciseError && (
              <p className="mt-2 text-xs text-destructive">{addExerciseError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercise list */}
      <div className="space-y-4">
        {workout.workoutExercises.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No exercises added yet.
          </p>
        )}
        {workout.workoutExercises.map((we) => (
          <Card key={we.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{we.exercise.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {we.sets.length > 0 && (
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b">
                      <th className="text-left py-1 pr-4">Set</th>
                      <th className="text-left py-1 pr-4">Reps</th>
                      <th className="text-left py-1">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {we.sets.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-1 pr-4">{s.setNumber}</td>
                        <td className="py-1 pr-4">{s.reps}</td>
                        <td className="py-1">{s.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!workout.completedAt && (
                <AddSetForm
                  workoutExerciseId={we.id}
                  nextSetNumber={we.sets.length + 1}
                  onSuccess={() => router.refresh()}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
