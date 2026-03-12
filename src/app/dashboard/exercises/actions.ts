"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createExercise, deleteExercise } from "@/data/exercises";

const createExerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function createExerciseAction(params: { name: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createExerciseSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const exercise = await createExercise(parsed.data.name);
  revalidatePath("/dashboard/exercises");
  return { data: exercise };
}

const deleteExerciseSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteExerciseAction(params: { id: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = deleteExerciseSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await deleteExercise(parsed.data.id);
  revalidatePath("/dashboard/exercises");
}
