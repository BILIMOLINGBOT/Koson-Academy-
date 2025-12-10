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
    let currentReplyTo = null; // Javob berilayotgan fikr ID

    // Fikrlar bazasi
    let comments = [];

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            heartCount,
            commentsCount,
            isHearted,
            isSubscribed,
            comments: comments
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
            comments = data.comments || [];
            
            // Foydalanuvchi reaktsiyasini ko'rsatish
            if (isHearted) {
                heartBtn.classList.add('active');
            }
            
            // Obuna holatini ko'rsatish
            if (isSubscribed) {
                subscribeBtn.textContent = "Obuna bo'lingan";
                subscribeBtn.classList.add('subscribed');
            }
            
            // Fikrlarni yuklash
            if (comments.length > 0) {
                renderComments();
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

    // Fikrni HTML ga aylantirish
    function createCommentHTML(comment, isReply = false) {
        const timeAgo = getTimeAgo(comment.timestamp);
        
        return `
            <div class="comment ${isReply ? 'reply' : ''}" data-id="${comment.id}">
                <div class="comment-avatar">${comment.author.charAt(0).toUpperCase()}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-time">${timeAgo}</div>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <div class="comment-action ${comment.isLiked ? 'active' : ''}" data-action="like">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${comment.isLiked ? '#ff0000' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="like-count">${comment.likes}</span>
                        </div>
                        <div class="comment-reply" data-action="reply">Javob berish</div>
                    </div>
                    
                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="replies-container">
                            ${comment.replies.map(reply => createCommentHTML(reply, true)).join('')}
                        </div>
                    ` : ''}
                    
                    ${currentReplyTo === comment.id ? `
                        <div class="reply-input-container">
                            <textarea class="reply-input" placeholder="Javobingizni yozing..."></textarea>
                            <div class="reply-buttons">
                                <button class="cancel-reply-btn comment-btn cancel-btn">Bekor qilish</button>
                                <button class="submit-reply-btn comment-btn submit-btn has-text">
                                    <div class="up-arrow-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="12" y1="19" x2="12" y2="5"></line>
                                            <polyline points="5 12 12 5 19 12"></polyline>
                                        </svg>
                                    </div>
                                    Javob yuborish
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Vaqtni hisoblash (hozirgina, 5 daqiqa oldin, 1 kun oldin, ...)
    function getTimeAgo(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "hozirgina";
        if (diffMins < 60) return `${diffMins} daqiqa oldin`;
        if (diffHours < 24) return `${diffHours} soat oldin`;
        if (diffDays < 7) return `${diffDays} kun oldin`;
        return `${Math.floor(diffDays / 7)} hafta oldin`;
    }

    // Fikrlarni ekranga chiqarish
    function renderComments() {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            commentsList.innerHTML += createCommentHTML(comment);
        });
        
        // Event listenerlarni qayta bog'lash
        attachCommentListeners();
    }

    // Comment event listenerlarni biriktirish
    function attachCommentListeners() {
        // Like tugmalari
        document.querySelectorAll('.comment-action[data-action="like"]').forEach(btn => {
            btn.addEventListener('click', handleLike);
        });
        
        // Reply tugmalari
        document.querySelectorAll('.comment-reply[data-action="reply"]').forEach(btn => {
            btn.addEventListener('click', handleReplyClick);
        });
        
        // Cancel reply tugmalari
        document.querySelectorAll('.cancel-reply-btn').forEach(btn => {
            btn.addEventListener('click', cancelReply);
        });
        
        // Submit reply tugmalari
        document.querySelectorAll('.submit-reply-btn').forEach(btn => {
            btn.addEventListener('click', submitReply);
        });
        
        // Reply inputlar
        document.querySelectorAll('.reply-input').forEach(input => {
            input.addEventListener('input', adjustReplyHeight);
            input.addEventListener('keydown', handleReplyKeydown);
        });
    }

    // Like bosilganda
    function handleLike(e) {
        const likeBtn = e.currentTarget;
        const commentElement = likeBtn.closest('.comment');
        const commentId = commentElement.dataset.id;
        const likeCountElement = likeBtn.querySelector('.like-count');
        
        // Fikrni topish
        let comment = findCommentById(commentId, comments);
        if (!comment) {
            // Javob bo'lishi mumkin
            comment = findReplyById(commentId, comments);
        }
        
        if (comment) {
            comment.isLiked = !comment.isLiked;
            comment.likes += comment.isLiked ? 1 : -1;
            
            // UI ni yangilash
            if (comment.isLiked) {
                likeBtn.classList.add('active');
                likeBtn.querySelector('svg').setAttribute('fill', '#ff0000');
            } else {
                likeBtn.classList.remove('active');
                likeBtn.querySelector('svg').setAttribute('fill', 'none');
            }
            likeCountElement.textContent = comment.likes;
            
            // Saqlash
            saveToStorage();
            
            // Notification
            showNotification(comment.isLiked ? "Fikrga like qo'ydingiz ❤️" : "Like olib tashlandi");
        }
    }

    // Reply bosilganda
    function handleReplyClick(e) {
        const replyBtn = e.currentTarget;
        const commentElement = replyBtn.closest('.comment');
        const commentId = commentElement.dataset.id;
        
        // Boshqa reply ni yopish
        if (currentReplyTo && currentReplyTo !== commentId) {
            const prevComment = document.querySelector(`.comment[data-id="${currentReplyTo}"]`);
            if (prevComment) {
                const prevReplyContainer = prevComment.querySelector('.reply-input-container');
                if (prevReplyContainer) {
                    prevReplyContainer.remove();
                }
            }
        }
        
        // Agar reply allaqachon ochiq bo'lsa, yopish
        if (currentReplyTo === commentId) {
            cancelReply();
            return;
        }
        
        // Yangi reply container qo'shish
        const existingContainer = commentElement.querySelector('.reply-input-container');
        if (!existingContainer) {
            const replyContainerHTML = `
                <div class="reply-input-container">
                    <textarea class="reply-input" placeholder="Javobingizni yozing..."></textarea>
                    <div class="reply-buttons">
                        <button class="cancel-reply-btn comment-btn cancel-btn">Bekor qilish</button>
                        <button class="submit-reply-btn comment-btn submit-btn has-text">
                            <div class="up-arrow-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </div>
                            Javob yuborish
                        </button>
                    </div>
                </div>
            `;
            
            const commentContent = commentElement.querySelector('.comment-content');
            const repliesContainer = commentContent.querySelector('.replies-container');
            if (repliesContainer) {
                repliesContainer.insertAdjacentHTML('afterend', replyContainerHTML);
            } else {
                commentContent.querySelector('.comment-actions').insertAdjacentHTML('afterend', replyContainerHTML);
            }
            
            currentReplyTo = commentId;
            
            // Focus input
            setTimeout(() => {
                const replyInput = commentElement.querySelector('.reply-input');
                if (replyInput) {
                    replyInput.focus();
                    // Event listener qo'shish
                    replyInput.addEventListener('input', adjustReplyHeight);
                    replyInput.addEventListener('keydown', handleReplyKeydown);
                    
                    // Submit button event listener
                    const submitBtn = commentElement.querySelector('.submit-reply-btn');
                    if (submitBtn) {
                        submitBtn.addEventListener('click', submitReply);
                    }
                    
                    // Cancel button event listener
                    const cancelBtn = commentElement.querySelector('.cancel-reply-btn');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', cancelReply);
                    }
                }
            }, 10);
        }
    }

    // Reply input height
    function adjustReplyHeight() {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    }

    // Reply keydown
    function handleReplyKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const submitBtn = this.closest('.reply-input-container').querySelector('.submit-reply-btn');
            if (submitBtn && !submitBtn.disabled) {
                submitReply.call(submitBtn);
            }
        }
    }

    // Reply yuborish
    function submitReply() {
        const replyContainer = this.closest('.reply-input-container');
        const replyInput = replyContainer.querySelector('.reply-input');
        const text = replyInput.value.trim();
        
        if (text) {
            const commentElement = replyContainer.closest('.comment');
            const commentId = commentElement.dataset.id;
            
            // Fikrni topish
            let comment = findCommentById(commentId, comments);
            
            if (comment) {
                // Yangi javob
                const newReply = {
                    id: generateId(),
                    author: "Siz",
                    text: text,
                    timestamp: new Date().toISOString(),
                    likes: 0,
                    isLiked: false,
                    parentId: commentId
                };
                
                // Javoblar ro'yxatini yaratish/yangilash
                if (!comment.replies) {
                    comment.replies = [];
                }
                comment.replies.push(newReply);
                
                // UI ni yangilash
                renderComments();
                
                // Notification
                showNotification("Javobingiz muvaffaqiyatli qo'shildi");
                
                // Reply ni yopish
                currentReplyTo = null;
                
                // Inputni tozalash
                replyInput.value = '';
            }
        }
    }

    // Reply ni bekor qilish
    function cancelReply() {
        const replyContainer = document.querySelector('.reply-input-container');
        if (replyContainer) {
            replyContainer.remove();
            currentReplyTo = null;
        }
    }

    // ID generator
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Comment topish
    function findCommentById(id, commentsArray) {
        for (let comment of commentsArray) {
            if (comment.id === id) return comment;
            if (comment.replies && comment.replies.length > 0) {
                const found = findCommentById(id, comment.replies);
                if (found) return found;
            }
        }
        return null;
    }

    // Reply topish
    function findReplyById(id, commentsArray) {
        for (let comment of commentsArray) {
            if (comment.replies && comment.replies.length > 0) {
                for (let reply of comment.replies) {
                    if (reply.id === id) return reply;
                }
            }
        }
        return null;
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
            // Yangi fikr
            const newComment = {
                id: generateId(),
                author: "Siz",
                text: commentInput.value,
                timestamp: new Date().toISOString(),
                likes: 0,
                isLiked: false,
                replies: []
            };
            
            // Fikrlar ro'yxatiga qo'shish
            comments.unshift(newComment);
            commentsCount++;
            
            // UI ni yangilash
            renderComments();
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