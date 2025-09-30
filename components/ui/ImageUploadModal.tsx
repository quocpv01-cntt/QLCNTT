import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Button from './Button';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.18-3.182l-3.182-3.182a8.25 8.25 0 00-11.664 0l-3.18 3.185" />
    </svg>
);


export const ImageUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string) => void;
  title: string;
  aspectRatioClass?: string;
}> = ({ isOpen, onClose, onSave, title, aspectRatioClass = 'aspect-video' }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError('Kích thước ảnh không được vượt quá 2MB.');
                setPreview(null);
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Vui lòng chọn một tệp hình ảnh.');
                setPreview(null);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setError('');
                setZoomLevel(1); // Reset zoom on new image
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInternalSave = () => {
        if (preview) {
            onSave(preview);
        } else {
            setError('Vui lòng chọn một hình ảnh để tải lên.');
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setPreview(null);
            setError('');
            setZoomLevel(1);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
        }
    };

    const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        if (e.deltaY < 0) { // Scroll up
            setZoomLevel(prev => Math.min(prev + zoomFactor, 3)); // Max zoom 300%
        } else { // Scroll down
            setZoomLevel(prev => Math.max(prev - zoomFactor, 0.5)); // Min zoom 50%
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div
                    className={`relative w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 overflow-hidden ${aspectRatioClass}`}
                    onClick={() => !preview && fileInputRef.current?.click()}
                    onWheel={preview ? handleWheelZoom : undefined}
                    role="button"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-label={preview ? "Thay đổi ảnh đã chọn" : "Nhấp để chọn ảnh"}
                >
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Xem trước"
                                className="max-h-full max-w-full object-contain transition-transform duration-150"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg p-1">
                                <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))} className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"><MinusIcon className="w-4 h-4" /></button>
                                <button onClick={() => setZoomLevel(1)} className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"><ArrowPathIcon className="w-4 h-4" /></button>
                                <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 3))} className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400" onClick={() => fileInputRef.current?.click()}>
                            <p>Nhấp để chọn ảnh</p>
                            <p className="text-xs mt-1">(Tối đa 2MB)</p>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                 {preview && (
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        Chọn ảnh khác
                    </Button>
                )}
                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                <div className="flex justify-end pt-2">
                    <Button onClick={handleInternalSave} disabled={!preview}>Lưu</Button>
                </div>
            </div>
        </Modal>
    );
};