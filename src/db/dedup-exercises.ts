import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function dedupExercises() {
  // Find all duplicate names and the canonical (oldest) id to keep
  const duplicates = await sql`
    SELECT name, MIN(created_at) AS keep_created_at
    FROM exercises
    GROUP BY name
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length === 0) {
    console.log("No duplicates found.");
    return;
  }

  console.log(`Found ${duplicates.length} duplicate exercise name(s).`);

  for (const row of duplicates) {
    const name = row.name as string;

    // Get all ids for this name, oldest first
    const ids = await sql`
      SELECT id FROM exercises
      WHERE name = ${name}
      ORDER BY created_at ASC
    `;

    const keepId = ids[0].id as string;
    const removeIds = ids.slice(1).map((r) => r.id as string);

    console.log(`"${name}": keeping ${keepId}, removing ${removeIds.join(", ")}`);

    // Remap workout_exercises references to the kept id
    await sql`
      UPDATE workout_exercises
      SET exercise_id = ${keepId}
      WHERE exercise_id = ANY(${removeIds})
    `;

    // Delete duplicate exercise rows
    await sql`
      DELETE FROM exercises
      WHERE id = ANY(${removeIds})
    `;
  }

  console.log("Deduplication complete.");
}

dedupExercises().catch(console.error);
