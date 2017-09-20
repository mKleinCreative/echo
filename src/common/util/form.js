import React, {PropTypes} from 'react'
import DatePicker from 'react-toolbox/lib/date_picker'
import TimePicker from 'react-toolbox/lib/time_picker'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown'
import Checkbox from 'react-toolbox/lib/checkbox'
import FontIcon from 'react-toolbox/lib/font_icon'

import {Flex} from 'src/common/components/Layout'

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
}

export const FORM_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  NOT_FOUND: 'notfound',
}

export function renderInput(field) {
  return <Input {..._values(field)}/>
}
renderInput.propTypes = propTypes

export function renderDropdown(field) {
  return <Dropdown {..._values(field)}/>
}
renderDropdown.propTypes = propTypes

export function renderDatePicker(field) {
  const {input: {value}} = field
  return <DatePicker {..._values(field)} value={value ? new Date(value) : new Date()}/>
}
renderDatePicker.propTypes = propTypes

export function renderTimePicker(field) {
  const {input: {value}} = field
  return <TimePicker {..._values(field)} value={value ? new Date(value) : new Date()} format="ampm"/>
}
renderTimePicker.propTypes = propTypes

export function renderCheckboxes({
  fields,
  meta,
  labels,
  icon,
  iconStyle,
  className,
  checkBoxStyle,
}) {
  const roles = fields.getAll()
  const handleChange = label => value => {
    return value ? fields.push(label) : fields.remove(roles.indexOf(label))
  }
  return (
    <Flex row alignItems_center className={className}>
      <FontIcon className={iconStyle} value={icon}/>
      <div>
        {labels.map(label =>
          <Checkbox
            className={checkBoxStyle}
            label={label}
            key={label}
            checked={roles.includes(label)}
            onChange={handleChange(label)}
            />
        )}
      </div>
      {meta.touched && meta.error && <span>{meta.error}</span>}
    </Flex>
  )
}
renderCheckboxes.propTypes = {
  fields: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  labels: PropTypes.array.isRequired,
  icon: PropTypes.string,
  iconStyle: PropTypes.string,
  className: PropTypes.string,
  checkBoxStyle: PropTypes.string,
}

function _values({input, meta, ...rest}) {
  return {
    ...input,
    ...rest,
    error: meta.visited && meta.error ? meta.error : null,
  }
}
