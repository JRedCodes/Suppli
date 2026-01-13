-- Migration: RLS Policies for Invoices, Files, and Learning Tables
-- Description: Tenant isolation for invoices, files, learning_adjustments

-- Invoices: Standard tenant isolation
CREATE POLICY "invoices_select"
ON invoices
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "invoices_insert"
ON invoices
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'staff')
  )
);

CREATE POLICY "invoices_update"
ON invoices
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

-- Invoice Lines: Standard tenant isolation
CREATE POLICY "invoice_lines_select"
ON invoice_lines
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "invoice_lines_insert"
ON invoice_lines
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'staff')
  )
);

-- Invoice Mismatches: Standard tenant isolation
CREATE POLICY "invoice_mismatches_select"
ON invoice_mismatches
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "invoice_mismatches_insert"
ON invoice_mismatches
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

CREATE POLICY "invoice_mismatches_update"
ON invoice_mismatches
FOR UPDATE
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
);

-- Files: Standard tenant isolation
CREATE POLICY "files_select"
ON files
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "files_insert"
ON files
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'staff')
  )
  AND uploaded_by = auth.uid()
);

-- Learning Adjustments: Standard tenant isolation
CREATE POLICY "learning_adjustments_select"
ON learning_adjustments
FOR SELECT
USING (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "learning_adjustments_insert"
ON learning_adjustments
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT business_id
    FROM business_users
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager')
  )
  OR actor_type = 'system'
);

-- Learning adjustments are typically system-generated, but managers can view
