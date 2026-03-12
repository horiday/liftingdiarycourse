import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllExercises() {
  return db.select().from(exercises).orderBy(exercises.name);
}

export async function createExercise(name: string) {
  const [exercise] = await db.insert(exercises).values({ name }).returning();
  return exercise;
}

export async function deleteExercise(id: string) {
  await db.delete(exercises).where(eq(exercises.id, id));
}
