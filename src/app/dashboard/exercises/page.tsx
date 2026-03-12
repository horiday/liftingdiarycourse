import { auth } from "@clerk/nextjs/server";
import { getAllExercises } from "@/data/exercises";
import ExercisesClient from "./ExercisesClient";

export default async function ExercisesPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const exercises = await getAllExercises();

  return <ExercisesClient exercises={exercises} />;
}
