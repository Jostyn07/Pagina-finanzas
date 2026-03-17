# 💰 FinWise — Tu asistente financiero inteligente

App web de gestión financiera personal con IA, construida con React + Supabase + Tailwind CSS.

## ✨ Funcionalidades

- **Health Score (0-100)** — Evaluación visual de tu salud financiera
- **Presupuesto 50/30/20** — Regla de presupuesto adaptable con barras de progreso
- **Baby Steps de Ramsey** — Los 7 pasos hacia la libertad financiera
- **Registro de transacciones** — Gastos e ingresos con categorías predefinidas
- **Dashboard visual** — Gráficas de distribución, patrimonio neto, flujo de caja
- **Asesor IA** — (Próximamente) Consejos personalizados con Claude API
- **PWA** — Instalable en celular como app nativa

## 🚀 Setup paso a paso

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto (elige una contraseña segura para la DB)
3. Espera a que el proyecto se inicialice (~2 minutos)
4. Ve a **SQL Editor** en el menú lateral
5. Pega el contenido completo de `supabase_schema.sql` y ejecuta
6. Ve a **Settings > API** y copia:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public key** (empieza con `eyJhbGciOi...`)

### 2. Configurar el proyecto local

```bash
# Clonar el repositorio (o descomprimir el ZIP)
cd finwise

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...tu-anon-key
```

### 3. Correr en desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:3000`. Regístrate, completa el onboarding y empieza a usar FinWise.

### 4. Deploy en Vercel (gratis)

1. Sube el proyecto a un repositorio en [GitHub](https://github.com)
2. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
3. Importa el repositorio
4. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. Click en **Deploy**
6. Tu app estará en `https://tu-proyecto.vercel.app`

### 5. Configurar Supabase para producción

En tu proyecto de Supabase, ve a **Authentication > URL Configuration** y agrega:
- **Site URL**: `https://tu-proyecto.vercel.app`
- **Redirect URLs**: `https://tu-proyecto.vercel.app/**`

## 📁 Estructura del proyecto

```
finwise/
├── public/
│   ├── favicon.svg
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── AdvisorTab.jsx     # Tab del asesor IA
│   │   ├── BabySteps.jsx      # Tracker de los 7 Baby Steps
│   │   ├── BottomNav.jsx      # Navegación inferior
│   │   ├── BudgetBars.jsx     # Barras 50/30/20 + pie chart
│   │   ├── GoalsTab.jsx       # Tab de metas financieras
│   │   ├── HealthRing.jsx     # Anillo SVG del Health Score
│   │   ├── TransactionList.jsx # Lista de transacciones
│   │   └── TransactionModal.jsx # Modal para nueva transacción
│   ├── context/
│   │   └── AuthContext.jsx    # Contexto de autenticación
│   ├── hooks/
│   │   └── useFinancialData.js # Hook de datos financieros
│   ├── lib/
│   │   └── supabase.js        # Cliente Supabase
│   ├── pages/
│   │   ├── Auth.jsx           # Login / Registro
│   │   ├── Dashboard.jsx      # Dashboard principal
│   │   └── Onboarding.jsx     # Onboarding 3 pasos
│   ├── utils/
│   │   ├── constants.js       # Baby Steps, Budget Groups
│   │   └── formatting.js      # formatMoney, getHealthColor
│   ├── App.jsx                # Router principal
│   ├── index.css              # Tailwind + estilos globales
│   └── main.jsx               # Punto de entrada React
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── supabase_schema.sql         # Schema completo de la DB
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## 🛠 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS 3 |
| Gráficas | Recharts |
| Iconos | Lucide React |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| IA | Claude API (próximamente) |
| Deploy | Vercel |

## 📊 Base de datos

8 tablas con Row Level Security:

- `profiles` — Datos del usuario y configuración de presupuesto
- `categories` — 25 categorías predefinidas + personalizadas
- `transactions` — Gastos e ingresos diarios
- `debts` — Deudas activas con tracking
- `assets` — Activos líquidos e ilíquidos
- `goals` — Metas financieras con progreso
- `financial_snapshots` — Foto mensual del estado financiero
- `ai_conversations` — Historial del asesor IA

## 📖 Principios financieros

FinWise está construido sobre:
- **Regla 50/30/20** (Elizabeth Warren)
- **7 Baby Steps** (Dave Ramsey)
- **FinHealth Score** (Financial Health Network)
- **Behavioral Finance** (Kahneman & Tversky)
- **The Psychology of Money** (Morgan Housel)
