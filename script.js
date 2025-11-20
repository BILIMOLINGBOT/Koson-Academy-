document.addEventListener('DOMContentLoaded', () => {
    // Elementlarni tanlab olish
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
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
    const likeCountDisplay = document.getElementById('like-count');
    const dislikeCountDisplay = document.getElementById('dislike-count');
    
    // Boshlang'ich ma'lumotlar
    let likeCount = 12000;
    let dislikeCount = 2500;
    let commentsCount = 0;
    let userReaction = null;
    let isSubscribed = false;
    let commentsData = [];

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            likeCount,
            dislikeCount,
            userReaction,
            isSubscribed
        };
        localStorage.setItem('videoReactions', JSON.stringify(data));
        localStorage.setItem('commentsData', JSON.stringify(commentsData));
    };

    // Ma'lumotlarni yuklash funksiyasi
    const loadFromStorage = () => {
        const savedData = localStorage.getItem('videoReactions');
        if (savedData) {
            const data = JSON.parse(savedData);
            likeCount = data.likeCount || likeCount;
            dislikeCount = data.dislikeCount || dislikeCount;
            userReaction = data.userReaction || null;
            isSubscribed = data.isSubscribed || false;
            
            // Foydalanuvchi reaktsiyasini ko'rsatish
            if (userReaction === 'like') {
                likeBtn.classList.add('active');
            } else if (userReaction === 'dislike') {
                dislikeBtn.classList.add('active');
            }
            
            // Obuna holatini ko'rsatish
            if (isSubscribed) {
                subscribeBtn.textContent = "Obuna bo'lingan";
                subscribeBtn.classList.add('subscribed');
            }
        }
        
        // Fikrlarni yuklash
        const savedComments = localStorage.getItem('commentsData');
        if (savedComments) {
            commentsData = JSON.parse(savedComments);
        }
        
        commentsCount = commentsData.length;
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
        likeCountDisplay.textContent = formatNumber(likeCount);
        dislikeCountDisplay.textContent = formatNumber(dislikeCount);
        
        commentsCount = commentsData.length; // Fikrlar sonini yangilash
        commentsMainCount.textContent = commentsCount;
        commentsModalCount.textContent = commentsCount;

        // Fikrlar ro'yxati va "fikrlar yo'q" xabarini boshqarish
        if (commentsCount > 0) {
            noCommentsIndicator.style.display = 'none';
            commentsList.style.display = 'block';
            renderComments(); // Fikrlarni qayta chizish
        } else {
            noCommentsIndicator.style.display = 'flex';
            commentsList.style.display = 'none';
        }
        
        // Ma'lumotlarni saqlash
        saveToStorage();
    }
    
    // Xabarlarni ko'rsatish funksiyasi (oldingidek qoldi)
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
    
    // ----------------------------------------------------
    // Fikrlar mantiqi: Like/Dislike, Javob berish
    // ----------------------------------------------------

    // Fikrni HTML elementiga aylantirish
    function createCommentElement(comment, isReply = false) {
        const commentDiv = document.createElement('div');
        commentDiv.className = isReply ? 'comment reply' : 'comment';
        
        // Vaqtni formatlash (soddalashtirilgan)
        const timeElapsed = 'hozirgina';
        
        commentDiv.innerHTML = `
            <div class="comment-avatar">${comment.author[0]}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-time">${timeElapsed}</div>
                </div>
                <div class="comment-text">${comment.text.replace(/\n/g, '<br>')}</div>
                <div class="comment-actions">
                    <div class="comment-action like-comment-btn" data-comment-id="${comment.id}" data-action="like" data-is-reply="${isReply}">
                        <svg class="like-icon-svg ${comment.userReaction === 'like' ? 'liked' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>${comment.likes}</span>
                    </div>
                    <div class="comment-action dislike-comment-btn" data-comment-id="${comment.id}" data-action="dislike" data-is-reply="${isReply}">
                        <svg class="${comment.userReaction === 'dislike' ? 'liked' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                        </svg>
                    </div>
                    <div class="comment-reply reply-btn" data-comment-id="${comment.id}" data-is-reply="${isReply ? 'true' : 'false'}">Javob berish</div>
                </div>
                <div class="reply-container" data-comment-id="${comment.id}">
                    </div>
                <div class="replies-list" data-comment-id="${comment.id}">
                    </div>
            </div>
        `;
        
        // Javoblarni qo'shish
        if (comment.replies && comment.replies.length > 0) {
            const repliesList = commentDiv.querySelector('.replies-list');
            comment.replies.forEach(reply => {
                repliesList.appendChild(createCommentElement(reply, true));
            });
        }
        
        return commentDiv;
    }

    // Barcha fikrlarni ro'yxatda ko'rsatish
    function renderComments() {
        commentsList.innerHTML = ''; // Ro'yxatni tozalash
        
        commentsData.forEach(comment => {
            commentsList.appendChild(createCommentElement(comment));
        });
        
        attachCommentEventListeners();
    }
    
    // Fikr tugmalariga hodisa tinglovchilarni biriktirish
    function attachCommentEventListeners() {
        // Like/Dislike tugmalari
        document.querySelectorAll('.like-comment-btn, .dislike-comment-btn').forEach(btn => {
            btn.removeEventListener('click', handleCommentReaction); // Oldingi tinglovchilarni olib tashlash
            btn.addEventListener('click', handleCommentReaction);
        });

        // Javob berish tugmasi
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.removeEventListener('click', handleReplyClick); // Oldingi tinglovchilarni olib tashlash
            btn.addEventListener('click', handleReplyClick);
        });
    }

    // Fikrga Like/Dislike berish mantiqi
    function handleCommentReaction(e) {
        const btn = e.currentTarget;
        const commentId = parseInt(btn.dataset.commentId);
        const action = btn.dataset.action;
        
        // Fikrni topish (oddiy qilib, asosiy fikrlar ichidan)
        const comment = commentsData.find(c => c.id === commentId) || 
                        commentsData.flatMap(c => c.replies || []).find(r => r.id === commentId);

        if (!comment) return;

        const currentReaction = comment.userReaction;

        if (currentReaction === action) {
            // Olib tashlash
            comment.userReaction = null;
            if (action === 'like') comment.likes--;
            showNotification(`${action === 'like' ? "Like" : "Dislike"} olib tashlandi`);
        } else {
            // Qo'shish
            if (action === 'like') {
                comment.likes++;
                if (currentReaction === 'dislike') {
                    // Dislike ni olib tashlash
                }
            } else if (action === 'dislike') {
                if (currentReaction === 'like') {
                    comment.likes--;
                }
            }
            comment.userReaction = action;
            showNotification(`${action === 'like' ? "Like" : "Dislike"} qo'shildi`);
        }
        
        // Agar dislike berilsa, likeni, va aksincha, olib tashlaymiz (YouTube mantiqiga o'xshash)
        if (action === 'like' && currentReaction === 'dislike') {
            comment.userReaction = 'like';
        } else if (action === 'dislike' && currentReaction === 'like') {
            comment.userReaction = 'dislike';
        }

        updateCounts(); // Ma'lumotlarni saqlash va qayta chizish
    }

    // Javob berish tugmasi bosilganda
    function handleReplyClick(e) {
        const btn = e.currentTarget;
        const commentId = parseInt(btn.dataset.commentId);
        const replyContainer = document.querySelector(`.reply-container[data-comment-id="${commentId}"]`);

        // Agar javob berish maydoni allaqachon mavjud bo'lsa, uni yopish
        if (replyContainer.innerHTML.trim() !== '') {
            replyContainer.innerHTML = '';
            return;
        }

        // Boshqa barcha ochiq javob berish maydonlarini yopish
        document.querySelectorAll('.reply-container').forEach(container => {
            if (parseInt(container.dataset.commentId) !== commentId) {
                container.innerHTML = '';
            }
        });

        // Javob berish maydonini yaratish
        const replyInputHTML = `
            <div class="reply-input-container add-comment">
                <div class="add-comment-avatar">J</div>
                <div class="comment-input-container">
                    <textarea class="comment-input reply-input" placeholder="Javob bildiring..." data-parent-id="${commentId}"></textarea>
                    <div class="comment-buttons">
                        <button class="comment-btn cancel-reply-btn">Bekor qilish</button>
                        <button class="comment-btn submit-reply-btn" data-parent-id="${commentId}" disabled>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                            Javob
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        replyContainer.innerHTML = replyInputHTML;
        const newReplyInput = replyContainer.querySelector('.reply-input');
        const submitReplyBtn = replyContainer.querySelector('.submit-reply-btn');
        const cancelReplyBtn = replyContainer.querySelector('.cancel-reply-btn');

        // Textarea balandligini sozlash
        newReplyInput.addEventListener('input', () => {
            adjustTextareaHeight(newReplyInput);
            submitReplyBtn.disabled = newReplyInput.value.trim() === '';
        });

        // Javobni bekor qilish
        cancelReplyBtn.addEventListener('click', () => {
            replyContainer.innerHTML = '';
        });

        // Javobni yuborish
        submitReplyBtn.addEventListener('click', () => {
            const parentId = parseInt(submitReplyBtn.dataset.parentId);
            const replyText = newReplyInput.value.trim();
            if (replyText) {
                addReply(parentId, replyText);
                replyContainer.innerHTML = ''; // Maydonni yopish
            }
        });

        // Fokusni javob maydoniga o'tkazish
        newReplyInput.focus();
    }

    // Javob qo'shish mantiqi
    function addReply(parentId, replyText) {
        const parentComment = commentsData.find(c => c.id === parentId);
        if (!parentComment) return;

        if (!parentComment.replies) {
            parentComment.replies = [];
        }

        const newReply = {
            id: Date.now(),
            author: "Siz (Javob)",
            text: replyText,
            likes: 0,
            userReaction: null
        };
        
        parentComment.replies.push(newReply);
        
        updateCounts();
        showNotification("Javobingiz qo'shildi");
    }

    // ----------------------------------------------------
    // Asosiy Video Actions (oldingidek qoldi)
    // ----------------------------------------------------

    // Like tugmasi logikasi
    likeBtn.addEventListener('click', () => {
        const wasActive = likeBtn.classList.contains('active');
        // ... (oldingidek)
        if (wasActive) {
            // Like olib tashlanmoqda
            likeBtn.classList.remove('active');
            likeCount--;
            userReaction = null;
            showNotification("Siz like ni olib tashladingiz");
        } else {
            // Like qo'shilmoqda
            likeBtn.classList.add('active');
            likeCount++;
            
            // Agar dislike aktiv bo'lsa, uni olib tashlash
            if (dislikeBtn.classList.contains('active')) {
                dislikeBtn.classList.remove('active');
                dislikeCount--;
            }
            
            userReaction = 'like';
            showNotification("Siz videoni like qildingiz");
        }
        updateCounts();
    });

    // Dislike tugmasi logikasi
    dislikeBtn.addEventListener('click', () => {
        const wasActive = dislikeBtn.classList.contains('active');
        // ... (oldingidek)
        if (wasActive) {
            // Dislike olib tashlanmoqda
            dislikeBtn.classList.remove('active');
            dislikeCount--;
            userReaction = null;
            showNotification("Siz dislike ni olib tashladingiz");
        } else {
            // Dislike qo'shilmoqda
            dislikeBtn.classList.add('active');
            dislikeCount++;
            
            // Agar like aktiv bo'lsa, uni olib tashlash
            if (likeBtn.classList.contains('active')) {
                likeBtn.classList.remove('active');
                likeCount--;
            }
            
            userReaction = 'dislike';
            showNotification("Siz videoni dislike qildingiz");
        }
        updateCounts();
    });

    // Saqlash tugmasi logikasi (oldingidek qoldi)
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

    // Obuna bo'lish tugmasi logikasi (oldingidek qoldi)
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

    // Fikrlar tugmasi bosilganda modalni ochish (oldingidek qoldi)
    commentsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        // Fokusni fikr qoldirish maydoniga o'tkazish
        setTimeout(() => commentInput.focus(), 300);
    });

    // Modalni yopish (oldingidek qoldi)
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    });

    // Modal tashqarisiga bosilganda yopish (oldingidek qoldi)
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
    function adjustTextareaHeight(textarea = commentInput) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Asosiy Fikr qoldirish maydoni
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

    // Asosiy Fikr qo'shish funksiyasi
    function addComment() {
        if (commentInput.value.trim() !== '') {
            const newComment = {
                id: Date.now(),
                author: "Siz",
                text: commentInput.value,
                likes: 0,
                userReaction: null,
                replies: []
            };
            
            commentsData.unshift(newComment); // Yangi fikrni boshiga qo'shish
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

    // Sahifa yuklanganda ma'lumotlarni yuklash
    loadFromStorage();
    updateCounts();
    adjustTextareaHeight();
    
    // Saqlash tugmasining holatini yuklash (oldingidek qoldi)
    const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '{}');
    if (savedVideos['currentVideo']) {
        saveBtn.classList.add('active');
    }
});