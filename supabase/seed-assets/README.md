# Supabase seed assets

These files are runtime fixtures referenced by versioned database seed rows. They are committed so a new Macitta installation can reproduce the production content.

Upload them after `supabase db push`:

```bash
npx supabase storage cp --experimental --linked --recursive supabase/seed-assets/toefl-audio ss:///toefl-audio
```

The destination bucket is public because the practice player resolves known public object URLs. Bucket listing is not granted through an RLS policy.
