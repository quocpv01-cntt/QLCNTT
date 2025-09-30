import React, { useState, useEffect, useRef } from 'react';

// Icons
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);


interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };
    
    const formatDateForInput = (date: Date | null): string => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const formatDateForOutput = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const initialDate = parseDate(value) || new Date();
    
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(initialDate);
    const pickerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setViewDate(parseDate(value) || new Date());
    }, [value]);


    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => (new Date(year, month, 1).getDay() + 6) % 7; // Monday is 0

    const changeMonth = (amount: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(formatDateForOutput(newDate));
        setIsOpen(false);
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const numDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        const days = [];
        
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-start-${i}`} className="w-9 h-9"></div>);
        }

        const selectedDate = parseDate(value);

        for (let day = 1; day <= numDays; day++) {
            const isSelected = selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
            const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
            
            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                        isSelected ? 'bg-primary-600 text-white font-bold' :
                        isToday ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative w-full" ref={pickerRef}>
            <div className="relative">
                <input
                    type="text"
                    readOnly
                    value={formatDateForInput(parseDate(value))}
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute z-10 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex justify-between items-center mb-2">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {viewDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {renderDays()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
