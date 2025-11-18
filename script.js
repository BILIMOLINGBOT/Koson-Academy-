document.addEventListener('DOMContentLoaded', () => {
    // Elementlarni tanlab olish
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const saveBtn = document.getElementById('save-btn');
    const commentsBtn = document.getElementById('comments-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const modal = document.getElementById('commentsModal');
    const closeBtn = document.querySelector('.close-btn');
    const commentInput = document.querySelector('.add-comment .comment-input');
    const submitBtn = document.querySelector('.add-comment .submit-btn');
    const commentsList = document.getElementById('commentsList');
    const commentsMainCount = document.getElementById('comments-main-count');
    const commentsModalCount = document.getElementById('comments-modal-count');
    const likeCountDisplay = document.getElementById('like-count');
    const dislikeCountDisplay = document.getElementById('dislike-count');

    // Boshlang'ich ma'lumotlar
    let likeCount = 12000;
    let dislikeCount = 2500;
    let commentsCount = 4; // Oldindan 4 ta fikr mavjud
    let userReaction = null;
    let isSubscribed = false;

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            likeCount,
            dislikeCount,
            commentsCount,
            userReaction,
            isSubscribed
        };
        localStorage.setItem('videoReactions', JSON.stringify(data));
    };

    // Ma'lumotlarni yuklash funksiyasi
    const loadFromStorage = () => {
        const savedData = localStorage.getItem('videoReactions');
        if (savedData) {
            const data = JSON.parse(savedData);
            likeCount = data.likeCount || likeCount;
            dislikeCount = data.dislikeCount || dislikeCount;
            commentsCount = data.commentsCount || commentsCount;
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
        commentsMainCount.textContent = commentsCount;
        commentsModalCount.textContent = commentsCount;
        
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

    // Like tugmasi logikasi
    likeBtn.addEventListener('click', () => {
        const wasActive = likeBtn.classList.contains('active');
        
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
    function adjustTextareaHeight(elem) {
        elem.style.height = 'auto';
        elem.style.height = `${elem.scrollHeight}px`;
    }

    // Fikr qoldirish maydoni bo'sh bo'lsa, tugmani o'chirib qo'yish
    commentInput.addEventListener('input', () => {
        adjustTextareaHeight(commentInput);
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

    // Fikr qo'shish funksiyasi
    function addComment() {
        if (commentInput.value.trim() !== '') {
            // Yangi fikrni yaratish
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerHTML = `
                <div class="add-comment-avatar">S</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="comment-author">Siz</div>
                        <div class="comment-time">hozirgina</div>
                    </div>
                    <div class="comment-text">${commentInput.value}</div>
                    <div class="comment-actions">
                        <div class="comment-action like">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            <span>0</span>
                        </div>
                        <div class="comment-action dislike">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
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
            adjustTextareaHeight(commentInput);
            
            // Fikr muvaffaqiyatli qo'shildi xabari
            showNotification("Fikringiz muvaffaqiyatli qo'shildi");
        }
    }

    // Fikr qo'shish tugmasi
    submitBtn.addEventListener('click', addComment);

    // Comment actions event delegation
    commentsList.addEventListener('click', (e) => {
        const action = e.target.closest('.comment-action');
        if (action) {
            const comment = action.closest('.comment');
            const isLike = action.classList.contains('like');
            const countSpan = action.querySelector('span');
            const wasActive = action.classList.contains('active');
            
            action.classList.toggle('active');
            
            let count = parseInt(countSpan.textContent);
            
            if (wasActive) {
                count--;
            } else {
                count++;
                
                // Remove from the other
                const otherClass = isLike ? 'dislike' : 'like';
                const otherAction = comment.querySelector(`.comment-action.${otherClass}`);
                if (otherAction.classList.contains('active')) {
                    otherAction.classList.remove('active');
                    const otherSpan = otherAction.querySelector('span');
                    let otherCount = parseInt(otherSpan.textContent);
                    otherCount--;
                    otherSpan.textContent = otherCount;
                }
            }
            
            countSpan.textContent = count;
        } else if (e.target.closest('.comment-reply')) {
            const replyTarget = e.target.closest('.comment-reply');
            const comment = replyTarget.closest('.comment');
            let replyContainer = comment.querySelector('.reply-container');
            
            if (!replyContainer) {
                replyContainer = document.createElement('div');
                replyContainer.className = 'reply-container';
                replyContainer.innerHTML = `
                    <div class="add-comment">
                        <div class="add-comment-avatar">S</div>
                        <div class="comment-input-container">
                            <textarea class="comment-input" placeholder="Javob bildiring..."></textarea>
                            <div class="comment-buttons">
                                <button class="comment-btn submit-btn" disabled>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                    Yuborish
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                comment.appendChild(replyContainer);
                
                const replyInput = replyContainer.querySelector('.comment-input');
                const replySubmit = replyContainer.querySelector('.submit-btn');
                
                replyInput.addEventListener('input', () => {
                    adjustTextareaHeight(replyInput);
                    replySubmit.disabled = replyInput.value.trim() === '';
                });
                
                replyInput.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter' && !ev.shiftKey && !replySubmit.disabled) {
                        ev.preventDefault();
                        addReply(comment, replyInput.value);
                        replyContainer.remove();
                    }
                });
                
                replySubmit.addEventListener('click', () => {
                    addReply(comment, replyInput.value);
                    replyContainer.remove();
                });
                
                setTimeout(() => replyInput.focus(), 100);
            }
        }
    });

    function addReply(parentComment, text) {
        if (text.trim() === '') return;
        
        const reply = document.createElement('div');
        reply.className = 'comment reply';
        reply.innerHTML = `
            <div class="add-comment-avatar">S</div>
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">Siz</div>
                    <div class="comment-time">hozirgina</div>
                </div>
                <div class="comment-text">${text}</div>
                <div class="comment-actions">
                    <div class="comment-action like">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>0</span>
                    </div>
                    <div class="comment-action dislike">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                        </svg>
                        <span>0</span>
                    </div>
                    <div class="comment-reply">Javob berish</div>
                </div>
            </div>
        `;
        
        parentComment.appendChild(reply);
        commentsCount++;
        updateCounts();
        showNotification("Javobingiz muvaffaqiyatli qo'shildi");
    }

    // Sahifa yuklanganda ma'lumotlarni yuklash
    loadFromStorage();
    updateCounts();
    adjustTextareaHeight(commentInput);
    
    // Saqlash tugmasining holatini yuklash
    const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '{}');
    if (savedVideos['currentVideo']) {
        saveBtn.classList.add('active');
    }
});