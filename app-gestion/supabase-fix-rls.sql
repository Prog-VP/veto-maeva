-- Fix RLS: Allow anon role for demo (no auth yet)
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'clients', 'animals', 'appointments', 'consultations',
    'consultation_items', 'catalog_items', 'invoices', 'invoice_lines'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY "anon_select_%1$s" ON %1$s FOR SELECT TO anon USING (deleted_at IS NULL)',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "anon_insert_%1$s" ON %1$s FOR INSERT TO anon WITH CHECK (true)',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "anon_update_%1$s" ON %1$s FOR UPDATE TO anon USING (true) WITH CHECK (true)',
      tbl
    );
  END LOOP;
END $$;
