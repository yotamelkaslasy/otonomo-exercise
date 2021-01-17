import React from 'react'
import './Checkbox.scss'

function Checkbox({ children, ...props }) {
  return (
    <label className="checkbox-label">
      <input type="checkbox" {...props} />
      <span className="label">{children}</span>
    </label>
  )
}

export default Checkbox
