
import useSWR, { mutate } from 'swr'
import { apiRequest } from './api'

export interface Sale {
  id: number
  bike_id: number
  buyer_name: string
  buyer_phone: string | null
  buyer_cnic: string | null
  sale_date: string
  sale_price: number
  notes: string | null
  profit: number
}

export type SaleInput = Omit<Sale, 'id' | 'profit'>
export type SalePatch = Omit<SaleInput, 'bike_id'>

export const salesEndpoints = {
  list: '/sales/',
  create: '/sales/',
  detail: (id: number) => `/sales/${id}`,
  patch: (id: number) => `/sales/${id}`,
  receipt: (id: number) => `/sales/${id}/receipt`,
}

export interface SalesAPI {
  list(): Promise<Sale[]>
  get(id: number): Promise<Sale>
  create(input: SaleInput): Promise<Sale>
  patch(id: number, input: SalePatch): Promise<Sale>
  receipt(id: number): Promise<Blob>
}

export const pakistanToday = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const localSaleDate = (date: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))

const salesKey = 'motodesk-sales'
const motorcyclesKey = 'motodesk-motorcycles'

// Fetch sales from FastAPI
export function useSales() {
  return useSWR<Sale[]>(
    salesKey,
    () => apiRequest<Sale[]>(salesEndpoints.list)
  )
}

// Fetch an individual sale
export async function getSale(id: number) {
  return apiRequest<Sale>(salesEndpoints.detail(id))
}

// Create or update a sale through FastAPI
export async function saveDemoSale(
  input: SaleInput | SalePatch,
  id?: number
) {
  const result = await apiRequest<Sale>(
    id === undefined
      ? salesEndpoints.create
      : salesEndpoints.patch(id),
    {
      method: id === undefined ? 'POST' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  )

  // Refresh sales and inventory after a successful change
  await Promise.all([
    mutate(salesKey),
    mutate(motorcyclesKey),
  ])

  return result
}

export const receiptShopName = 'MotoDesk Motors'
