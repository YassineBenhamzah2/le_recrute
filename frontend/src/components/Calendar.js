import React from 'react';
import DatePicker from 'react-date-picker';
import moment from 'moment';

const Calendar = ({ value, onChange, name, date, className }) => {
  let safeDate = null;

  if (value) {
    if (value instanceof Date && !isNaN(value.getTime())) {
      safeDate = value;
    } else if (moment.isMoment(value)) {
      safeDate = value.isValid() ? value.toDate() : null;
    } else if (typeof value === 'string' && value.trim()) {
      const parts = value.trim().split(/[/.-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          if (!isNaN(d.getTime())) safeDate = d;
        } else {
          const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          if (!isNaN(d.getTime())) safeDate = d;
        }
      } else {
        const d = new Date(value);
        if (!isNaN(d.getTime())) safeDate = d;
      }
    }
  }

  return (
    <DatePicker
      className={className}
      onChange={onChange}
      value={safeDate}
      name={name}
      locale='fr-FR'
      yearPlaceholder={date}
      showLeadingZeros={true}
      format='dd/MM/yyyy'
    />
  );
};

export default Calendar;
