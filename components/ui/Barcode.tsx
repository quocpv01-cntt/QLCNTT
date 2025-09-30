import React from 'react';

interface BarcodeProps {
  value: string;
  size?: 'small' | 'medium';
}

const Barcode: React.FC<BarcodeProps> = ({ value, size = 'medium' }) => {
  if (!value) {
    return null;
  }

  // Define parameters based on size
  const isSmall = size === 'small';
  const apiHeight = isSmall ? 25 : 40; // in pixels for the barcode image
  const imgClasses = isSmall 
    ? 'h-6 bg-white px-1 rounded' 
    : 'h-10 bg-white px-1 py-0.5 rounded';
  const textClasses = isSmall 
    ? 'text-[10px] tracking-wider mt-0.5 font-mono text-gray-500 dark:text-gray-400' 
    : 'text-xs tracking-widest mt-1 font-mono text-gray-500 dark:text-gray-400';
  
  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(value)}&code=Code128&dpi=96&height=${apiHeight}`;

  return (
    <div className="flex flex-col items-center">
      <img src={barcodeUrl} alt={`Mã vạch cho ${value}`} className={imgClasses} />
      <span className={textClasses}>{value}</span>
    </div>
  );
};

export default Barcode;