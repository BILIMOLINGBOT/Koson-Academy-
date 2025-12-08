// Ma'lumotlar
const comments = [
    {
        id: 1,
        author: 'Sanjar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
        text: 'Juda zo\'r video bo\'libdi',
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
        replies: [
            {
                id: 21,
                author: 'Siz',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
                text: 'Milliy',
                time: 'hozirgina',
                likes: 0,
                liked: false,
                replyTo: 'Malika'
            }
        ]
    }
];

let heartCount = 12000;
let isHearted = false;
let isSaved = false;
let isSubscribed = false;
let replyingTo = null;

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
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-with-replies';
    div.dataset.commentId = comment.id;
    
    // Asosiy fikr
    const mainComment = document.createElement('div');
    mainComment.className = 'comment';
    mainComment.innerHTML = `
        <img src="${comment.avatar}" alt="${comment.author}" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-time">${comment.time}</div>
            </div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-actions">
                <div class="comment-action comment-like ${comment.liked ? 'active' : ''}" data-id="${comment.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="${comment.liked ? '#ff0000' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>${comment.likes}</span>
                </div>
                <div class="comment-reply" data-id="${comment.id}">Javob berish</div>
            </div>
        </div>
    `;
    
    // Like tugmasi
    const likeBtn = mainComment.querySelector('.comment-like');
    likeBtn.addEventListener('click', () => toggleCommentLike(comment.id));
    
    // Javob berish tugmasi
    const replyBtn = mainComment.querySelector('.comment-reply');
    replyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startReplyToComment(comment.id, comment.author);
    });
    
    div.appendChild(mainComment);
    
    // Javoblarni ko'rsatish
    if (comment.replies && comment.replies.length > 0) {
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'replies-container';
        
        comment.replies.forEach(reply => {
            const replyEl = createReplyElement(reply);
            repliesContainer.appendChild(replyEl);
        });
        
        div.appendChild(repliesContainer);
    }
    
    return div;
}

// Javob elementi yaratish
function createReplyElement(reply) {
    const div = document.createElement('div');
    div.className = 'compact-reply';
    
    const mentionText = reply.replyTo 
        ? `<span class="compact-reply-mention">@${reply.replyTo}</span> ${reply.text}` 
        : reply.text;
    
    div.innerHTML = `
        <img src="${reply.avatar}" alt="${reply.author}" class="compact-reply-avatar">
        <div class="compact-reply-content">
            <div class="compact-reply-header">
                <div class="compact-reply-author">${reply.author}</div>
                <div class="compact-reply-time">${reply.time}</div>
            </div>
            <div class="compact-reply-text">${mentionText}</div>
        </div>
    `;
    
    return div;
}

// Fikr like tugmasi
function toggleCommentLike(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.liked = !comment.liked;
        comment.likes += comment.liked ? 1 : -1;
        renderComments();
    }
}

// Javob berish rejimini boshlash
function startReplyToComment(commentId, authorName) {
    replyingTo = { id: commentId, author: authorName };
    
    // Reply info panelini ko'rsatish
    const replyInfo = document.querySelector('.reply-info');
    if (replyInfo) {
        replyInfo.classList.add('show');
        replyInfo.querySelector('.replying-to-name').textContent = `@${authorName}`;
    }
    
    // Inputni sozlash
    const commentInput = document.getElementById('commentInput');
    commentInput.placeholder = `@${authorName} ga javob yozing...`;
    commentInput.focus();
    
    // Scroll qilish
    const commentsSection = document.querySelector('.comments-section');
    commentsSection.scrollTop = commentsSection.scrollHeight;
}

// Javob berish rejimini bekor qilish
function cancelReply() {
    replyingTo = null;
    
    // Reply info panelini yashirish
    const replyInfo = document.querySelector('.reply-info');
    if (replyInfo) {
        replyInfo.classList.remove('show');
    }
    
    // Inputni tiklash
    const commentInput = document.getElementById('commentInput');
    commentInput.placeholder = 'Fikr bildiring...';
    commentInput.value = '';
    document.getElementById('commentSendBtn').disabled = true;
    document.getElementById('commentSendBtn').classList.remove('active');
}

