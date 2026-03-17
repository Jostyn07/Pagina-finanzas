import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  Wallet, TrendingUp, TrendingDown, Target, PiggyBank, CreditCard,
  LogOut, Plus, ArrowRight, ArrowLeft, Shield, BarChart3, Brain,
  AlertCircle, CheckCircle2, ChevronRight, Moon, Sun, Settings,
  DollarSign, Home, Utensils, Car, Smartphone, GraduationCap,
  Gamepad2, ShoppingBag, Heart, Coffee, Landmark, X, Edit3,
  Calendar, Clock, Loader2, Trash2, Save, RefreshCw
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area
} from "recharts";

// ============================================================
// CONTEXT & SUPABASE
// ============================================================
const AppContext = createContext(null);

const STORAGE_KEY = "finwise_supabase_config";

function getStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatMoney(amount, currency = "COP") {
  if (amount == null) return "$0";
  const abs = Math.abs(Number(amount));
  if (currency === "COP") {
    return (amount < 0 ? "-" : "") + "$" + abs.toLocaleString("es-CO", { maximumFractionDigits: 0 });
  }
  return (amount < 0 ? "-" : "") + "$" + abs.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function getHealthColor(score) {
  if (score >= 70) return { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30", fill: "#34d399" };
  if (score >= 40) return { bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/30", fill: "#fbbf24" };
  return { bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/30", fill: "#f87171" };
}

function getHealthLabel(score) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bueno";
  if (score >= 40) return "Regular";
  if (score >= 20) return "En riesgo";
  return "Crítico";
}

const BABY_STEPS = [
  { step: 1, title: "Fondo de emergencia inicial", desc: "Ahorra $1,000 USD (o equivalente) para emergencias básicas", icon: Shield },
  { step: 2, title: "Eliminar deudas", desc: "Paga todas las deudas (excepto hipoteca) con el método bola de nieve", icon: CreditCard },
  { step: 3, title: "Fondo completo", desc: "Ahorra 3-6 meses de gastos como red de seguridad total", icon: PiggyBank },
  { step: 4, title: "Invertir 15%", desc: "Invierte el 15% de tus ingresos para el retiro", icon: TrendingUp },
  { step: 5, title: "Educación hijos", desc: "Ahorra para la educación de tus hijos", icon: GraduationCap },
  { step: 6, title: "Pagar la casa", desc: "Paga la hipoteca por adelantado", icon: Home },
  { step: 7, title: "Riqueza y generosidad", desc: "Construye riqueza e invierte y da generosamente", icon: Heart },
];

const BUDGET_GROUPS = {
  needs: { label: "Necesidades", color: "#3b82f6", lightColor: "#93c5fd" },
  wants: { label: "Deseos", color: "#f59e0b", lightColor: "#fcd34d" },
  savings: { label: "Ahorro", color: "#10b981", lightColor: "#6ee7b7" },
};

// ============================================================
// SETUP SCREEN (Supabase config)
// ============================================================
function SetupScreen({ onSave }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setTesting(true);
    try {
      const client = createClient(url.trim(), key.trim());
      const { error: err } = await client.auth.getSession();
      if (err && !err.message.includes("no session")) throw err;
      const config = { url: url.trim(), key: key.trim() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      onSave(config);
    } catch (e) {
      setError("No se pudo conectar. Verifica la URL y la llave.");
    } finally { setTesting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 mb-4">
            <Wallet className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinWise</h1>
          <p className="text-slate-400 mt-2">Conecta tu proyecto de Supabase para empezar</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Supabase URL</label>
            <input type="url" required value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Anon Key</label>
            <input type="text" required value={key} onChange={e => setKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-xs" />
          </div>
          {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
          <button type="submit" disabled={testing}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {testing ? "Conectando..." : "Conectar"}
          </button>
          <p className="text-xs text-slate-500 text-center">Ejecuta el schema SQL en tu proyecto de Supabase antes de conectar</p>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// AUTH SCREEN
// ============================================================
function AuthScreen({ supabase }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (error) throw error;
        setSuccess("Cuenta creada. Revisa tu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setError(e.message || "Error al procesar");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 mb-4">
            <Wallet className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinWise</h1>
          <p className="text-slate-400 mt-2">Tu asistente financiero inteligente</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <div className="flex bg-slate-900/50 rounded-xl p-1">
            {["login", "register"].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"}`}>
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre completo</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
          {success && <p className="text-emerald-400 text-sm flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />{success}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING FLOW
// ============================================================
function OnboardingScreen({ supabase, profile, onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    full_name: profile?.full_name || "",
    currency: profile?.currency || "COP",
    monthly_income: profile?.monthly_income || "",
    budget_needs_pct: 50, budget_wants_pct: 30, budget_savings_pct: 20,
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) { setData(d => ({ ...d, [field]: value })); }

  async function finish() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      ...data,
      monthly_income: Number(data.monthly_income) || 0,
      onboarding_completed: true
    }).eq("id", profile.id);
    setSaving(false);
    if (!error) onComplete();
  }

  const totalPct = Number(data.budget_needs_pct) + Number(data.budget_wants_pct) + Number(data.budget_savings_pct);
  const pctValid = totalPct === 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Configuremos tu perfil</h1>
          <p className="text-slate-400 mt-1">Paso {step} de 3</p>
          <div className="flex gap-2 justify-center mt-3">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${s <= step ? "bg-amber-500" : "bg-slate-700"}`} />
            ))}
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Heart className="w-5 h-5 text-amber-400" /> Datos básicos</h2>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Tu nombre</label>
                <input type="text" value={data.full_name} onChange={e => update("full_name", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Moneda principal</label>
                <select value={data.currency} onChange={e => update("currency", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  <option value="COP">COP — Peso Colombiano</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="MXN">MXN — Peso Mexicano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Ingreso mensual neto</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="number" value={data.monthly_income} onChange={e => update("monthly_income", e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-amber-400" /> Regla de presupuesto</h2>
              <p className="text-sm text-slate-400">Ajusta los porcentajes según tu realidad. La recomendación clásica es 50/30/20.</p>
              {[
                { key: "budget_needs_pct", label: "Necesidades", desc: "Vivienda, comida, transporte, deudas mínimas", color: "blue" },
                { key: "budget_wants_pct", label: "Deseos", desc: "Entretenimiento, restaurantes, hobbies", color: "amber" },
                { key: "budget_savings_pct", label: "Ahorro", desc: "Fondo emergencia, inversión, pago extra deudas", color: "emerald" },
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className={`text-sm font-bold text-${item.color}-400`}>{data[item.key]}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={data[item.key]}
                    onChange={e => update(item.key, Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-slate-700 accent-amber-500" />
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
              <div className={`text-center py-2 rounded-xl text-sm font-medium ${pctValid ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                Total: {totalPct}% {pctValid ? "✓" : "(debe sumar 100%)"}
              </div>
              {data.monthly_income > 0 && pctValid && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { label: "Necesidades", pct: data.budget_needs_pct, color: "blue" },
                    { label: "Deseos", pct: data.budget_wants_pct, color: "amber" },
                    { label: "Ahorro", pct: data.budget_savings_pct, color: "emerald" },
                  ].map(b => (
                    <div key={b.label} className="bg-slate-900/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">{b.label}</p>
                      <p className={`text-sm font-bold text-${b.color}-400 mt-1`}>
                        {formatMoney(data.monthly_income * b.pct / 100, data.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Target className="w-5 h-5 text-amber-400" /> Resumen</h2>
              <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between"><span className="text-slate-400">Nombre</span><span className="text-white font-medium">{data.full_name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Moneda</span><span className="text-white font-medium">{data.currency}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ingreso mensual</span><span className="text-amber-400 font-bold">{formatMoney(data.monthly_income, data.currency)}</span></div>
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between"><span className="text-slate-400">Necesidades ({data.budget_needs_pct}%)</span><span className="text-blue-400">{formatMoney(data.monthly_income * data.budget_needs_pct / 100, data.currency)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Deseos ({data.budget_wants_pct}%)</span><span className="text-amber-300">{formatMoney(data.monthly_income * data.budget_wants_pct / 100, data.currency)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ahorro ({data.budget_savings_pct}%)</span><span className="text-emerald-400">{formatMoney(data.monthly_income * data.budget_savings_pct / 100, data.currency)}</span></div>
              </div>
              <p className="text-xs text-slate-500 text-center">Podrás cambiar todo esto después en Configuración</p>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Atrás
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={step === 2 && !pctValid}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-1">
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? "Guardando..." : "Empezar a usar FinWise"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// TRANSACTION FORM MODAL
// ============================================================
function TransactionModal({ supabase, profile, categories, onClose, onSaved }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const filtered = categories.filter(c => c.type === type);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: profile.id, type, amount: Number(amount),
      category_id: categoryId || null, description, date,
    });
    setSaving(false);
    if (!error) { onSaved(); onClose(); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-md bg-slate-800 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Nueva transacción</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex bg-slate-900/50 rounded-xl p-1">
            {[["expense", "Gasto", TrendingDown], ["income", "Ingreso", TrendingUp]].map(([t, l, Icon]) => (
              <button key={t} type="button" onClick={() => { setType(t); setCategoryId(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${type === t ? (t === "expense" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400") : "text-slate-400"}`}>
                <Icon className="w-4 h-4" />{l}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Monto</label>
            <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Categoría</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${categoryId === c.id ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30" : "bg-slate-900/50 text-slate-300 hover:bg-slate-700/50"}`}>
                  <span>{c.icon}</span><span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Descripción</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>
          <button type="submit" disabled={saving || !amount}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// HEALTH SCORE RING
// ============================================================
function HealthRing({ score, size = 140 }) {
  const { text, fill } = getHealthColor(score);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-700/50" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={fill} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className={`text-3xl font-bold ${text}`}>{score}</div>
        <div className="text-xs text-slate-400">{getHealthLabel(score)}</div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ supabase, profile, refreshProfile }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showAddTx, setShowAddTx] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [healthScore, setHealthScore] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    
    const [cats, txs, dbs, ast, gls] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("transactions").select("*, categories(name, icon, budget_group)").gte("date", startOfMonth).order("date", { ascending: false }),
      supabase.from("debts").select("*").eq("is_active", true),
      supabase.from("assets").select("*"),
      supabase.from("goals").select("*").eq("status", "active"),
    ]);
    
    setCategories(cats.data || []);
    setTransactions(txs.data || []);
    setDebts(dbs.data || []);
    setAssets(ast.data || []);
    setGoals(gls.data || []);

    // Calculate health score locally
    const income = Number(profile.monthly_income) || 0;
    const expenses = (txs.data || []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const totalDebtPayments = (dbs.data || []).reduce((s, d) => s + Number(d.minimum_payment || 0), 0);
    const liquidAssets = (ast.data || []).filter(a => a.is_liquid).reduce((s, a) => s + Number(a.current_value), 0);
    
    let score = 0;
    if (income > 0) {
      // Cash flow (0-20)
      if (income > expenses) score += Math.min(20, Math.round((income - expenses) / income * 40));
      // Savings rate (0-20)
      const savingsRate = income > 0 ? (income - expenses) / income * 100 : 0;
      if (savingsRate >= 20) score += 20;
      else if (savingsRate >= 10) score += 15;
      else if (savingsRate > 0) score += 10;
      // DTI (0-20)
      const dti = income > 0 ? totalDebtPayments / income * 100 : 0;
      if (dti <= 15) score += 20;
      else if (dti <= 25) score += 15;
      else if (dti <= 36) score += 10;
      else if (dti <= 50) score += 5;
      // Emergency fund (0-20)
      const emergMonths = expenses > 0 ? liquidAssets / expenses : 0;
      if (emergMonths >= 6) score += 20;
      else if (emergMonths >= 3) score += 15;
      else if (emergMonths >= 1) score += 10;
      else if (liquidAssets > 0) score += 5;
      // Planning (0-20)
      if ((gls.data || []).length > 0) score += 10;
      if ((txs.data || []).some(t => { const d = new Date(t.date); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; })) score += 10;
    }
    setHealthScore(Math.min(100, score));
    setLoading(false);
  }, [supabase, profile]);

  useEffect(() => { loadData(); }, [loadData]);

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const monthlyIncome = Number(profile.monthly_income) || 0;
  const netCashFlow = (monthlyIncome || income) - expenses;
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance), 0);
  const totalAssets = assets.reduce((s, a) => s + Number(a.current_value), 0);
  const netWorth = totalAssets - totalDebt;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - expenses) / monthlyIncome * 100) : 0;

  // Budget group breakdown
  const budgetData = Object.entries(BUDGET_GROUPS).map(([key, { label, color }]) => {
    const total = transactions.filter(t => t.type === "expense" && t.categories?.budget_group === key).reduce((s, t) => s + Number(t.amount), 0);
    const limit = monthlyIncome * (profile[`budget_${key}_pct`] || 0) / 100;
    return { key, label, color, total, limit, pct: limit > 0 ? (total / limit * 100) : 0 };
  });

  const pieData = budgetData.filter(d => d.total > 0).map(d => ({ name: d.label, value: d.total, fill: d.color }));

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Inicio", icon: BarChart3 },
    { id: "transactions", label: "Movimientos", icon: Wallet },
    { id: "goals", label: "Metas", icon: Target },
    { id: "advisor", label: "Asesor IA", icon: Brain },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white">FinWise</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Hola, {profile.full_name?.split(" ")[0] || "Usuario"}</span>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded-lg" title="Cerrar sesión">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* ========== DASHBOARD TAB ========== */}
        {tab === "dashboard" && (
          <>
            {/* Health Score + Net Worth */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center">
                <HealthRing score={healthScore} size={120} />
                <p className="text-xs text-slate-400 mt-2">Salud financiera</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-center space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Patrimonio neto</p>
                  <p className={`text-xl font-bold ${netWorth >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatMoney(netWorth, profile.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Flujo del mes</p>
                  <p className={`text-lg font-bold ${netCashFlow >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatMoney(netCashFlow, profile.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tasa de ahorro</p>
                  <p className={`text-sm font-bold ${savingsRate >= 20 ? "text-emerald-400" : savingsRate >= 10 ? "text-amber-400" : "text-red-400"}`}>{savingsRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Budget 50/30/20 Bars */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" /> Presupuesto del mes
              </h3>
              <div className="space-y-3">
                {budgetData.map(b => (
                  <div key={b.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{b.label} ({profile[`budget_${b.key}_pct`]}%)</span>
                      <span className={b.pct > 100 ? "text-red-400 font-bold" : "text-slate-400"}>
                        {formatMoney(b.total, profile.currency)} / {formatMoney(b.limit, profile.currency)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, b.pct)}%`, backgroundColor: b.pct > 100 ? "#f87171" : b.color }} />
                    </div>
                  </div>
                ))}
              </div>
              {pieData.length > 0 && (
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(val) => formatMoney(val, profile.currency)} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} />
                      <Legend formatter={(val) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{val}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Baby Steps Progress */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Baby Steps — Paso {profile.current_baby_step || 1}
              </h3>
              <div className="space-y-2">
                {BABY_STEPS.map(bs => {
                  const current = profile.current_baby_step || 1;
                  const done = bs.step < current;
                  const active = bs.step === current;
                  const Icon = bs.icon;
                  return (
                    <div key={bs.step} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${active ? "bg-amber-500/10 ring-1 ring-amber-500/20" : done ? "opacity-50" : "opacity-30"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? "bg-emerald-500/20" : active ? "bg-amber-500/20" : "bg-slate-700/50"}`}>
                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-slate-500"}`} />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${active ? "text-white" : "text-slate-400"}`}>{bs.title}</p>
                        {active && <p className="text-xs text-slate-500">{bs.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">Últimos movimientos</h3>
                <button onClick={() => setTab("transactions")} className="text-xs text-amber-400 hover:underline">Ver todos</button>
              </div>
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Aún no hay movimientos este mes. ¡Registra tu primer gasto o ingreso!</p>
              ) : (
                <div className="space-y-1.5">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 px-2 hover:bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{tx.categories?.icon || (tx.type === "income" ? "💰" : "📦")}</span>
                        <div>
                          <p className="text-sm text-white">{tx.categories?.name || tx.description || "Sin categoría"}</p>
                          <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount, profile.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ========== TRANSACTIONS TAB ========== */}
        {tab === "transactions" && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Movimientos del mes</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No hay movimientos todavía</p>
                <button onClick={() => setShowAddTx(true)} className="mt-3 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-sm font-semibold">
                  Registrar el primero
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-700/30 rounded-lg group">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{tx.categories?.icon || "📦"}</span>
                      <div>
                        <p className="text-sm text-white">{tx.description || tx.categories?.name || "Sin categoría"}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount, profile.currency)}
                      </span>
                      <button onClick={async () => { await supabase.from("transactions").delete().eq("id", tx.id); loadData(); }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== GOALS TAB ========== */}
        {tab === "goals" && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Metas financieras</h3>
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Aún no tienes metas definidas</p>
                <p className="text-xs text-slate-500 mt-1">Próximamente podrás crear y gestionar metas aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map(g => {
                  const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount * 100) : 0;
                  return (
                    <div key={g.id} className="bg-slate-900/50 rounded-xl p-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-white font-medium">{g.name}</span>
                        <span className="text-xs text-amber-400">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                        <span>{formatMoney(g.current_amount, profile.currency)}</span>
                        <span>{formatMoney(g.target_amount, profile.currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== AI ADVISOR TAB ========== */}
        {tab === "advisor" && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Asesor financiero IA</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                Tu asesor personal analizará tus datos reales y te dará consejos inteligentes basados en tu situación.
              </p>
              <div className="mt-4 bg-slate-900/50 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Resumen para el asesor</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Ingreso:</span> <span className="text-white">{formatMoney(monthlyIncome, profile.currency)}</span></div>
                  <div><span className="text-slate-500">Gastos:</span> <span className="text-white">{formatMoney(expenses, profile.currency)}</span></div>
                  <div><span className="text-slate-500">Deudas:</span> <span className="text-white">{formatMoney(totalDebt, profile.currency)}</span></div>
                  <div><span className="text-slate-500">Score:</span> <span className={getHealthColor(healthScore).text}>{healthScore}/100</span></div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-4">Módulo completo en el siguiente paso del desarrollo</p>
            </div>
          </div>
        )}
      </main>

      {/* FAB - Add transaction */}
      <button onClick={() => setShowAddTx(true)}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[280px] w-14 h-14 bg-amber-500 hover:bg-amber-400 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center transition-transform hover:scale-105 z-30">
        <Plus className="w-6 h-6 text-slate-900" />
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 z-40">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Transaction Modal */}
      {showAddTx && (
        <TransactionModal supabase={supabase} profile={profile} categories={categories}
          onClose={() => setShowAddTx(false)} onSaved={loadData} />
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [config, setConfig] = useState(getStoredConfig);
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase
  useEffect(() => {
    if (!config) { setLoading(false); return; }
    const client = createClient(config.url, config.key);
    setSupabase(client);
    
    client.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, [config]);

  // Load profile
  useEffect(() => {
    if (!supabase || !session?.user) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data));
  }, [supabase, session]);

  const refreshProfile = useCallback(() => {
    if (!supabase || !session?.user) return;
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data));
  }, [supabase, session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Step 1: No Supabase config
  if (!config) return <SetupScreen onSave={setConfig} />;

  // Step 2: Not authenticated
  if (!session) return <AuthScreen supabase={supabase} />;

  // Step 3: Profile not loaded yet
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Step 4: Onboarding not completed
  if (!profile.onboarding_completed) {
    return <OnboardingScreen supabase={supabase} profile={profile} onComplete={refreshProfile} />;
  }

  // Step 5: Main app
  return <Dashboard supabase={supabase} profile={profile} refreshProfile={refreshProfile} />;
}
