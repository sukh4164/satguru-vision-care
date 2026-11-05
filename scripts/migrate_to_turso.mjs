import { createClient } from "@libsql/client";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const TURSO_URL = process.env.TURSO_DATABASE_URL || "libsql://satguru-vision-sukhvendersingh.aws-ap-south-1.turso.io";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4NTg3MDYsImlkIjoiMDFhMWFhM2ItMjgwMS03ZDM3LThhZjgtZGY0OTg2Mjg1NTIzIiwia2lkIjoiV3RqdmY4RHg5RmFUZzNxMWtGbXJjYnY2U25LWnhRR3hzRk9nUlpFLUZ1VSIsInJpZCI6IjQwNjdkM2U0LWRlNjctNDg0OS05OTc5LTMzN2EwOTA0MDMyYiJ9.5Pi8eIzUbZHT8w7o1kPXQo-P3KG4by6HOQwIwxyAV15CmtKOEmcbyZzVVOj88yoz61jB6s2VktzEcAFwWG8CAQ";

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

async function migrate() {
  console.log("Dumping local SQLite database...");
  const rawDump = execSync('sqlite3 data/satguru_vision.db .dump', { encoding: "utf-8" });

  // Clean dump: remove transaction wrappers and sqlite_sequence create/delete which might conflict
  const cleanedStatements = rawDump
    .split(/;\r?\n/)
    .map(s => s.trim())
    .filter(s => {
      if (!s) return false;
      if (s.startsWith("BEGIN TRANSACTION")) return false;
      if (s.startsWith("COMMIT")) return false;
      if (s.includes("sqlite_sequence")) return false;
      return true;
    });

  console.log(`Executing ${cleanedStatements.length} SQL statements on Turso...`);

  let count = 0;
  for (const sql of cleanedStatements) {
    try {
      await client.execute(sql);
      count++;
      if (count % 20 === 0 || count === cleanedStatements.length) {
        console.log(`Progress: ${count}/${cleanedStatements.length} statements executed.`);
      }
    } catch (err) {
      console.warn(`Warning on statement: ${sql.slice(0, 50)}... -> ${err.message}`);
    }
  }

  console.log("\nVerifying migrated data on Turso...");
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
  console.log("Migrated tables:", tables.rows.map(r => r.name));

  const custCount = await client.execute("SELECT count(*) as c FROM customers;");
  const ordCount = await client.execute("SELECT count(*) as c FROM orders;");
  const prodCount = await client.execute("SELECT count(*) as c FROM products;");

  console.log(`Verification:`);
  console.log(`- Customers: ${custCount.rows[0].c}`);
  console.log(`- Orders: ${ordCount.rows[0].c}`);
  console.log(`- Products: ${prodCount.rows[0].c}`);
  console.log("Migration complete!");
}

migrate().catch(console.error);

