// Ma'lumotlar - rasmda ko'rsatilgan fikrlar
const comments = [
    {
        id: 1,
        author: 'aziz_mahmudov88',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        text: 'Azam aka vaqtni to\'g\'ri taqsimlaydilar.',
        time: '1 hafta',
        likes: 0,
        liked: false,
        replies: []
    },
    {
        id: 2,
        author: 'fozilov_asilbekk',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
        text: 'Hozir @aziz_mahmudov88 yozadi "Azam aka yomon narsa tavsiya qilmaydi" deb',
        time: '2 hafta',
        likes: 0,
        liked: false,
        replies: [
            {
                id: 3,
                author: 'fozilov_asilbekk',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                text: '@fozilov_asilbekk ayttimku yozadi deb',
                time: '1 hafta',
                likes: 0,
                liked: false,
                replyTo: 'fozilov_asilbekk'
            }
        ]
    },
    {
        id: 4,
        author: 'abdulvahhob.saytolg',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80',
        text: 'Lekin ozom iPhone ishlataman, sizlar buni ishlatinglar',
        time: '2 hafta',
        likes: 0,
        liked: false,
        replies: [
            {
                id: 5,
                author: 'javohirgroup_',
                avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80',
                text: 'Shapkezdan Pushtuqa o\'xshab qolibsiz',
                time: '1 hafta',
                likes: 0,
                liked: false,
                replyTo: 'abdulvahhob.saytolg'
            }
        ]
    }
];

let heartCount = 12000;
let isHearted = false;
let isSaved = false;
let isSubscribed = false;
let currentReplyId = null;

// Raqamlarni formatlash
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}

// Xabarnoma ko'rsatish
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Fikrlarni render qilish
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    const noComments = document.getElementById('no-comments-indicator');
    
    if (comments.length === 0) {
        commentsList.style.display = 'none';
        noComments.style.display = 'flex';
    } else {
        commentsList.style.display = 'block';
        noComments.style.display = 'none';
        commentsList.innerHTML = '';
        
        comments.forEach(comment => {
            const commentEl = createCommentElement(comment);
            commentsList.appendChild(commentEl);
        });
    }
    
    updateCounts();
}

