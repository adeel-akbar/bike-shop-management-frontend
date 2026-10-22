import { useState } from 'react'
import useSWR from 'swr'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  Button,
  PageHeading,
  EmptyState,
  LoadingState,
  ErrorMessage,
} from '../components/ui'
import { useMotorcycles, money, bikeDate } from '../lib/motorcycles'
import { useSales, localSaleDate, receiptShopName, type Sale } from '../lib/sales'
import { apiRequest, apiPdfRequest } from '../lib/api'
export function SalesHistory() {
  const {
    data: sales,
    error,
    isLoading,
    mutate,
  } = useSales()
  const {
    data: bikes,
    error: bikeError,
    isLoading: bikesLoading,
  } = useMotorcycles()
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const rows = (sales || []).filter(sale => {
    const bike = bikes?.find(b => b.id === sale.bike_id)
    const matchesSearch = `
      ${sale.id}
      ${sale.buyer_name}
      ${bike?.company ?? ''}
      ${bike?.model ?? ''}
      ${bike?.registration_no ?? 'Unregistered'}
    `
      .toLowerCase()
      .includes(q.toLowerCase())
    return (
      matchesSearch &&
      (!from || localSaleDate(sale.sale_date) >= from) &&
      (!to || localSaleDate(sale.sale_date) <= to)
    )
  })
  return (
    <div className="dashboard inventory-page">
      <PageHeading
        title="Sales History"
        description="Every handover, all in one place."
      >
        <Link className="btn btn-primary" to="/sales/new">
          Record Sale
        </Link>
      </PageHeading>
      <div className="surface sales-filters">
        <label>
          Search sales
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buyer, motorcycle, receipt…"
          />
        </label>
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={e => setTo(e.target.value)}
          />
        </label>
      </div>
      {error || bikeError ? (
        <>
          <ErrorMessage>
            Unable to load sales records.
          </ErrorMessage>
          <Button onClick={() => mutate()}>
            Try again
          </Button>
        </>
      ) : isLoading || bikesLoading || !bikes ? (
        <LoadingState label="Loading sales…" />
      ) : !rows.length ? (
        <EmptyState title="No matching sales">
          Adjust your filters or record your first sale.
        </EmptyState>
      ) : (
        <>
          <div className="surface sales-table">
            <table>
              <thead>
                <tr>
                  {[
                    'Motorcycle',
                    'Buyer',
                    'Sale date',
                    'Sale price',
                    'Receipt',
                    '',
                  ].map((heading, index) => (
                    <th key={index}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(sale => {
                  const bike = bikes.find(
                    b => b.id === sale.bike_id
                  )
                  return (
                    <tr key={sale.id}>
                      <td>
                        {bike?.company} {bike?.model}
                        <br />
                        <small>
                          {bike?.registration_no || 'Unregistered'}
                        </small>
                      </td>
                      <td>{sale.buyer_name}</td>
                      <td>{bikeDate(sale.sale_date)}</td>
                      <td>{money(sale.sale_price)}</td>
                      <td>#{sale.id}</td>
                      <td>
                        <Link to={`/sales/${sale.id}`}>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="sales-mobile">
            {rows.map(sale => {
              const bike = bikes.find(
                b => b.id === sale.bike_id
              )
              return (
                <article
                  className="surface detail-section"
                  key={sale.id}
                >
                  <h3>
                    {bike?.company} {bike?.model}
                  </h3>
                  <p>
                    {bike?.registration_no || 'Unregistered'}
                  </p>
                  <p>{sale.buyer_name}</p>
                  <p>
                    {bikeDate(sale.sale_date)} · Receipt #{sale.id}
                  </p>
                  <strong>{money(sale.sale_price)}</strong>
                  <Link to={`/sales/${sale.id}`}>
                    View Details
                  </Link>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
export function SaleDetails({
  receipt = false,
}: {
  receipt?: boolean
}) {
  const { id } = useParams()
  const { state } = useLocation()
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  async function downloadReceipt() {
    if (!id || downloading) return

    setDownloading(true)
    setDownloadError('')

    try {
      const pdf = await apiPdfRequest(`/sales/${id}/receipt`)
      const url = URL.createObjectURL(pdf)
      const link = document.createElement('a')
      link.href = url
      link.download = `motodesk-receipt-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : 'Unable to download receipt.'
      )
    } finally {
      setDownloading(false)
    }
  }
  const {
    data: sale,
    error,
    isLoading,
  } = useSWR<Sale>(
    id ? `motodesk-sale-${id}` : null,
    () => apiRequest<Sale>(`/sales/${id}`)
  )
  const {
    data: bikes,
    error: bikeError,
    isLoading: bikesLoading,
  } = useMotorcycles()
  if (error || bikeError) {
    return (
      <div className="dashboard">
        <ErrorMessage>
          Unable to load sale.
        </ErrorMessage>
      </div>
    )
  }
  if (isLoading || bikesLoading || !bikes || !sale) {
    return (
      <div className="dashboard">
        <LoadingState label="Loading sale details…" />
      </div>
    )
  }
  const bike = bikes.find(b => b.id === sale?.bike_id)
  if (!sale || !bike) {
    return (
      <div className="dashboard">
        <EmptyState title="Sale not found">
          Choose a sale from Sales History.
        </EmptyState>
        <Link to="/sales">Back to Sales History</Link>
      </div>
    )
  }
  const fields = [
    [
      'Motorcycle',
      `${bike.company} ${bike.model} · ${bike.model_year}`,
    ],
    ['Registration', bike.registration_no || 'Unregistered'],
    ['Engine number', bike.engine_no],
    ['Chassis number', bike.chassis_no],
    ['Buyer', sale.buyer_name],
    ['Phone', sale.buyer_phone || '—'],
    ['CNIC', sale.buyer_cnic || '—'],
    ['Sale date', bikeDate(sale.sale_date)],
  ]
  return (
    <div
      className={`dashboard inventory-page ${
        receipt ? 'receipt-page' : ''
      }`}
    >
      <div className="no-print">
        <PageHeading
          title={
            receipt
              ? 'Receipt Preview'
              : `Sale #${sale.id}`
          }
          description={
            receipt
              ? 'Review the sale details before printing.'
              : 'Motorcycle sale information and financial summary.'
          }
        />
        {state?.saved && (
          <p role="status" className="inventory-success">
            Sale {state.saved} successfully.
          </p>
        )}
        <div className="inventory-actions">
          <Link to="/sales">
            Back to Sales History
          </Link>
          {receipt ? (
            <>
              <Link to={`/sales/${sale.id}`}>
                Sale Details
              </Link>
              <Button onClick={downloadReceipt} disabled={downloading}>
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button onClick={() => window.print()}>
                Print Preview
              </Button>
            </>
          ) : (
            <>
              <Link to={`/sales/${sale.id}/edit`}>
                Edit Sale
              </Link>
              <Link to={`/sales/${sale.id}/receipt`}>
                View Receipt
              </Link>
            </>
          )}
        </div>
        {downloadError && <ErrorMessage>{downloadError}</ErrorMessage>}
      </div>
      <article
        className={`surface detail-section ${
          receipt ? 'customer-receipt' : ''
        }`}
      >
        {receipt && (
          <header>
            <p>CUSTOMER RECEIPT</p>
            <h1>{receiptShopName}</h1>
          </header>
        )}
        <h2>Receipt #{sale.id}</h2>
        <dl className="sale-info">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="receipt-total">
          <span>Sale price</span>
          <strong>{money(sale.sale_price)}</strong>
        </div>
        {!receipt && (
          <>
            <h3>Admin financial summary</h3>
            <p
              className={
                sale.profit < 0
                  ? 'sale-warning'
                  : 'sale-profit'
              }
            >
              {sale.profit < 0 ? 'Loss' : 'Profit'}:{' '}
              {money(Math.abs(sale.profit))}
            </p>
            <h3>Private notes</h3>
            <p className="sale-notes">
              {sale.notes || 'No notes.'}
            </p>
          </>
        )}
        {receipt && (
          <footer>
            Thank you for choosing {receiptShopName}.
          </footer>
        )}
      </article>
    </div>
  )
}
