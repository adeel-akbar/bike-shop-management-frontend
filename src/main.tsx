
import React, { useState } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useOutletContext,
} from 'react-router-dom'

import { Shell } from './components/shell'
import { EmptyState, Modal } from './components/ui'
import { Dashboard } from './screens/dashboard'
import { Login } from './screens/login'
import { Inventory, MotorcycleDetails } from './screens/inventory'
import { MotorcycleFormPage } from './screens/motorcycle-form'
import { SalesHistory, SaleDetails } from './screens/sales'
import { SaleFormPage } from './screens/sale-form'

import { isAuthenticated, setUnauthorizedHandler } from './lib/api'

import './styles.css'
import './inventory.css'
import './sales.css'

setUnauthorizedHandler(() => {
  window.location.hash = '/login'
})

// Protect dashboard, inventory, and sales routes
function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function Workspace() {
  const [future, setFuture] = useState<string | null>(null)
  const navigate = useNavigate()

  const action = (name: string) => {
    if (/add motorcycle/i.test(name)) {
      navigate('/inventory/new')
    } else if (/inventory/i.test(name)) {
      navigate('/inventory')
    } else if (/record sale/i.test(name)) {
      navigate('/sales/new')
    } else if (/sales/i.test(name)) {
      navigate('/sales')
    } else {
      setFuture(name)
    }
  }

  return (
    <>
      <Shell onFuture={action}>
        <Outlet context={action} />
      </Shell>

      <Modal
        open={!!future}
        title={future || 'Coming in a later phase'}
        onClose={() => setFuture(null)}
      >
        <EmptyState title="A little further down the road.">
          This feature is planned for a later phase.
          No business records will be changed.
        </EmptyState>
      </Modal>
    </>
  )
}

function DashboardPreview() {
  const action = useOutletContext<(name: string) => void>()

  return <Dashboard onFuture={action} />
}

export default function App() {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          {/* Protected application routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Workspace />}>
              <Route
                path="/"
                element={<DashboardPreview />}
              />

              <Route
                path="/inventory"
                element={<Inventory />}
              />

              <Route
                path="/inventory/new"
                element={<MotorcycleFormPage />}
              />

              <Route
                path="/inventory/:id"
                element={<MotorcycleDetails />}
              />

              <Route
                path="/inventory/:id/edit"
                element={<MotorcycleFormPage />}
              />

              <Route
                path="/sales"
                element={<SalesHistory />}
              />

              <Route
                path="/sales/new"
                element={<SaleFormPage />}
              />

              <Route
                path="/sales/:id"
                element={<SaleDetails />}
              />

              <Route
                path="/sales/:id/edit"
                element={<SaleFormPage />}
              />

              <Route
                path="/sales/:id/receipt"
                element={<SaleDetails receipt />}
              />
            </Route>
          </Route>

          {/* Public login route */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  )
}
