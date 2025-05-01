document.addEventListener('DOMContentLoaded', () => {
    // Mode selection
    const modeButtons = document.querySelectorAll('.mode-btn');
    const compressionModes = document.querySelectorAll('.compression-mode');
    
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            compressionModes.forEach(modeEl => {
                modeEl.classList.remove('active');
                if (modeEl.id === `${mode}Mode`) {
                    modeEl.classList.add('active');
                }
            });
        });
    });

    // Single file mode
    const singleDropZone = document.getElementById('singleDropZone');
    const singleFileInput = document.getElementById('singleFileInput');
    const singlePreview = document.getElementById('singlePreview');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const downloadSingle = document.getElementById('downloadSingle');
    const clearSingle = document.getElementById('clearSingle');
    const singleFileInfo = document.getElementById('singleFileInfo');

    let currentSingleFile = null;
    let currentSinglePreview = null;
    let currentSingleOriginalSize = 0;

    // Multiple files mode
    const multipleDropZone = document.getElementById('multipleDropZone');
    const multipleFileInput = document.getElementById('multipleFileInput');
    const multiplePreview = document.getElementById('multiplePreview');
    const multipleQualitySlider = document.getElementById('multipleQualitySlider');
    const multipleQualityValue = document.getElementById('multipleQualityValue');
    const totalOriginalSize = document.getElementById('totalOriginalSize');
    const totalCompressedSize = document.getElementById('totalCompressedSize');
    const downloadMultiple = document.getElementById('downloadMultiple');
    const clearMultiple = document.getElementById('clearMultiple');
    const multipleFileInfo = document.getElementById('multipleFileInfo');

    let currentMultipleFiles = [];
    let currentMultiplePreviews = [];
    let currentMultipleOriginalSizes = [];

    // Add these variables at the top with other DOM elements
    const customSizeInput = document.getElementById('customSizeInput');
    const sizeUnitKB = document.getElementById('sizeUnitKB');
    const sizeUnitMB = document.getElementById('sizeUnitMB');
    const convertSizeBtn = document.getElementById('convertSize');

    // Common functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function convertToPreviewableFormat(file) {
        try {
            // Handle HEIC/HEIF files
            if (file.type === 'image/heic' || file.type === 'image/heif' || 
                file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                const result = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 1
                });
                return {
                    previewFile: new File([result], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' }),
                    originalFile: file
                };
            }
            // Handle CR2 files
            else if (file.name.toLowerCase().endsWith('.cr2')) {
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const ifds = UTIF.decode(uint8Array);
                if (!ifds || ifds.length === 0) {
                    throw new Error('Invalid CR2 file');
                }
                UTIF.decodeImage(uint8Array, ifds[0]);
                const rgba = UTIF.toRGBA8(ifds[0]);
                
                const canvas = document.createElement('canvas');
                canvas.width = ifds[0].width;
                canvas.height = ifds[0].height;
                const ctx = canvas.getContext('2d');
                const imageData = ctx.createImageData(ifds[0].width, ifds[0].height);
                imageData.data.set(rgba);
                ctx.putImageData(imageData, 0, 0);
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 1));
                return {
                    previewFile: new File([blob], file.name.replace(/\.cr2$/i, '.jpg'), { type: 'image/jpeg' }),
                    originalFile: file
                };
            }
            // Handle PSD files
            else if (file.name.toLowerCase().endsWith('.psd')) {
                const arrayBuffer = await file.arrayBuffer();
                const psd = await PSD.fromArrayBuffer(arrayBuffer);
                psd.parse();
                
                const canvas = document.createElement('canvas');
                canvas.width = psd.header.width;
                canvas.height = psd.header.height;
                const ctx = canvas.getContext('2d');
                
                if (psd.image && psd.image.toImageData) {
                    const imageData = psd.image.toImageData();
                    ctx.putImageData(imageData, 0, 0);
                } else {
                    const layer = psd.layers[0];
                    if (layer && layer.image && layer.image.toImageData) {
                        const imageData = layer.image.toImageData();
                        ctx.putImageData(imageData, 0, 0);
                    } else {
                        throw new Error('Could not extract image data from PSD');
                    }
                }
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 1));
                return {
                    previewFile: new File([blob], file.name.replace(/\.psd$/i, '.jpg'), { type: 'image/jpeg' }),
                    originalFile: file
                };
            }
            // Handle PDF files
            else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const page = pdfDoc.getPages()[0];
                const { width, height } = page.getSize();
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                const imageBytes = await page.exportAsPNG();
                const img = new Image();
                img.src = URL.createObjectURL(new Blob([imageBytes], { type: 'image/png' }));
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, width, height);
                        URL.revokeObjectURL(img.src);
                        resolve();
                    };
                    img.onerror = () => {
                        URL.revokeObjectURL(img.src);
                        reject(new Error('Failed to load PDF page as image'));
                    };
                });
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 1));
                return {
                    previewFile: new File([blob], file.name.replace(/\.pdf$/i, '.jpg'), { type: 'image/jpeg' }),
                    originalFile: file
                };
            }
            // Handle other image formats
            else if (file.type.startsWith('image/')) {
                return {
                    previewFile: file,
                    originalFile: file
                };
            }
            else {
                throw new Error('Unsupported file format');
            }
        } catch (error) {
            console.error('File conversion error:', error);
            throw new Error(`Failed to process ${file.name}. Please try another format.`);
        }
    }

    function compressImage(file, quality) {
        return new Promise((resolve, reject) => {
            try {
                // Create a new image object
                const img = new Image();
                
                // Create a canvas for compression
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Handle image loading
                img.onload = () => {
                    try {
                        // Set canvas dimensions
                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        // Draw image to canvas
                        ctx.drawImage(img, 0, 0);
                        
                        // Convert to blob with specified quality
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    resolve(blob);
                                } else {
                                    reject(new Error('Failed to create compressed blob'));
                                }
                            },
                            'image/jpeg',
                            quality / 100
                        );
                    } catch (error) {
                        reject(new Error('Failed to compress image: ' + error.message));
                    }
                };
                
                // Handle image loading errors
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                // Start loading the image
                if (file instanceof Blob) {
                    img.src = URL.createObjectURL(file);
                } else {
                    img.src = file;
                }
            } catch (error) {
                reject(new Error('Compression failed: ' + error.message));
            }
        });
    }

    // Update quality slider event listeners
    let compressionTimeout;
    function debounceCompression(callback, delay) {
        return function(...args) {
            clearTimeout(compressionTimeout);
            compressionTimeout = setTimeout(() => callback.apply(this, args), delay);
        };
    }

    qualitySlider.addEventListener('input', debounceCompression(async () => {
        const quality = qualitySlider.value;
        qualityValue.textContent = `${quality}%`;
        
        if (currentSingleFile) {
            try {
                const compressedBlob = await compressImage(currentSingleFile, quality);
                const compressedSize = formatFileSize(compressedBlob.size);
                
                // Update both compressed size displays
                document.getElementById('compressedSize').textContent = compressedSize;
                compressedSizeElement.textContent = compressedSize;

                // Update custom size input with current compressed size
                const sizeInKB = Math.round(compressedBlob.size / 1024);
                customSizeInput.value = sizeInKB;
                sizeUnitKB.checked = true;
                sizeUnitMB.checked = false;
            } catch (error) {
                console.error('Compression error:', error);
                document.getElementById('compressedSize').textContent = '-';
                compressedSizeElement.textContent = '-';
            }
        }
    }, 300));

    multipleQualitySlider.addEventListener('input', debounceCompression(async () => {
        const quality = multipleQualitySlider.value;
        multipleQualityValue.textContent = `${quality}%`;
        
        if (currentMultipleFiles.length > 0) {
            try {
                console.log('Starting compression for multiple files...');
                let totalSize = 0;
                for (let i = 0; i < currentMultipleFiles.length; i++) {
                    const compressedBlob = await compressImage(currentMultipleFiles[i], quality);
                    totalSize += compressedBlob.size;
                }
                console.log('Multiple file compression completed, total size:', totalSize);
                totalCompressedSize.textContent = formatFileSize(totalSize);
            } catch (error) {
                console.error('Compression error:', error);
                totalCompressedSize.textContent = '-';
            }
        }
    }, 300));

    // Single file mode handlers
    singleDropZone.addEventListener('click', () => singleFileInput.click());
    singleDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        singleDropZone.classList.add('dragover');
    });
    singleDropZone.addEventListener('dragleave', () => {
        singleDropZone.classList.remove('dragover');
    });
    singleDropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        singleDropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            try {
                const { previewFile, originalFile } = await convertToPreviewableFormat(file);
                handleSingleFile(previewFile, originalFile);
            } catch (error) {
                console.error('File handling error:', error);
                alert(error.message || 'Failed to process the file. Please try another format.');
            }
        }
    });

    singleFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { previewFile, originalFile } = await convertToPreviewableFormat(file);
                handleSingleFile(previewFile, originalFile);
            } catch (error) {
                console.error('File handling error:', error);
                alert(error.message || 'Failed to process the file. Please try another format.');
            }
        }
    });

    function handleSingleFile(previewFile, originalFile) {
        currentSingleFile = originalFile;
        currentSinglePreview = previewFile;
        currentSingleOriginalSize = originalFile.size;
        singleFileInfo.innerHTML = `<p>Selected: ${originalFile.name}</p>`;
        originalSize.textContent = formatFileSize(originalFile.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            singlePreview.innerHTML = `
                <div class="image-preview">
                    <img src="${e.target.result}" alt="Preview">
                    <div class="preview-info">
                        <p class="file-name">${originalFile.name}</p>
                        <p class="file-size">${formatFileSize(originalFile.size)}</p>
                    </div>
                </div>
            `;
            downloadSingle.disabled = false;
        };
        reader.readAsDataURL(previewFile);
    }

    downloadSingle.addEventListener('click', async () => {
        if (currentSingleFile) {
            try {
                const quality = qualitySlider.value;
                const compressedBlob = await compressImage(currentSingleFile, quality);
                const link = document.createElement('a');
                link.href = URL.createObjectURL(compressedBlob);
                link.download = `compressed_${currentSingleFile.name}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error('Download error:', error);
                alert('Failed to download the compressed file. Please try again.');
            }
        }
    });

    clearSingle.addEventListener('click', () => {
        currentSingleFile = null;
        currentSinglePreview = null;
        currentSingleOriginalSize = 0;
        singlePreview.innerHTML = '';
        singleFileInfo.innerHTML = '<p>No file selected</p>';
        originalSize.textContent = '-';
        compressedSize.textContent = '-';
        downloadSingle.disabled = true;
        qualitySlider.value = 80;
        qualityValue.textContent = '80%';
    });

    // Multiple files mode handlers
    multipleDropZone.addEventListener('click', () => multipleFileInput.click());
    multipleDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        multipleDropZone.classList.add('dragover');
    });
    multipleDropZone.addEventListener('dragleave', () => {
        multipleDropZone.classList.remove('dragover');
    });
    multipleDropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        multipleDropZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            try {
                const results = await Promise.all(files.map(convertToPreviewableFormat));
                const previewFiles = results.map(r => r.previewFile);
                const originalFiles = results.map(r => r.originalFile);
                handleMultipleFiles(previewFiles, originalFiles);
            } catch (error) {
                console.error('File handling error:', error);
                alert(error.message || 'Failed to process some files. Please try another format.');
            }
        }
    });

    multipleFileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            try {
                const results = await Promise.all(files.map(convertToPreviewableFormat));
                const previewFiles = results.map(r => r.previewFile);
                const originalFiles = results.map(r => r.originalFile);
                handleMultipleFiles(previewFiles, originalFiles);
            } catch (error) {
                console.error('File handling error:', error);
                alert(error.message || 'Failed to process some files. Please try another format.');
            }
        }
    });

    function handleMultipleFiles(previewFiles, originalFiles) {
        if (previewFiles.length > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        currentMultipleFiles = originalFiles;
        currentMultiplePreviews = previewFiles;
        currentMultipleOriginalSizes = originalFiles.map(f => f.size);
        multipleFileInfo.innerHTML = `<p>Selected ${originalFiles.length} files</p>`;
        
        let totalSize = originalFiles.reduce((sum, file) => sum + file.size, 0);
        totalOriginalSize.textContent = formatFileSize(totalSize);

        multiplePreview.innerHTML = '';
        previewFiles.forEach((previewFile, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <div class="preview-info">
                        <p class="file-name">${originalFiles[index].name}</p>
                        <p class="file-size">${formatFileSize(originalFiles[index].size)}</p>
                    </div>
                `;
                multiplePreview.appendChild(preview);
                
                if (index === previewFiles.length - 1) {
                    downloadMultiple.disabled = false;
                }
            };
            reader.readAsDataURL(previewFile);
        });
    }

    downloadMultiple.addEventListener('click', async () => {
        if (currentMultipleFiles.length > 0) {
            try {
                const quality = multipleQualitySlider.value;
                const zip = new JSZip();
                
                for (let i = 0; i < currentMultipleFiles.length; i++) {
                    const compressedBlob = await compressImage(currentMultipleFiles[i], quality);
                    zip.file(`compressed_${currentMultipleFiles[i].name}`, compressedBlob);
                }
                
                const content = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'compressed_images.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error('Download error:', error);
                alert('Failed to download the compressed files. Please try again.');
            }
        }
    });

    clearMultiple.addEventListener('click', () => {
        currentMultipleFiles = [];
        currentMultiplePreviews = [];
        currentMultipleOriginalSizes = [];
        multiplePreview.innerHTML = '';
        multipleFileInfo.innerHTML = '<p>No files selected</p>';
        totalOriginalSize.textContent = '-';
        totalCompressedSize.textContent = '-';
        downloadMultiple.disabled = true;
        multipleQualitySlider.value = 80;
        multipleQualityValue.textContent = '80%';
    });

    // Theme handling
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        const tooltip = themeToggle.querySelector('.tooltip');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            tooltip.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            tooltip.textContent = 'Dark Mode';
        }
    }

    // Add this function to handle custom size conversion
    async function convertToCustomSize(file, targetSizeBytes) {
        let quality = 0.9;
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let compressedBlob;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            compressedBlob = await compressImage(file, quality);
            const currentSize = compressedBlob.size;

            if (Math.abs(currentSize - targetSizeBytes) < 1024) { // Within 1KB of target
                break;
            }

            if (currentSize > targetSizeBytes) {
                maxQuality = quality;
                quality = (quality + minQuality) / 2;
            } else {
                minQuality = quality;
                quality = (quality + maxQuality) / 2;
            }

            attempts++;
        }

        return compressedBlob;
    }

    // Update the convert button event listener
    convertSizeBtn.addEventListener('click', async () => {
        if (!currentSingleFile) {
            alert('Please select a file first');
            return;
        }

        const sizeValue = parseFloat(customSizeInput.value);
        if (isNaN(sizeValue) || sizeValue <= 0) {
            alert('Please enter a valid size');
            return;
        }

        const isKB = sizeUnitKB.checked;
        const targetSizeBytes = isKB ? sizeValue * 1024 : sizeValue * 1024 * 1024;

        // Don't allow compression to target size larger than original
        if (targetSizeBytes > currentSingleFile.size) {
            alert('Target size cannot be larger than original file size');
            return;
        }

        try {
            const compressedBlob = await convertToCustomSize(currentSingleFile, targetSizeBytes);
            const compressedSize = formatFileSize(compressedBlob.size);
            
            // Update both compressed size displays
            document.getElementById('compressedSize').textContent = compressedSize;
            compressedSizeElement.textContent = compressedSize;

            // Update quality slider based on the compression result
            const quality = Math.round((compressedBlob.size / currentSingleFile.size) * 100);
            qualitySlider.value = quality;
            qualityValue.textContent = `${quality}%`;

            // Update download button
            const downloadBtn = document.getElementById('downloadSingle');
            downloadBtn.href = URL.createObjectURL(compressedBlob);
            downloadBtn.download = `compressed_${currentSingleFile.name}`;
            downloadBtn.style.display = 'block';
            downloadBtn.disabled = false;
        } catch (error) {
            console.error('Error during custom size conversion:', error);
            alert('Error converting image to specified size. Please try again.');
        }
    });

    // Add event listeners for the radio buttons to update the input placeholder
    sizeUnitKB.addEventListener('change', () => {
        customSizeInput.placeholder = 'Enter size in KB';
    });

    sizeUnitMB.addEventListener('change', () => {
        customSizeInput.placeholder = 'Enter size in MB';
    });
}); 