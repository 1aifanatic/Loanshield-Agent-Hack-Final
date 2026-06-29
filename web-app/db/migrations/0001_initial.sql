CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_dispute_id TEXT NOT NULL UNIQUE,
  external_case_key TEXT NOT NULL UNIQUE,
  source_system TEXT NOT NULL DEFAULT 'LoanShieldDemoPortal',
  uipath_case_id TEXT,
  uipath_case_url TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  current_stage TEXT NOT NULL DEFAULT 'Webhook Intake',
  sla_status TEXT NOT NULL DEFAULT 'on_track',
  priority TEXT NOT NULL DEFAULT 'normal',
  event_type TEXT NOT NULL,
  dispute_type TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  loan_id_masked TEXT NOT NULL,
  transaction_id TEXT,
  customer_name TEXT NOT NULL,
  customer_segment TEXT NOT NULL DEFAULT 'Retail',
  vulnerable_customer_flag BOOLEAN NOT NULL DEFAULT FALSE,
  disputed_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  narrative TEXT NOT NULL,
  risk_score NUMERIC(5,2),
  evidence_score NUMERIC(5,2),
  recommended_outcome TEXT,
  final_outcome TEXT,
  approved_amount NUMERIC(12,2),
  webhook_delivery_status TEXT DEFAULT 'not_sent',
  webhook_status_code INTEGER,
  webhook_error TEXT,
  last_callback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  external_dispute_id TEXT NOT NULL REFERENCES disputes(external_dispute_id) ON DELETE CASCADE,
  external_case_key TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_name TEXT,
  stage TEXT,
  task_name TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_dispute_id TEXT NOT NULL REFERENCES disputes(external_dispute_id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  description TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'customer',
  validation_status TEXT NOT NULL DEFAULT 'pending',
  extracted_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_dispute_id TEXT NOT NULL REFERENCES disputes(external_dispute_id) ON DELETE CASCADE,
  decision_id TEXT NOT NULL UNIQUE,
  decision_type TEXT NOT NULL,
  recommended_outcome TEXT,
  recommended_by TEXT,
  recommendation_rationale TEXT,
  human_decision TEXT,
  decided_by TEXT,
  approved_amount NUMERIC(12,2),
  decision_rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS integration_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  external_dispute_id TEXT,
  event_id TEXT,
  correlation_id TEXT,
  request_method TEXT,
  request_url TEXT,
  request_headers JSONB DEFAULT '{}'::jsonb,
  request_body JSONB DEFAULT '{}'::jsonb,
  response_status INTEGER,
  response_body JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_updated_at ON disputes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_events_dispute_created ON case_events(external_dispute_id, created_at DESC);
