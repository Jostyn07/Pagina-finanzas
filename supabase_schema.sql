-- ============================================================
-- FINWISE — Esquema completo de base de datos para Supabase
-- Tu asistente financiero inteligente
-- ============================================================

-- ============================================================
-- 1. TABLA: profiles (extiende auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'COP',
  monthly_income NUMERIC(15,2) DEFAULT 0,
  income_frequency TEXT DEFAULT 'monthly' CHECK (income_frequency IN ('weekly', 'biweekly', 'monthly')),
  -- Presupuesto personalizable (default 50/30/20)
  budget_needs_pct NUMERIC(5,2) DEFAULT 50.00,
  budget_wants_pct NUMERIC(5,2) DEFAULT 30.00,
  budget_savings_pct NUMERIC(5,2) DEFAULT 20.00,
  -- Baby Steps de Ramsey - paso actual
  current_baby_step INTEGER DEFAULT 1 CHECK (current_baby_step BETWEEN 1 AND 7),
  -- Preferencias
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 2. TABLA: categories (categorías de gastos/ingresos)
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  -- Clasificación 50/30/20
  budget_group TEXT DEFAULT 'needs' CHECK (budget_group IN ('needs', 'wants', 'savings')),
  is_system BOOLEAN DEFAULT FALSE, -- categorías predefinidas
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA: transactions (gastos e ingresos)
-- ============================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Índices para consultas frecuentes
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);

-- ============================================================
-- 4. TABLA: debts (deudas activas)
-- ============================================================
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN (
    'credit_card', 'student_loan', 'mortgage', 'car_loan', 
    'personal_loan', 'medical', 'other'
  )),
  total_amount NUMERIC(15,2) NOT NULL CHECK (total_amount > 0),
  current_balance NUMERIC(15,2) NOT NULL CHECK (current_balance >= 0),
  interest_rate NUMERIC(6,3) DEFAULT 0,
  minimum_payment NUMERIC(15,2) DEFAULT 0,
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  is_active BOOLEAN DEFAULT TRUE,
  paid_off_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. TABLA: assets (activos)
-- ============================================================
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN (
    'savings_account', 'checking_account', 'investment',
    'real_estate', 'vehicle', 'cash', 'crypto', 'other'
  )),
  current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  is_liquid BOOLEAN DEFAULT TRUE, -- si se puede usar rápidamente
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. TABLA: goals (metas financieras)
-- ============================================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'savings' CHECK (type IN (
    'emergency_fund', 'debt_payoff', 'savings', 
    'investment', 'purchase', 'retirement', 'other'
  )),
  target_amount NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE,
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 7. TABLA: financial_snapshots (foto mensual del estado)
-- ============================================================
CREATE TABLE public.financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  -- Métricas calculadas
  total_income NUMERIC(15,2) DEFAULT 0,
  total_expenses NUMERIC(15,2) DEFAULT 0,
  total_needs NUMERIC(15,2) DEFAULT 0,
  total_wants NUMERIC(15,2) DEFAULT 0,
  total_savings NUMERIC(15,2) DEFAULT 0,
  net_cash_flow NUMERIC(15,2) DEFAULT 0,
  -- Patrimonio
  total_assets NUMERIC(15,2) DEFAULT 0,
  total_debts NUMERIC(15,2) DEFAULT 0,
  net_worth NUMERIC(15,2) DEFAULT 0,
  -- Ratios
  debt_to_income NUMERIC(6,2) DEFAULT 0,
  savings_rate NUMERIC(6,2) DEFAULT 0,
  -- Health Score (0-100)
  health_score INTEGER DEFAULT 0,
  baby_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- ============================================================
-- 8. TABLA: ai_conversations (historial de consejos IA)
-- ============================================================
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}', -- datos financieros usados como contexto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON public.ai_conversations(user_id, created_at DESC);

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Profiles: solo el dueño puede ver/editar su perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories: ver las del sistema + las propias, editar solo las propias
CREATE POLICY "Users can view own and system categories"
  ON public.categories FOR SELECT
  USING (is_system = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid() AND is_system = FALSE);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid() AND is_system = FALSE);

-- Transactions: CRUD solo para el dueño
CREATE POLICY "Users can CRUD own transactions"
  ON public.transactions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Debts: CRUD solo para el dueño
CREATE POLICY "Users can CRUD own debts"
  ON public.debts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Assets: CRUD solo para el dueño
CREATE POLICY "Users can CRUD own assets"
  ON public.assets FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Goals: CRUD solo para el dueño
