/**
 * 分段按鈕（純介面元件）：切換畫面、選切片數…
 */
export default function SegmentedControl({ label, options, value, onChange, size = 'md' }) {
  return (
    <div className={`segmented segmented--${size}`} role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={`segmented__item${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
