   export const formatPKR = (value: number) =>
     `Rs. ${new Intl.NumberFormat('en-US').format(value)}`

   export const formatDate = (date: string) =>
     new Intl.DateTimeFormat('en-GB', {
       day: '2-digit',
       month: 'short',
       year: 'numeric',
       timeZone: 'Asia/Karachi',
     }).format(new Date(date))