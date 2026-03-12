"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

const createWorkoutSchema = z.object({
  name: z.string().max(100).optional(),
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  startedAt: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const workout = await createWorkout(
    userId,
    parsed.data.name ?? null,
    parsed.data.startedAt
  );

  redirect(`/dashboard/workout/${workout.id}`);
}
