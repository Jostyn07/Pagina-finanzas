import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { formatMoney, getHealthColor } from '../utils/formatting'
import { Brain, Send, Loader2, RefreshCw, Sparkles, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react'

const QUICK_SUGGESTIONS = [
  { icon: TrendingUp,    label: '¿Cómo mejorar mi Health Score?', text: '¿Qué acciones concretas puedo tomar para mejorar mi salud financiera y subir mi score?' },
  { icon: Target,        label: '¿En qué priorizar mis metas?',   text: 'Dado mi ingreso y situación actual, ¿en qué orden debería priorizar mis metas financieras?' },
  { icon: AlertTriangle, label: 'Analiza mis gastos del mes',     text: 'Analiza mis gastos de este mes. ¿Dónde estoy gastando de más? ¿Qué patrones ves?' },
  { icon: Zap,           label: '¿Qué haría Dave Ramsey?',        text: 'Según los Baby Steps de Dave Ramsey y mi situación actual, ¿en qué baby step estoy y qué debería hacer?' },
]

function buildSystemPrompt(profile, monthlyIncome, expenses, debts, goals, healthScore, netWorth, savingsRate) {
  const totalDebt = (debts || []).reduce((s, d) => s + Number(d.current_balance), 0)
  const totalMinPayments = (debts || []).reduce((s, d) => s + Number(d.minimum_payment || 0), 0)
  const dti = monthlyIncome > 0 ? (totalMinPayments / monthlyIncome * 100).toFixed(1) : 0

  const debtList = debts?.length
    ? debts.map(d => `- ${d.name}: ${formatMoney(d.current_balance, profile.currency)} al ${d.interest_rate}% anual`).join('\n')
    : '- Sin deudas registradas'

  const goalList = goals?.length
    ? goals.map(g => `- ${g.name}: ${formatMoney(g.current_amount, profile.currency)} de ${formatMoney(g.target_amount, profile.currency)}`).join('\n')
    : '- Sin metas activas'

  return `Eres FinWise AI, un asesor financiero personal experto, empático y directo. Hablas en español colombiano.

SITUACIÓN FINANCIERA ACTUAL (${new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}):
- Nombre: ${profile.full_name || 'Usuario'}
- Moneda: ${profile.currency}
- Ingreso mensual: ${formatMoney(monthlyIncome, profile.currency)}
- Gastos del mes: ${formatMoney(expenses, profile.currency)}
- Flujo de caja: ${formatMoney(monthlyIncome - expenses, profile.currency)}
- Tasa de ahorro: ${savingsRate?.toFixed(1)}%
- Patrimonio neto: ${formatMoney(netWorth, profile.currency)}
- Health Score: ${healthScore}/100
- Ratio deuda-ingreso (DTI): ${dti}%
- Baby Step actual: ${profile.current_baby_step || 1} de 7

DEUDAS ACTIVAS:
${debtList}
Total deuda: ${formatMoney(totalDebt, profile.currency)}

METAS FINANCIERAS:
${goalList}

PRINCIPIOS QUE APLICAS:
1. Regla 50/30/20 de Elizabeth Warren
2. 7 Baby Steps de Dave Ramsey
3. The Psychology of Money de Morgan Housel
4. Rich Dad Poor Dad de Kiyosaki
5. The Richest Man in Babylon (págate primero, ahorra mínimo 10%)
6. I Will Teach You to Be Rich de Ramit Sethi
7. Behavioral Finance: detectas sesgos cognitivos (aversión a pérdida, contabilidad mental, tunneling)

INSTRUCCIONES:
- Da consejos concretos, específicos y accionables basados en los datos reales
- Sé directo pero empático. No des sermones largos
- Usa cifras específicas cuando sea relevante
- Máximo 4-5 párrafos, usa emojis con moderación
- Si DTI es alto, score bajo o gastos > ingresos, dilo claramente`
}

export default function AdvisorTab({ profile, monthlyIncome, expenses, totalDebt, healthScore, netWorth, savingsRate, debts, goals }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)
  const hc = getHealthColor(healthScore)

  // Load history from Supabase
  useEffect(() => {
    async function loadHistory() {
      setLoadingHistory(true)
      const { data } = await supabase
        .from('ai_conversations')
        .select('role, content')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(30)
      if (data?.length) setMessages(data.map(m => ({ role: m.role, content: m.content })))
      setLoadingHistory(false)
    }
    loadHistory()
  }, [profile.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')
    setLoading(true)

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)

    // Save user message
    await supabase.from('ai_conversations').insert({
      user_id: profile.id, role: 'user', content: userMsg,
      context: { healthScore, monthlyIncome, expenses, totalDebt }
    })

    try {
      const systemPrompt = buildSystemPrompt(
        profile, monthlyIncome, expenses, debts, goals,
        healthScore, netWorth, savingsRate
      )

      // ✅ Call Supabase Edge Function (proxy) — never exposes API key
      const { data, error } = await supabase.functions.invoke('chat-advisor', {
        body: {
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt,
        },
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      const assistantText = data?.text || 'No pude generar una respuesta. Intenta de nuevo.'
      const assistantMsg = { role: 'assistant', content: assistantText }
      setMessages([...newMessages, assistantMsg])

      // Save assistant message
      await supabase.from('ai_conversations').insert({
        user_id: profile.id, role: 'assistant', content: assistantText, context: {}
      })
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠️ ${err.message || 'Error de conexión. Verifica que la Edge Function esté desplegada.'}`
      }])
    } finally {
      setLoading(false)
    }
  }

  async function clearHistory() {
    if (!confirm('¿Borrar todo el historial del asesor?')) return
    await supabase.from('ai_conversations').delete().eq('user_id', profile.id)
    setMessages([])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const isEmpty = messages.length === 0 && !loadingHistory

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Asesor financiero IA</h3>
              <p className="text-xs text-slate-400">Powered by Claude · Datos reales de tu cuenta</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearHistory} className="p-2 hover:bg-slate-700 rounded-lg" title="Limpiar historial">
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Financial summary */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div className="bg-slate-900/50 rounded-xl p-2 text-center">
            <p className="text-xs text-slate-500">Score</p>
            <p className={`text-sm font-bold ${hc.text}`}>{healthScore}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 text-center">
            <p className="text-xs text-slate-500">Ahorro</p>
            <p className="text-sm font-bold text-emerald-400">{savingsRate?.toFixed(0)}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 text-center">
            <p className="text-xs text-slate-500">Deuda</p>
            <p className="text-sm font-bold text-red-400 truncate">{formatMoney(totalDebt, profile.currency)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-2 text-center">
            <p className="text-xs text-slate-500">Baby Step</p>
            <p className="text-sm font-bold text-amber-400">{profile.current_baby_step || 1}/7</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-col" style={{ minHeight: 400 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : isEmpty ? (
            <div className="text-center py-6">
              <Sparkles className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">¡Hola, {profile.full_name?.split(' ')[0] || 'usuario'}!</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Soy tu asesor financiero personal. Conozco tu situación real y puedo darte consejos personalizados.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 text-white rounded-br-sm'
                    : 'bg-slate-700/60 text-slate-200 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Brain className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">FinWise IA</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/60 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {isEmpty && (
          <div className="px-4 pb-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Preguntas frecuentes</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_SUGGESTIONS.map((s, i) => {
                const Icon = s.icon
                return (
                  <button key={i} onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-2 text-left px-3 py-2 bg-slate-700/40 hover:bg-slate-700/70 rounded-xl transition-colors">
                    <Icon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-slate-300 leading-tight">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-700/50">
          <div className="flex gap-2">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntale a tu asesor..."
              rows={1}
              className="flex-1 px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm"
              style={{ maxHeight: 100 }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="p-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 rounded-xl transition-colors flex-shrink-0">
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 text-center">Enter para enviar · Shift+Enter para nueva línea</p>
        </div>
      </div>
    </div>
  )
}
