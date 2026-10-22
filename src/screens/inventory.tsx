
import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Bike, Plus, Search } from 'lucide-react'

import {
  Button,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeading,
  StatusBadge,
} from '../components/ui'

import { bikeDate, money, useMotorcycles } from '../lib/motorcycles'

export function Inventory() {
  const { data, error, isLoading, mutate } = useMotorcycles()
  const [params, setParams] = useSearchParams()

  const query = params.get('q') || ''
  const [draft, setDraft] = useState(query)

  useEffect(() => {
    setDraft(query)
  }, [query])

  function filter(name: string, value: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous)

      if (value) next.set(name, value)
      else next.delete(name)

      return next
    })
  }

  useEffect(() => {
    if (draft === query) return

    const timer = setTimeout(() => {
      setParams(previous => {
        const next = new URLSearchParams(previous)

        if (draft.trim()) next.set('q', draft.trim())
        else next.delete('q')

        return next
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [draft, query, setParams])

  const status = params.get('bike_status') || ''
  const start = params.get('starting_date') || ''
  const end = params.get('ending_date') || ''

  const invalidDates = !!(start && end && start > end)

  const bikes = (data || []).filter(b =>
    (!query ||
      [
        b.company,
        b.model,
        b.registration_no,
        b.engine_no,
        b.chassis_no,
      ].some(value =>
        value?.toLowerCase().includes(query.toLowerCase())
      )) &&
    (!status || b.status === (status === 'true')) &&
    (!start || b.purchase_date.slice(0, 10) >= start) &&
    (!end || b.purchase_date.slice(0, 10) <= end)
  )

  return (
    <div className="dashboard inventory-page">
      <PageHeading
        eyebrow="YOUR MOTORCYCLES"
        title="Inventory"
        description="Every motorcycle, every detail. All in one place."
      >
        <Link className="btn btn-primary" to="/inventory/new">
          <Plus size={17} />
          Add Motorcycle
        </Link>
      </PageHeading>

      <section
        className="surface inventory-filters"
        aria-label="Inventory filters"
      >
        <label className="inventory-search">
          <Search size={18} />
          <input
            aria-label="Search inventory"
            placeholder="Search company, model or identification number"
            value={draft}
            onChange={e => setDraft(e.target.value)}
          />
        </label>

        <div className="filter-controls">
          <label>
            Status
            <select
              value={status}
              onChange={e => filter('bike_status', e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Sold</option>
            </select>
          </label>

          <label>
            Starting date
            <input
              type="date"
              value={start}
              onChange={e => filter('starting_date', e.target.value)}
            />
          </label>

          <label>
            Ending date
            <input
              type="date"
              min={start || undefined}
              value={end}
              onChange={e => filter('ending_date', e.target.value)}
            />
          </label>

          <Button
            variant="secondary"
            onClick={() => {
              setDraft('')
              setParams({})
            }}
          >
            Clear Filters
          </Button>
        </div>
      </section>

      {invalidDates && (
        <ErrorMessage>
          Ending date must be on or after the starting date.
        </ErrorMessage>
      )}

      {isLoading ? (
        <LoadingState label="Loading inventory…" />
      ) : error ? (
        <>
          <ErrorMessage>
            Inventory could not be loaded.
          </ErrorMessage>
          <Button onClick={() => mutate()}>
            Try again
          </Button>
        </>
      ) : !bikes.length ? (
        <EmptyState
          title={
            data?.length
              ? 'No matching motorcycles'
              : 'Your inventory is empty'
          }
        >
          {data?.length
            ? 'Try a different search or clear your filters.'
            : 'Add your first motorcycle to get started.'}
        </EmptyState>
      ) : (
        <section className="surface inventory-results">
          <div className="section-heading">
            <h2>Motorcycles</h2>
            <span>{bikes.length} records</span>
          </div>

          <div className="inventory-desktop">
            <table>
              <thead>
                <tr>
                  {[
                    'Motorcycle',
                    'Registration',
                    'Engine number',
                    'Purchase date',
                    'Purchase price',
                    'Status',
                    '',
                  ].map((heading, index) => (
                    <th key={index}>{heading}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {bikes.map(bike => (
                  <tr key={bike.id}>
                    <td>
                      <strong>
                        {bike.company} {bike.model}
                      </strong>
                      <small>{bike.model_year}</small>
                    </td>

                    <td>
                      {bike.registration_no || 'Unregistered'}
                    </td>

                    <td>{bike.engine_no}</td>
                    <td>{bikeDate(bike.purchase_date)}</td>
                    <td>{money(bike.purchase_price)}</td>

                    <td>
                      <StatusBadge available={bike.status} />
                    </td>

                    <td>
                      <Link to={`/inventory/${bike.id}`}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="inventory-mobile">
            {bikes.map(bike => (
              <li className="surface" key={bike.id}>
                <div className="inventory-card-title">
                  <Bike size={22} />

                  <h3>
                    {bike.company} {bike.model}
                    <small>{bike.model_year} model</small>
                  </h3>

                  <StatusBadge available={bike.status} />
                </div>

                <dl>
                  <div>
                    <dt>Registration</dt>
                    <dd>{bike.registration_no || 'Unregistered'}</dd>
                  </div>

                  <div>
                    <dt>Engine number</dt>
                    <dd>{bike.engine_no}</dd>
                  </div>

                  <div>
                    <dt>Purchased</dt>
                    <dd>{bikeDate(bike.purchase_date)}</dd>
                  </div>

                  <div>
                    <dt>Purchase price</dt>
                    <dd>{money(bike.purchase_price)}</dd>
                  </div>
                </dl>

                <Link
                  className="btn btn-secondary"
                  to={`/inventory/${bike.id}`}
                >
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export function MotorcycleDetails() {
  const { id } = useParams()
  const location = useLocation()

  const { data, error, isLoading } = useMotorcycles()

  const bike = data?.find(b => b.id === Number(id))

  if (isLoading) {
    return (
      <div className="dashboard">
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <ErrorMessage>
          Unable to load motorcycle.
        </ErrorMessage>
        <Link to="/inventory">Back to inventory</Link>
      </div>
    )
  }

  if (!bike) {
    return (
      <div className="dashboard">
        <EmptyState title="Motorcycle not found">
          This motorcycle could not be found.
        </EmptyState>
        <Link to="/inventory">Back to inventory</Link>
      </div>
    )
  }

  const groups = [
    [
      'Motorcycle information',
      [
        ['Company', bike.company],
        ['Model', bike.model],
        ['Model year', String(bike.model_year)],
        ['Registration', bike.registration_no],
        ['Engine number', bike.engine_no],
        ['Chassis number', bike.chassis_no],
      ],
    ],
    [
      'Purchase information',
      [
        ['Purchase price', money(bike.purchase_price)],
        ['Purchase date', bikeDate(bike.purchase_date)],
      ],
    ],
    [
      'Seller information',
      [
        ['Seller name', bike.seller_name],
        ['Phone number', bike.seller_phone_no],
        ['CNIC', bike.seller_cnic],
      ],
    ],
    [
      'Additional information',
      [
        ['Notes', bike.notes],
      ],
    ],
  ] as [string, [string, string | null][]][]

  return (
    <div className="dashboard inventory-page">
      <Link className="inventory-back" to="/inventory">
        ← Back to inventory
      </Link>

      <PageHeading
        eyebrow={`MOTORCYCLE #${bike.id}`}
        title={`${bike.company} ${bike.model}`}
        description={`${bike.model_year} model`}
      >
        <div className="inventory-actions">
          <StatusBadge available={bike.status} />

          <Link
            className="btn btn-secondary"
            to={`/inventory/${bike.id}/edit`}
          >
            Edit Motorcycle
          </Link>

          {bike.status && (
            <Link
              className="btn btn-primary"
              to={`/sales/new?bikeId=${bike.id}`}
            >
              Record Sale
            </Link>
          )}
        </div>
      </PageHeading>

      {location.state?.saved && (
        <p role="status" className="inventory-success">
          Motorcycle {location.state.saved} successfully.
        </p>
      )}

      <div className="detail-grid">
        {groups.map(([title, fields]) => (
          <section
            className="surface detail-section"
            key={title}
          >
            <h2>{title}</h2>

            <dl>
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || 'Not provided'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