CREATE POLICY "Users can CRUD own goals"
  ON public.goals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Snapshots: CRUD solo para el dueño
CREATE POLICY "Users can CRUD own snapshots"
  ON public.financial_snapshots FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- AI Conversations: CRUD solo para el dueño
CREATE POLICY "Users can CRUD own ai conversations"
  ON public.ai_conversations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 10. DATOS INICIALES: Categorías del sistema
-- ============================================================

-- Categorías de GASTOS - Necesidades (50%)
INSERT INTO public.categories (user_id, name, icon, type, budget_group, is_system, sort_order) VALUES
  (NULL, 'Vivienda/Arriendo', '🏠', 'expense', 'needs', TRUE, 1),
  (NULL, 'Servicios públicos', '💡', 'expense', 'needs', TRUE, 2),
  (NULL, 'Alimentación', '🛒', 'expense', 'needs', TRUE, 3),
  (NULL, 'Transporte', '🚌', 'expense', 'needs', TRUE, 4),
  (NULL, 'Salud/Seguro', '🏥', 'expense', 'needs', TRUE, 5),
  (NULL, 'Deudas (pago mínimo)', '💳', 'expense', 'needs', TRUE, 6),
  (NULL, 'Internet/Teléfono', '📱', 'expense', 'needs', TRUE, 7),
  (NULL, 'Educación', '📚', 'expense', 'needs', TRUE, 8);

-- Categorías de GASTOS - Deseos (30%)
INSERT INTO public.categories (user_id, name, icon, type, budget_group, is_system, sort_order) VALUES
  (NULL, 'Restaurantes/Comida fuera', '🍕', 'expense', 'wants', TRUE, 10),
  (NULL, 'Entretenimiento', '🎮', 'expense', 'wants', TRUE, 11),
  (NULL, 'Ropa/Accesorios', '👕', 'expense', 'wants', TRUE, 12),
  (NULL, 'Suscripciones', '📺', 'expense', 'wants', TRUE, 13),
  (NULL, 'Hobbies', '🎨', 'expense', 'wants', TRUE, 14),
  (NULL, 'Café/Snacks', '☕', 'expense', 'wants', TRUE, 15),
  (NULL, 'Compras personales', '🛍️', 'expense', 'wants', TRUE, 16);

-- Categorías de GASTOS - Ahorro (20%)
INSERT INTO public.categories (user_id, name, icon, type, budget_group, is_system, sort_order) VALUES
  (NULL, 'Fondo de emergencia', '🛟', 'expense', 'savings', TRUE, 20),
  (NULL, 'Ahorro para metas', '🎯', 'expense', 'savings', TRUE, 21),
  (NULL, 'Inversión', '📈', 'expense', 'savings', TRUE, 22),
  (NULL, 'Pago extra deudas', '💪', 'expense', 'savings', TRUE, 23),
  (NULL, 'Retiro/Pensión', '🏖️', 'expense', 'savings', TRUE, 24);

-- Categorías de INGRESOS
INSERT INTO public.categories (user_id, name, icon, type, budget_group, is_system, sort_order) VALUES
  (NULL, 'Salario', '💰', 'income', 'needs', TRUE, 30),
  (NULL, 'Freelance/Extra', '💻', 'income', 'needs', TRUE, 31),
  (NULL, 'Inversiones', '📊', 'income', 'needs', TRUE, 32),
  (NULL, 'Otros ingresos', '🎁', 'income', 'needs', TRUE, 33);

-- ============================================================
-- 11. FUNCIONES ÚTILES
-- ============================================================

-- Función para calcular el Health Score
CREATE OR REPLACE FUNCTION public.calculate_health_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_income NUMERIC;
  v_expenses NUMERIC;
  v_total_debt NUMERIC;
  v_liquid_assets NUMERIC;
  v_savings_rate NUMERIC;
  v_dti NUMERIC;
  v_emergency_months NUMERIC;