// Fikr elementi yaratish
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
    
    // Like tugmasi matni
    const likeText = comment.likes > 0 ? comment.likes : '';
    
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
                    <span class="comment-like-count">${likeText}</span>
                </div>
                ${!isReply ? `<div class="comment-reply" data-id="${comment.id}">Javob berish</div>` : ''}
            </div>
        </div>
    `;
    
    // Like tugmasi
    const likeBtn = div.querySelector('.comment-like');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCommentLike(comment.id, isReply);
    });
    
    // Javob berish funksiyalari (faqat asosiy fikrlar uchun)
    if (!isReply) {
        const replyBtn = div.querySelector('.comment-reply');
        replyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleReplyForm(comment.id);
        });
        
        // Javoblarni ko'rsatish
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            comment.replies.forEach(reply => {
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
                    const hasText = replyInput.value.trim().length > 0;
                    replyBtn.disabled = !hasText;
                    
                    if (hasText) {
                        replyBtn.classList.add('active');
                    } else {
                        replyBtn.classList.remove('active');
                    }
                    
                    // Auto resize textarea
                    replyInput.style.height = 'auto';
                    replyInput.style.height = Math.min(replyInput.scrollHeight, 80) + 'px';
                });
                
                replyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey && replyInput.value.trim()) {
                        e.preventDefault();
                        addReply(comment.id, replyInput.value.trim(), comment.author);
                    }
                });
                
                replyBtn.addEventListener('click', () => {
                    if (replyInput.value.trim()) {
                        addReply(comment.id, replyInput.value.trim(), comment.author);
                    }
                });
                
                // Boshlang'ich holat
                replyBtn.disabled = true;
            }
        }, 0);
    }
    
    return div;
}

// Fikr like tugmasi
function toggleCommentLike(commentId, isReply) {
    if (isReply) {
        comments.forEach(c => {
            const reply = c.replies.find(r => r.id === commentId);
            if (reply) {
                reply.liked = !reply.liked;
                reply.likes += reply.liked ? 1 : -1;
            }
        });
    } else {
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
            comment.liked = !comment.liked;
            comment.likes += comment.liked ? 1 : -1;
        }
    }
    renderComments();
}

// Javob berish formasini ochish/yopish
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
            
            // Inputni focus qilish
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

// Javob qo'shish
function addReply(commentId, text, replyToAuthor) {
    if (!text || text.trim().length === 0) return;
    
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        const newReply = {
            id: Date.now(),
            author: 'Siz',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
            text: text.trim(),
            time: 'hozirgina',
            likes: 0,
            liked: false,
            replyTo: replyToAuthor
        };
        
        if (!comment.replies) {
            comment.replies = [];
        }
        
        // Javobni arrayga qo'shish
        comment.replies.push(newReply);
        
        // Reply formani yopish va inputni tozalash
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        const replyInput = document.getElementById(`reply-input-${commentId}`);
        
        if (replyForm) {
            replyForm.classList.remove('show');
        }
        
        if (replyInput) {
            replyInput.value = '';
            replyInput.style.height = 'auto';
            replyInput.dispatchEvent(new Event('input'));
        }
        
        currentReplyId = null;
        
        // UI ni yangilash
        renderComments();
        showNotification('Javobingiz qo\'shildi');
        
        // Yangi javobni ko'rish uchun scroll qilish
        setTimeout(() => {
            const newReplyElement = document.querySelector(`[data-reply-id="${newReply.id}"]`);
            if (newReplyElement) {
                newReplyElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                newReplyElement.classList.add('new-reply');
                
                // 3 sekunddan keyin animatsiya classini olib tashlash
                setTimeout(() => {
                    newReplyElement.classList.remove('new-reply');
                }, 3000);
            }
        }, 100);
    }
}

// Yangi fikr qo'shish
function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (!text || text.length === 0) return;
    
    const newComment = {
        id: Date.now(),
        author: 'Siz',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
        text: text,
        time: 'hozirgina',
        likes: 0,
        liked: false,
        replies: []
    };
    
    comments.unshift(newComment);
    input.value = '';
    input.style.height = 'auto';
    
    const commentSendBtn = document.getElementById('commentSendBtn');
    commentSendBtn.disabled = true;
    commentSendBtn.classList.remove('active');
    
    renderComments();
    showNotification('Fikringiz qo\'shildi');
}

// Hisoblagichlarni yangilash
function updateCounts() {
    const totalComments = comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);
    
    document.getElementById('comments-main-count').textContent = totalComments;
    document.getElementById('comments-modal-count').textContent = totalComments;
    document.getElementById('heart-count').textContent = formatNumber(heartCount);
}

// DOM elementlari
document.addEventListener('DOMContentLoaded', function() {
    // Yurak tugmasi
    document.getElementById('heart-btn').addEventListener('click', function() {
        isHearted = !isHearted;
        this.classList.toggle('active');
        heartCount += isHearted ? 1 : -1;
        updateCounts();
        showNotification(isHearted ? 'Yoqdi ❤️' : 'Yoqmadi');
    });
    
    // Saqlash tugmasi
    document.getElementById('save-btn').addEventListener('click', function() {
        isSaved = !isSaved;
        this.classList.toggle('active');
        showNotification(isSaved ? 'Saqlandi' : 'Saqlanganlardan o\'chirildi');
    });
    
    // Obuna tugmasi
    document.getElementById('subscribe-btn').addEventListener('click', function() {
        isSubscribed = !isSubscribed;
        this.textContent = isSubscribed ? 'Obuna bo\'lingan' : 'Obuna bo\'lish';
        this.classList.toggle('subscribed');
        showNotification(isSubscribed ? 'Obuna bo\'ldingiz' : 'Obuna bekor qilindi');
    });
    
    // Ulashish tugmasi
    document.getElementById('share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Ozoda - YANGI SHOU 2025 konsert dasturi',
                text: 'Ozoda - YANGI SHOU 2025 konsert dasturi | Eng yangi qo\'shiqlami tomosha qiling!',
                url: window.location.href,
            })
            .then(() => showNotification('Ulashildi'))
            .catch(() => {
                navigator.clipboard.writeText(window.location.href);
                showNotification('Havola nusxalandi');
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showNotification('Havola nusxalandi');
        }
    });
    
    // Fikrlar modal
    document.getElementById('comments-btn').addEventListener('click', () => {
        const modal = document.getElementById('commentsModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Modal ochilganda inputni focus qilish
        setTimeout(() => {
            document.getElementById('commentInput').focus();
        }, 300);
    });
    
    // Modalni yopish
    document.querySelector('.close-comments-btn').addEventListener('click', () => {
        const modal = document.getElementById('commentsModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    });
    
    // Modal tashqarisiga bosish
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('commentsModal');
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    });
    
    // Fikr input
    const commentInput = document.getElementById('commentInput');
    const commentSendBtn = document.getElementById('commentSendBtn');
    
    commentInput.addEventListener('input', () => {
        const hasText = commentInput.value.trim().length > 0;
        commentSendBtn.disabled = !hasText;
        
        if (hasText) {
            commentSendBtn.classList.add('active');
        } else {
            commentSendBtn.classList.remove('active');
        }
        
        // Auto resize textarea
        commentInput.style.height = 'auto';
        commentInput.style.height = Math.min(commentInput.scrollHeight, 120) + 'px';
    });
    
    commentSendBtn.addEventListener('click', addComment);
    
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (commentInput.value.trim()) {
                addComment();
            }
        }
    });
    
    // Boshlang'ich render
    renderComments();
    
    // Recommended videolarni bosiladigan qilish
    document.querySelectorAll('.recommended-video').forEach(video => {
        video.addEventListener('click', function() {
            const title = this.querySelector('.recommended-video-title').textContent;
            showNotification(`"${title}" videosini ochish`);
        });
    });
    
    // Escape tugmasi bilan modalni yopish
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('commentsModal');
            if (modal.style.display === 'block') {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }
    });
});