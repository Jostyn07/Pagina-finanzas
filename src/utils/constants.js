import { Shield, CreditCard, PiggyBank, TrendingUp, GraduationCap, Home, Heart } from 'lucide-react'

export const BABY_STEPS = [
  { step: 1, title: 'Fondo de emergencia inicial', desc: 'Ahorra $1,000 USD (o equivalente) para emergencias básicas', icon: Shield },
  { step: 2, title: 'Eliminar deudas', desc: 'Paga todas las deudas (excepto hipoteca) con el método bola de nieve', icon: CreditCard },
  { step: 3, title: 'Fondo completo', desc: 'Ahorra 3-6 meses de gastos como red de seguridad total', icon: PiggyBank },
  { step: 4, title: 'Invertir 15%', desc: 'Invierte el 15% de tus ingresos para el retiro', icon: TrendingUp },
  { step: 5, title: 'Educación hijos', desc: 'Ahorra para la educación de tus hijos', icon: GraduationCap },
  { step: 6, title: 'Pagar la casa', desc: 'Paga la hipoteca por adelantado', icon: Home },
  { step: 7, title: 'Riqueza y generosidad', desc: 'Construye riqueza e invierte y da generosamente', icon: Heart },
]

export const BUDGET_GROUPS = {
  needs: { label: 'Necesidades', color: '#3b82f6', lightColor: '#93c5fd' },
  wants: { label: 'Deseos', color: '#f59e0b', lightColor: '#fcd34d' },
  savings: { label: 'Ahorro', color: '#10b981', lightColor: '#6ee7b7' },
}
