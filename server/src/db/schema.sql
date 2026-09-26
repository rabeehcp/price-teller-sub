-- PriceTeller PostgreSQL Schema

CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sub_area VARCHAR(255),
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  currency_symbol VARCHAR(10) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL DEFAULT 15.0
);

CREATE TABLE IF NOT EXISTS shops (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  distance_km NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5,
  review_count INT NOT NULL DEFAULT 0,
  shop_type VARCHAR(50) NOT NULL DEFAULT 'supermarket',
  opening_hours VARCHAR(100) NOT NULL DEFAULT '8:00 AM - 10:00 PM',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  free_delivery_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
  color VARCHAR(50) NOT NULL DEFAULT '#2563eb',
  categories JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(64) NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  image TEXT,
  default_unit VARCHAR(50) NOT NULL,
  available_units JSONB NOT NULL DEFAULT '[]'::jsonb,
  unit_multiplier JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_organic BOOLEAN NOT NULL DEFAULT false,
  is_seasonal BOOLEAN NOT NULL DEFAULT false,
  badge VARCHAR(100),
  nutritional_note TEXT,
  prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  stock_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_histories (
  product_id VARCHAR(100) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  points JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS price_reports (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  shop_id VARCHAR(100) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  location_id VARCHAR(64) NOT NULL,
  reported_price NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  reported_by VARCHAR(255) NOT NULL,
  timestamp VARCHAR(100) NOT NULL,
  proof_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  user_voted VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flash_deals (
  id VARCHAR(100) PRIMARY KEY,
  shop_id VARCHAR(100) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  deal_price NUMERIC(10, 2) NOT NULL,
  discount_percentage NUMERIC(5, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  expires_in_minutes INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  shop_id VARCHAR(100),
  shop_name VARCHAR(255),
  phone VARCHAR(50),
  location_id VARCHAR(64),
  created_at VARCHAR(100),
  token VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS consumer_data (
  user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  basket JSONB NOT NULL DEFAULT '[]'::jsonb,
  saved_lists JSONB NOT NULL DEFAULT '[]'::jsonb,
  favorites JSONB NOT NULL DEFAULT '[]'::jsonb,
  trip_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_location_id VARCHAR(64),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(100) PRIMARY KEY,
  consumer_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consumer_name VARCHAR(255) NOT NULL,
  shop_id VARCHAR(100) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  basket_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(100) PRIMARY KEY,
  conversation_id VARCHAR(100) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(100) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  basket_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS basket_snapshot JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_msg_id VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS audio_duration NUMERIC;
CREATE INDEX IF NOT EXISTS idx_messages_client_msg_id ON messages(conversation_id, client_msg_id);
-- Unique partial index prevents concurrent duplicate chat messages with the same client_msg_id
CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_conversation_client_msg
  ON messages (conversation_id, client_msg_id)
  WHERE client_msg_id IS NOT NULL AND client_msg_id <> '';
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(conversation_id, is_read);

CREATE TABLE IF NOT EXISTS pre_bookings (
  id VARCHAR(100) PRIMARY KEY,
  consumer_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consumer_name VARCHAR(255) NOT NULL,
  consumer_phone VARCHAR(50),
  consumer_email VARCHAR(255),
  shop_id VARCHAR(100) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_count INT NOT NULL DEFAULT 0,
  total_quantity INT NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  pickup_time VARCHAR(100),
  notes TEXT,
  merchant_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_sales (
  id VARCHAR(100) PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id VARCHAR(100) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  bill_number VARCHAR(50) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_count INT NOT NULL DEFAULT 0,
  total_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_shops_location_id ON shops(location_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_verified ON shops(is_verified);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_organic ON products(is_organic);
CREATE INDEX IF NOT EXISTS idx_price_reports_product_id ON price_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_status ON price_reports(status);
CREATE INDEX IF NOT EXISTS idx_flash_deals_shop_id ON flash_deals(shop_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_conversations_consumer_id ON conversations(consumer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_shop_id ON conversations(shop_id);
CREATE INDEX IF NOT EXISTS idx_conversations_shop_name ON conversations(shop_name);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_consumer_id ON pre_bookings(consumer_id);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_shop_id ON pre_bookings(shop_id);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_status ON pre_bookings(status);
CREATE INDEX IF NOT EXISTS idx_merchant_sales_shop_id ON merchant_sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_merchant_sales_merchant_id ON merchant_sales(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_sales_created_at ON merchant_sales(created_at);

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration_days INT NOT NULL,
  price_paise INT NOT NULL CHECK (price_paise >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchant Subscriptions Table
CREATE TABLE IF NOT EXISTS merchant_subscriptions (
  id VARCHAR(100) PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id VARCHAR(100),
  plan_id VARCHAR(64) NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Payments Table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id VARCHAR(100) PRIMARY KEY,
  subscription_id VARCHAR(100) REFERENCES merchant_subscriptions(id) ON DELETE SET NULL,
  merchant_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(64) NOT NULL REFERENCES subscription_plans(id),
  amount_paise INT NOT NULL CHECK (amount_paise > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  provider VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  provider_order_id VARCHAR(100),
  provider_payment_id VARCHAR(100),
  provider_signature VARCHAR(255),
  idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  actor_id VARCHAR(100) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Indexes
CREATE INDEX IF NOT EXISTS idx_sub_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_merchant_sub_merchant_id ON merchant_subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_sub_status ON merchant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_merchant_sub_expires_at ON merchant_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sub_payments_merchant_id ON subscription_payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_sub_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_sub_payments_order_id ON subscription_payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Client Partners / Field Onboarding Agents Table
CREATE TABLE IF NOT EXISTS client_partners (
  id VARCHAR(100) PRIMARY KEY,
  client_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  upi_id VARCHAR(100) NOT NULL,
  commission_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 50.0,
  min_shops_threshold INT NOT NULL DEFAULT 50,
  area VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  total_shops_count INT NOT NULL DEFAULT 0,
  total_earnings_paise BIGINT NOT NULL DEFAULT 0,
  total_paid_paise BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Payouts Table
CREATE TABLE IF NOT EXISTS client_payouts (
  id VARCHAR(100) PRIMARY KEY,
  client_id VARCHAR(100) NOT NULL REFERENCES client_partners(id) ON DELETE CASCADE,
  amount_paise INT NOT NULL CHECK (amount_paise > 0),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'upi',
  upi_ref_id VARCHAR(100),
  paid_to_upi VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_partners_code ON client_partners(client_code);
CREATE INDEX IF NOT EXISTS idx_client_partners_phone ON client_partners(phone);
CREATE INDEX IF NOT EXISTS idx_client_partners_status ON client_partners(status);
CREATE INDEX IF NOT EXISTS idx_client_payouts_client_id ON client_payouts(client_id);

