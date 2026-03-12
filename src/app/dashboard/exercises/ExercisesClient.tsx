"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { Exercise } from "@/db/schema";
import { createExerciseAction, deleteExerciseAction } from "./actions";
import { useRouter } from "next/navigation";

export default function ExercisesClient({
  exercises,
}: {
  exercises: Exercise[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await createExerciseAction({ name });
    if (result?.error) {
      setError("Failed to create exercise");
    } else {
      setName("");
      router.refresh();
    }
    setPending(false);
  }

  async function handleDelete(id: string) {
    await deleteExerciseAction({ id });
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Exercises</h1>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">New Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="exercise-name">Name</Label>
              <Input
                id="exercise-name"
                placeholder="e.g. Bench Press"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "Adding..." : "Add"}
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  No exercises yet.
                </TableCell>
              </TableRow>
            )}
            {exercises.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="font-medium">{ex.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {ex.createdAt ? format(ex.createdAt, "do MMM yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(ex.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
