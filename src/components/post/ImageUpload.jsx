import { useEffect, useMemo, useRef } from 'react'
import { useLang } from '../../i18n/index.jsx'
import Icon from '../ui/Icon.jsx'

/**
 * Pick one image. value = File | null. Shows a preview.
 */
export default function ImageUpload({ value, onChange }) {
  const { t } = useLang()
  const inputRef = useRef(null)
  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value])

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (preview) {
    return (
      <div className="upload-preview">
        <img src={preview} alt="Selected" />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(null)}>
          <Icon name="x" size={14} /> {t('create.remove')}
        </button>
      </div>
    )
  }

  return (
    <>
      <button type="button" className="upload-drop" style={{ width: '100%' }} onClick={() => inputRef.current?.click()}>
        <Icon name="image" size={30} strokeWidth={1.5} />
        <p style={{ marginTop: 6 }}>{t('create.addPhoto')}</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f)
          e.target.value = ''
        }}
      />
    </>
  )
}
