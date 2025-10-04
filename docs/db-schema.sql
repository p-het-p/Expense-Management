-- Enable UUID generation
create extension if not exists pgcrypto;

-- =======================
-- Enums
-- =======================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin','manager','employee');
  end if;
  if not exists (select 1 from pg_type where typname = 'expense_status') then
    create type expense_status as enum ('draft','pending','approved','rejected','paid');
  end if;
  if not exists (select 1 from pg_type where typname = 'approver_type') then
    create type approver_type as enum ('role','user');
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_action') then
    create type approval_action as enum ('submit','approve','reject','escalate','comment');
  end if;
  if not exists (select 1 from pg_type where typname = 'workflow_status') then
    create type workflow_status as enum ('in_progress','approved','rejected');
  end if;
end$$;

-- =======================
-- Core multi-tenant tables
-- =======================
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  country_code char(2),
  default_currency char(3) not null,
  created_at timestamptz not null default now()
);

create unique index if not exists companies_domain_uq on companies ((lower(domain))) where domain is not null;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  password_hash text not null,
  role user_role not null default 'employee',
  manager_id uuid null references users(id) on delete set null,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists users_company_email_uq on users (company_id, lower(email));

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(company_id, lower(name))
);

-- Optional reference for expense categories (GL mapping)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  gl_code text,
  created_at timestamptz not null default now(),
  unique(company_id, lower(name))
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(company_id, lower(name))
);

-- =======================
-- Expenses
-- =======================
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  department_id uuid null references departments(id) on delete set null,
  category_id uuid null references categories(id) on delete set null,
  vendor_id uuid null references vendors(id) on delete set null,

  description text,
  expense_date date not null,
  -- Original amount and currency as submitted by employee
  amount_orig numeric(12,2) not null check (amount_orig >= 0),
  currency char(3) not null,

  -- Converted to company default currency at submission time
  converted_currency char(3) not null,
  amount_converted numeric(12,2) not null check (amount_converted >= 0),
  exchange_rate numeric(18,8) not null check (exchange_rate > 0),

  status expense_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists expenses_company_status_idx on expenses (company_id, status);
create index if not exists expenses_company_user_date_idx on expenses (company_id, user_id, expense_date);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  storage_url text not null,
  mime_type text,
  ocr_text text,
  ocr_fields jsonb,
  checksum bytea,
  created_at timestamptz not null default now()
);
create index if not exists receipts_expense_idx on receipts (expense_id);

-- =======================
-- Workflows and approvals
-- =======================
create table if not exists approval_workflows (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  min_approval_percent int not null default 100 check (min_approval_percent between 1 and 100),
  created_at timestamptz not null default now(),
  unique(company_id, lower(name))
);

create table if not exists approval_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references approval_workflows(id) on delete cascade,
  step_order int not null check (step_order >= 1),
  approver_type approver_type not null,           -- role or user
  approver_role user_role,                        -- when approver_type = 'role'
  approver_user_id uuid references users(id),     -- when approver_type = 'user'
  threshold_amount numeric(12,2),                 -- optional min amount
  condition_json jsonb,                           -- additional rules
  unique(workflow_id, step_order)
);

create table if not exists expense_workflow_instances (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  workflow_id uuid not null references approval_workflows(id) on delete restrict,
  current_step_order int not null default 1,
  status workflow_status not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(expense_id)
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  step_id uuid references approval_steps(id) on delete set null,
  actor_user_id uuid not null references users(id) on delete restrict,
  action approval_action not null,
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists approvals_expense_idx on approvals (expense_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  author_user_id uuid not null references users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

-- =======================
-- Currency, countries, caching
-- =======================
create table if not exists currency_rates (
  id bigint generated always as identity primary key,
  base_currency char(3) not null,
  rates jsonb not null,            -- {"USD":1,"EUR":0.91,...}
  provider text,
  effective_date date not null,
  fetched_at timestamptz not null default now(),
  unique (base_currency, effective_date)
);

create table if not exists countries_cache (
  code char(2) primary key,
  name text not null,
  currency char(3) not null,
  updated_at timestamptz not null default now()
);

-- =======================
-- Invites, sessions, notifications, audit
-- =======================
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  role user_role not null default 'employee',
  manager_id uuid references users(id) on delete set null,
  token text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(company_id, lower(email)),
  unique(token)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  jwt_id text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  unique(jwt_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, read_at);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid not null references companies(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  table_name text not null,
  row_id uuid,
  diff_json jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_company_idx on audit_logs (company_id, created_at desc);

-- =======================
-- Helpful views (optional)
-- =======================
-- Example: latest rate per base currency
create or replace view v_currency_latest as
select distinct on (base_currency) base_currency, rates, provider, effective_date, fetched_at
from currency_rates
order by base_currency, effective_date desc, fetched_at desc;
