// components/ui/ExportButton.tsx

import React, { useContext, useState } from 'react';
import { AuthContext, UserRole } from '../../types';
import Button from './Button';
import Modal from './Modal';
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon, PrinterIcon } from '../../constants';
import { useToast } from '../../contexts/ToastContext';

interface ExportButtonProps {
  filteredData: any[];
  allData: any[];
  fileName: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ filteredData, allData, fileName }) => {
    const auth = useContext(AuthContext);
    const { addToast } = useToast();
    const user = auth?.user;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportSource, setExportSource] = useState<'filtered' | 'all'>('filtered');

    if (user?.role !== UserRole.ADMIN) {
        return null;
    }
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setExportSource('filtered');
    };

    const dataToExport = exportSource === 'filtered' ? filteredData : allData;

    const exportAction = (format: 'json' | 'csv' | 'pdf') => {
        handleCloseModal();
        if (dataToExport.length === 0) {
            addToast('Không có dữ liệu để xuất.', 'info');
            return;
        }

        try {
            switch (format) {
                case 'json':
                    handleExportJSON();
                    break;
                case 'csv':
                    handleExportCSV();
                    break;
                case 'pdf':
                    handleExportPDF();
                    break;
            }
        } catch (error) {
            addToast(`Xuất ${format.toUpperCase()} thất bại!`, 'error');
            console.error(`Failed to export ${format.toUpperCase()}:`, error);
        }
    };

    const handleExportJSON = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataToExport, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${fileName}.json`;
        link.click();
        addToast('Xuất JSON thành công!', 'success');
    };
    
    const convertToCSV = (objArray: any[]) => {
        if (objArray.length === 0) return '';
        const array = typeof objArray !== 'object' ? JSON.parse(JSON.stringify(objArray)) : objArray;
        
        const headers = Object.keys(array[0]).filter(key => typeof array[0][key] !== 'object' || array[0][key] === null);
        let str = headers.join(',') + '\r\n';

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const header of headers) {
                let value = array[i][header] === null || array[i][header] === undefined ? '' : array[i][header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                line += value + ',';
            }
            line = line.slice(0, -1);
            str += line + '\r\n';
        }
        return str;
    };

    const handleExportCSV = () => {
        const csvString = convertToCSV(dataToExport);
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast('Xuất CSV thành công!', 'success');
    };

    const handleExportPDF = () => {
        const headers = Object.keys(dataToExport[0]).filter(key => typeof dataToExport[0][key] !== 'object' || dataToExport[0][key] === null);
        const sanitizedFileName = fileName.replace(/_/g, ' ');
        const title = document.title || 'Báo cáo';
        
        let htmlContent = `
            <html>
                <head>
                    <title>Xuất PDF - ${sanitizedFileName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        @page { size: A4 landscape; margin: 1cm; }
                        h1 { font-size: 16pt; color: #333; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; text-align: left; padding: 6px; font-size: 9pt; word-break: break-word; }
                        thead { display: table-header-group; }
                        th { background-color: #f2f2f2 !important; color: #333 !important; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f9f9f9 !important; }
                    </style>
                </head>
                <body>
                    <h1>${title} - ${sanitizedFileName}</h1>
                    <table>
                        <thead>
                            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${dataToExport.map(row => `
                                <tr>
                                    ${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 500);
            addToast('Đang chuẩn bị tệp PDF...', 'info');
        } else {
             addToast('Không thể mở cửa sổ in. Vui lòng kiểm tra trình chặn cửa sổ bật lên.', 'error');
        }
    };
    
    const radioLabelClass = "flex items-center text-sm cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition";
    const radioInputClass = "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-500";
    const exportButtonClass = "w-full text-left p-3 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3 font-medium";

    return (
        <>
            <Button
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
                title="Mở tùy chọn xuất dữ liệu"
                icon={ArrowDownTrayIcon}
            >
                Xuất dữ liệu
            </Button>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Tùy chọn Xuất Dữ liệu">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Chọn Nguồn Dữ liệu</h3>
                        <div className="space-y-3">
                            <label className={radioLabelClass}>
                                <input type="radio" name="exportSource" value="filtered" checked={exportSource === 'filtered'} onChange={() => setExportSource('filtered')} className={radioInputClass} />
                                <span className="ml-3">Chế độ xem hiện tại <span className="text-gray-500 dark:text-gray-400">({filteredData.length} mục)</span></span>
                            </label>
                            <label className={radioLabelClass}>
                                <input type="radio" name="exportSource" value="all" checked={exportSource === 'all'} onChange={() => setExportSource('all')} className={radioInputClass} />
                                <span className="ml-3">Tất cả dữ liệu <span className="text-gray-500 dark:text-gray-400">({allData.length} mục)</span></span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Chọn Định dạng</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button onClick={() => exportAction('csv')} className={exportButtonClass} role="menuitem">
                                <TableCellsIcon className="w-6 h-6 text-primary-500" />
                                <span>Xuất tệp CSV</span>
                            </button>
                             <button onClick={() => exportAction('json')} className={exportButtonClass} role="menuitem">
                                <DocumentTextIcon className="w-6 h-6 text-primary-500" />
                                <span>Xuất tệp JSON</span>
                            </button>
                             <button onClick={() => exportAction('pdf')} className={exportButtonClass} role="menuitem">
                                 <PrinterIcon className="w-6 h-6 text-primary-500" />
                                <span>In hoặc Lưu PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ExportButton;