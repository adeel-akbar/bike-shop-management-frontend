import React, { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from './components/shell'
import { EmptyState, Modal } from './components/ui'
import { Dashboard } from './screens/dashboard'
import { Login } from './screens/login'
import { setUnauthorizedHandler } from './lib/api'
import './styles.css'
import './inventory.css'
import { Inventory, MotorcycleDetails } from './screens/inventory'
import { MotorcycleFormPage } from './screens/motorcycle-form'
import { useNavigate, useOutletContext, Outlet } from 'react-router-dom'
import { SalesHistory, SaleDetails } from './screens/sales'
import { SaleFormPage } from './screens/sale-form'
import './sales.css'

setUnauthorizedHandler(() => { window.location.hash = '/login' })
function Workspace() {
  const [future, setFuture] = useState<string | null>(null)
  const navigate = useNavigate()
  const action = (name: string) => {
    if (/add motorcycle/i.test(name)) navigate('/inventory/new')
    else if (/inventory/i.test(name)) navigate('/inventory')
    else if (/record sale/i.test(name)) navigate('/sales/new')
    else if (/sales/i.test(name)) navigate('/sales')
    else setFuture(name)
  }
  return <><Shell onFuture={action}><Outlet context={action}/></Shell><Modal open={!!future} title={future || 'Coming in a later phase'} onClose={() => setFuture(null)}><EmptyState title="A little further down the road.">This feature is planned for a later phase. No business records will be changed.</EmptyState></Modal></>
}
function DashboardPreview() {
  const action = useOutletContext<(name:string)=>void>()
  return <Dashboard onFuture={action}/>
}

export default function App() {
  return <React.StrictMode><HashRouter><Routes><Route element={<Workspace/>}><Route path="/" element={<DashboardPreview />} /><Route path="/inventory" element={<Inventory/>}/><Route path="/inventory/new" element={<MotorcycleFormPage/>}/><Route path="/inventory/:id" element={<MotorcycleDetails/>}/><Route path="/inventory/:id/edit" element={<MotorcycleFormPage/>}/><Route path="/sales" element={<SalesHistory/>}/><Route path="/sales/new" element={<SaleFormPage/>}/><Route path="/sales/:id" element={<SaleDetails/>}/><Route path="/sales/:id/edit" element={<SaleFormPage/>}/><Route path="/sales/:id/receipt" element={<SaleDetails receipt/>}/></Route><Route path="/login" element={<Login />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></HashRouter></React.StrictMode>
}
