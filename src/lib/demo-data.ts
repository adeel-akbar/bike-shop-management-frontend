export const demoStats = {
  total: 48, available: 18, sold: 30,
  purchaseInvestment: 8245000, inventoryCost: 3160000,
  salesRevenue: 5760000, grossProfit: 675000,
}
export const demoBikes = [
  { id: 1, company: 'Honda', model: 'CG 125', year: 2025, registration: 'LEA-25-4821', purchaseDate: '2026-10-18', purchasePrice: 225000, available: true },
  { id: 2, company: 'Yamaha', model: 'YBR 125', year: 2024, registration: 'LEB-24-3108', purchaseDate: '2026-10-17', purchasePrice: 385000, available: true },
  { id: 3, company: 'Honda', model: 'CD 70', year: 2025, registration: 'Unregistered', purchaseDate: '2026-10-16', purchasePrice: 148000, available: false },
]
export const formatPKR = (value: number) => `Rs. ${new Intl.NumberFormat('en-US').format(value)}`
export const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' }).format(new Date(date))
