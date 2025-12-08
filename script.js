// Event listenerlar
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditId = null;
});

document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditId = null;
});

document.getElementById('save-edit').addEventListener('click', () => {
    if (!currentEditId) return;
    
    const comment = findCommentRecursive(comments, currentEditId);
    if (comment) {
        comment.text = document.getElementById('edit-input').value.trim();
        comment.time = comment.time.includes('tahrirlandi') 
            ? comment.time 
            : comment.time + ' (tahrirlandi)';
        
        renderComments();
        document.getElementById('edit-modal').style.display = 'none';
        currentEditId = null;
        showNotification('Fikr tahrirlandi');
    }
});

// Modal tashqarisiga bosganda yopish
document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) {
        document.getElementById('edit-modal').style.display = 'none';
        currentEditId = null;
    }
});// Ma'lumotlar
const currentUser = "Mening Profilim";
let userActions = JSON.parse(localStorage.getItem('commentActions')) || {};

const comments = [
    {
        id: 1,
        author: 'nafisaning_dunyosi',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        text: 'Nechi dubl bo\'ldi😂 shapaloqqa',
        time: '2 kun oldin',
        likes: 1743,
        dislikes: 5,
        replies: []
    },
    {
        id: 2,
        author: 'shoirabonu_essens',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        text: 'Yegan oshim burnimdan chiqdi degan joyi wu😂',
        time: '22 soat oldin',
        likes: 5,
        dislikes: 1,
        replies: []
    },
    {
        id: 3,
        author: currentUser,
        avatar: null,
        text: 'Bu mening fikrim, men uni o\'chirishim yoki tahrirlashim mumkin',
        time: '5 daqiqa oldin',
        likes: 0,
        dislikes: 0,
        replies: []
    }
];

let heartCount = 12000;
let isHearted = false;
let isSaved = false;
let isSubscribed = false;
let currentReplyId = null;
let currentEditId = null;

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
        
        // Javoblarni ko'rsatish (forma ostida)
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            comment.replies.forEach(reply => {
                const replyEl = createCommentElement(reply, true);
                repliesContainer.appendChild(replyEl);
            });
            
            div.appendChild(repliesContainer);
        }
        
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

// Like/Dislike funksiyalari
function handleLike(commentId) {
    const comment = findCommentRecursive(comments, commentId);
    if (!comment) return;
    
    const currentAction = userActions[commentId];
    
    if (currentAction === 'like') {
        comment.likes = Math.max(0, comment.likes - 1);
        delete userActions[commentId];
    } else if (currentAction === 'dislike') {
        comment.likes += 1;
        comment.dislikes = Math.max(0, comment.dislikes - 1);
        userActions[commentId] = 'like';
    } else {
        comment.likes += 1;
        userActions[commentId] = 'like';
    }
    
    localStorage.setItem('commentActions', JSON.stringify(userActions));
    renderComments();
}

function handleDislike(commentId) {
    const comment = findCommentRecursive(comments, commentId);
    if (!comment) return;
    
    const currentAction = userActions[commentId];
    
    if (currentAction === 'dislike') {
        comment.dislikes = Math.max(0, comment.dislikes - 1);
        delete userActions[commentId];
    } else if (currentAction === 'like') {
        comment.dislikes += 1;
        comment.likes = Math.max(0, comment.likes - 1);
        userActions[commentId] = 'dislike';
    } else {
        comment.dislikes += 1;
        userActions[commentId] = 'dislike';
    }
    
    localStorage.setItem('commentActions', JSON.stringify(userActions));
    renderComments();
}

// Menyu
function toggleMenu(commentId) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
    
    const menu = document.getElementById(`menu-${commentId}`);
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}

// Tahrirlash
function editComment(commentId) {
    const comment = findCommentRecursive(comments, commentId);
    if (comment) {
        currentEditId = commentId;
        document.getElementById('edit-input').value = comment.text;
        document.getElementById('edit-modal').style.display = 'flex';
    }
}

// O'chirish
function deleteComment(commentId) {
    if (confirm("Bu fikrni o'chirishni istaysizmi?")) {
        removeCommentRecursive(comments, commentId);
        delete userActions[commentId];
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    }
}

// Javob berish formasi
function toggleReplyBox(id) {
    const box = document.getElementById(`reply-box-${id}`);
    if (box.innerHTML !== '') {
        box.innerHTML = '';
        return;
    }
    
    document.querySelectorAll('[id^="reply-box-"]').forEach(el => el.innerHTML = '');

    const target = findCommentRecursive(comments, id);
    const mention = target ? `@${target.author} ` : '';

    box.innerHTML = `
        <div style="display:flex; gap:10px; margin-top:12px;">
            <div class="user-avatar-small user-avatar-reply">M</div>
            <div style="flex:1; position: relative;">
                <input type="text" id="input-${id}" class="comment-input" value="${mention}" style="width:100%; background: transparent; border: none; border-bottom: 1px solid #3f3f3f; color: #fff; padding: 8px 0; outline: none;">
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <button id="btn-reply-${id}" style="padding: 6px 12px; background: #0095f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;" onclick="submitReply(${id})">Yuborish</button>
                    <button style="padding: 6px 12px; background: transparent; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px;" onclick="toggleReplyBox(${id})">Bekor qilish</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const inp = document.getElementById(`input-${id}`);
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
    }, 50);
}

// Javob yuborish
function submitReply(parentId) {
    const input = document.getElementById(`input-${parentId}`);
    const btn = document.getElementById(`btn-reply-${parentId}`);
    const text = input.value.trim();
    
    if (!text) return;

    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Yuborilmoqda...`;

    setTimeout(() => {
        const target = findCommentRecursive(comments, parentId);
        if (target) {
            target.replies.push({
                id: Date.now(),
                author: currentUser,
                avatar: null,
                text: text,
                time: 'hozirgina',
                likes: 0,
                dislikes: 0,
                replies: [],
                replyTo: target.author
            });
            renderComments();
        }
    }, 1000);
}

// Yordamchi funksiyalar
function findCommentRecursive(list, id) {
    for (let item of list) {
        if (item.id === id) return item;
        if (item.replies.length > 0) {
            const found = findCommentRecursive(item.replies, id);
            if (found) return found;
        }
    }
    return null;
}

function removeCommentRecursive(list, id) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            list.splice(i, 1);
            return true;
        }
        if (list[i].replies.length > 0) {
            const removed = removeCommentRecursive(list[i].replies, id);
            if (removed) return true;
        }
    }
    return false;
}

// Yangi fikr qo'shish
function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const btn = document.getElementById('commentSendBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Yuborilmoqda...';
    
    setTimeout(() => {
        const newComment = {
            id: Date.now(),
            author: currentUser,
            avatar: null,
            text: text,
            time: 'hozirgina',
            likes: 0,
            dislikes: 0,
            replies: []
        };
        
        comments.unshift(newComment);
        input.value = '';
        btn.innerHTML = 'Yuborish';
        btn.disabled = true;
        renderComments();
        showNotification('Fikringiz qo\'shildi');
    }, 1000);
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