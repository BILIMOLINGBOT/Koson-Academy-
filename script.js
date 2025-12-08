// Ma'lumotlar - Instagram uslubida
const comments = [
    {
        id: 1,
        author: 'aziz_mahmudov88',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        text: 'Azam aka vaqtni to\'g\'ri taqsimlaydilar.',
        time: '1w',
        likes: 24,
        liked: false,
        replies: []
    },
    {
        id: 2,
        author: 'fozilov_asilbekk',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
        text: 'Hozir @aziz_mahmudov88 yozadi "Azam aka yomon narsa tavsiya qilmaydi" deb',
        time: '2w',
        likes: 12,
        liked: false,
        replies: [
            {
                id: 3,
                author: 'fozilov_asilbekk',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                text: '@fozilov_asilbekk ayttimku yozadi deb',
                time: '1w',
                likes: 3,
                liked: false,
                replyTo: 'fozilov_asilbekk'
            }
        ],
        showReplies: true
    },
    {
        id: 4,
        author: 'abdulvahhob.saytolg',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80',
        text: 'Lekin ozom iPhone ishlataman, sizlar buni ishlatinglar',
        time: '2w',
        likes: 8,
        liked: true,
        replies: [
            {
                id: 5,
                author: 'javohirgroup_',
                avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80',
                text: 'Shapkezdan Pushtuqa o\'xshab qolibsiz',
                time: '1w',
                likes: 15,
                liked: false,
                replyTo: 'abdulvahhob.saytolg'
            }
        ],
        showReplies: true
    }
];

let heartCount = 12567;
let isHearted = false;
let isSaved = false;
let isSubscribed = false;
let currentReplyId = null;
let commentData = [...comments];

// Raqamlarni formatlash
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
}

// Vaqtni formatlash
function formatTime(time) {
    if (time.includes('w')) return time;
    if (time.includes('soat')) return time;
    if (time.includes('min')) return time;
    if (time === 'hozirgina') return 'hozir';
    return time;
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
    
    if (commentData.length === 0) {
        commentsList.style.display = 'none';
        noComments.style.display = 'flex';
    } else {
        commentsList.style.display = 'block';
        noComments.style.display = 'none';
        commentsList.innerHTML = '';
        
        commentData.forEach(comment => {
            const commentEl = createCommentElement(comment);
            commentsList.appendChild(commentEl);
        });
    }
    
    updateCounts();
}

