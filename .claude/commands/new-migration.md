# Create a new Supabase migration

Run: `npx supabase migration new $ARGUMENTS`

Then open the created file and implement the SQL needed.
After writing the SQL, push to cloud: `npx supabase db push`
Then regenerate types: `npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts`
