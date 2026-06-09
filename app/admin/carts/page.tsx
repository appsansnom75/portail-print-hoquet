import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = 'admin123'

const COLOR_MAP: Record<string, string> = {
  'text-blue-500':   '#3b82f6',
  'text-green-500':  '#22c55e',
  'text-purple-500': '#a855f7',
  'text-red-500':    '#ef4444',
  'text-yellow-500': '#eab308',
  'text-orange-500': '#f97316',
  'text-pink-500':   '#ec4899',
  'text-white':      '#ffffff',
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminCartsPage({
  searchParams,
}: {
  searchParams: Promise<{ pwd?: string }>
}) {
  const params = await searchParams
  const pwd = params?.pwd

  if (pwd !== ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6">
        <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl space-y-6 text-white text-center">
          <div className="text-5xl">🔒</div>
          <h2 className="font-black text-blue-500 uppercase tracking-[0.3em] italic text-xl">Accès protégé</h2>
          <p className="text-white/30 text-sm">Réservé à l'administration</p>
          <form method="GET" className="space-y-4">
            <input
              type="password"
              name="pwd"
              placeholder="Mot de passe"
              autoFocus
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-white placeholder-white/20"
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-black uppercase bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-95 transition-all tracking-[0.2em] text-white"
            >
              Accéder
            </button>
          </form>
          {pwd !== undefined && (
            <p className="text-red-500 text-sm font-black uppercase tracking-widest">❌ Mot de passe incorrect</p>
          )}
        </div>
      </div>
    )
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: allDrafts } = await adminSupabase
    .from('orders')
    .select('*')
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })

  const drafts = (allDrafts ?? []).filter(
    (o) => Array.isArray(o.items) && o.items.length > 0
  )

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="sticky top-0 z-40 bg-[#0f092e]/90 py-4 backdrop-blur-md flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase text-blue-500 italic tracking-tighter">
              🛒 Paniers en cours
            </h1>
            <p className="text-white/20 text-[11px] font-black uppercase tracking-widest mt-1">
              Agences avec articles non commandés
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-5 py-2.5 rounded-full">
            <span className="text-blue-400 font-black text-sm">
              {drafts.length} panier{drafts.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* LISTE */}
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 border border-dashed border-white/5 rounded-[40px]">
            <div className="text-5xl">✅</div>
            <p className="font-black uppercase tracking-[0.3em] text-white/20 text-sm">Aucun panier en cours</p>
            <p className="text-white/10 text-xs">Toutes les agences ont validé leurs commandes</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((order) => {
              const lastActivity = new Date(order.updated_at ?? order.created_at)
              const hoursAgo = Math.floor((Date.now() - lastActivity.getTime()) / 3600000)
              const isOld = hoursAgo > 48

              const totalHT = order.items.reduce((acc: number, item: any) => {
                return acc + Number(item.price ?? 0) * Number(item.qty ?? item.quantity ?? 0)
              }, 0)

              return (
                <div
                  key={order.id}
                  className={`bg-white/[0.02] border rounded-[28px] p-6 transition-all hover:border-blue-500/30 ${
                    isOld ? 'border-orange-500/20' : 'border-white/5'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                    {/* INFOS AGENCE */}
                    <div className="lg:w-64 shrink-0 space-y-1">
                      <p className="font-black uppercase tracking-widest text-[13px] text-white">
                        {order.agency_name ?? '—'}
                      </p>
                      <p className="text-white/30 text-[12px]">{order.client_email ?? '—'}</p>

                      {/* DATE DU PANIER */}
                      <p className="text-white/20 text-[11px] font-medium mt-1">
                        🕐 {formatDate(order.updated_at ?? order.created_at)}
                      </p>

                      <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        isOld ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-white/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOld ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                        {hoursAgo < 1
                          ? "Actif à l'instant"
                          : hoursAgo < 24
                          ? `Il y a ${hoursAgo}h`
                          : `Il y a ${Math.floor(hoursAgo / 24)}j`
                        }
                      </div>
                    </div>

                    {/* ARTICLES + TOTAL */}
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''} dans le panier
                      </p>

                      <div className="grid gap-2">
                        {order.items.map((item: any, i: number) => {
                          const price      = Number(item.price ?? 0)
                          const qty        = Number(item.qty ?? item.quantity ?? 0)
                          const totalLigne = price * qty
                          const itemColor  = item.color
                            ? (COLOR_MAP[item.color.toLowerCase()] ?? '#ffffff')
                            : '#e2e8f0'

                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-black/20 px-4 py-2.5 rounded-2xl border border-white/5"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-blue-500/60 text-xs">📦</span>
                                <span
                                  className="text-[13px] font-bold truncate"
                                  style={{ color: itemColor }}
                                >
                                  {item.productName ?? item.name ?? '—'}
                                </span>
                                {item.orderedBy && (
                                  <span className="text-[10px] font-black text-blue-500/50 uppercase shrink-0">
                                    → {item.orderedBy}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 shrink-0 ml-4">
                                <span className="text-[12px] font-black text-white/40">
                                  × {qty}
                                </span>
                                <span className="text-[13px] font-black text-blue-400 tabular-nums">
                                  {fmt(totalLigne)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* TOTAL HT */}
                      <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-black uppercase text-white/20 tracking-widest">Total HT</span>
                          <span className="text-[18px] font-black text-white tabular-nums">{fmt(totalHT)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}