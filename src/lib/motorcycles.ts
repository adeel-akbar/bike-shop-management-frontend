
import useSWR, { mutate } from 'swr'
import { apiRequest, ApiError } from './api'

export interface Motorcycle {
  id: number
  company: string
  model: string
  model_year: number
  registration_no: string | null
  engine_no: string
  chassis_no: string
  purchase_date: string
  purchase_price: number
  seller_name: string
  seller_phone_no: string | null
  seller_cnic: string | null
  notes: string | null
  status: boolean
}

export type MotorcycleCreate = Omit<
  Motorcycle,
  'id' | 'status' | 'purchase_date'
> & {
  purchase_date?: string
}

export type MotorcyclePatch = Partial<MotorcycleCreate>

export interface MotorcycleAPI {
  list(filters: {
    bike_status?: boolean
    starting_date?: string
    ending_date?: string
  }): Promise<Motorcycle[]>

  get(id: number): Promise<Motorcycle>
  create(data: MotorcycleCreate): Promise<Motorcycle>
  patch(id: number, changes: MotorcyclePatch): Promise<Motorcycle>
}

export const motorcycleEndpoints = {
  list: '/bikes/',
  create: '/bikes/',
  detail: (id: number) => `/bikes/${id}`,
  patch: (id: number) => `/bikes/${id}`,
}

const key = 'motodesk-motorcycles'

export const money = (value: number) =>
  `Rs. ${value.toLocaleString('en-PK')}`

export const bikeDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

// Fetch motorcycles from FastAPI
export function useMotorcycles() {
  return useSWR<Motorcycle[]>(
    key,
    () => apiRequest<Motorcycle[]>(motorcycleEndpoints.list)
  )
}

// Fetch a single motorcycle
export async function getMotorcycle(id: number) {
  return apiRequest<Motorcycle>(motorcycleEndpoints.detail(id))
}

export class MotorcycleValidationError extends Error {
  constructor(public fields: Record<string, string>) {
    super('Please correct the highlighted fields.')
  }
}

// Create or update a motorcycle
export async function saveDemoMotorcycle(
  data: MotorcyclePatch,
  id?: number
) {
  let motorcycle: Motorcycle

  if (id !== undefined) {
    motorcycle = await apiRequest<Motorcycle>(
      motorcycleEndpoints.patch(id),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
  } else {
    motorcycle = await apiRequest<Motorcycle>(
      motorcycleEndpoints.create,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )
  }

  await mutate(key)

  return motorcycle
}
