"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  addExerciseToWorkout,
  logSet,
  completeWorkout,
  updateWorkoutName,
} from "@/data/workouts";
import { revalidatePath } from "next/cache";

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
});

export async function addExerciseAction(params: {
  workoutId: string;
  exerciseId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addExerciseSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await addExerciseToWorkout(userId, parsed.data.workoutId, parsed.data.exerciseId);
    revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
  } catch {
    return { error: "Failed to add exercise" };
  }
}

const logSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export async function logSetAction(params: {
  workoutExerciseId: string;
  setNumber: number;
  reps: number;
  weight: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = logSetSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await logSet(
      userId,
      parsed.data.workoutExerciseId,
      parsed.data.setNumber,
      parsed.data.reps,
      parsed.data.weight
    );
    revalidatePath("/dashboard/workout/[workoutId]", "page");
  } catch {
    return { error: "Failed to save set" };
  }
}

const updateWorkoutNameSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

export async function updateWorkoutNameAction(params: {
  workoutId: string;
  name: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = updateWorkoutNameSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateWorkoutName(userId, parsed.data.workoutId, parsed.data.name);
    revalidatePath(`/dashboard/workout/${parsed.data.workoutId}`);
  } catch {
    return { error: "Failed to update name" };
  }
}

const completeWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function completeWorkoutAction(params: { workoutId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = completeWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await completeWorkout(userId, parsed.data.workoutId);
  redirect("/dashboard");
}
