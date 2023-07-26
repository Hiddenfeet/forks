document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('data-modal-overlay');
    const modalClose = document.getElementById('data-modal-close');
    const modalTrigger = document.getElementById('data-modal-target');
    const modalContent = document.getElementById('data-modal-content');
    const resizeHandle = document.querySelector('.resize-handle');
    const originalBackgroundColor = window.getComputedStyle(modalContent).backgroundColor;

    let isResizing = false;
    let startX, startY;
    let modalStartWidth, modalStartHeight;
    let embedIframe = modalContent.querySelector('iframe');

    modalTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        modalOverlay.style.display = 'flex';
    });

    modalClose.addEventListener('click', function() {
        if (!isResizing) {
            modalOverlay.style.display = 'none';
        }
    });

    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay && !isResizing) {
            modalOverlay.style.display = 'none';
        }
    });

    resizeHandle.addEventListener('mousedown', function(event) {
        event.preventDefault();
        isResizing = true;
        startX = event.clientX;
        startY = event.clientY;
        modalStartWidth = modalContent.offsetWidth;
        modalStartHeight = modalContent.offsetHeight;

        const tempOverlay = document.createElement('div');
        tempOverlay.id = 'temp-overlay';
        tempOverlay.style.position = 'fixed';
        tempOverlay.style.top = '0';
        tempOverlay.style.left = '0';
        tempOverlay.style.width = '100%';
        tempOverlay.style.height = '100%';
        tempOverlay.style.zIndex = '9998';
        document.body.appendChild(tempOverlay);

        document.addEventListener('mousemove', resizeModal);

        document.addEventListener('mouseup', function(event) {
            if (!modalContent.contains(event.target) && !isResizing) {
                document.body.removeChild(tempOverlay);
                isResizing = false;
            }
        });
    });

    function resizeModal(event) {
        if (!isResizing) {
            return;
        }

        if (event.buttons === 0) {
            isResizing = false;
            document.body.removeChild(document.getElementById('temp-overlay'));
            modalContent.style.backgroundColor = originalBackgroundColor;
            embedIframe.style.pointerEvents = 'auto';
            return;
        }

        const diffX = event.clientX - startX;
        const diffY = event.clientY - startY;
        const newWidth = modalStartWidth + diffX;
        const newHeight = modalStartHeight + diffY;

        modalContent.style.width = newWidth + 'px';
        modalContent.style.height = newHeight + 'px';

        modalContent.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        embedIframe.style.pointerEvents = 'none';

        const modalPadding = parseInt(window.getComputedStyle(modalContent).padding);
        const maxEmbedWidth = newWidth - 2 * modalPadding;
        const maxEmbedHeight = newHeight - 2 * modalPadding;

        embedIframe.style.width = maxEmbedWidth + 'px';
        embedIframe.style.height = maxEmbedHeight + 'px';
    }
});

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
  
  // Get a reference to the copy text link
  const copyTextLink = document.getElementById('data-modal-target2');
  
  // Add click event listener to the copy text link
  copyTextLink.addEventListener('click', function(event) {
    event.preventDefault();
    
    const textToCopy = '0x96f762c6D109Cece42449181D31b55A941c6dd28'; // Replace with the actual text you want to copy
    
    // Copy the text to clipboard
    copyToClipboard(textToCopy);
});