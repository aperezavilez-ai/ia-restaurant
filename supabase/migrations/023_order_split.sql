-- División de cuenta: partes con nombre y monto por comensal
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS split_config JSONB;
