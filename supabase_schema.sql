
-- Tabela de Recibos de Salário
CREATE TABLE IF NOT EXISTS salary_slips (
    id UUID DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    employee_role TEXT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    base_salary NUMERIC DEFAULT 0,
    salary_base_proportional NUMERIC DEFAULT 0,
    allowances NUMERIC DEFAULT 0,
    bonuses NUMERIC DEFAULT 0,
    subsidies NUMERIC DEFAULT 0,
    subsidy_transport NUMERIC DEFAULT 0,
    subsidy_food NUMERIC DEFAULT 0,
    subsidy_family NUMERIC DEFAULT 0,
    subsidy_housing NUMERIC DEFAULT 0,
    absences NUMERIC DEFAULT 0,
    absences_justified NUMERIC DEFAULT 0,
    advances NUMERIC DEFAULT 0,
    penalties NUMERIC DEFAULT 0,
    gross_total NUMERIC DEFAULT 0,
    inss NUMERIC DEFAULT 0,
    irt NUMERIC DEFAULT 0,
    net_total NUMERIC DEFAULT 0,
    days_worked NUMERIC DEFAULT 0,
    days_off NUMERIC DEFAULT 0,
    days_vacation NUMERIC DEFAULT 0,
    overtime_hours NUMERIC DEFAULT 0,
    lost_hours NUMERIC DEFAULT 0,
    location TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (employee_id, month, year)
);

-- Tabela de Registros de Assiduidade (Efetividade)
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    days JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);

-- Tabela de Ordens de Transferência
CREATE TABLE IF NOT EXISTS transfer_orders (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL,
    date DATE NOT NULL,
    cash_register_id TEXT,
    cash_register_name TEXT,
    total_value NUMERIC DEFAULT 0,
    employee_count INTEGER DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    details JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para melhor performance
CREATE INDEX IF NOT EXISTS idx_salary_slips_period ON salary_slips(month, year);
CREATE INDEX IF NOT EXISTS idx_attendance_period ON attendance_records(month, year);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_period ON transfer_orders(month, year);