BEGIN
  -- Obtener ingreso mensual
  SELECT monthly_income INTO v_income FROM public.profiles WHERE id = p_user_id;
  IF v_income IS NULL OR v_income <= 0 THEN RETURN 0; END IF;

  -- Gastos del último mes
  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM public.transactions
  WHERE user_id = p_user_id 
    AND type = 'expense'
    AND date >= (CURRENT_DATE - INTERVAL '30 days');

  -- Total de deudas activas
  SELECT COALESCE(SUM(current_balance), 0) INTO v_total_debt
  FROM public.debts WHERE user_id = p_user_id AND is_active = TRUE;

  -- Activos líquidos
  SELECT COALESCE(SUM(current_value), 0) INTO v_liquid_assets
  FROM public.assets WHERE user_id = p_user_id AND is_liquid = TRUE;

  -- 1. Flujo de caja positivo (0-20 puntos)
  IF v_income > v_expenses THEN
    v_score := v_score + LEAST(20, ROUND((v_income - v_expenses) / v_income * 40));
  END IF;

  -- 2. Tasa de ahorro (0-20 puntos)
  v_savings_rate := CASE WHEN v_income > 0 
    THEN (v_income - v_expenses) / v_income * 100 
    ELSE 0 END;
  IF v_savings_rate >= 20 THEN v_score := v_score + 20;
  ELSIF v_savings_rate >= 10 THEN v_score := v_score + 15;
  ELSIF v_savings_rate > 0 THEN v_score := v_score + 10;
  END IF;

  -- 3. Ratio deuda-ingreso (0-20 puntos)
  SELECT COALESCE(SUM(minimum_payment), 0) INTO v_dti
  FROM public.debts WHERE user_id = p_user_id AND is_active = TRUE;
  v_dti := CASE WHEN v_income > 0 THEN v_dti / v_income * 100 ELSE 0 END;
  IF v_dti <= 15 THEN v_score := v_score + 20;
  ELSIF v_dti <= 25 THEN v_score := v_score + 15;
  ELSIF v_dti <= 36 THEN v_score := v_score + 10;
  ELSIF v_dti <= 50 THEN v_score := v_score + 5;
  END IF;

  -- 4. Fondo de emergencia (0-20 puntos)
  v_emergency_months := CASE WHEN v_expenses > 0 
    THEN v_liquid_assets / v_expenses 
    ELSE 0 END;
  IF v_emergency_months >= 6 THEN v_score := v_score + 20;
  ELSIF v_emergency_months >= 3 THEN v_score := v_score + 15;
  ELSIF v_emergency_months >= 1 THEN v_score := v_score + 10;
  ELSIF v_liquid_assets > 0 THEN v_score := v_score + 5;
  END IF;

  -- 5. Planificación (0-20 puntos)
  -- Tiene metas activas?
  IF EXISTS(SELECT 1 FROM public.goals WHERE user_id = p_user_id AND status = 'active') THEN
    v_score := v_score + 10;
  END IF;
  -- Consistencia en registro (transacciones en los últimos 7 días)
  IF EXISTS(
    SELECT 1 FROM public.transactions 
    WHERE user_id = p_user_id AND date >= CURRENT_DATE - 7
  ) THEN
    v_score := v_score + 10;
  END IF;

  RETURN LEAST(100, v_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener resumen financiero del mes
CREATE OR REPLACE FUNCTION public.get_monthly_summary(
  p_user_id UUID,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_income', COALESCE((
      SELECT SUM(t.amount) FROM public.transactions t
      WHERE t.user_id = p_user_id AND t.type = 'income'
        AND EXTRACT(MONTH FROM t.date) = p_month
        AND EXTRACT(YEAR FROM t.date) = p_year
    ), 0),
    'total_expenses', COALESCE((
      SELECT SUM(t.amount) FROM public.transactions t
      WHERE t.user_id = p_user_id AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = p_month
        AND EXTRACT(YEAR FROM t.date) = p_year
    ), 0),
    'by_budget_group', (
      SELECT json_agg(json_build_object('group', bg, 'total', total))
      FROM (
        SELECT c.budget_group AS bg, COALESCE(SUM(t.amount), 0) AS total
        FROM public.transactions t
        JOIN public.categories c ON t.category_id = c.id
        WHERE t.user_id = p_user_id AND t.type = 'expense'
          AND EXTRACT(MONTH FROM t.date) = p_month
          AND EXTRACT(YEAR FROM t.date) = p_year
        GROUP BY c.budget_group
      ) sub
    ),
    'top_categories', (
      SELECT json_agg(json_build_object('name', cat_name, 'icon', cat_icon, 'total', total))
      FROM (
        SELECT c.name AS cat_name, c.icon AS cat_icon, SUM(t.amount) AS total
        FROM public.transactions t
        JOIN public.categories c ON t.category_id = c.id
        WHERE t.user_id = p_user_id AND t.type = 'expense'
          AND EXTRACT(MONTH FROM t.date) = p_month
          AND EXTRACT(YEAR FROM t.date) = p_year
        GROUP BY c.name, c.icon
        ORDER BY total DESC
        LIMIT 5
      ) sub
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
