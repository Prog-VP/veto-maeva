-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE species_type AS ENUM ('chien', 'chat', 'cheval');
CREATE TYPE sex_type AS ENUM ('male', 'female', 'unknown');
CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);
CREATE TYPE consultation_status AS ENUM ('open', 'completed');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid');
CREATE TYPE catalog_item_type AS ENUM ('product', 'service');
-- ============================================
-- TRIGGER FUNCTION: updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- clients
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  bexio_contact_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_clients_deleted ON clients(deleted_at);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_clients_bexio ON clients(bexio_contact_id)
WHERE bexio_contact_id IS NOT NULL;
CREATE INDEX idx_clients_search ON clients USING gin (
  (first_name || ' ' || last_name) gin_trgm_ops
);
CREATE TRIGGER trg_clients_updated BEFORE
UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- animals
-- ============================================
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  species species_type NOT NULL DEFAULT 'dog',
  breed TEXT,
  sex sex_type NOT NULL DEFAULT 'unknown',
  birth_date DATE,
  weight NUMERIC(6, 2),
  chip_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_animals_client ON animals(client_id);
CREATE INDEX idx_animals_deleted ON animals(deleted_at);
CREATE INDEX idx_animals_chip ON animals(chip_number)
WHERE chip_number IS NOT NULL;
CREATE TRIGGER trg_animals_updated BEFORE
UPDATE ON animals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- catalog_items
-- ============================================
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type catalog_item_type NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  default_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,
  unit TEXT,
  track_stock BOOLEAN NOT NULL DEFAULT false,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  stock_alert_threshold INTEGER DEFAULT 5,
  bexio_article_id INTEGER,
  bexio_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_catalog_type ON catalog_items(type);
CREATE INDEX idx_catalog_deleted ON catalog_items(deleted_at);
CREATE INDEX idx_catalog_category ON catalog_items(category);
CREATE INDEX idx_catalog_stock_alert ON catalog_items(stock_quantity, stock_alert_threshold)
WHERE track_stock = true;
CREATE INDEX idx_catalog_bexio ON catalog_items(bexio_article_id)
WHERE bexio_article_id IS NOT NULL;
CREATE TRIGGER trg_catalog_updated BEFORE
UPDATE ON catalog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- consultations
-- ============================================
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  status consultation_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_consultations_animal ON consultations(animal_id);
CREATE INDEX idx_consultations_date ON consultations(date);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_deleted ON consultations(deleted_at);
CREATE TRIGGER trg_consultations_updated BEFORE
UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- appointments
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  animal_id UUID REFERENCES animals(id) ON DELETE
  SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    consultation_id UUID REFERENCES consultations(id) ON DELETE
  SET NULL,
    color TEXT DEFAULT '#3b82f6',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT chk_times CHECK (end_time > start_time)
);
CREATE INDEX idx_appointments_range ON appointments(start_time, end_time);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_animal ON appointments(animal_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_deleted ON appointments(deleted_at);
CREATE TRIGGER trg_appointments_updated BEFORE
UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- consultation_items
-- ============================================
CREATE TABLE consultation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE
  SET NULL,
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_consult_items_consultation ON consultation_items(consultation_id);
CREATE INDEX idx_consult_items_catalog ON consultation_items(catalog_item_id);
CREATE TRIGGER trg_consult_items_updated BEFORE
UPDATE ON consultation_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- invoices
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  consultation_id UUID REFERENCES consultations(id) ON DELETE
  SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_ht NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_ttc NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'draft',
    bexio_invoice_id INTEGER,
    bexio_pdf_url TEXT,
    bexio_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);
CREATE UNIQUE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_consultation ON invoices(consultation_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_deleted ON invoices(deleted_at);
CREATE INDEX idx_invoices_bexio ON invoices(bexio_invoice_id)
WHERE bexio_invoice_id IS NOT NULL;
CREATE TRIGGER trg_invoices_updated BEFORE
UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- invoice_lines
-- ============================================
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE
  SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,
    discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_catalog ON invoice_lines(catalog_item_id);
CREATE TRIGGER trg_invoice_lines_updated BEFORE
UPDATE ON invoice_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ============================================
-- FUNCTION: auto-generate invoice number (YYYY-NNNN)
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS TRIGGER AS $$
DECLARE year_str TEXT;
next_seq INTEGER;
BEGIN year_str := to_char(NEW.date, 'YYYY');
SELECT COALESCE(
    MAX(
      CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)
    ),
    0
  ) + 1 INTO next_seq
FROM invoices
WHERE invoice_number LIKE year_str || '-%';
NEW.invoice_number := year_str || '-' || LPAD(next_seq::TEXT, 4, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_invoice_number BEFORE
INSERT ON invoices FOR EACH ROW
  WHEN (
    NEW.invoice_number IS NULL
    OR NEW.invoice_number = ''
  ) EXECUTE FUNCTION generate_invoice_number();
-- ============================================
-- FUNCTION: décrémenter stock quand consultation_item ajouté
-- ============================================
CREATE OR REPLACE FUNCTION decrement_stock() RETURNS TRIGGER AS $$ BEGIN
UPDATE catalog_items
SET stock_quantity = stock_quantity - NEW.quantity::integer
WHERE id = NEW.catalog_item_id
  AND track_stock = true;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_decrement_stock
AFTER
INSERT ON consultation_items FOR EACH ROW EXECUTE FUNCTION decrement_stock();
-- ============================================
-- RLS
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
-- Policies : authenticated users = full access (single-vet practice)
-- SELECT filtre soft delete automatiquement
DO $$
DECLARE tbl TEXT;
BEGIN FOR tbl IN
SELECT unnest(
    ARRAY [
    'clients', 'animals', 'appointments', 'consultations',
    'consultation_items', 'catalog_items', 'invoices', 'invoice_lines'
  ]
  ) LOOP EXECUTE format(
    'CREATE POLICY "auth_select_%1$s" ON %1$s FOR SELECT TO authenticated USING (deleted_at IS NULL)',
    tbl
  );
EXECUTE format(
  'CREATE POLICY "auth_insert_%1$s" ON %1$s FOR INSERT TO authenticated WITH CHECK (true)',
  tbl
);
EXECUTE format(
  'CREATE POLICY "auth_update_%1$s" ON %1$s FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
  tbl
);
END LOOP;
END $$;