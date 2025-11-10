CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS importers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    importer_code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    location VARCHAR(150),
    address VARCHAR(255),
    email VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_code VARCHAR(40) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(255),
    city VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'partner', 'employee')),
    managed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150),
    phone VARCHAR(30),
    company_name VARCHAR(180),
    can_issue_invoices BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_inventory BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_team BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_require_manager CHECK (
        role <> 'employee' OR managed_by IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(40) NOT NULL,
    activity_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(60) NOT NULL UNIQUE,
    brand VARCHAR(120) NOT NULL,
    model VARCHAR(120),
    size VARCHAR(60),
    importer_id UUID REFERENCES importers(id) ON DELETE SET NULL,
    purchase_reference VARCHAR(60),
    has_remaining_stock BOOLEAN NOT NULL DEFAULT TRUE,
    quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    last_purchase_at TIMESTAMP WITH TIME ZONE,
    last_sale_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_number VARCHAR(60) NOT NULL UNIQUE,
    importer_id UUID NOT NULL REFERENCES importers(id) ON DELETE CASCADE,
    tire_id UUID NOT NULL REFERENCES tires(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(12, 2) NOT NULL CHECK (total_cost >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(60) NOT NULL UNIQUE,
    buyer_id UUID NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tire_id UUID REFERENCES tires(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    importer_snapshot JSONB,
    buyer_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tire_id UUID NOT NULL REFERENCES tires(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment')),
    quantity INT NOT NULL,
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    invoice_line_item_id UUID REFERENCES invoice_line_items(id) ON DELETE SET NULL,
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_invoices_buyer_date ON invoices (buyer_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_seller_date ON invoices (seller_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_tire ON invoice_line_items (tire_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tire_date ON stock_movements (tire_id, movement_date DESC);
