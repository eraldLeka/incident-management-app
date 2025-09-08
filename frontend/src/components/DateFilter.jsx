import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateFilter = ({ onDateChange }) => {
    const [selectedDate, setSelectedDate] = useState(null);

    const handleChange = (date) =>{
        setSelectedDate(date);
        if(onDateChange){
            onDateChange(date);
        }
    };
    return (
        <div>
            <DatePicker
                selected={selectedDate}
                onChange={handleChange}
                dateFormat="yyyy-MM-dd"
                placeholderText='Select a date'
                isClearable
            /> 
        </div>
    );
};

export default DateFilter;