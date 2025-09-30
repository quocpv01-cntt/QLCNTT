// components/ui/PrintModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Barcode from './Barcode';
import { ITEquipment } from '../../types';
import { PrinterIcon } from '../../constants';

interface PrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemsToPrint: ITEquipment[];
}

const PRINT_OPTIONS_COMPANY_NAME = 'printOptions_companyName_v1';

// Reusable component for label content, used in both preview and print
const LabelContent: React.FC<{ item: ITEquipment; options: any; accentColor: string }> = ({ item, options, accentColor }) => {
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.assetTag)}`;

    // Special styles for previewing in dark mode
    const previewBarcodeContainerStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '2px 4px',
        borderRadius: '4px',
    };

    return (
        <>
            <div className="label-accent-bar" style={{ backgroundColor: accentColor }}></div>
            <div className="label-content">
                {options.showCompanyName && options.companyName && <p className="company-name">{options.companyName}</p>}
                <div className="label-body">
                    {options.type === 'barcode' ? (
                        <div className="barcode-container" style={previewBarcodeContainerStyle}>
                            <Barcode value={item.assetTag} />
                        </div>
                    ) : (
                        <img src={qrCodeUrl} alt="QR Code" className="bg-white p-1" style={{ height: '40px', width: '40px', objectFit: 'contain', margin: '0 auto' }} />
                    )}
                </div>
                <div className="label-footer">
                    {options.showName && <p className="device-name">{item.deviceName}</p>}
                    {options.showSerial && item.serialNumber && <p className="serial-number">S/N: {item.serialNumber}</p>}
                </div>
                {options.showDate && <p className="print-date">{currentDate}</p>}
            </div>
        </>
    );
};


const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, itemsToPrint }) => {
    const [options, setOptions] = useState({
        type: 'barcode',
        showName: true,
        showSerial: true,
        size: 'medium',
        companyName: '',
        showCompanyName: true,
        showDate: false,
    });
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const savedCompanyName = localStorage.getItem(PRINT_OPTIONS_COMPANY_NAME) || 'TÊN CÔNG TY';
            setOptions(prev => ({ ...prev, companyName: savedCompanyName }));
        }
    }, [isOpen]);
    
    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setOptions(o => ({ ...o, [name]: checked }));
        } else {
            setOptions(o => ({ ...o, [name]: value }));
             if (name === 'companyName') {
                localStorage.setItem(PRINT_OPTIONS_COMPANY_NAME, value);
            }
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const primaryColorValue = getComputedStyle(document.documentElement).getPropertyValue(`--color-primary-500`).trim();
            const accentColor = `rgb(${primaryColorValue})`;

            const printWindow = window.open('', '', 'height=800,width=1000');
            if (printWindow) {
                printWindow.document.write('<html><head><title>In Tem Thiết bị</title>');
                printWindow.document.write(`
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        @media print { @page { size: A4; margin: 1cm; } }
                        body { 
                            font-family: 'Inter', sans-serif; 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        .label-grid { display: grid; gap: 4mm; width: 100%; }
                        .size-small { grid-template-columns: repeat(4, 1fr); }
                        .size-medium { grid-template-columns: repeat(3, 1fr); }
                        .size-large { grid-template-columns: repeat(2, 1fr); }

                        .label { background: #fff; color: #000; position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 8px; box-sizing: border-box; border: 1px solid #eee; border-radius: 4px; page-break-inside: avoid; }
                        .label-accent-bar { position: absolute; top: 0; left: 0; bottom: 0; width: 4px; background-color: ${accentColor} !important; }
                        .label-content { padding-left: 10px; display: flex; flex-direction: column; flex-grow: 1; }
                        .company-name { font-size: 8px; font-weight: 700; text-align: left; margin: 0 0 4px; text-transform: uppercase; color: #333; }
                        .label-body { text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; margin: 4px 0; }
                        .label-body img { height: 35px !important; width: auto; max-width: 100%; object-fit: contain; margin: 0 auto; }
                        .barcode-container > div { display: flex; flex-direction: column; align-items: center; }
                        .barcode-container img { background-color: white !important; padding: 2px 4px; border-radius: 4px; }
                        .barcode-container > div > span { color: #000 !important; font-size: 9px !important; letter-spacing: 1px; }
                        .label-footer { text-align: left; margin-top: auto; }
                        .device-name { font-size: 9px; font-weight: 600; margin: 0; word-break: break-word; line-height: 1.2; }
                        .serial-number { font-size: 8px; color: #555; margin: 2px 0 0; word-break: break-word; }
                        .print-date { font-size: 7px; color: #888; text-align: right; margin: 4px 0 0; }
                    </style>
                `);
                printWindow.document.write(`</head><body><div class="label-grid size-${options.size}">`);
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</div></body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const sizeClasses = {
        small: 'w-48 h-[90px]', medium: 'w-56 h-[105px]', large: 'w-64 h-[120px]'
    };
    const accentColor = `rgb(var(--color-primary-500))`;
    const formInputClass = "w-full mt-1 p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500";
    const formLabelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400";
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tùy chọn In tem" size="4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Options */}
                <div className="md:col-span-1 space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200/50 dark:border-gray-700/50 pb-2 mb-3">Nội dung Tem</h4>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="companyName" className={formLabelClass}>Tên công ty</label>
                                <input id="companyName" name="companyName" type="text" value={options.companyName} onChange={handleOptionChange} className={formInputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                                <label className="flex items-center"><input type="checkbox" name="showCompanyName" checked={options.showCompanyName} onChange={handleOptionChange} className="mr-2 h-4 w-4 rounded" /> <span className="text-sm">Tên công ty</span></label>
                                <label className="flex items-center"><input type="checkbox" name="showName" checked={options.showName} onChange={handleOptionChange} className="mr-2 h-4 w-4 rounded" /> <span className="text-sm">Tên thiết bị</span></label>
                                <label className="flex items-center"><input type="checkbox" name="showSerial" checked={options.showSerial} onChange={handleOptionChange} className="mr-2 h-4 w-4 rounded" /> <span className="text-sm">Số Serial</span></label>
                                <label className="flex items-center"><input type="checkbox" name="showDate" checked={options.showDate} onChange={handleOptionChange} className="mr-2 h-4 w-4 rounded" /> <span className="text-sm">Ngày in</span></label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200/50 dark:border-gray-700/50 pb-2 mb-3">Bố cục & Kiểu dáng</h4>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="print-code-type" className={formLabelClass}>Loại mã</label>
                                <select id="print-code-type" name="type" value={options.type} onChange={handleOptionChange} className={formInputClass}>
                                    <option value="barcode">Mã vạch (Barcode)</option>
                                    <option value="qrcode">Mã QR</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="print-label-size" className={formLabelClass}>Kích thước tem</label>
                                <select id="print-label-size" name="size" value={options.size} onChange={handleOptionChange} className={formInputClass}>
                                    <option value="small">Nhỏ (4 tem/hàng)</option>
                                    <option value="medium">Vừa (3 tem/hàng)</option>
                                    <option value="large">Lớn (2 tem/hàng)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <Button icon={PrinterIcon} onClick={handlePrint} className="w-full mt-4">In ({itemsToPrint.length} tem)</Button>
                </div>
                {/* Live Preview */}
                <div className="md:col-span-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center min-h-[400px]">
                     <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 self-start">Xem trước Trực tiếp</h4>
                     <div className="flex-grow flex items-center justify-center w-full">
                        {itemsToPrint.length > 0 ? (
                            <div className={`label relative overflow-hidden border border-gray-300 dark:border-gray-600 rounded-md flex flex-col bg-white dark:bg-gray-900 shadow-lg ${sizeClasses[options.size as keyof typeof sizeClasses]}`}>
                                 <LabelContent item={itemsToPrint[0]} options={options} accentColor={accentColor} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Không có mục nào để xem trước.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden div for actual printing content */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    {itemsToPrint.map(item => (
                        <div key={item.id} className="label">
                            <LabelContent item={item} options={options} accentColor={accentColor} />
                        </div>
                    ))}
                </div>
            </div>

        </Modal>
    );
};

export default PrintModal;
