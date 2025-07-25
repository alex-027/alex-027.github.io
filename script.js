class BirthdayPhotoMerger {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startCameraBtn = document.getElementById('startCamera');
        this.captureBtn = document.getElementById('capturePhoto');
        this.downloadBtn = document.getElementById('downloadPhoto');
        this.stopCameraBtn = document.getElementById('stopCamera');
        this.friendPhoto = document.getElementById('friendPhoto');
        
        // Array of your photos - add your photo filenames here
        this.friendPhotoPaths = [
            'pictures/IMG_5741-removebg-preview.png',
            'pictures/IMG_5761-removebg-preview.png',
            'pictures/IMG_5768-removebg-preview.png',
            'pictures/IMG_5779-removebg-preview.png',
            'pictures/IMG_5785-removebg-preview.png',
            'pictures/IMG_5795-removebg-preview.png',
            'pictures/IMG_5804-removebg-preview.png',
            'pictures/IMG_5818-removebg-preview.png',
            'pictures/IMG_5826-removebg-preview.png',
            'pictures/IMG_5839-removebg-preview.png'
        ];
        this.currentPhotoIndex = 0;
        
        this.stream = null;
        this.capturedImageData = null;
        
        this.init();
    }
    
    init() {
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.downloadBtn.addEventListener('click', () => this.downloadPhoto());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        
        // Set initial photo
        this.setRandomPhoto();
        
        // Add some birthday sparkles
        this.addSparkleEffect();
    }
    
    setRandomPhoto() {
        // Select a random photo from the array
        this.currentPhotoIndex = Math.floor(Math.random() * this.friendPhotoPaths.length);
        this.friendPhoto.src = this.friendPhotoPaths[this.currentPhotoIndex];
    }
    
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            this.video.srcObject = this.stream;
            this.video.play();
            
            this.startCameraBtn.style.display = 'none';
            this.captureBtn.style.display = 'inline-block';
            this.stopCameraBtn.style.display = 'inline-block';
            
            // Add camera ready animation
            this.showNotification('📸 Camera ready! Position yourself on the right side!', 'success');
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showNotification('❌ Could not access camera. Please check permissions.', 'error');
        }
    }
    
    stopCamera() {
        if (this.stream) {
            // Stop all video tracks
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        // Clear video source
        this.video.srcObject = null;
        
        // Reset button visibility
        this.startCameraBtn.style.display = 'inline-block';
        this.captureBtn.style.display = 'none';
        this.stopCameraBtn.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        
        this.showNotification('📷 Camera stopped', 'info');
    }
    
    capturePhoto() {
        if (!this.video.videoWidth || !this.video.videoHeight) {
            this.showNotification('⏳ Please wait for camera to load completely', 'warning');
            return;
        }
        
        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the current video frame
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Create friend photo overlay
        const friendImg = new Image();
        friendImg.onload = () => {
            // Draw friend photo on the left half
            const leftWidth = this.canvas.width / 2;
            this.ctx.drawImage(friendImg, 0, 0, leftWidth, this.canvas.height);
            
            // Add a subtle border between the two sides
            this.ctx.strokeStyle = 'rgba(225, 112, 85, 0.8)';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(leftWidth, 0);
            this.ctx.lineTo(leftWidth, this.canvas.height);
            this.ctx.stroke();
            
            // Add birthday decorations
            this.addBirthdayDecorations();
            
            // Store the image data
            this.capturedImageData = this.canvas.toDataURL('image/jpeg', 0.9);
            
            // Automatically download the photo
            this.autoDownloadPhoto();
            
            // Set next random photo for next capture
            this.setRandomPhoto();
            
            // Keep capture button visible for next photo
            this.captureBtn.style.display = 'inline-block';
            this.downloadBtn.style.display = 'none';
            
            this.showNotification('🎉 Perfect! Your birthday memory is ready!', 'success');
        };
        
        friendImg.src = this.friendPhotoPaths[this.currentPhotoIndex];
    }
    
    addBirthdayDecorations() {
        const ctx = this.ctx;
        
        // Add birthday text overlay
        ctx.save();
        ctx.font = 'bold 48px Georgia';
        ctx.fillStyle = 'rgba(186, 131, 143, 0.9)';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        
        const text = 'Happy 19th Birthday!';
        const x = this.canvas.width / 2;
        const y = 80;
        
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        // Add birthday emojis
        ctx.font = '60px Arial';
        ctx.fillText('🎂', x - 200, y + 80);
        ctx.fillText('🎈', x + 200, y + 80);
        ctx.fillText('🎉', x - 100, this.canvas.height - 80);
        ctx.fillText('✨', x + 100, this.canvas.height - 80);
        
        // Add age number
        ctx.font = 'bold 120px Georgia';
        ctx.fillStyle = 'rgba(203, 166, 247, 0.7)';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.fillText('19', x, this.canvas.height - 150);
        ctx.strokeText('19', x, this.canvas.height - 150);
        
        ctx.restore();
    }
    
    autoDownloadPhoto() {
        if (!this.capturedImageData) return;
        
        // Create download link and trigger automatically
        const link = document.createElement('a');
        link.download = `thorben-19th-birthday-${new Date().getTime()}.jpg`;
        link.href = this.capturedImageData;
        
        // Trigger download automatically
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('📱 Photo automatically saved to your device!', 'success');
    }
    
    downloadPhoto() {
        if (!this.capturedImageData) {
            this.showNotification('❌ No photo to download', 'error');
            return;
        }
        
        // Manual download (backup option)
        this.autoDownloadPhoto();
        this.showNotification('💾 Photo downloaded again!', 'success');
        
        // Add celebration effect
        this.triggerCelebration();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            maxWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#00b894',
            error: '#d63031',
            warning: '#fdcb6e',
            info: '#74b9ff'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    triggerCelebration() {
        // Create celebration particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createCelebrationParticle();
            }, i * 100);
        }
    }
    
    createCelebrationParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['🎉', '🎊', '✨', '🎈', '🎂'][Math.floor(Math.random() * 5)];
        
        Object.assign(particle.style, {
            position: 'fixed',
            fontSize: '30px',
            pointerEvents: 'none',
            zIndex: '999',
            left: Math.random() * window.innerWidth + 'px',
            top: '-50px',
            animation: 'celebration-fall 3s linear forwards'
        });
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }
    
    addSparkleEffect() {
        // Add CSS for celebration animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebration-fall {
                to {
                    transform: translateY(${window.innerHeight + 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Create periodic sparkles
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createSparkle();
            }
        }, 2000);
    }
    
    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        
        Object.assign(sparkle.style, {
            position: 'fixed',
            fontSize: '20px',
            pointerEvents: 'none',
            zIndex: '998',
            left: Math.random() * window.innerWidth + 'px',
            top: Math.random() * window.innerHeight + 'px',
            animation: 'sparkle-twinkle 2s ease-out forwards'
        });
        
        // Add sparkle animation
        const sparkleStyle = document.createElement('style');
        sparkleStyle.textContent = `
            @keyframes sparkle-twinkle {
                0% { opacity: 0; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
                100% { opacity: 0; transform: scale(0) rotate(360deg); }
            }
        `;
        document.head.appendChild(sparkleStyle);
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
    }
}

// Initialize the birthday photo merger when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BirthdayPhotoMerger();
});