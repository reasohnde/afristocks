// components/FileUpload.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUpload = ({
    onUploadSuccess,
    onUploadError,
    uploadType = 'avatar', // avatar, document, multiple
    maxFiles = 1,
    maxSize = 10 * 1024 * 1024, // 10MB
    accept = {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        'application/pdf': ['.pdf'],
    }
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Upload direct vers Cloudinary (côté client)
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
        formData.append('folder', `afristocks/${uploadType}s`);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    };

    // Upload via backend API
    const uploadViaBackend = async (file) => {
        const formData = new FormData();
        formData.append(uploadType, file);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/upload/${uploadType}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Backend upload error:', error);
            throw error;
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        setUploadProgress(0);

        try {
            const uploadPromises = acceptedFiles.map(async (file) => {
                // Choisir la méthode d'upload
                // Pour les petits fichiers, utiliser le backend
                // Pour les gros fichiers, upload direct Cloudinary
                if (file.size > 5 * 1024 * 1024) {
                    return await uploadToCloudinary(file);
                } else {
                    return await uploadViaBackend(file);
                }
            });

            const results = await Promise.all(uploadPromises);

            setUploadedFiles(prev => [...prev, ...results]);

            if (onUploadSuccess) {
                onUploadSuccess(results);
            }

            // Reset après succès
            setTimeout(() => {
                setUploadProgress(0);
            }, 1000);
        } catch (error) {
            console.error('Upload failed:', error);
            if (onUploadError) {
                onUploadError(error);
            }
        } finally {
            setUploading(false);
        }
    }, [uploadType, onUploadSuccess, onUploadError]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
        disabled: uploading,
    });

    const removeFile = async (fileId) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/upload/${fileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            setUploadedFiles(prev => prev.filter(f => f.publicId !== fileId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600">Upload en cours... {uploadProgress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            {isDragActive ? (
                                "Déposez les fichiers ici..."
                            ) : (
                                <>
                                    Glissez-déposez vos fichiers ici, ou{' '}
                                    <span className="text-blue-500 font-medium">cliquez pour sélectionner</span>
                                </>
                            )}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            {maxFiles > 1 ? `Jusqu'à ${maxFiles} fichiers • ` : ''}
                            Max {(maxSize / 1024 / 1024).toFixed(0)}MB par fichier
                        </p>
                    </>
                )}
            </div>

            {/* Erreurs de validation */}
            {fileRejections.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                    {fileRejections.map(({ file, errors }) => (
                        <div key={file.path}>
                            {file.path}: {errors.map(e => e.message).join(', ')}
                        </div>
                    ))}
                </div>
            )}

            {/* Fichiers uploadés */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Fichiers uploadés:</h4>
                    {uploadedFiles.map((file) => (
                        <div key={file.publicId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                                {file.url && file.url.includes('image') ? (
                                    <img src={file.url} alt="" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5 4a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <span className="text-sm text-gray-600">
                                    {file.originalName || 'Fichier'}
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(file.publicId)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;