document.addEventListener('DOMContentLoaded', () => {
    // Elementlarni tanlab olish
    const heartBtn = document.getElementById('heart-btn');
    const saveBtn = document.getElementById('save-btn');
    const commentsBtn = document.getElementById('comments-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const modal = document.getElementById('commentsModal');
    const closeBtn = document.querySelector('.close-btn');
    const commentInput = document.querySelector('.comment-input');
    const submitBtn = document.querySelector('.submit-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const commentsList = document.getElementById('commentsList');
    const noCommentsIndicator = document.getElementById('no-comments-indicator');
    const commentsMainCount = document.getElementById('comments-main-count');
    const commentsModalCount = document.getElementById('comments-modal-count');
    const heartCountDisplay = document.getElementById('heart-count');

    // Boshlang'ich ma'lumotlar
    let heartCount = 12000;
    let commentsCount = 0;
    let isHearted = false;
    let isSubscribed = false;

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            heartCount,
            commentsCount,
            isHearted,
            isSubscribed
        };
        localStorage.setItem('videoReactions', JSON.stringify(data));
    };

    // Ma'lumotlarni yuklash funksiyasi
    const loadFromStorage = () => {
        const savedData = localStorage.getItem('videoReactions');
        if (savedData) {
            const data = JSON.parse(savedData);
            heartCount = data.heartCount || heartCount;
            commentsCount = data.commentsCount || commentsCount;
            isHearted = data.isHearted || false;
            isSubscribed = data.isSubscribed || false;
            
            // Foydalanuvchi reaktsiyasini ko'rsatish
            if (isHearted) {
                heartBtn.classList.add('active');
            }
            
            // Obuna holatini ko'rsatish
            if (isSubscribed) {
                subscribeBtn.textContent = "Obuna bo'lingan";
                subscribeBtn.classList.add('subscribed');
            }
        }
    };

    // Raqamlarni formatlash funksiyasi
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    // Hisoblagichlarni yangilash funksiyasi
    function updateCounts() {
        heartCountDisplay.textContent = formatNumber(heartCount);
        commentsMainCount.textContent = commentsCount;
        commentsModalCount.textContent = commentsCount;

        // Fikrlar ro'yxati va "fikrlar yo'q" xabarini boshqarish
        if (commentsCount > 0) {
            noCommentsIndicator.style.display = 'none';
            commentsList.style.display = 'block';
        } else {
            noCommentsIndicator.style.display = 'flex';
            commentsList.style.display = 'none';
        }
        
        // Ma'lumotlarni saqlash
        saveToStorage();
    }
    
    // Xabarlarni ko'rsatish funksiyasi
    function showNotification(message, duration = 3000) {
        // Mavjud xabarni olib tashlash
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Yangi xabar yaratish
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Progress bar yaratish
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        notification.appendChild(progressBar);
        
        // Animatsiya
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 10);
        
        // Xabarni olib tashlash
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Yurak tugmasi logikasi
    heartBtn.addEventListener('click', () => {
        isHearted = !isHearted;
        
        if (isHearted) {
            // Yurak qo'shilmoqda
            heartBtn.classList.add('active');
            heartCount++;
            showNotification("Siz videoni sevdingiz ❤️");
        } else {
            // Yurak olib tashlanmoqda
            heartBtn.classList.remove('active');
            heartCount--;
            showNotification("Siz videoni sevmadingiz");
        }
        updateCounts();
    });

    // Saqlash tugmasi logikasi
    saveBtn.addEventListener('click', () => {
        const isActive = saveBtn.classList.toggle('active');
        
        // Saqlash holatini saqlash
        const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '{}');
        if (isActive) {
            savedVideos['currentVideo'] = true;
            showNotification("Video saqlandi");
        } else {
            delete savedVideos['currentVideo'];
            showNotification("Video saqlanganlar ro'yxatidan olib tashlandi");
        }
        localStorage.setItem('savedVideos', JSON.stringify(savedVideos));
    });

    // Obuna bo'lish tugmasi logikasi
    subscribeBtn.addEventListener('click', () => {
        isSubscribed = !isSubscribed;
        
        if (isSubscribed) {
            subscribeBtn.textContent = "Obuna bo'lingan";
            subscribeBtn.classList.add('subscribed');
            showNotification("Asia Films HD kanaliga obuna bo'ldingiz");
        } else {
            subscribeBtn.textContent = "Obuna bo'lish";
            subscribeBtn.classList.remove('subscribed');
            showNotification("Asia Films HD kanalidan obunani olib tashladingiz");
        }
        
        saveToStorage();
    });

    // Fikrlar tugmasi bosilganda modalni ochish
    commentsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        // Fokusni fikr qoldirish maydoniga o'tkazish
        setTimeout(() => commentInput.focus(), 300);
    });

    // Modalni yopish
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    });

    // Modal tashqarisiga bosilganda yopish
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    });

    // Textarea avto kengayishi
    function adjustTextareaHeight() {
        commentInput.style.height = 'auto';
        commentInput.style.height = `${commentInput.scrollHeight}px`;
    }

    // Fikr qoldirish maydoni bo'sh bo'lsa, tugmani o'chirib qo'yish
    commentInput.addEventListener('input', () => {
        adjustTextareaHeight();
        if (commentInput.value.trim() !== '') {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    });

    // Enter tugmasi bilan fikr qo'shish (shift+enter yangi qator uchun)
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !submitBtn.disabled) {
            e.preventDefault();
            addComment();
        }
    });

    // Bekor qilish tugmasi
    cancelBtn.addEventListener('click', () => {
        commentInput.value = '';
        submitBtn.disabled = true;
        adjustTextareaHeight();
    });

    // Fikr qo'shish funksiyasi
    function addComment() {
        if (commentInput.value.trim() !== '') {
            // Yangi fikrni yaratish
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
                <div class="comment-avatar">S</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="comment-author">Siz</div>
                        <div class="comment-time">hozirgina</div>
                    </div>
                    <div class="comment-text">${commentInput.value}</div>
                    <div class="comment-actions">
                        <div class="comment-action">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span>0</span>
                        </div>
                        <div class="comment-reply">Javob berish</div>
                    </div>
                </div>
            `;
            
            // Yangi fikrni ro'yxatga qo'shish
            commentsList.prepend(newComment);
            commentsCount++;
            updateCounts();
            
            // Input maydonini tozalash
            commentInput.value = '';
            submitBtn.disabled = true;
            adjustTextareaHeight();
            
            // Fikr muvaffaqiyatli qo'shildi xabari
            showNotification("Fikringiz muvaffaqiyatli qo'shildi");
        }
    }

    // Fikr qo'shish tugmasi
    submitBtn.addEventListener('click', addComment);

    // Ulashish tugmasi logikasi
    document.getElementById('share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Ozoda - YANGI SHOU 2025 konsert dasturi',
                text: 'Ozoda - YANGI SHOU 2025 konsert dasturi | Eng yangi qo\'shiqlar',
                url: window.location.href,
            })
            .then(() => showNotification("Video muvaffaqiyatli ulashildi"))
            .catch((error) => showNotification("Ulashishda xatolik yuz berdi"));
        } else {
            // Fallback: URL ni clipboard ga nusxalash
            navigator.clipboard.writeText(window.location.href)
                .then(() => showNotification("Havola nusxalandi"))
                .catch(() => showNotification("Nusxalashda xatolik yuz berdi"));
        }
    });

    // Sahifa yuklanganda ma'lumotlarni yuklash
    loadFromStorage();
    updateCounts();
    adjustTextareaHeight();
    
    // Saqlash tugmasining holatini yuklash
    const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '{}');
    if (savedVideos['currentVideo']) {
        saveBtn.classList.add('active');
    }
});