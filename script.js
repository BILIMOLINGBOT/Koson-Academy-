// Javob qo'shish - yangilangan versiya
function addReply(commentId, text, replyToAuthor) {
    if (!text) return;
    
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        const newReply = {
            id: Date.now(),
            author: 'Siz',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
            text: text,
            time: 'hozirgina',
            likes: 0,
            liked: false,
            replyTo: replyToAuthor
        };
        
        if (!comment.replies) {
            comment.replies = [];
        }
        
        comment.replies.push(newReply);
        currentReplyId = null;
        
        // Reply formani yopish va inputni tozalash
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        const replyInput = document.getElementById(`reply-input-${commentId}`);
        
        if (replyForm) {
            replyForm.classList.remove('show');
        }
        
        if (replyInput) {
            replyInput.value = '';
            replyInput.dispatchEvent(new Event('input'));
        }
        
        renderComments();
        showNotification('Javobingiz qo\'shildi');
        
        // Yangi javobni ko'rish uchun scroll qilish
        setTimeout(() => {
            const newReplyElement = document.querySelector(`[data-reply-id="${newReply.id}"]`);
            if (newReplyElement) {
                newReplyElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }
}

// Fikr elementi yaratish - yangilangan versiya
function createCommentElement(comment, isReply = false, parentCommentId = null) {
    const div = document.createElement('div');
    div.className = isReply ? 'comment reply-comment' : 'comment';
    
    // Elementga ID qo'shamiz
    if (comment.id) {
        div.setAttribute('data-comment-id', comment.id);
        if (isReply) {
            div.setAttribute('data-reply-id', comment.id);
        }
    }
    
    // Mentionni alohida ajratish
    let commentHTML = comment.text;
    
    // Agar fikrda @username bo'lsa, uni alohida ajratish
    if (comment.text.includes('@')) {
        const parts = comment.text.split(/(@\w+)/g);
        commentHTML = parts.map(part => {
            if (part.startsWith('@')) {
                return `<span class="mention">${part}</span>`;
            }
            return part;
        }).join('');
    }
    
    // Agar replyTo bo'lsa
    if (comment.replyTo) {
        commentHTML = `<span class="mention">@${comment.replyTo}</span> ${commentHTML}`;
    }
    
    div.innerHTML = `
        <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-time">${comment.time}${comment.time.includes('avval') ? '' : ' avval'}</div>
            </div>
            <div class="comment-text">${commentHTML}</div>
            <div class="comment-actions">
                <div class="comment-action comment-like ${comment.liked ? 'active' : ''}" data-id="${comment.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${comment.liked ? '#ff0000' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>${comment.likes}</span>
                </div>
                ${!isReply ? `<div class="comment-reply" data-id="${comment.id}">Javob berish</div>` : ''}
            </div>
        </div>
    `;
    
    // Like tugmasi
    const likeBtn = div.querySelector('.comment-like');
    likeBtn.addEventListener('click', () => toggleCommentLike(comment.id, isReply));
    
    // Javob berish funksiyalari (faqat asosiy fikrlar uchun)
    if (!isReply) {
        const replyBtn = div.querySelector('.comment-reply');
        replyBtn.addEventListener('click', () => toggleReplyForm(comment.id));
        
        // Javoblarni ko'rsatish
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            // Javoblarni saralash (eng yangisi pastda)
            const sortedReplies = [...comment.replies].sort((a, b) => {
                // Agar vaqt "hozirgina" bo'lsa, uni eng pastda ko'rsatish
                if (a.time === 'hozirgina') return 1;
                if (b.time === 'hozirgina') return -1;
                return 0;
            });
            
            sortedReplies.forEach(reply => {
                const replyEl = createCommentElement(reply, true, comment.id);
                repliesContainer.appendChild(replyEl);
            });
            
            div.appendChild(repliesContainer);
        }
        
        // Javob berish formasi
        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.id = `reply-form-${comment.id}`;
        replyForm.innerHTML = `
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80" alt="You" class="add-comment-avatar" style="width: 32px; height: 32px;">
            <div class="comment-input-container" style="flex: 1; position: relative;">
                <div class="reply-input-wrapper">
                    <textarea class="reply-input" placeholder="@${comment.author} ga javob yozing..." id="reply-input-${comment.id}"></textarea>
                    <button class="reply-send-btn" id="reply-btn-${comment.id}" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        div.appendChild(replyForm);
        
        // Javob input hodisalari
        setTimeout(() => {
            const replyInput = document.getElementById(`reply-input-${comment.id}`);
            const replyBtn = document.getElementById(`reply-btn-${comment.id}`);
            
            if (replyInput && replyBtn) {
                replyInput.addEventListener('input', () => {
                    replyBtn.disabled = !replyInput.value.trim();
                    if (replyInput.value.trim()) {
                        replyBtn.classList.add('active');
                    } else {
                        replyBtn.classList.remove('active');
                    }
                });
                
                replyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey && replyInput.value.trim()) {
                        e.preventDefault();
                        addReply(comment.id, replyInput.value.trim(), comment.author);
                    }
                });
                
                replyBtn.addEventListener('click', () => {
                    addReply(comment.id, replyInput.value.trim(), comment.author);
                });
            }
        }, 0);
    }
    
    return div;
}

// Javob berish formasini ochish/yopish - yangilangan versiya
function toggleReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        if (currentReplyId === commentId) {
            replyForm.classList.remove('show');
            currentReplyId = null;
        } else {
            // Barcha boshqa reply formalarni yopish
            document.querySelectorAll('.reply-form').forEach(f => f.classList.remove('show'));
            
            // Tanlangan reply formani ochish
            replyForm.classList.add('show');
            currentReplyId = commentId;
            
            // Inputni focus qilish va tozalash
            setTimeout(() => {
                const input = document.getElementById(`reply-input-${commentId}`);
                if (input) {
                    input.focus();
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                    
                    // Inputni ko'rish uchun scroll qilish
                    input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }
    }
}

// Javoblarni ko'rish uchun CSS o'zgartirish