// Fikr elementi yaratish
function createCommentElement(comment, isReply = false) {
    const div = document.createElement('div');
    div.className = isReply ? 'comment reply-comment' : 'comment';
    div.setAttribute('data-id', comment.id);
    
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
    const likeText = comment.likes > 0 ? formatNumber(comment.likes) : '';
    
    div.innerHTML = `
        <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-time">${formatTime(comment.time)}</div>
            </div>
            <div class="comment-text">${commentHTML}</div>
            <div class="comment-actions">
                <button class="comment-action comment-like ${comment.liked ? 'active' : ''}" data-id="${comment.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="${comment.liked ? '#ed4956' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    ${likeText}
                </button>
                ${!isReply ? `<button class="comment-reply" data-id="${comment.id}">Javob berish</button>` : ''}
            </div>
        </div>
    `;
    
    // Like tugmasi
    const likeBtn = div.querySelector('.comment-like');
    likeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCommentLike(comment.id, isReply);
    });
    
    // Javob berish funksiyalari (faqat asosiy fikrlar uchun)
    if (!isReply) {
        const replyBtn = div.querySelector('.comment-reply');
        replyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleReplyForm(comment.id);
        });
        
        // Javoblarni ko'rsatish
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            // View replies button
            if (comment.replies.length > 0 && !comment.showReplies) {
                const viewRepliesBtn = document.createElement('button');
                viewRepliesBtn.className = 'view-replies';
                viewRepliesBtn.innerHTML = `
                    <span>${comment.replies.length} javobni ko'rish</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                `;
                viewRepliesBtn.addEventListener('click', () => {
                    toggleReplies(comment.id);
                });
                
                const actionsDiv = div.querySelector('.comment-actions');
                actionsDiv.appendChild(viewRepliesBtn);
            }
            
            // Agar replylar ko'rsatilishi kerak bo'lsa
            if (comment.showReplies) {
                comment.replies.forEach(reply => {
                    const replyEl = createCommentElement(reply, true);
                    repliesContainer.appendChild(replyEl);
                });
                
                div.appendChild(repliesContainer);
                
                // Hide replies button
                const hideRepliesBtn = document.createElement('button');
                hideRepliesBtn.className = 'view-replies expanded';
                hideRepliesBtn.innerHTML = `
                    <span>Javoblarni yashirish</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                `;
                hideRepliesBtn.addEventListener('click', () => {
                    toggleReplies(comment.id);
                });
                
                const actionsDiv = div.querySelector('.comment-actions');
                actionsDiv.appendChild(hideRepliesBtn);
            }
        }
        
        // Javob berish formasi
        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.id = `reply-form-${comment.id}`;
        replyForm.innerHTML = `
            <div class="reply-input-wrapper">
                <input type="text" class="reply-input" placeholder="@${comment.author} ga javob yozing..." id="reply-input-${comment.id}">
                <button class="reply-send-btn" id="reply-btn-${comment.id}" disabled>Yuborish</button>
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
                });
                
                replyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && replyInput.value.trim()) {
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
        commentData.forEach(c => {
            if (c.replies) {
                const reply = c.replies.find(r => r.id === commentId);
                if (reply) {
                    reply.liked = !reply.liked;
                    reply.likes += reply.liked ? 1 : -1;
                    
                    // Animation
                    const likeBtn = document.querySelector(`[data-id="${commentId}"] .comment-like`);
                    if (likeBtn) {
                        likeBtn.classList.add('heart-animation');
                        setTimeout(() => {
                            likeBtn.classList.remove('heart-animation');
                        }, 300);
                    }
                }
            }
        });
    } else {
        const comment = commentData.find(c => c.id === commentId);
        if (comment) {
            comment.liked = !comment.liked;
            comment.likes += comment.liked ? 1 : -1;
            
            // Animation
            const likeBtn = document.querySelector(`[data-id="${commentId}"] .comment-like`);
            if (likeBtn) {
                likeBtn.classList.add('heart-animation');
                setTimeout(() => {
                    likeBtn.classList.remove('heart-animation');
                }, 300);
            }
        }
    }
    renderComments();
}

// Javoblarni ko'rsatish/yashirish
function toggleReplies(commentId) {
    const comment = commentData.find(c => c.id === commentId);
    if (comment) {
        comment.showReplies = !comment.showReplies;
        renderComments();
    }
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
    
    const comment = commentData.find(c => c.id === commentId);
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
        comment.showReplies = true;
        
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
        
        currentReplyId = null;
        
        // UI ni yangilash
        renderComments();
        showNotification('Javobingiz qo\'shildi');
        
        // Yangi javobni ko'rish uchun scroll qilish
        setTimeout(() => {
            const newReplyElement = document.querySelector(`[data-id="${newReply.id}"]`);
            if (newReplyElement) {
                newReplyElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        replies: [],
        showReplies: false
    };
    
    commentData.unshift(newComment);
    input.value = '';
    
    const commentSendBtn = document.getElementById('commentSendBtn');
    commentSendBtn.disabled = true;
    
    renderComments();
    showNotification('Fikringiz qo\'shildi');
}

// Hisoblagichlarni yangilash
function updateCounts() {
    const totalComments = commentData.reduce((total, comment) => {
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
        
        // Animation
        this.classList.add('heart-animation');
        setTimeout(() => {
            this.classList.remove('heart-animation');
        }, 300);
        
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
         