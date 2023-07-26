document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay2 = document.getElementById('data-modal-overlay2');
    const modalClose2 = document.getElementById('data-modal-close2');
    const modalTrigger2 = document.getElementById('data-modal-target2');
    const modalContent2 = document.getElementById('data-modal-content2');
    const resizeHandle2 = document.querySelector('.resize-handle2');
    const originalBackgroundColor2 = window.getComputedStyle(modalContent2).backgroundColor;
  
    let isResizing2 = false;
    let startX2, startY2;
    let modalStartWidth2, modalStartHeight2;
    let embedIframe2 = modalContent2.querySelector('iframe');
  
    modalTrigger2.addEventListener('click', function(event) {
      event.preventDefault();
      modalOverlay2.style.display = 'flex';
    });
  
    modalClose2.addEventListener('click', function() {
      if (!isResizing2) {
        modalOverlay2.style.display = 'none';
      }
    });
  
    modalOverlay2.addEventListener('click', function(event) {
      if (event.target === modalOverlay2 && !isResizing2) {
        modalOverlay2.style.display = 'none';
      }
    });
  
    resizeHandle2.addEventListener('mousedown', function(event) {
      event.preventDefault();
      isResizing2 = true;
      startX2 = event.clientX;
      startY2 = event.clientY;
      modalStartWidth2 = modalContent2.offsetWidth;
      modalStartHeight2 = modalContent2.offsetHeight;
  
      const tempOverlay2 = document.createElement('div');
      tempOverlay2.id = 'temp-overlay2';
      tempOverlay2.style.position = 'fixed';
      tempOverlay2.style.top = '0';
      tempOverlay2.style.left = '0';
      tempOverlay2.style.width = '100%';
      tempOverlay2.style.height = '100%';
      tempOverlay2.style.zIndex = '9998';
      document.body.appendChild(tempOverlay2);
  
      document.addEventListener('mousemove', resizeModal2);
      document.addEventListener('mouseup', function(event) {
        if (!modalContent2.contains(event.target) && !isResizing2) {
            document.body.removeChild(tempOverlay2);
            isResizing = false;
        }
    });
    });
  
    function resizeModal2(event) {
      if (!isResizing2) {
        return;
      }

      if (event.buttons === 0) {
        isResizing2 = false;
        document.body.removeChild(document.getElementById('temp-overlay2'));
        modalContent2.style.backgroundColor = originalBackgroundColor2;
        embedIframe2.style.pointerEvents = 'auto';
        return;
    }
  
      const diffX2 = event.clientX - startX2;
      const diffY2 = event.clientY - startY2;
      const newWidth2 = modalStartWidth2 + diffX2;
      const newHeight2 = modalStartHeight2 + diffY2;
  
      modalContent2.style.width = newWidth2 + 'px';
      modalContent2.style.height = newHeight2 + 'px';

      modalContent2.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      embedIframe2.style.pointerEvents = 'none';
  
      const modalPadding2 = parseInt(window.getComputedStyle(modalContent2).padding);
      const maxEmbedWidth2 = newWidth2 - 2 * modalPadding2;
      const maxEmbedHeight2 = newHeight2 - 2 * modalPadding2;
  
      embedIframe2.style.width = maxEmbedWidth2 + 'px';
      embedIframe2.style.height = maxEmbedHeight2 + 'px';
    }
  });  