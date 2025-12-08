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
function createCommentElement(comment, isReply = false) {
    const div = document.createElement('div');
    div.className = isReply ? 'comment reply-comment' : 'comment';
    
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
        replyBtn.addEventListener('click', () => toggleReplyForm(comment.id));
        
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
            document.querySelectorAll('.reply-form').forEach(f => f.classList.remove('show'));
            replyForm.classList.add('show');
            currentReplyId = commentId;
            setTimeout(() => {
                document.getElementById(`reply-input-${commentId}`).focus();
            }, 100);
        }
    }
}

// Javob qo'shish
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
        
        comment.replies.push(newReply);
        currentReplyId = null;
        renderComments();
        showNotification('Javobingiz qo\'shildi');
    }
}

// Yangi fikr qo'shish
function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (!text) return;
    
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
    document.getElementById('commentSendBtn').disabled = true;
    document.getElementById('commentSendBtn').classList.remove('active');
    renderComments();
    showNotification('Fikringiz qo\'shildi');
}

// Hisoblagichlarni yangilash
function updateCounts() {
    document.getElementById('comments-main-count').textContent = comments.length;
    document.getElementById('comments-modal-count').textContent = comments.length;
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

// Boshlang'ich render
renderComments();