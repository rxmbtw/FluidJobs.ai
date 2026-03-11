import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, Upload, X, Check, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
// @ts-ignore
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

interface JobImage {
    id: number;
    image_url: string;
    source: 'minio' | 'external-imported' | 'uploaded';
    category: string;
    tags: string[];
    is_used: boolean;
    secure_url: string;
}

interface ImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string, imageId: number) => void;
    currentImageId?: number;
    usedImages?: string[];
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ isOpen, onClose, onSelect, currentImageId, usedImages = [] }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'internal' | 'upload'>('internal');
    const [images, setImages] = useState<JobImage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState('Tech');
    const [uploadTags, setUploadTags] = useState('');
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = String(user?.role) === 'Admin' || String(user?.role) === 'SuperAdmin' || String(user?.role) === 'HR';

    const fetchInternalImages = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get<{ success: boolean; images?: any[]; error?: string }>(`${process.env.REACT_APP_BACKEND_URL}/api/job-images/list`, {
                params: { search: searchQuery, category }
            });
            if (res.data.success && res.data.images) {
                setImages(res.data.images);
            } else {
                setError(res.data.error || 'Failed to load images');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', uploadFile);
        formData.append('category', uploadCategory);

        // Convert comma-separated string to JSON array
        const tagsArray = uploadTags.split(',').map(t => t.trim()).filter(t => t);
        formData.append('tags', JSON.stringify(tagsArray));

        try {
            const res = await axios.post<{ success: boolean; image?: { secure_url: string; id: number }; error?: string }>(`${process.env.REACT_APP_BACKEND_URL}/api/job-images/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success && res.data.image) {
                onSelect(res.data.image.secure_url, res.data.image.id);
            } else {
                setError(res.data.error || 'Upload failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'internal') {
            fetchInternalImages();
        }
    }, [isOpen, activeTab, category]);

    // Debounced search for internal images
    useEffect(() => {
        if (activeTab === 'internal') {
            const delayFn = setTimeout(() => {
                if (isOpen) fetchInternalImages();
            }, 500);
            return () => clearTimeout(delayFn);
        }
    }, [searchQuery, activeTab]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Select Job Cover Image</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose a stunning image to represent this job opening</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs & Search Bar */}
                <div className="p-6 border-b bg-white flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center sticky top-0 z-10">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => { setActiveTab('internal'); setSearchQuery(''); }}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'internal' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Library
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'upload' ? 'bg-indigo-600 shadow-sm text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <Upload className="w-4 h-4" /> Upload
                            </button>
                        )}
                    </div>

                    {activeTab === 'internal' && (
                        <form onSubmit={(e) => e.preventDefault()} className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={"Search images by tags..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </form>
                    )}
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-100">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                            <p className="font-medium animate-pulse">Loading images...</p>
                        </div>
                    )}

                    {!loading && activeTab === 'internal' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map(img => {
                                const isSelected = img.id === currentImageId;
                                const isUsed = img.is_used || usedImages.includes(img.secure_url) || usedImages.includes(img.image_url);
                                const disableSelect = isUsed && !isSelected;

                                return (
                                    <div
                                        key={img.id}
                                        onClick={() => !disableSelect && onSelect(img.secure_url, img.id)}
                                        className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-gray-200 cursor-pointer transition-all duration-300
                      ${isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 scale-105 shadow-xl z-10' : ''}
                      ${disableSelect ? 'opacity-60 cursor-not-allowed grayscale-[40%]' : 'hover:shadow-lg hover:-translate-y-1'}
                    `}
                                    >
                                        <img
                                            src={img.secure_url}
                                            alt={img.category}
                                            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                                            loading="lazy"
                                            style={{ opacity: 0 }}
                                            onLoad={(e) => {
                                                (e.target as HTMLImageElement).style.opacity = '1';
                                            }}
                                        />

                                        {/* Hover Overlay */}
                                        {!disableSelect && !isSelected && (
                                            <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Select Image</span>
                                            </div>
                                        )}

                                        {/* Meta Tags */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                            <div className="flex gap-2 text-xs font-medium text-white/90">
                                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded uppercase tracking-wider">{img.category}</span>
                                                {img.source === 'external-imported' && <span className="bg-purple-500/80 px-2 py-0.5 rounded">Imported</span>}
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                                                <Check className="w-5 h-5" />
                                            </div>
                                        )}
                                        {disableSelect && (
                                            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1 leading-none">
                                                <AlertCircle className="w-3.5 h-3.5" /> IN USE
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {images.length === 0 && !error && (
                                <div className="col-span-full h-48 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                    <ImageIcon className="w-12 h-12 mb-3 text-gray-300" />
                                    <p>No images found in your library.</p>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === 'upload' && isAdmin && (
                        <form onSubmit={handleUpload} className="max-w-2xl mx-auto py-8">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${uploadFile ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-gray-100'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/webp"
                                />

                                {uploadFile ? (
                                    <>
                                        <img src={URL.createObjectURL(uploadFile)} alt="Preview" className="h-40 w-auto object-contain rounded-lg shadow-md mb-4" />
                                        <p className="text-indigo-700 font-medium">{uploadFile.name}</p>
                                        <p className="text-indigo-500 text-sm mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8 text-indigo-500" />
                                        </div>
                                        <p className="text-gray-900 font-medium text-lg">Click to upload an image</p>
                                        <p className="text-gray-500 mt-2 text-sm text-center max-w-xs">Supports JPG, PNG and WebP. Automatically stores securely in your MinIO server.</p>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Category</label>
                                    <select
                                        value={uploadCategory}
                                        onChange={e => setUploadCategory(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="Tech">Tech</option>
                                        <option value="Management">Management</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Design">Design</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional, comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. office, remote, modern"
                                        value={uploadTags}
                                        onChange={e => setUploadTags(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!uploadFile || uploading}
                                className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
                            >
                                {uploading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading to MinIO...</> : 'Save & Select Image'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ImagePickerModal;
