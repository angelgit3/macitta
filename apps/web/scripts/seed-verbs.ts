import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Note: For seeding we usually need SERVICE_ROLE_KEY to bypass RLS or if we are admin. 
// Check if ANON works (if RLS allows insert) or if we need to ask user for service key.
// For now relying on Anon Key assuming policies allow it or user is local developer.
// Actually, usually Anon Key + RLS means you can only insert if logged in.
// Does the user have a SERVICE_ROLE_KEY available? 
// Or I can use my MCP tool 'execute_sql' to insert? 
// The script approach is better for large data. 
// Let's assume I might need to use the MCP tool if this fails, but let's try strict script first. 
// Wait, I am an agent, I can just read the file and use 'execute_sql' in a loop or batch!
// That avoids "RLS" issues entirely because execute_sql is admin.
// BUT, the plan said "create seeding script". Let's create it.
// If it fails due to permissions, I will fallback to generating SQL.

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const jsonPath = path.resolve(__dirname, "../../../Documentos extra/verbos_tarjetas.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data = JSON.parse(rawData);

    console.log(`Found ${data.cards.length} cards.`);

    // Clear existing verbs?
    // We can't easily clear via Client if RLS blocks delete.
    // We will assume append or upsert.

    const verbs = data.cards.map((card: any) => {
        // Extract answers
        const infinitive = card.answers.find((a: any) => a.field === "Infinitivo")?.text;
        const simplePast = card.answers.find((a: any) => a.field === "Pasado Simple")?.text;
        const pastParticiple = card.answers.find((a: any) => a.field === "Pasado Participio")?.text;

        // Map to DB columns
        return {
            translation: card.front_text, // "Ser/Estar"
            infinitive: infinitive,       // string or object
            simple_past: simplePast,      // string or object
            past_participle: pastParticiple, // string or object
            category: "irregular", // Defaulting to irregular as per JSON content
            difficulty_level: 1
        };
    });

    const { error } = await supabase.from("verbs").insert(verbs);

    if (error) {
        console.error("Error seeding verbs:", error);
    } else {
        console.log("Successfully seeded verbs!");
    }
}

seed();
