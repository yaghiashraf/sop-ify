document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const processInput = document.getElementById('process-input');
    const resultSection = document.getElementById('result-section');
    const loadingDiv = document.getElementById('loading');
    const sopContent = document.getElementById('sop-content');
    const printBtn = document.getElementById('print-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    // Auto-focus input on load
    processInput.focus();

    generateBtn.addEventListener('click', async () => {
        const text = processInput.value.trim();
        
        if (!text) {
            showToast('Please enter some process notes first.', 'error');
            processInput.focus();
            return;
        }

        // UI State: Loading
        setLoadingState(true);

        try {
            const response = await fetch('/.netlify/functions/generate-sop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: text })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate SOP');
            }

            const data = await response.json();
            
            // Render Content
            sopContent.innerHTML = data.content;
            
            // UI State: Success
            setLoadingState(false);
            showToast('SOP generated successfully!', 'success');
            
            // Scroll to result
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'error');
            setLoadingState(false, true); // keep loading hidden but don't show result
        }
    });

    // Helper to toggle loading/result visibility
    function setLoadingState(isLoading, isError = false) {
        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<div class="loader-ring" style="width:20px;height:20px;border-width:2px;position:static;display:inline-block;vertical-align:middle;margin-right:10px;"></div> Generating...';
            resultSection.style.display = 'none';
            loadingDiv.style.display = 'block';
        } else {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-text">Generate SOP</span> <i class="ph-bold ph-magic-wand"></i>';
            loadingDiv.style.display = 'none';
            if (!isError) {
                resultSection.style.display = 'block';
            }
        }
    }

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const type = "text/html";
        const blob = new Blob([sopContent.innerHTML], { type });
        const data = [new ClipboardItem({ [type]: blob })];

        navigator.clipboard.write(data).then(
            () => {
                showToast('Copied to clipboard!');
            },
            () => {
                // Fallback for simple text
                navigator.clipboard.writeText(sopContent.innerText).then(() => {
                    showToast('Copied text to clipboard!');
                }).catch(err => {
                    showToast('Failed to copy.', 'error');
                });
            }
        );
    });

    // Toast Notification System
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
        
        toast.innerHTML = `
            <i class="ph-fill ${icon}" style="font-size: 1.25rem;"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});