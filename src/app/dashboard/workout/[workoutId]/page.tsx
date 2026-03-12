import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getWorkout, getExercises } from "@/data/workouts";
import WorkoutDetail from "./WorkoutDetail";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { workoutId } = await params;
  const [workout, exercises] = await Promise.all([
    getWorkout(userId, workoutId),
    getExercises(),
  ]);

  if (!workout) notFound();

  return <WorkoutDetail workout={workout} exercises={exercises} />;
}
