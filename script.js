// Ma'lumotlar
const comments = [
    {
        id: 1,
        author: 'Sanjar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        text: 'Juda zo\'r video bo\'libdi 👍',
        time: '2 soat avval',
        likes: 3,
        liked: false,
        replies: [
            {
                id: 11,
                author: 'Jasur',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                text: 'Ha, to\'g\'ri aytasiz',
                time: '1 soat avval',
                likes: 1,
                liked: false,
                replyTo: 'Sanjar'
            }
        ]
    },
    {
        id: 2,
        author: 'Malika',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80',
        text: 'Konsert juda chiroyli tashkil qilingan!',
        time: '5 soat avval',
        likes: 7,
        liked: false,
        replies: []
    }
];

let heartCount = 12000;
let isHearted = false;
let isSaved = false;
let isSubscribed = false;
let currentReplyId = null;
let replyingToComment = null;

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
    setupReplyMode();
}

// Fikr elementi yaratish
function createCommentElement(comment, isReply = false) {
    const div = document.createElement('div');
    div.className = isReply ? 'comment reply-comment' : 'comment';
    div.dataset.commentId = comment.id;
    
    const mentionText = comment.replyTo 
        ? `<span class="mention">@${comment.replyTo}</span> ${comment.text}` 
        : comment.text;
    
    div.innerHTML = `
        <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-time">${comment.time}</div>
            </div>
            <div class="comment-text">${mentionText}</div>
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
    
    // Javob berish funksiyalari
    if (!isReply) {
        const replyBtn = div.querySelector('.comment-reply');
        replyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startReplyMode(comment.id, comment.author);
        });
        
        // Javoblarni ko'rsatish
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            comment.replies.forEach(reply => {
                const replyEl = createCommentElement(reply, true);
                repliesContainer.appendChild(replyEl);
            });
            
            div.appendChild(repliesContainer);
        }
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

// Javob rejimini boshlash
function startReplyMode(commentId, authorName) {
    replyingToComment = { id: commentId, author: authorName };
    
    // Add-comment bo'limiga fokus
    const commentInput = document.getElementById('commentInput');
    const commentSection = document.querySelector('.comments-section');
    
    // Reply mode infosini qo'shish
    let replyModeInfo = document.querySelector('.reply-mode-info');
    if (!replyModeInfo) {
        replyModeInfo = document.createElement('div');
        replyModeInfo.className = 'reply-mode-info';
        replyModeInfo.innerHTML = `
            <div class="reply-to-text">Javob berilyapti: <span class="reply-to-name">@${authorName}</span></div>
            <button class="cancel-reply-btn">Bekor qilish</button>
        `;
        
        const addCommentSection = document.querySelector('.add-comment');
        commentSection.insertBefore(replyModeInfo, addCommentSection);
        
        // Bekor qilish tugmasi
        replyModeInfo.querySelector('.cancel-reply-btn').addEventListener('click', cancelReplyMode);
    }
    
    replyModeInfo.classList.add('show');
    document.querySelector('.comment-input-wrapper').classList.add('reply-mode');
    
    // Inputga fokus
    commentInput.placeholder = `@${authorName} ga javob yozing...`;
    commentInput.focus();
    
    // Scroll qilish
    commentSection.scrollTop = commentSection.scrollHeight;
}

// Javob rejimini bekor qilish
function cancelReplyMode() {
    replyingToComment = null;
    
    const replyModeInfo = document.querySelector('.reply-mode-info');
    if (replyModeInfo) {
        replyModeInfo.classList.remove('show');
        setTimeout(() => replyModeInfo.remove(), 300);
    }
    
    document.querySelector('.comment-input-wrapper').classList.remove('reply-mode');
    
    const commentInput = document.getElementById('commentInput');
    commentInput.placeholder = 'Fikr bildiring...';
    commentInput.value = '';
    document.getElementById('commentSendBtn').disabled = true;
    document.getElementById('commentSendBtn').classList.remove('active');
}

// Javob qo'shish (reply mode orqali)
function addReplyFromMainInput() {
    const commentInput = document.getElementById('commentInput');
    const text = commentInput.value.trim();
    
    if (!text || !replyingToComment) return;
    
    const comment = comments.find(c => c.id === replyingToComment.id);
    if (comment) {
        const newReply = {
            id: Date.now(),
            author: 'Siz',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
            text: text,
            time: 'hozirgina',
            likes: 0,
            liked: false,
            replyTo: replyingToComment.author
        };
        
        comment.replies.push(newReply);
        cancelReplyMode();
        renderComments();
        showNotification('Javobingiz qo\'shildi');
    }
}

// Yangi fikr qo'shish
function addComment() {
    const commentInput = document.getElementById('commentInput');
    const text = commentInput.value.trim();
    
    if (!text) return;
    
    // Agar reply mode bo'lsa
    if (replyingToComment) {
        addReplyFromMainInput();
        return;
    }
    
    // Yangi fikr qo'shish
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
    commentInput.value = '';
    document.getElementById('commentSendBtn').disabled = true;
    document.getElementById('commentSendBtn').classList.remove('active');
    renderComments();
    showNotification('Fikringiz qo\'shildi');
}

// Reply mode sozlamalari
function setupReplyMode() {
    const commentInput = document.getElementById('commentInput');
    const commentSendBtn = document.getElementById('commentSendBtn');
    
    commentInput.addEventListener('input', () => {
        commentSendBtn.disabled = !commentInput.value.trim();
        if (commentInput.value.trim()) {
            commentSendBtn.classList.add('active');
        } else {
            commentSendBtn.classList.remove('active');
        }
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
}

// Hisoblagichlarni yangilash
function updateCounts() {
    // Barcha fikrlarni hisoblash (asosiy fikrlar + javoblar)
    let totalComments = comments.length;
    comments.forEach(comment => {
        totalComments += comment.replies.length;
    });
    
    document.getElementById('comments-main-count').textContent = totalComments;
    document.getElementById('comments-modal-count').textContent = totalComments;
    document.getElementById('heart-count').textContent = formatNumber(heartCount);
}

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
    showNotification('Havola nusxalandi');
});

// Fikrlar modal
document.getElementById('comments-btn').addEventListener('click', () => {
    const modal = document.getElementById('commentsModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    setTimeout(() => document.getElementById('commentInput').focus(), 100);
});

// Modalni yopish
document.querySelector('.close-comments-btn').addEventListener('click', () => {
    const modal = document.getElementById('commentsModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
    cancelReplyMode();
});

// Modal tashqarisiga bosish
window.addEventListener('click', (e) => {
    const modal = document.getElementById('commentsModal');
    if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
        cancelReplyMode();
    }
});

// Boshlang'ich render
renderComments();