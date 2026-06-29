ALTER TABLE verbs
    ALTER COLUMN infinitive TYPE jsonb USING infinitive::jsonb,
    ALTER COLUMN simple_past TYPE jsonb USING simple_past::jsonb,
    ALTER COLUMN past_participle TYPE jsonb USING past_participle::jsonb;;
