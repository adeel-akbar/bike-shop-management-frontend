import useSWR, { mutate } from 'swr'
import { getDemoMotorcycles, markDemoSold } from './motorcycles'
export interface Sale { id:number; bike_id:number; buyer_name:string; buyer_phone:string|null; buyer_cnic:string|null; sale_date:string; sale_price:number; notes:string|null; profit:number }
export type SaleInput = Omit<Sale,'id'|'profit'>
export type SalePatch = Omit<SaleInput,'bike_id'>
export const salesEndpoints = {list:'/sales/',create:'/sales/',detail:(id:number)=>`/sales/${id}`,patch:(id:number)=>`/sales/${id}`,receipt:(id:number)=>`/sales/${id}/receipt`}
// Phase 4: confirm OpenAPI schemas; JWT required. Receipt responses are PDF blobs, not JSON.
export interface SalesAPI { list():Promise<Sale[]>; get(id:number):Promise<Sale>; create(input:SaleInput):Promise<Sale>; patch(id:number,input:SalePatch):Promise<Sale>; receipt(id:number):Promise<Blob> }
export const pakistanToday = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
export const localSaleDate = (date:string) => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date))
let sales:Sale[] = getDemoMotorcycles().filter(b=>!b.status).map((b,i)=>({id:1001+i,bike_id:b.id,buyer_name:['Faisal Mahmood','Muhammad Abdullah Khan','Ayesha Siddiqui'][i],buyer_phone:'0300-1234567',buyer_cnic:'35202-1234567-1',sale_date:'2026-10-10T00:00:00+05:00',sale_price:b.purchase_price+15000,profit:15000,notes:'Documents handed over to buyer.'}))
export function useSales(){return useSWR<Sale[]>('demo-sales',async()=>[...sales])}
export async function saveDemoSale(input:SaleInput|SalePatch,id?:number){
 await new Promise(r=>setTimeout(r,180))
 const old=id===undefined?undefined:sales.find(s=>s.id===id)
 if(id!==undefined&&!old)throw new Error('Sale not found.')
 const bike=getDemoMotorcycles().find(b=>b.id===(old?.bike_id ?? (input as SaleInput).bike_id))
 if(!bike)throw new Error('Select a valid motorcycle.')
 if(!old&&(!bike.status||sales.some(s=>s.bike_id===bike.id)))throw new Error('This motorcycle is already sold. Select another motorcycle.')
 if(!input.buyer_name.trim())throw new Error('Buyer name is required.')
 if(!Number.isSafeInteger(input.sale_price)||input.sale_price<=0)throw new Error('Enter a positive whole PKR amount.')
 if(!Number.isFinite(Date.parse(input.sale_date)))throw new Error('Enter a valid sale date.')
 const result:Sale={...input,id:old?.id??Math.max(1000,...sales.map(s=>s.id))+1,bike_id:bike.id,profit:input.sale_price-bike.purchase_price}
 sales=old?sales.map(s=>s.id===id?result:s):[result,...sales]
 if(!old)await markDemoSold(bike.id)
 await mutate('demo-sales',[...sales],false)
 return result
}
export const receiptShopName = 'MotoDesk Motors'
