-- Fix: Allow soft delete for anon and authenticated roles
-- Problem: SELECT policy has "deleted_at IS NULL" which also affects UPDATE visibility
-- Solution: Drop SELECT-based UPDATE policies and recreate with USING (true)

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'clients', 'animals', 'appointments', 'consultations',
    'consultation_items', 'catalog_items', 'invoices', 'invoice_lines'
  ]) LOOP
    -- Drop old policies
    EXECUTE format('DROP POLICY IF EXISTS "auth_update_%1$s" ON %1$s', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%1$s" ON %1$s', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated update %1$s" ON %1$s', tbl);

    -- Recreate: anyone authenticated or anon can update any row (including setting deleted_at)
    EXECUTE format(
      'CREATE POLICY "authenticated_update_%1$s" ON %1$s FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "anon_update_%1$s" ON %1$s FOR UPDATE TO anon USING (true) WITH CHECK (true)',
      tbl
    );
  END LOOP;
END $$;
