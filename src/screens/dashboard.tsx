import { ArrowRight, ArrowUpRight, Bike, CalendarDays, Check, CircleDollarSign, Coins, PackageCheck, Plus, ReceiptText, Tag, Wallet } from 'lucide-react'
import useSWR from 'swr'
import { Button, PageHeading, StatCard, StatusBadge, LoadingState, ErrorMessage } from '../components/ui'
import { formatDate, formatPKR } from '../lib/format'
import { apiRequest } from '../lib/api'
import { useMotorcycles } from '../lib/motorcycles'

type DashboardStats = {
  total_bikes: number
  available_bikes: number
  sold_bikes: number
  total_purchase_cost: number
  inventory_cost: number
  total_sales_revenue: number
  total_profit: number
}

export function Dashboard({ onFuture }: { onFuture: (name: string) => void }) {
  const { data: bikes, error: bikesError, isLoading: bikesLoading, mutate: reloadBikes } = useMotorcycles()
  const { data: stats, error: statsError, isLoading: statsLoading, mutate: reloadStats } = useSWR<DashboardStats>(
    'motodesk-dashboard-stats',
    () => apiRequest<DashboardStats>('/stats/')
  )

  const recentBikes = (bikes ?? []).slice(-4).reverse().map(b => ({
    id: b.id,
    company: b.company,
    model: b.model,
    year: b.model_year,
    registration: b.registration_no || 'Unregistered',
    purchaseDate: b.purchase_date,
    purchasePrice: b.purchase_price,
    available: b.status,
  }))

  const today = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi',
  }).format(new Date())

  const actions = [
    { label: 'Add Motorcycle', caption: 'Bring a new bike on board', icon: Plus, tone: 'blue' },
    { label: 'Record Sale', caption: 'Make the next handover official', icon: Tag, tone: 'purple' },
    { label: 'View Inventory', caption: 'Find the right bike, faster', icon: Bike, tone: 'teal' },
    { label: 'View Sales', caption: 'Every deal, in one place', icon: ReceiptText, tone: 'slate' },
  ]

  return (
    <div className="dashboard">
      <PageHeading title="A clear view of your business." description="Welcome back. Here’s how your dealership is doing.">
        <span className="date-chip"><CalendarDays size={16} />{today}</span>
      </PageHeading>

      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow"><span className="tiny-line" /> BUILT FOR YOUR NEXT CHAPTER</span>
          <h2>Good bikes.<br />Great business.</h2>
          <p>From the first purchase to the final handover.<br className="desktop-break" /> Keep every motorcycle, every rupee, in view.</p>
          <Button onClick={() => onFuture('Add Motorcycle')}><Plus size={17} />Add Motorcycle<ArrowRight size={16} /></Button>
        </div>
        <div className="hero-image">
          <img src="/images/motorcycle.png" alt="Midnight-blue commuter motorcycle with polished chrome detailing" />
          <div className="hero-tag"><span className="hero-tag-icon"><Check size={14} /></span>Built to keep your business moving.</div>
        </div>
        <span className="hero-corner">THE ROAD AHEAD, SIMPLIFIED.</span>
      </section>

      {(statsError || bikesError) && (
        <div className="surface" style={{ padding: 16, marginBottom: 16 }}>
          <ErrorMessage>Unable to load dashboard data.</ErrorMessage>
          <Button onClick={() => { void reloadStats(); void reloadBikes() }}>Try again</Button>
        </div>
      )}

      <div className="section-heading"><h2>Business at a glance</h2><span><span className="muted-dot" />All-time overview</span></div>
      {statsLoading || bikesLoading || !stats || !bikes ? (
        <LoadingState label="Loading dashboard statistics…" />
      ) : !statsError && !bikesError ? (
        <>
          <section className="inventory-stats" aria-label="Motorcycle statistics">
            <StatCard label="Total Motorcycles" value={String(stats.total_bikes).padStart(2, '0')} caption="Every motorcycle in your business" icon={Bike} />
            <StatCard label="Available Motorcycles" value={String(stats.available_bikes).padStart(2, '0')} caption="Ready for their next owner" icon={PackageCheck} tone="teal" />
            <StatCard label="Sold Motorcycles" value={String(stats.sold_bikes).padStart(2, '0')} caption="Successful handovers" icon={Tag} tone="purple" />
          </section>
          <section className="finance-stats" aria-label="Financial statistics">
            <StatCard financial label="Total Purchase Investment" value={formatPKR(stats.total_purchase_cost)} caption="Across all motorcycle purchases" icon={Wallet} tone="blue" />
            <StatCard financial label="Available Inventory Cost" value={formatPKR(stats.inventory_cost)} caption="Capital in your current stock" icon={Coins} tone="slate" />
            <StatCard financial label="Total Sales Revenue" value={formatPKR(stats.total_sales_revenue)} caption="Value of all completed sales" icon={ReceiptText} tone="teal" />
            <StatCard financial label="Realized Gross Profit" value={formatPKR(stats.total_profit)} caption="Profit from completed sales" icon={CircleDollarSign} tone="profit" />
          </section>
        </>
      ) : null}

      <section className="quick-section">
        <div className="section-heading"><h2>Keep things moving</h2><span>Your everyday shortcuts</span></div>
        <div className="quick-actions">
          {actions.map(({ label, caption, icon: Icon, tone }) => (
            <button key={label} className="quick-action surface" onClick={() => onFuture(label)}>
              <span className={`icon-tile ${tone}`}><Icon size={20} /></span>
              <span className="quick-copy"><strong>{label}</strong><small>{caption}</small></span>
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="recent-section surface">
        <div className="recent-heading">
          <div><h2>A look inside your inventory</h2><p>A few recently added motorcycles from your inventory.</p></div>
          <button className="text-button" onClick={() => onFuture('Inventory')}>View inventory<ArrowRight size={15} /></button>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Motorcycle</th><th>Registration</th><th>Purchase date</th><th>Purchase price</th><th>Status</th></tr></thead>
            <tbody>
              {recentBikes.map(bike => (
                <tr key={bike.id}>
                  <td><span className="bike-cell"><span className="bike-thumb"><Bike size={24} strokeWidth={1.4} /></span><span><strong>{bike.company} {bike.model}</strong><small>{bike.year} model</small></span></span></td>
                  <td>{bike.registration}</td>
                  <td>{bike.purchaseDate ? formatDate(bike.purchaseDate) : '—'}</td>
                  <td className="price-cell">{formatPKR(bike.purchasePrice)}</td>
                  <td><StatusBadge available={bike.available} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mobile-inventory" aria-label="Recent motorcycles">
          {recentBikes.map(bike => (
            <li key={bike.id} className="mobile-bike-card surface">
              <div className="mobile-bike-heading">
                <span className="bike-thumb"><Bike size={24} strokeWidth={1.4} aria-hidden="true" /></span>
                <div><h3>{bike.company} {bike.model}</h3><p>{bike.year} model</p></div>
                <StatusBadge available={bike.available} />
              </div>
              <dl>
                <div><dt>Registration</dt><dd>{bike.registration}</dd></div>
                <div><dt>Purchase date</dt><dd>{bike.purchaseDate ? formatDate(bike.purchaseDate) : '—'}</dd></div>
                <div className="mobile-bike-price"><dt>Purchase price</dt><dd>{formatPKR(bike.purchasePrice)}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
