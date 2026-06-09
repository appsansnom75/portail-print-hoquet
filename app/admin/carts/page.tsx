import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export default async function AdminCartsPage() {

  // 1. Vérifie session avec le client SSR (cookies)
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Vérifie le rôle super_admin via service_role
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: adminUser } = await adminSupabase.auth.admin.getUserById(user.id)
  const role = adminUser?.user?.app_metadata?.role

  // DEBUG TEMPORAIRE — à supprimer après
  if (role !== 'super_admin') {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace' }}>
        <h2>❌ Accès refusé — debug info</h2>
        <p><strong>user.id :</strong> {user.id}</p>
        <p><strong>role détecté :</strong> {role ?? 'undefined/null'}</p>
        <p><strong>SERVICE_ROLE_KEY présente :</strong> {serviceKey ? '✅ oui' : '❌ non — clé manquante !'}</p>
        <p><strong>app_metadata brut :</strong> {JSON.stringify(adminUser?.user?.app_metadata)}</p>
      </div>
    )
  }

  // 3. Récupère les paniers draft
  const { data: drafts } = await adminSupabase
    .from('orders')
    .select('*')
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })

  // 4. Commandes En attente depuis +3 jours
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  ).toISOString()

  const { data: pending } = await adminSupabase
    .from('orders')
    .select('*')
    .eq('status', 'En attente')
    .lt('created_at', threeDaysAgo)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2">🛒 Admin — Paniers & Commandes</h1>
      <p className="text-gray-500 mb-10 text-sm">Accessible uniquement aux super admins</p>

      {/* PANIERS DRAFT */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold mb-1">
          Paniers non validés
          <span className="ml-2 text-sm font-normal text-gray-500">({drafts?.length ?? 0})</span>
        </h2>
        <p className="text-sm text-gray-400 mb-4">Agences qui ont commencé une commande sans la valider</p>

        {drafts && drafts.length > 0 ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50 text-left">
                <th className="p-3 border">Agence</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Articles</th>
                <th className="p-3 border">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-3 border font-medium">{order.agency_name ?? '—'}</td>
                  <td className="p-3 border text-gray-600">{order.client_email ?? '—'}</td>
                  <td className="p-3 border">
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((item: any, i: number) => (
                          <div key={i} className="text-xs py-0.5">
                            📦 {item.productName} × {item.quantity}
                            {item.price ? ` — ${item.price} €` : ''}
                          </div>
                        ))
                      : <span className="text-gray-400">Panier vide</span>
                    }
                  </td>
                  <td className="p-3 border text-gray-500 text-xs">
                    {new Date(order.updated_at ?? order.created_at).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 italic">Aucun panier en cours.</p>
        )}
      </section>

      {/* COMMANDES EN ATTENTE +3 JOURS */}
      <section>
        <h2 className="text-xl font-semibold mb-1">
          Commandes en attente depuis +3 jours
          <span className="ml-2 text-sm font-normal text-gray-500">({pending?.length ?? 0})</span>
        </h2>
        <p className="text-sm text-gray-400 mb-4">Commandes validées par les agences mais pas encore traitées</p>

        {pending && pending.length > 0 ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-orange-50 text-left">
                <th className="p-3 border">N°</th>
                <th className="p-3 border">Agence</th>
                <th className="p-3 border">Total TTC</th>
                <th className="p-3 border">Date commande</th>
                <th className="p-3 border">Jours en attente</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((order) => {
                const days = Math.floor(
                  (Date.now() - new Date(order.created_at).getTime()) / 86400000
                )
                return (
                  <tr key={order.id} className={days > 7 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="p-3 border text-gray-500">#{order.order_number ?? '—'}</td>
                    <td className="p-3 border font-medium">{order.agency_name ?? '—'}</td>
                    <td className="p-3 border font-bold">
                      {order.total_ttc ? `${order.total_ttc} €` : '—'}
                    </td>
                    <td className="p-3 border text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className={`p-3 border font-bold ${days > 7 ? 'text-red-600' : 'text-orange-500'}`}>
                      {days} jours
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 italic">Aucune commande en retard.</p>
        )}
      </section>
    </div>
  )
}