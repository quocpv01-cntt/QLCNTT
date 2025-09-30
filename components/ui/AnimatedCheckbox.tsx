import React from 'react';

interface AnimatedCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ id, checked, onChange, label, disabled = false }) => {
  return (
    <label htmlFor={id} className={`flex items-center space-x-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <div className="animated-checkbox">
        <input 
          id={id} 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="checkmark">
          <svg className="checkmark-svg" viewBox="0 0 24 24">
            <path d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      </div>
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};

export default AnimatedCheckbox;
