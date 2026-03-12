import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserWorkouts(userId: string) {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(eq(workouts.userId, userId))
    .orderBy(workouts.startedAt, workoutExercises.order);

  // Group exercises under each workout
  const map = new Map<
    string,
    { id: string; name: string | null; startedAt: Date; exercises: string[] }
  >();

  for (const row of rows) {
    if (!map.has(row.workoutId)) {
      map.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      map.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(map.values());
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getUserWorkouts>
>[number];

export async function getWorkout(userId: string, workoutId: string) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order), asc(we.createdAt)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
  return workout ?? null;
}

export type WorkoutDetail = NonNullable<Awaited<ReturnType<typeof getWorkout>>>;

export async function getExercises() {
  return db.select().from(exercises).orderBy(exercises.name);
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
) {
  // Verify ownership
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
  if (!workout) throw new Error("Workout not found");

  const existing = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const [we] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: existing.length + 1 })
    .returning();
  return we;
}

export async function logSet(
  userId: string,
  workoutExerciseId: string,
  setNumber: number,
  reps: number,
  weight: string
) {
  // Verify ownership via plain join
  const [row] = await db
    .select({ userId: workouts.userId })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1);
  if (!row || row.userId !== userId) throw new Error("Unauthorized");

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weight })
    .returning();
  return set;
}

export async function completeWorkout(userId: string, workoutId: string) {
  await db
    .update(workouts)
    .set({ completedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function updateWorkoutName(
  userId: string,
  workoutId: string,
  name: string
) {
  await db
    .update(workouts)
    .set({ name })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function createWorkout(
  userId: string,
  name: string | null,
  startedAt: Date
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}
