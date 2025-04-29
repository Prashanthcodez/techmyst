document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileTypesDisplay = document.getElementById('fileTypesDisplay');
    const previewContainer = document.getElementById('previewContainer');
    const clearSelectionBtn = document.getElementById('clearSelection');
    const convertBtn = document.getElementById('convertBtn');
    const formatSelect = document.getElementById('formatSelect');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    let selectedFiles = [];
    let convertedFiles = [];

    // Define accepted image formats and their extensions
    const acceptedFormats = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'image/webp': ['webp'],
        'image/heic': ['heic'],
        'image/heif': ['heif'],
        'image/tiff': ['tif', 'tiff'],
        'image/bmp': ['bmp'],
        'image/x-adobe-dng': ['dng'],
        'image/x-canon-cr2': ['cr2'],
        'image/x-nikon-nef': ['nef'],
        'image/x-olympus-orf': ['orf'],
        'image/x-sony-sr2': ['sr2'],
        'image/x-adobe-photoshop': ['psd'],
        'application/illustrator': ['ai'],
        'image/avif': ['avif'],
        'application/x-xcf': ['xcf'],
        'application/postscript': ['eps'],
        'application/pdf': ['pdf']
    };

    // Function to check if file is an accepted image
    function isAcceptedImageFile(file) {
        // Check by MIME type first
        if (file.type.startsWith('image/') || 
            file.type === 'application/pdf' || 
            file.type === 'application/illustrator' ||
            file.type === 'application/x-xcf' ||
            file.type === 'application/postscript') {
            return true;
        }

        // Check by file extension if MIME type is not recognized
        const extension = file.name.split('.').pop().toLowerCase();
        return Object.values(acceptedFormats).flat().includes(extension);
    }

    // Update file input accept attribute to include all formats
    fileInput.setAttribute('accept', Object.keys(acceptedFormats).join(',') + ',.heic,.heif,.cr2,.nef,.orf,.sr2,.psd,.ai,.eps,.xcf');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
            // Reset the file input so the same file can be selected again
            fileInput.value = '';
        }
    });

    function handleFiles(files) {
        // Check if adding these files would exceed the limit
        if (selectedFiles.length + files.length > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        // Filter and add accepted image files
        const imageFiles = Array.from(files).filter(file => {
            const isAccepted = isAcceptedImageFile(file);
            if (!isAccepted) {
                alert(`Skipped unsupported file: ${file.name}`);
            }
            return isAccepted;
        });

        if (imageFiles.length === 0) {
            return;
        }

        // Add the files to our array
        selectedFiles = [...selectedFiles, ...imageFiles];

        // Update the UI
        updateFileTypesDisplay();
        updatePreviewContainer();
        updateButtons();

        // Log for debugging
        console.log('Files selected:', selectedFiles.map(f => ({ 
            name: f.name, 
            type: f.type || 'unknown', 
            size: f.size,
            extension: f.name.split('.').pop().toLowerCase()
        })));
    }

    function updateFileTypesDisplay() {
        if (selectedFiles.length === 0) {
            fileTypesDisplay.innerHTML = '<p>No files selected</p>';
            return;
        }

        const fileTypes = new Set(selectedFiles.map(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return extension.toUpperCase();
        }));

        fileTypesDisplay.innerHTML = `
            <p>Selected files (${selectedFiles.length}): ${Array.from(fileTypes).join(', ')}</p>
        `;
    }

    async function updatePreviewContainer() {
        previewContainer.innerHTML = '';
        
        if (selectedFiles.length === 0) {
            previewContainer.innerHTML = '<p class="no-files">No files selected</p>';
            return;
        }

        for (const [index, file] of selectedFiles.entries()) {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.dataset.index = index;
            
            const extension = file.name.split('.').pop().toLowerCase();
            
            try {
                let previewUrl;
                if (extension === 'heic' || extension === 'heif') {
                    // Show loading state
                    preview.innerHTML = `
                        <div class="preview-loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Converting preview...</p>
                        </div>
                        <div class="preview-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-size">${formatFileSize(file.size)}</p>
                            <p class="file-type">${extension.toUpperCase()}</p>
                        </div>
                        <button class="download-btn" data-index="${index}" disabled>
                            <i class="fas fa-download"></i> Download
                        </button>
                    `;
                    previewContainer.appendChild(preview);

                    try {
                        // Convert HEIC to JPEG for preview
                        const blob = await heic2any({
                            blob: file,
                            toType: 'image/jpeg',
                            quality: 0.8 // Lower quality for preview
                        });
                        previewUrl = URL.createObjectURL(blob);
                        
                        // Update preview with converted image
                        preview.innerHTML = `
                            <img src="${previewUrl}" alt="Preview">
                            <div class="preview-info">
                                <p class="file-name">${file.name}</p>
                                <p class="file-size">${formatFileSize(file.size)}</p>
                                <p class="file-type">${extension.toUpperCase()}</p>
                            </div>
                            <button class="download-btn" data-index="${index}" disabled>
                                <i class="fas fa-download"></i> Download
                            </button>
                        `;
                    } catch (error) {
                        console.error('HEIC preview error:', error);
                        preview.innerHTML = `
                            <div class="no-preview">
                                <i class="fas fa-exclamation-circle"></i>
                                <p>Preview failed</p>
                                <p class="error-message">Could not load HEIC preview</p>
                            </div>
                            <div class="preview-info">
                                <p class="file-name">${file.name}</p>
                                <p class="file-size">${formatFileSize(file.size)}</p>
                                <p class="file-type">${extension.toUpperCase()}</p>
                            </div>
                            <button class="download-btn" data-index="${index}" disabled>
                                <i class="fas fa-download"></i> Download
                            </button>
                        `;
                    }
                } else if (file.type.startsWith('image/')) {
                    // Handle regular image files
                    previewUrl = URL.createObjectURL(file);
                    preview.innerHTML = `
                        <img src="${previewUrl}" alt="Preview">
                        <div class="preview-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-size">${formatFileSize(file.size)}</p>
                            <p class="file-type">${extension.toUpperCase()}</p>
                        </div>
                        <button class="download-btn" data-index="${index}" disabled>
                            <i class="fas fa-download"></i> Download
                        </button>
                    `;
                    previewContainer.appendChild(preview);
                } else {
                    // Handle non-image files
                    preview.innerHTML = `
                        <div class="no-preview">
                            <i class="fas fa-file-image"></i>
                            <p>Preview not available</p>
                        </div>
                        <div class="preview-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-size">${formatFileSize(file.size)}</p>
                            <p class="file-type">${extension.toUpperCase()}</p>
                        </div>
                        <button class="download-btn" data-index="${index}" disabled>
                            <i class="fas fa-download"></i> Download
                        </button>
                    `;
                    previewContainer.appendChild(preview);
                }
            } catch (error) {
                console.error('Preview error:', error);
                preview.innerHTML = `
                    <div class="no-preview">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Preview failed</p>
                        <p class="error-message">${error.message}</p>
                    </div>
                    <div class="preview-info">
                        <p class="file-name">${file.name}</p>
                        <p class="file-size">${formatFileSize(file.size)}</p>
                        <p class="file-type">${extension.toUpperCase()}</p>
                    </div>
                    <button class="download-btn" data-index="${index}" disabled>
                        <i class="fas fa-download"></i> Download
                    </button>
                `;
                previewContainer.appendChild(preview);
            }
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function updateButtons() {
        clearSelectionBtn.disabled = selectedFiles.length === 0;
        convertBtn.disabled = selectedFiles.length === 0 || !formatSelect.value;
        downloadAllBtn.disabled = convertedFiles.length === 0;
    }

    clearSelectionBtn.addEventListener('click', () => {
        selectedFiles = [];
        convertedFiles = [];
        updateFileTypesDisplay();
        updatePreviewContainer();
        updateButtons();
    });

    convertBtn.addEventListener('click', async () => {
        const targetFormat = formatSelect.value;
        convertedFiles = [];
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                // Get current format from file extension instead of MIME type
                const currentFormat = file.name.split('.').pop().toLowerCase();

                if (currentFormat === targetFormat.toLowerCase()) {
                    alert(`File "${file.name}" is already in ${targetFormat.toUpperCase()} format`);
                    continue;
                }

                try {
                    const convertedBlob = await convertImage(file, targetFormat);
                    const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat;
                    convertedFiles.push({
                        blob: convertedBlob,
                        name: newFileName
                    });

                    // Enable download button for this image
                    const downloadBtn = document.querySelector(`.download-btn[data-index="${i}"]`);
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.addEventListener('click', () => downloadFile(convertedBlob, newFileName));
                    }

                    // Update preview info to show new format
                    const previewInfo = document.querySelector(`.image-preview[data-index="${i}"] .file-type`);
                    if (previewInfo) {
                        previewInfo.textContent = targetFormat.toUpperCase();
                    }
                } catch (error) {
                    console.error('Conversion error:', error);
                    alert(`Error converting "${file.name}": ${error.message}`);
                }
            }
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = 'Convert';
            downloadAllBtn.disabled = convertedFiles.length === 0;
        }
    });

    async function convertImage(file, targetFormat) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if it's a HEIC/HEIF file
                const extension = file.name.split('.').pop().toLowerCase();
                if (extension === 'heic' || extension === 'heif') {
                    try {
                        // Convert HEIC to JPEG first
                        const blob = await heic2any({
                            blob: file,
                            toType: 'image/jpeg',
                            quality: 0.92
                        });
                        
                        // If target format is JPEG, return the blob directly
                        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
                            resolve(blob);
                            return;
                        }
                        
                        // Otherwise, use this JPEG to convert to target format
                        file = blob;
                    } catch (error) {
                        console.error('HEIC conversion error:', error);
                        reject(new Error('Failed to convert HEIC format. Please make sure the file is not corrupted.'));
                        return;
                    }
                }

                // For all other formats or after HEIC conversion
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Fill with white background for formats that don't support transparency
                    if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    
                    ctx.drawImage(img, 0, 0);

                    // Set quality for JPEG
                    const quality = targetFormat === 'jpg' || targetFormat === 'jpeg' ? 0.92 : undefined;

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Conversion failed'));
                        }
                    }, `image/${targetFormat}`, quality);
                };

                img.onerror = () => reject(new Error('Failed to load image'));

                // Create object URL from blob if file is a blob, otherwise read as data URL
                if (file instanceof Blob) {
                    img.src = URL.createObjectURL(file);
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        img.src = e.target.result;
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                reject(new Error('Conversion failed: ' + error.message));
            }
        });
    }

    function downloadFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    downloadAllBtn.addEventListener('click', async () => {
        if (convertedFiles.length === 0) return;

        downloadAllBtn.disabled = true;
        downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating ZIP...';

        try {
            const zip = new JSZip();
            convertedFiles.forEach(file => {
                zip.file(file.name, file.blob);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'converted_images.zip');
        } catch (error) {
            console.error('ZIP creation error:', error);
            alert('Error creating ZIP file: ' + error.message);
        } finally {
            downloadAllBtn.disabled = false;
            downloadAllBtn.innerHTML = 'Download All as ZIP';
        }
    });

    formatSelect.addEventListener('change', () => {
        updateButtons();
    });
}); 