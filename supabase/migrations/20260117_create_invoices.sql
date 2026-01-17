-- Create Invoices Table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING', 'PAID', 'OVERDUE'
  total_amount NUMERIC DEFAULT 0,
  
  -- Relations
  kol_id UUID REFERENCES kols(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Bank Details Snapshot (in case defaults change later)
  bank_name TEXT,
  bank_account_no TEXT,
  bank_account_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Invoice Items Table
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  price NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_invoices_kol_id ON invoices(kol_id);
CREATE INDEX idx_invoices_campaign_id ON invoices(campaign_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
