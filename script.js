document.addEventListener('DOMContentLoaded', function() {
    const downloadForm = document.getElementById('downloadForm');
    const resultContainer = document.getElementById('resultContainer');
    const loading = document.getElementById('loading');
    const downloadLink = document.getElementById('downloadLink');
    const newDownloadBtn = document.getElementById('newDownload');

    downloadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const videoUrl = document.getElementById('videoUrl').value;
        
        // Show loading state
        downloadForm.classList.add('hidden');
        loading.classList.remove('hidden');
        
        // Send to server
        fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoUrl })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show download link
                downloadLink.href = data.downloadUrl;
                loading.classList.add('hidden');
                resultContainer.classList.remove('hidden');
            } else {
                alert('Error: ' + (data.error || 'Failed to download video'));
                resetForm();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
            resetForm();
        });
    });

    newDownloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });

    function resetForm() {
        downloadForm.reset();
        resultContainer.classList.add('hidden');
        loading.classList.add('hidden');
        downloadForm.classList.remove('hidden');
    }
});