
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  EmptyState,
  ErrorMessage,
  LoadingState,
  PageHeading,
} from '../components/ui'
import {
  type Motorcycle,
  type MotorcyclePatch,
  MotorcycleValidationError,
  saveDemoMotorcycle,
  useMotorcycles,
} from '../lib/motorcycles'
import { ApiError } from '../lib/api'

type Values = Record<string, string>

const sections = [
  {
    title: 'Motorcycle information',
    fields: [
      ['company', 'Company', 'text', true],
      ['model', 'Model', 'text', true],
      ['model_year', 'Model year', 'number', true],
      ['registration_no', 'Registration number', 'text', false],
      ['engine_no', 'Engine number', 'text', true],
      ['chassis_no', 'Chassis number', 'text', true],
    ],
  },
  {
    title: 'Purchase information',
    fields: [
      ['purchase_price', 'Purchase price (PKR)', 'number', true],
      ['purchase_date', 'Purchase date', 'date', false],
    ],
  },
  {
    title: 'Seller information',
    fields: [
      ['seller_name', 'Seller name', 'text', true],
      ['seller_phone_no', 'Seller phone number', 'tel', false],
      ['seller_cnic', 'Seller CNIC', 'text', false],
    ],
  },
  {
    title: 'Additional information',
    fields: [
      ['notes', 'Notes', 'textarea', false],
    ],
  },
] as {
  title: string
  fields: [string, string, string, boolean][]
}[]

function initialValues(bike?: Motorcycle): Values {
  return Object.fromEntries(
    sections.flatMap(section =>
      section.fields.map(([key]) => [
        key,
        key === 'purchase_date'
          ? bike
            ? new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Karachi',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).format(new Date(bike.purchase_date))
            : ''
          : String(bike?.[key as keyof Motorcycle] ?? ''),
      ])
    )
  )
}

export function MotorcycleFormPage() {
  const { id } = useParams()
  const { data, error, isLoading } = useMotorcycles()

  if (id && isLoading) {
    return (
      <div className="dashboard">
        <LoadingState />
      </div>
    )
  }

  if (id && error) {
    return (
      <div className="dashboard">
        <ErrorMessage>
          Unable to load motorcycle.
        </ErrorMessage>
      </div>
    )
  }

  const bike = data?.find(b => b.id === Number(id))

  if (id && !bike) {
    return (
      <div className="dashboard">
        <EmptyState title="Motorcycle not found">
          Return to inventory to choose another motorcycle.
        </EmptyState>
        <Link to="/inventory">Back to inventory</Link>
      </div>
    )
  }

  return <MotorcycleForm key={id || 'new'} bike={bike} />
}

