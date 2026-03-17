import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFinancialData(profile) {
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [debts, setDebts] = useState([])
  const [assets, setAssets] = useState([])
  const [goals, setGoals] = useState([])
  const [healthScore, setHealthScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)

    const now = new Date()
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const [cats, txs, dbs, ast, gls] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('transactions').select('*, categories(name, icon, budget_group)').gte('date', startOfMonth).order('date', { ascending: false }),
      supabase.from('debts').select('*').eq('is_active', true),
      supabase.from('assets').select('*'),
      supabase.from('goals').select('*').eq('status', 'active'),
    ])

    setCategories(cats.data || [])
    setTransactions(txs.data || [])
    setDebts(dbs.data || [])
    setAssets(ast.data || [])
    setGoals(gls.data || [])

    // Calculate health score
    const income = Number(profile.monthly_income) || 0
    const expenses = (txs.data || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    const totalDebtPayments = (dbs.data || []).reduce((s, d) => s + Number(d.minimum_payment || 0), 0)
    const liquidAssets = (ast.data || []).filter(a => a.is_liquid).reduce((s, a) => s + Number(a.current_value), 0)

    let score = 0
    if (income > 0) {
      if (income > expenses) score += Math.min(20, Math.round((income - expenses) / income * 40))
      const savingsRate = (income - expenses) / income * 100
      if (savingsRate >= 20) score += 20
      else if (savingsRate >= 10) score += 15
      else if (savingsRate > 0) score += 10
      const dti = totalDebtPayments / income * 100
      if (dti <= 15) score += 20
      else if (dti <= 25) score += 15
      else if (dti <= 36) score += 10
      else if (dti <= 50) score += 5
      const emergMonths = expenses > 0 ? liquidAssets / expenses : 0
      if (emergMonths >= 6) score += 20
      else if (emergMonths >= 3) score += 15
      else if (emergMonths >= 1) score += 10
      else if (liquidAssets > 0) score += 5
      if ((gls.data || []).length > 0) score += 10
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      if ((txs.data || []).some(t => new Date(t.date) >= weekAgo)) score += 10
    }
    setHealthScore(Math.min(100, score))
    setLoading(false)
  }, [profile])

  useEffect(() => { loadData() }, [loadData])

  // Derived values
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const monthlyIncome = Number(profile?.monthly_income) || 0
  const netCashFlow = (monthlyIncome || income) - expenses
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance), 0)
  const totalAssets = assets.reduce((s, a) => s + Number(a.current_value), 0)
  const netWorth = totalAssets - totalDebt
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - expenses) / monthlyIncome * 100) : 0

  return {
    categories, transactions, debts, assets, goals,
    healthScore, loading, loadData,
    income, expenses, monthlyIncome, netCashFlow,
    totalDebt, totalAssets, netWorth, savingsRate,
  }
}
