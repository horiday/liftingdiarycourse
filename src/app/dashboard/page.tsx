import { auth } from "@clerk/nextjs/server";
import { getUserWorkouts } from "@/data/workouts";
import WorkoutLog from "./WorkoutLog";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const workouts = await getUserWorkouts(userId);

  return <WorkoutLog workouts={workouts} />;
}