function MotorcycleForm({ bike }: { bike?: Motorcycle }) {
  const navigate = useNavigate()

  const [initial] = useState(() => initialValues(bike))
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState('')
  const [saved, setSaved] = useState(false)

  const dirty = JSON.stringify(initial) !== JSON.stringify(values)
  const back = bike ? `/inventory/${bike.id}` : '/inventory'

  useEffect(() => {
    if (!dirty || saving || saved) return

    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const click = (event: MouseEvent) => {
      const element = (event.target as HTMLElement).closest('a,button')

      if (
        element &&
        !element.closest('form') &&
        !window.confirm('Discard unsaved motorcycle changes?')
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const current = window.location.hash

    const pop = (event: PopStateEvent) => {
      if (
        window.location.hash !== current &&
        !window.confirm('Discard unsaved motorcycle changes?')
      ) {
        event.stopImmediatePropagation()
        window.history.pushState(null, '', current)
      }
    }

    window.addEventListener('beforeunload', unload)
    document.addEventListener('click', click, true)
    window.addEventListener('popstate', pop)

    return () => {
      window.removeEventListener('beforeunload', unload)
      document.removeEventListener('click', click, true)
      window.removeEventListener('popstate', pop)
    }
  }, [dirty, saving, saved])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const next: Record<string, string> = {}

    for (const { fields } of sections) {
      for (const [key, label, , required] of fields) {
        if (required && !values[key].trim()) {
          next[key] = `${label} is required.`
        }
      }
    }

    const year = Number(values.model_year)
    const price = Number(values.purchase_price)

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > new Date().getFullYear() + 1
    ) {
      next.model_year =
        `Enter a year from 1900 to ${new Date().getFullYear() + 1}.`
    }

    if (!Number.isSafeInteger(price) || price <= 0) {
      next.purchase_price = 'Enter a positive whole PKR amount.'
    }

    setErrors(next)
    setFailure('')

    if (Object.keys(next).length) return

    const payload: Record<string, string | number | null> = {}

    for (const [key, raw] of Object.entries(values)) {
      if (bike && raw === initial[key]) continue

      if (key === 'purchase_date') {
        if (raw) {
          payload[key] = `${raw}T00:00:00+05:00`
        }
        continue
      }

      payload[key] =
        ['model_year', 'purchase_price'].includes(key)
          ? Number(raw)
          : raw.trim() || null
    }

    setSaving(true)

    try {
      const result = await saveDemoMotorcycle(
        payload as MotorcyclePatch,
        bike?.id
      )

      setSaved(true)

      navigate(`/inventory/${result.id}`, {
        replace: true,
        state: {
          saved: bike ? 'updated' : 'added',
        },
      })
    } catch (error) {
      if (error instanceof MotorcycleValidationError) {
        setErrors(error.fields)
      } else if (error instanceof ApiError && error.status === 409) {
        setFailure(
          'A motorcycle with these identification details already exists.'
        )
      } else {
        setFailure(
          'Unable to save motorcycle. Please check your details and try again.'
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard inventory-page">
      <PageHeading
        eyebrow={
          bike ? `MOTORCYCLE #${bike.id}` : 'GROW YOUR INVENTORY'
        }
        title={bike ? 'Edit Motorcycle' : 'Add Motorcycle'}
        description="A few details now. A clearer picture of your business."
      />

      <form
        className="motorcycle-form"
        onSubmit={submit}
        noValidate
      >
        {sections.map(section => (
          <fieldset
            className="surface detail-section"
            key={section.title}
          >
            <legend>{section.title}</legend>

            <div className="motorcycle-fields">
              {section.fields.map(([key, label, type, required]) => (
                <label
                  key={key}
                  className={type === 'textarea' ? 'field-wide' : ''}
                >
                  <span>
                    {label}
                    {required ? ' *' : ' (optional)'}
                  </span>

                  {type === 'textarea' ? (
                    <textarea
                      name={key}
                      rows={4}
                      value={values[key]}
                      onChange={event =>
                        setValues({
                          ...values,
                          [key]: event.target.value,
                        })
                      }
                    />
                  ) : (
                    <input
                      name={key}
                      type={type}
                      required={required}
                      step={type === 'number' ? 1 : undefined}
                      placeholder={
                        key === 'seller_phone_no'
                          ? '03XX-XXXXXXX'
                          : key === 'seller_cnic'
                            ? '35202-1234567-1'
                            : undefined
                      }
                      value={values[key]}
                      aria-invalid={!!errors[key]}
                      aria-describedby={
                        errors[key] ? `${key}-error` : undefined
                      }
                      onChange={event =>
                        setValues({
                          ...values,
                          [key]: event.target.value,
                        })
                      }
                    />
                  )}

                  {errors[key] && (
                    <small
                      id={`${key}-error`}
                      role="alert"
                      className="field-error"
                    >
                      {errors[key]}
                    </small>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {failure && <ErrorMessage>{failure}</ErrorMessage>}

        <div className="inventory-actions form-actions">
          <p>
            Motorcycle records are saved securely to your database.
          </p>

          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => {
              if (
                !dirty ||
                window.confirm('Discard unsaved motorcycle changes?')
              ) {
                navigate(back)
              }
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={saving || (!!bike && !dirty)}
          >
            {saving ? 'Saving…' : 'Save Motorcycle'}
          </Button>
        </div>
      </form>
    </div>
  )
}
