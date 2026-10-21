import useSWR, { mutate } from 'swr'

export interface Motorcycle {
  id: number; company: string; model: string; model_year: number; registration_no: string | null;
  engine_no: string; chassis_no: string; purchase_date: string; purchase_price: number;
  seller_name: string; seller_phone_no: string | null; seller_cnic: string | null; notes: string | null; status: boolean;
}
export type MotorcycleCreate = Omit<Motorcycle, 'id' | 'status' | 'purchase_date'> & { purchase_date?: string }
export type MotorcyclePatch = Partial<MotorcycleCreate>
// Phase 4 adapter contract. No HTTP requests or authentication are implemented here.
export interface MotorcycleAPI {
  list(filters: { bike_status?: boolean; starting_date?: string; ending_date?: string }): Promise<Motorcycle[]>;
  get(id: number): Promise<Motorcycle>;
  create(data: MotorcycleCreate): Promise<Motorcycle>;
  patch(id: number, changes: MotorcyclePatch): Promise<Motorcycle>;
}
export const motorcycleEndpoints = { list: '/bikes/', create: '/bikes/', detail: (id: number) => `/bikes/${id}`, patch: (id: number) => `/bikes/${id}` }
const names = [['Honda','CG 125'],['Yamaha','YBR 125G'],['Suzuki','GS 150'],['Honda','CD 70'],['United','US 70'],['Road Prince','RP 125'],['Harley-Davidson Special Edition Motorcycles','Ultra Limited Touring Anniversary Collection'],['Suzuki','GD 110S']]
let records: Motorcycle[] = names.map(([company, model], i) => ({ id: i + 1, company, model, model_year: 2026 - i % 4, registration_no: i === 3 ? null : `LE${25-i}- ${4210+i}`, engine_no: `ENG-2026-${1001+i}`, chassis_no: `CHS-2026-${8001+i}`, purchase_date: `2026-0${9-i}-12T12:00:00+05:00`, purchase_price: [185000,420000,310000,145000,95000,175000,5760000,290000][i], seller_name: ['Ahmed Khan','Ali Raza','Usman Malik','Hassan Shah','Bilal Ahmed','Omar Farooq','Imran Sheikh','Saad Ali'][i], seller_phone_no: i % 3 ? '0300-1234567' : null, seller_cnic: i % 2 ? '35202-1234567-1' : null, notes: i === 6 ? 'Special anniversary touring motorcycle with extended luggage, premium passenger seating and a complete service history. Purchased from a private collector; original documents and spare keys are included. Inspect all accessories before delivery.' : i % 2 ? 'Original documents verified. Regularly serviced.' : null, status: i % 3 !== 1 }))
export const getDemoMotorcycles = () => [...records]
export async function markDemoSold(id: number) {
  records = records.map(b => b.id === id ? {...b, status:false} : b)
  await mutate(key, [...records], false)
}
const key = 'motodesk-demo-motorcycles'
export const money = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`
export const bikeDate = (value: string) => new Date(value).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: 'short', year: 'numeric' })
export function useMotorcycles() { return useSWR<Motorcycle[]>(key, async () => { await new Promise(resolve => setTimeout(resolve, 180)); return [...records] }) }
export class MotorcycleValidationError extends Error {
  constructor(public fields: Record<string, string>) { super('Please correct the highlighted fields.') }
}
export async function saveDemoMotorcycle(data: MotorcyclePatch, id?: number) {
  await new Promise(resolve => setTimeout(resolve, 250))
  const errors: Record<string, string> = {}
  for (const field of ['engine_no', 'chassis_no'] as const) {
    const value = data[field]
    if (value && (value.toUpperCase() === 'DUPLICATE' || records.some(b => b.id !== id && b[field].toLowerCase() === value.toLowerCase()))) errors[field] = 'This number already exists. Use a unique number.'
  }
  if (Object.keys(errors).length) throw new MotorcycleValidationError(errors)
  let record: Motorcycle
  if (id !== undefined) {
    const existing = records.find(b => b.id === id)
    if (!existing) throw new Error('Motorcycle no longer exists.')
    record = { ...existing, ...data }
    records = records.map(b => b.id === id ? record : b)
  } else {
    record = { ...(data as MotorcycleCreate), id: Math.max(...records.map(b => b.id), 0) + 1, status: true, purchase_date: data.purchase_date || new Date().toISOString() }
    records = [...records, record]
  }
  await mutate(key, [...records], false)
  return record
}