// Fikr qo'shish
function addComment() {
    const commentInput = document.getElementById('commentInput');
    const text = commentInput.value.trim();
    
    if (!text) return;
    
    if (replyingTo) {
        // Javob qo'shish
        const comment = comments.find(c => c.id === replyingTo.id);
        if (comment) {
            const newReply = {
                id: Date.now(),
                author: 'Siz',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80',
                text: text,
                time: 'hozirgina',
                likes: 0,
                liked: false,
                replyTo: replyingTo.author
            };
            
            if (!comment.replies) {
                comment.replies = [];
            }
            
            comment.replies.push(newReply);
            showNotification('Javobingiz qo\'shildi');
        }
    } else {
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
        showNotification('Fikringiz qo\'shildi');
    }
    
    // Tozalash
    commentInput.value = '';
    document.getElementById('commentSendBtn').disabled = true;
    document.getElementById('commentSendBtn').classList.remove('active');
    
    // Reply rejimini bekor qilish
    cancelReply();
    
    // Yangilash
    renderComments();
}

// Hisoblagichlarni yangilash
function updateCounts() {
    // Barcha fikrlarni hisoblash (asosiy fikrlar + javoblar)
    let totalComments = comments.length;
    comments.forEach(comment => {
        if (comment.replies) {
            totalComments += comment.replies.length;
        }
    });
    
    document.getElementById('comments-main-count').textContent = totalComments;
    document.getElementById('comments-modal-count').textContent = totalComments;
    document.getElementById('heart-count').textContent = formatNumber(heartCount);
}

// Reply info panelini yaratish
function createReplyInfoPanel() {
    const addCommentSection = document.querySelector('.add-comment');
    const replyInfo = document.createElement('div');
    replyInfo.className = 'reply-info';
    replyInfo.innerHTML = `
        <div class="reply-info-content">
            <div class="replying-to">
                Javob berilyapti: <span class="replying-to-name"></span>
            </div>
            <button class="cancel-reply">Bekor qilish</button>
        </div>
    `;
    
    addCommentSection.parentNode.insertBefore(replyInfo, addCommentSection);
    
    // Bekor qilish tugmasi
    replyInfo.querySelector('.cancel-reply').addEventListener('click', cancelReply);
}

// DOM yuklanganda
document.addEventListener('DOMContentLoaded', function() {
    // Reply info panelini yaratish
    createReplyInfoPanel();
    
    // Event listenerlar
    document.getElementById('heart-btn').addEventListener('click', function() {
        isHearted = !isHearted;
        this.classList.toggle('active');
        heartCount += isHearted ? 1 : -1;
        updateCounts();
        showNotification(isHearted ? 'Yoqdi ❤️' : 'Yoqmadi');
    });
    
    document.getElementById('save-btn').addEventListener('click', function() {
        isSaved = !isSaved;
        this.classList.toggle('active');
        showNotification(isSaved ? 'Saqlandi' : 'Saqlanganlardan o\'chirildi');
    });
    
    document.getElementById('subscribe-btn').addEventListener('click', function() {
        isSubscribed = !isSubscribed;
        this.textContent = isSubscribed ? 'Obuna bo\'lingan' : 'Obuna bo\'lish';
        this.classList.toggle('subscribed');
        showNotification(isSubscribed ? 'Obuna bo\'ldingiz' : 'Obuna bekor qilindi');
    });
    
    document.getElementById('share-btn').addEventListener('click', () => {
        showNotification('Havola nusxalandi');
    });
    
    // Fikrlar modal
    document.getElementById('comments-btn').addEventListener('click', () => {
        const modal = document.getElementById('commentsModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        setTimeout(() => {
            document.getElementById('commentInput').focus();
        }, 100);
    });
    
    // Modalni yopish
    document.querySelector('.close-comments-btn').addEventListener('click', () => {
        const modal = document.getElementById('commentsModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            cancelReply();
        }, 300);
    });
    
    // Modal tashqarisiga bosish
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('commentsModal');
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                cancelReply();
            }, 300);
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
});