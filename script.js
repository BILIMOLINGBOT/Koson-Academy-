// DOM Elements
const videoFileInput = document.getElementById('videoFile');
const videoPreview = document.getElementById('videoPreview');
const videoUploadForm = document.getElementById('videoUploadForm');
const videosGrid = document.getElementById('videosGrid');

// Video Preview Functionality
if (videoFileInput && videoPreview) {
    videoFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            const videoURL = URL.createObjectURL(file);
            videoPreview.innerHTML = `
                <video controls style="width: 100%; max-height: 300px; border-radius: 8px;">
                    <source src="${videoURL}" type="${file.type}">
                    Brauzeringiz videoni qo'llab-quvvatlamaydi.
                </video>
                <p style="margin-top: 10px; color: #1da1f2;">
                    <i class="fas fa-check-circle"></i> Video tanlandi: ${file.name}
                </p>
            `;
        }
    });

    videoPreview.addEventListener('click', () => {
        videoFileInput.click();
    });
}

// Video Upload Form Handler
if (videoUploadForm) {
    videoUploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('videoFile');
        const description = this.querySelector('textarea').value;
        
        if (!fileInput.files[0]) {
            alert('Iltimos, video faylni tanlang!');
            return;
        }
        
        const formData = new FormData();
        formData.append('videoFile', fileInput.files[0]);
        formData.append('description', description);
        
        // Show loading state
        const submitBtn = this.querySelector('.tweet-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...';
        submitBtn.disabled = true;
        
        try {
            // In a real application, this would be a server endpoint
            // For demo purposes, we'll simulate upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert('Video muvaffaqiyatli yuklandi!');
            
            // Reset form
            this.reset();
            videoPreview.innerHTML = `
                <i class="fas fa-video"></i>
                <p>Video tanlang yoki bu yerga sudrab tashlang</p>
            `;
            
            // Add new video to grid (demo)
            const newVideo = {
                title: `Yangi Video ${new Date().toLocaleDateString()}`,
                description: description || 'Tavsif yo\'q',
                views: '0',
                duration: '1:30',
                date: new Date().toLocaleDateString('uz-UZ')
            };
            
            addVideoToGrid(newVideo);
            
        } catch (error) {
            alert('Video yuklashda xatolik yuz berdi: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Function to add video to grid
function addVideoToGrid(video) {
    if (!videosGrid) return;
    
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.onclick = () => window.location.href = 'videopage.html';
    
    videoCard.innerHTML = `
        <div class="video-thumbnail">
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; 
                align-items: center; justify-content: center; color: white; font-size: 48px;">
                <i class="fas fa-video"></i>
            </div>
        </div>
        <div class="video-info">
            <h4>${video.title}</h4>
            <p class="video-description">${video.description}</p>
            <div class="video-meta">
                <span><i class="far fa-eye"></i> ${video.views}</span>
                <span><i class="far fa-clock"></i> ${video.duration}</span>
                <span><i class="far fa-calendar"></i> ${video.date}</span>
            </div>
        </div>
    `;
    
    videosGrid.prepend(videoCard);
}

// Video page functionality
function loadVideo(videoId) {
    // In a real application, this would load video data from server
    const videoData = {
        1: {
            title: "Birinchi video sarlavhasi",
            description: "Bu birinchi video haqida to'liq tavsif. Video kontent yaratish bo'yicha maslahatlar.",
            views: "12,456",
            date: "2024-01-01"
        },
        2: {
            title: "Ikkinchi video sarlavhasi",
            description: "Bu ikkinchi video haqida batafsil ma'lumot. Qiziqarli vlog va tajribalar.",
            views: "8,745",
            date: "2024-01-05"
        }
    };
    
    const data = videoData[videoId] || videoData[1];
    
    // Update video details
    document.getElementById('videoTitle').textContent = data.title;
    document.getElementById('videoDescription').textContent = data.description;
    document.getElementById('viewCount').textContent = data.views;
    document.getElementById('uploadDate').textContent = data.date;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize video data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Demo videos data
    const demoVideos = [
        {
            title: "O'zbekiston go'zalliklari",
            description: "O'zbekistonning ajoyib tabiiy go'zalliklari",
            views: "15.2k",
            duration: "4:20",
            date: "2024-01-10"
        },
        {
            title: "Dasturlash darslari",
            description: "JavaScript asoslari - 1-qism",
            views: "8.7k",
            duration: "12:45",
            date: "2024-01-08"
        },
        {
            title: "Musiqa video",
            description: "Yangi chiqqan o'zbek musiqasi",
            views: "23.4k",
            duration: "3:15",
            date: "2024-01-05"
        },
        {
            title: "Sport yangiliklari",
            description: "Jahon sportidagi eng so'nggi yangiliklar",
            views: "5.6k",
            duration: "8:30",
            date: "2024-01-03"
        }
    ];
    
    // Load demo videos on index page
    if (videosGrid && window.location.pathname.includes('index.html')) {
        demoVideos.forEach(video => addVideoToGrid(video));
    }
    
    // File drag and drop
    const videoPreviewElem = document.getElementById('videoPreview');
    if (videoPreviewElem) {
        videoPreviewElem.addEventListener('dragover', (e) => {
            e.preventDefault();
            videoPreviewElem.style.borderColor = '#1da1f2';
            videoPreviewElem.style.backgroundColor = '#f5f8fa';
        });
        
        videoPreviewElem.addEventListener('dragleave', () => {
            videoPreviewElem.style.borderColor = '#e1e8ed';
            videoPreviewElem.style.backgroundColor = 'transparent';
        });
        
        videoPreviewElem.addEventListener('drop', (e) => {
            e.preventDefault();
            videoPreviewElem.style.borderColor = '#e1e8ed';
            videoPreviewElem.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('video/')) {
                const videoURL = URL.createObjectURL(files[0]);
                videoPreviewElem.innerHTML = `
                    <video controls style="width: 100%; max-height: 300px; border-radius: 8px;">
                        <source src="${videoURL}" type="${files[0].type}">
                        Brauzeringiz videoni qo'llab-quvvatlamaydi.
                    </video>
                    <p style="margin-top: 10px; color: #1da1f2;">
                        <i class="fas fa-check-circle"></i> Video tanlandi: ${files[0].name}
                    </p>
                `;
                
                // Set file input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                videoFileInput.files = dataTransfer.files;
            }
        });
    }
});