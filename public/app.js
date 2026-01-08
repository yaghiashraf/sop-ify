document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const processInput = document.getElementById('process-input');
    const resultSection = document.getElementById('result-section');
    const loadingDiv = document.getElementById('loading');
    const sopContent = document.getElementById('sop-content');
    const printBtn = document.getElementById('print-btn');
    const copyBtn = document.getElementById('copy-btn');

    generateBtn.addEventListener('click', async () => {
        const text = processInput.value.trim();
        
        if (!text) {
            alert('Please enter some process notes first.');
            return;
        }

        // UI State: Loading
        generateBtn.disabled = true;
        resultSection.style.display = 'none';
        loadingDiv.style.display = 'block';

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
            loadingDiv.style.display = 'none';
            resultSection.style.display = 'block';
            
            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating SOP: ' + error.message);
            loadingDiv.style.display = 'none';
        } finally {
            generateBtn.disabled = false;
        }
    });

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        // Create a temporary element to handle the copy
        // We use textContent to get plain text, or innerHTML if we want to copy code.
        // For rich text copy, it's more complex, so we'll grab the raw text structure or use Clipboard API
        
        const type = "text/html";
        const blob = new Blob([sopContent.innerHTML], { type });
        const data = [new ClipboardItem({ [type]: blob })];

        navigator.clipboard.write(data).then(
            () => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "Copied!";
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            },
            () => {
                alert("Failed to copy to clipboard.");
            }
        );
    });
});
