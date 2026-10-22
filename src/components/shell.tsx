
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  Bike,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ReceiptText,
  ShieldCheck,
  Tag,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Modal } from './ui'
import { setAccessToken } from '../lib/api'

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="MotoDesk dashboard">
      <span className="brand-mark">
        <Bike size={27} strokeWidth={1.8} />
      </span>
      <span>
        Moto<span className="brand-light">Desk</span>
        <small>BUILT BY ADEEL AKBAR</small>
      </span>
    </Link>
  )
}

export function NavigationItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon size={19} />
      <span>{label}</span>
      {active && <span className="nav-dot" />}
    </button>
  )
}

export function Shell({
  children,
  onFuture,
}: {
  children: ReactNode
  onFuture: (name: string) => void
}) {
  const [menu, setMenu] = useState(false)
  const [logout, setLogout] = useState(false)

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const title =
    pathname === '/'
      ? 'Dashboard'
      : pathname === '/inventory/new'
        ? 'Add Motorcycle'
        : pathname.startsWith('/inventory')
          ? 'Inventory'
          : pathname === '/sales/new'
            ? 'Record Sale'
            : 'Sales History'

  const future = (name: string) => {
    setMenu(false)
    onFuture(name)
  }

  return (
    <div className="app-shell">
      {menu && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}

      <aside className={`sidebar ${menu ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <X />
          </button>
        </div>

        <div className="workspace">
          <span className="workspace-avatar">M</span>
          <div>
            <strong>My dealership</strong>
            <small>Owner workspace</small>
          </div>
          <ShieldCheck size={17} />
        </div>

        <span className="nav-caption">WORKSPACE</span>

        <nav aria-label="Main navigation">
          <NavigationItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === '/'}
            onClick={() => {
              navigate('/')
              setMenu(false)
            }}
          />
          <NavigationItem
            icon={Bike}
            label="Inventory"
            active={
              pathname.startsWith('/inventory') &&
              pathname !== '/inventory/new'
            }
            onClick={() => future('Inventory')}
          />
          <NavigationItem
            icon={Plus}
            label="Add Motorcycle"
            onClick={() => future('Add Motorcycle')}
          />
          <NavigationItem
            icon={ReceiptText}
            label="Sales History"
            active={
              pathname.startsWith('/sales') &&
              pathname !== '/sales/new'
            }
            onClick={() => future('Sales History')}
          />
          <NavigationItem
            icon={Tag}
            label="Record Sale"
            onClick={() => future('Record Sale')}
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="note-icon">
              <ShieldCheck size={18} />
            </span>
            <strong>Your business. One place.</strong>
            <p>
              A little less paperwork.
              <br />
              A lot more peace of mind.
            </p>
            <span className="note-line" />
          </div>

          <button
            className="help-button"
            onClick={() => future('Workspace guide')}
          >
            <CircleHelp size={18} />
            Workspace guide
            <ArrowUpRight size={15} />
          </button>

          <button
            className="account"
            onClick={() => setLogout(true)}
            aria-label="Account and logout"
          >
            <span className="avatar">AD</span>
            <span>
              <strong>Administrator</strong>
              <small>Dealership owner</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <LayoutDashboard size={16} />
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{title}</strong>
          </div>

          <div className="topbar-right">
            <button
              className="top-account"
              aria-label="Account and logout"
              onClick={() => setLogout(true)}
            >
              <span className="avatar small">AD</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <main>{children}</main>

        <footer className="app-footer">
  <span>Made for the way you do business.</span>
  <span>© 2026 MotoDesk · Built by Adeel Akbar</span>
</footer>
      </div>

      <nav
        className="bottom-nav"
        aria-label="Mobile quick navigation"
      >
        <button
          className={pathname === '/' ? 'selected' : ''}
          onClick={() => {
            navigate('/')
            setMenu(false)
          }}
        >
          <LayoutDashboard />
          Home
        </button>

        <button onClick={() => future('Inventory')}>
          <Bike />
          Inventory
        </button>

        <button onClick={() => future('Add Motorcycle')}>
          <Plus />
          Add bike
        </button>

        <button
          className={pathname.startsWith('/sales') ? 'selected' : ''}
          onClick={() => future('Sales History')}
        >
          <ClipboardList />
          Sales
        </button>
      </nav>

      <Modal
        open={logout}
        title="Log out of MotoDesk?"
        onClose={() => setLogout(false)}
        confirmLabel="Log out"
        onConfirm={() => {
  setAccessToken(null)
  setLogout(false)
  navigate('/login', { replace: true })
}}
      >
        <p>Are you sure you want to log out of your dealership workspace?</p>
      </Modal>
    </div>
  )
}
