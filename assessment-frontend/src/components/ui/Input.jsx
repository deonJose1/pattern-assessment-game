// Reusable labeled input/textarea for the admin design system.
//
// Props:
//   label     optional field label
//   type      'text' | 'date' | 'textarea' | any native input type (default 'text')
//   value, onChange, name, required, placeholder, rows, id
//   ...rest   standard field attributes
//
// When type === 'textarea' a <textarea> is rendered; otherwise an <input>.

const FIELD_CLASSES =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'

function Input({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  rows = 4,
  className = '',
  ...rest
}) {
  const fieldId = id ?? name
  const isTextarea = type === 'textarea'

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={fieldId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`${FIELD_CLASSES} resize-y`}
          {...rest}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={FIELD_CLASSES}
          {...rest}
        />
      )}
    </div>
  )
}

export default Input
