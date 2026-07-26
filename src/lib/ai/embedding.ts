import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // text-embedding-004 produces 768-dimensional vectors
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  const result = await model.embedContent(text);
  const embedding = result.embedding.values;
  return embedding;
}

export async function findSimilarTask(embedding: number[], threshold = 0.85) {
  if (!embedding || embedding.length === 0) return null;

  const vectorStr = `[${embedding.join(",")}]`;

  try {
    const results = await db.execute(sql`
      SELECT id, content, 1 - (embedding <=> ${vectorStr}::vector) AS similarity
      FROM todo_item
      WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${vectorStr}::vector) >= ${threshold}
      ORDER BY similarity DESC
      LIMIT 1
    `);

    // neon-http returns rows array or similar
    const rows = (results as any).rows || results;
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error("Error finding similar task via pgvector:", err);
  }

  return null;
}
