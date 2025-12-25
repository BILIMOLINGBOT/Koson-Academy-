// Elementlarni tanlab olish
const heartBtn = document.getElementById('heart-btn');
const saveBtn = document.getElementById('save-btn');
const commentsBtn = document.getElementById('comments-btn');
const subscribeBtn = document.getElementById('subscribe-btn');
const modal = document.getElementById('commentsModal');
const closeCommentsBtn = document.querySelector('.close-comments-btn');
const commentInput = document.getElementById('commentInput');
const commentSendBtn = document.getElementById('commentSendBtn');
const commentsList = document.getElementById('commentsList');
const noCommentsIndicator = document.getElementById('no-comments-indicator');
const commentsMainCount = document.getElementById('comments-main-count');
const commentsModalCount = document.getElementById('comments-modal-count');
const heartCountDisplay = document.getElementById('heart-count');

// REPLY MODE STATE
let replyMode = {
    active: false,
    targetCommentId: null,
    targetCommentIndex: null,
    targetAuthor: null,
    isEditMode: false,
    replyToReplyIndex: undefined,
    originalText: ""
};

// State (Holat)
let state = {
    heartCount: 12000,
    isHearted: false,
    isSubscribed: false,
    comments: [
        {
            id: 1,
            text: "Ajoyib konsert! Ozodaning yangi qo'shiqlari juda yoqdi.",
            author: "Sanjar Uz",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
            time: "2 kun avval",
            timestamp: Date.now() - 172800000,
            likes: 24,
            isLiked: false,
            replies: [
                {
                    id: 101,
                    text: "Men ham rozi! Super kontsert bo'lgan.",
                    author: "Farrux S",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
                    time: "3 kun avval",
                    timestamp: Date.now() - 259200000,
                    likes: 5,
                    isLiked: false
                }
            ]
        },
        {
            id: 2,
            text: "Bunday konsertlarni ko'proq o'tkazish kerak. O'zbek musiqasi rivojlanmoqda!",
            author: "Dilnoza M",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
            time: "4 kun avval",
            timestamp: Date.now() - 345600000,
            likes: 18,
            isLiked: false,
            replies: []
        }
    ]
};

// ========== UTIL FUNCTIONS ==========

function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 7) return date.toLocaleDateString('uz-UZ');
    if (diffDay > 0) return `${diffDay} kun avval`;
    if (diffHour > 0) return `${diffHour} soat avval`;
    if (diffMin > 0) return `${diffMin} daqiqa avval`;
    return 'hozirgina';
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}

function showNotification(message) {
    const old = document.querySelector('.notification');
    if (old) old.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== STORAGE FUNCTIONS ==========

const saveToStorage = () => {
    localStorage.setItem('ytVideoReactions', JSON.stringify(state));
};

const loadFromStorage = () => {
    const savedData = localStorage.getItem('ytVideoReactions');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        state = { ...state, ...parsed };
        
        // Vaqtni formatlash
        state.comments = state.comments.map(c => {
            if (c.timestamp) c.time = formatTime(new Date(c.timestamp));
            if (c.likes === undefined) c.likes = 0;
            if (c.isLiked === undefined) c.isLiked = false;
            if (c.replies === undefined) c.replies = [];
            
            // Replies uchun ham formatlash
            if (c.replies) {
                c.replies = c.replies.map(r => {
                    if (r.timestamp) r.time = formatTime(new Date(r.timestamp));
                    if (r.likes === undefined) r.likes = 0;
                    if (r.isLiked === undefined) r.isLiked = false;
                    return r;
                });
            }
            return c;
        });
    }
    updateUI();
};

// ========== UI RENDER FUNCTIONS ==========

function updateUI() {
    // Like sonini yangilash
    heartCountDisplay.textContent = formatNumber(state.heartCount);
    
    // Like tugmasi holatini yangilash
    if (state.isHearted) {
        heartBtn.classList.add('active');
    } else {
        heartBtn.classList.remove('active');
    }

    // Obuna tugmasi holatini yangilash
    if (state.isSubscribed) {
        subscribeBtn.textContent = "Obuna bo'lingan";
        subscribeBtn.classList.add('subscribed');
    } else {
        subscribeBtn.textContent = "Obuna bo'lish";
        subscribeBtn.classList.remove('subscribed');
    }

    // Commentlarni yangilash
    renderComments();
    
    // Jami commentlar sonini hisoblash va yangilash
    updateCommentsCount();
    
    // Reply mode indicator ni yangilash
    updateReplyModeIndicator();
}

// Commentlar sonini yangilash funksiyasi
function updateCommentsCount() {
    let totalComments = 0;
    
    // Asosiy commentlar
    totalComments += state.comments.length;
    
    // Reply commentlar
    state.comments.forEach(c => {
        if (c.replies && c.replies.length > 0) {
            totalComments += c.replies.length;
        }
    });
    
    // HTML elementlariga sonlarni joylashtirish
    commentsMainCount.textContent = formatNumber(totalComments);
    commentsModalCount.textContent = formatNumber(totalComments);
}

function updateReplyModeIndicator() {
    const existingIndicator = document.querySelector('.reply-mode-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    if (replyMode.active) {
        const indicator = document.createElement('div');
        indicator.className = 'reply-mode-indicator';
        
        if (replyMode.isEditMode) {
            if (replyMode.replyToReplyIndex !== undefined) {
                // Edit reply mode
                indicator.innerHTML = `
                    <div class="reply-mode-text">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Javobingizni tahrirlash
                    </div>
                    <button class="reply-mode-cancel" onclick="cancelReplyMode()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Bekor qilish
                    </button>
                `;
            } else {
                // Edit comment mode
                indicator.innerHTML = `
                    <div class="reply-mode-text">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Fikringizni tahrirlash
                    </div>
                    <button class="reply-mode-cancel" onclick="cancelReplyMode()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Bekor qilish
                    </button>
                `;
            }
        } else {
            // Reply mode
            indicator.innerHTML = `
                <div class="reply-mode-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>${replyMode.targetAuthor}</span><span class="reply-mode-author"> ga javob yozyapsiz</span>
                </div>
                <button class="reply-mode-cancel" onclick="cancelReplyMode()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Bekor qilish
                </button>
            `;
        }
        
        // Add indicator to comments list
        if (commentsList.firstChild) {
            commentsList.insertBefore(indicator, commentsList.firstChild);
        } else {
            commentsList.appendChild(indicator);
        }
        
        // Update input wrapper style
        document.querySelector('.comment-input-wrapper').classList.add('reply-mode');
    } else {
        // Remove reply mode styles
        const inputWrapper = document.querySelector('.comment-input-wrapper');
        if (inputWrapper) inputWrapper.classList.remove('reply-mode');
    }
}

function createCommentElement(comment, index) {
    const div = document.createElement('div');
    div.className = 'comment-wrapper';
    
    const isMyComment = comment.author === 'Siz';
    
    // Format comment text with mentions
    let formattedText = comment.text;
    formattedText = formattedText.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    
    let html = `
    <div class="comment" id="comment-${index}">
        <img src="${comment.avatar}" alt="Avatar" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${comment.time}</span>
            </div>
            <div class="comment-text">${formattedText}</div>
            
            <div class="comment-actions">
                <button class="comment-action-btn like-btn ${comment.isLiked ? 'active' : ''}" onclick="toggleCommentLike(${index})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span>${formatNumber(comment.likes || 0)}</span>
                </button>
                <div class="reply-btn" onclick="startReplyMode(${index}, false, '${comment.author.replace(/'/g, "\\'")}')">
                    Javob berish
                </div>
            </div>
        </div>
        
        ${isMyComment ? `
        <div class="comment-options" onclick="toggleMenu(event, ${index})">
            <div class="comment-options-dot"></div><div class="comment-options-dot"></div><div class="comment-options-dot"></div>
        </div>
        <div class="comment-menu" id="menu-${index}">
            <div class="comment-menu-item comment-menu-edit" onclick="startReplyMode(${index}, true, '${comment.author.replace(/'/g, "\\'")}')">
                Tahrirlash
            </div>
            <div class="comment-menu-item comment-menu-delete" onclick="deleteComment(${index})">
                O'chirish
            </div>
        </div>
        ` : ''}
    </div>

    <div class="replies-container">
        ${comment.replies && comment.replies.length > 0 ? comment.replies.map((reply, replyIndex) => {
            let replyFormattedText = reply.text;
            replyFormattedText = replyFormattedText.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
            
            const isMyReply = reply.author === 'Siz';
            
            return `
            <div class="reply-item" id="reply-${index}-${replyIndex}">
                <img src="${reply.avatar}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${reply.author}</span>
                        <span class="comment-time">${reply.time}</span>
                    </div>
                    <div class="comment-text">${replyFormattedText}</div>
                    
                    <div class="comment-actions">
                        <button class="comment-action-btn like-btn ${reply.isLiked ? 'active' : ''}" onclick="toggleReplyLike(${index}, ${replyIndex})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            <span>${formatNumber(reply.likes || 0)}</span>
                        </button>
                        <div class="reply-btn" onclick="startReplyToReply(${index}, ${replyIndex}, '${reply.author.replace(/'/g, "\\'")}')">
                            Javob berish
                        </div>
                    </div>
                </div>
                
                ${isMyReply ? `
                <div class="comment-options" onclick="toggleReplyMenu(event, ${index}, ${replyIndex})">
                    <div class="comment-options-dot"></div><div class="comment-options-dot"></div><div class="comment-options-dot"></div>
                </div>
                <div class="comment-menu" id="reply-menu-${index}-${replyIndex}">
                    <div class="comment-menu-item comment-menu-edit" onclick="editReply(${index}, ${replyIndex})">
                        Tahrirlash
                    </div>
                    <div class="comment-menu-item comment-menu-delete" onclick="deleteReply(${index}, ${replyIndex})">
                        O'chirish
                    </div>
                </div>
                ` : ''}
            </div>
        `}).join('') : ''}
    </div>
    `;

    div.innerHTML = html;
    return div;
}

function renderComments() {
    commentsList.innerHTML = '';
    if (state.comments.length === 0) {
        noCommentsIndicator.style.display = 'flex';
    } else {
        noCommentsIndicator.style.display = 'none';
        state.comments.forEach((comment, index) => {
            const el = createCommentElement(comment, index);
            commentsList.appendChild(el);
        });
        
        // Reply mode indicator ni qayta joylashtirish
        updateReplyModeIndicator();
    }
}


// ========== COMMENT FUNCTIONS ==========

function toggleCommentLike(index) {
    const comment = state.comments[index];
    if (comment.isLiked) {
        comment.likes--;
        comment.isLiked = false;
        showNotification("Like olib tashlandi");
    } else {
        comment.likes++;
        comment.isLiked = true;
        showNotification("Like bosildi");
    }
    saveToStorage();
    updateUI();
}

function toggleReplyLike(commentIndex, replyIndex) {
    const reply = state.comments[commentIndex].replies[replyIndex];
    if (!reply.likes) reply.likes = 0;
    if (!reply.isLiked) reply.isLiked = false;
    
    if (reply.isLiked) {
        reply.likes--;
        reply.isLiked = false;
        showNotification("Like olib tashlandi");
    } else {
        reply.likes++;
        reply.isLiked = true;
        showNotification("Like bosildi");
    }
    saveToStorage();
    updateUI();
}

function startReplyMode(index, isEdit = false, author = null) {
    const comment = state.comments[index];
    
    // Reply mode ni sozlash
    replyMode.active = true;
    replyMode.targetCommentId = comment.id;
    replyMode.targetCommentIndex = index;
    replyMode.targetAuthor = author || comment.author;
    replyMode.isEditMode = isEdit;
    replyMode.replyToReplyIndex = undefined;
    replyMode.originalText = isEdit ? comment.text : '';
    
    if (isEdit) {
        // Edit mode
        commentInput.value = comment.text;
        commentInput.placeholder = "Fikringizni tahrirlang...";
    } else {
        // Reply mode
        commentInput.value = `@${comment.author} `;
        commentInput.placeholder = `${comment.author} ga javob yozing...`;
    }
    
    // Tugmani faollashtiramiz
    commentSendBtn.disabled = commentInput.value.trim() === '';
    if (!commentSendBtn.disabled) commentSendBtn.classList.add('active');
    
    // Scroll to input
    commentInput.focus();
    commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // UI ni yangilash
    updateReplyModeIndicator();
    
    // Menyuni yopish
    const menu = document.getElementById(`menu-${index}`);
    if (menu) menu.classList.remove('show');
}

function startReplyToReply(commentIndex, replyIndex, author) {
    const comment = state.comments[commentIndex];
    const reply = comment.replies[replyIndex];
    
    // Reply mode ni sozlash
    replyMode.active = true;
    replyMode.targetCommentId = comment.id;
    replyMode.targetCommentIndex = commentIndex;
    replyMode.targetAuthor = author || reply.author;
    replyMode.isEditMode = false;
    replyMode.replyToReplyIndex = replyIndex;
    replyMode.originalText = '';
    
    // Inputni sozlash
    commentInput.value = `@${reply.author} `;
    commentInput.placeholder = `${reply.author} ga javob yozing...`;
    
    // Tugmani faollashtiramiz
    commentSendBtn.disabled = commentInput.value.trim() === '';
    if (!commentSendBtn.disabled) commentSendBtn.classList.add('active');
    
    // Scroll to input
    commentInput.focus();
    commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // UI ni yangilash
    updateReplyModeIndicator();
}

function editReply(commentIndex, replyIndex) {
    const reply = state.comments[commentIndex].replies[replyIndex];
    
    // Reply mode ni sozlash
    replyMode.active = true;
    replyMode.targetCommentId = state.comments[commentIndex].id;
    replyMode.targetCommentIndex = commentIndex;
    replyMode.targetAuthor = reply.author;
    replyMode.isEditMode = true;
    replyMode.replyToReplyIndex = replyIndex;
    replyMode.originalText = reply.text;
    
    // Inputni sozlash
    commentInput.value = reply.text;
    commentInput.placeholder = "Javobingizni tahrirlang...";
    
    // Tugmani faollashtiramiz
    commentSendBtn.disabled = commentInput.value.trim() === '';
    if (!commentSendBtn.disabled) commentSendBtn.classList.add('active');
    
    // Scroll to input
    commentInput.focus();
    commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // UI ni yangilash
    updateReplyModeIndicator();
}

function cancelReplyMode() {
    replyMode.active = false;
    replyMode.targetCommentId = null;
    replyMode.targetCommentIndex = null;
    replyMode.targetAuthor = null;
    replyMode.isEditMode = false;
    replyMode.replyToReplyIndex = undefined;
    replyMode.originalText = "";
    
    // Inputni tozalamiz
    commentInput.value = '';
    commentInput.placeholder = 'Fikr bildiring...';
    commentSendBtn.disabled = true;
    commentSendBtn.classList.remove('active');
    
    // UI ni yangilash
    updateReplyModeIndicator();
}

function submitCommentOrReply() {
    const text = commentInput.value.trim();
    
    if (!text) {
        showNotification("Iltimos, matn kiriting");
        return;
    }
    
    // Spinner effect
    const originalHtml = commentSendBtn.innerHTML;
    commentSendBtn.innerHTML = '<div class="loading-spinner"></div>';
    commentSendBtn.disabled = true;
    
    setTimeout(() => {
        if (replyMode.active) {
            // Bu reply yoki edit
            if (replyMode.isEditMode) {
                if (replyMode.replyToReplyIndex !== undefined) {
                    // Edit reply
                    const reply = state.comments[replyMode.targetCommentIndex].replies[replyMode.replyToReplyIndex];
                    reply.text = text;
                    reply.time = "hozirgina (tahrirlangan)";
                    reply.timestamp = Date.now();
                    
                    saveToStorage();
                    updateUI();
                    showNotification("Javob muvaffaqiyatli tahrirlandi");
                } else {
                    // Edit existing comment
                    const comment = state.comments[replyMode.targetCommentIndex];
                    comment.text = text;
                    comment.time = "hozirgina (tahrirlangan)";
                    comment.timestamp = Date.now();
                    
                    saveToStorage();
                    updateUI();
                    showNotification("Fikr muvaffaqiyatli tahrirlandi");
                }
            } else {
                if (replyMode.replyToReplyIndex !== undefined) {
                    // Reply to reply (nested reply - hozircha faqat bir darajali reply qilamiz)
                    const reply = {
                        id: Date.now(),
                        text: text,
                        author: 'Siz',
                        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80',
                        time: 'hozirgina',
                        timestamp: Date.now(),
                        likes: 0,
                        isLiked: false
                    };
                    
                    if (!state.comments[replyMode.targetCommentIndex].replies) {
                        state.comments[replyMode.targetCommentIndex].replies = [];
                    }
                    
                    state.comments[replyMode.targetCommentIndex].replies.push(reply);
                    
                    saveToStorage();
                    updateUI();
                    showNotification("Javobingiz qo'shildi");
                } else {
                    // Reply to comment
                    const reply = {
                        id: Date.now(),
                        text: text,
                        author: 'Siz',
                        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80',
                        time: 'hozirgina',
                        timestamp: Date.now(),
                        likes: 0,
                        isLiked: false
                    };
                    
                    if (!state.comments[replyMode.targetCommentIndex].replies) {
                        state.comments[replyMode.targetCommentIndex].replies = [];
                    }
                    
                    state.comments[replyMode.targetCommentIndex].replies.push(reply);
                    
                    saveToStorage();
                    updateUI();
                    showNotification("Javobingiz qo'shildi");
                }
            }
        } else {
            // This is a new main comment
            const newComment = {
                id: Date.now(),
                text: text,
                author: 'Siz',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80',
                time: 'hozirgina',
                timestamp: Date.now(),
                likes: 0,
                isLiked: false,
                replies: []
            };
            
            state.comments.unshift(newComment);
            saveToStorage();
            updateUI();
            showNotification("Fikr muvaffaqiyatli qo'shildi");
        }
        
        // Reset after submission
        cancelReplyMode();
        
        // Reset button
        commentSendBtn.innerHTML = originalHtml;
        commentInput.value = '';
        commentInput.style.height = 'auto';
        commentSendBtn.disabled = true;
        commentSendBtn.classList.remove('active');
    }, 600);
}

function toggleMenu(e, index) {
    e.stopPropagation();
    const menu = document.getElementById(`menu-${index}`);
    
    // Boshqa menyularni yopish
    document.querySelectorAll('.comment-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    
    menu.classList.toggle('show');
}

function toggleReplyMenu(e, commentIndex, replyIndex) {
    e.stopPropagation();
    const menu = document.getElementById(`reply-menu-${commentIndex}-${replyIndex}`);
    
    // Boshqa menyularni yopish
    document.querySelectorAll('.comment-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    
    menu.classList.toggle('show');
}

function deleteComment(index) {
    if(confirm("Fikrni o'chirmoqchimisiz?")) {
        state.comments.splice(index, 1);
        saveToStorage();
        updateUI();
        showNotification("Fikr o'chirildi");
    }
}

function deleteReply(commentIndex, replyIndex) {
    if(confirm("Javobingizni o'chirmoqchimisiz?")) {
        state.comments[commentIndex].replies.splice(replyIndex, 1);
        saveToStorage();
        updateUI();
        showNotification("Javob o'chirildi");
    }
}

// ========== EVENT LISTENERS ==========

// Video Like Actions
heartBtn.addEventListener('click', () => {
    state.isHearted = !state.isHearted;
    state.heartCount += state.isHearted ? 1 : -1;
    showNotification(state.isHearted ? "Videoga like bosildi" : "Like olib tashlandi");
    saveToStorage();
    updateUI();
});

subscribeBtn.addEventListener('click', () => {
    state.isSubscribed = !state.isSubscribed;
    showNotification(state.isSubscribed ? "Obuna bo'ldingiz" : "Obuna bekor qilindi");
    saveToStorage();
    updateUI();
});

saveBtn.addEventListener('click', () => {
    saveBtn.classList.toggle('active');
    showNotification(saveBtn.classList.contains('active') ? "Video saqlandi" : "Saqlash bekor qilindi");
});

// Modal Controls
commentsBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
});

const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Reply mode ni reset qilish
        cancelReplyMode();
    }, 300);
};

closeCommentsBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    // Close menus inside modal
    if (!e.target.closest('.comment-options')) {
        document.querySelectorAll('.comment-menu.show').forEach(m => m.classList.remove('show'));
    }
});

// Add Main Comment or Reply
commentInput.addEventListener('input', () => {
    commentInput.style.height = 'auto';
    commentInput.style.height = commentInput.scrollHeight + 'px';
    
    // Validate input
    const text = commentInput.value.trim();
    commentSendBtn.disabled = text === '';
    
    if (!commentSendBtn.disabled) {
        commentSendBtn.classList.add('active');
    } else {
        commentSendBtn.classList.remove('active');
    }
});

commentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!commentSendBtn.disabled) {
            submitCommentOrReply();
        }
    }
    
    // ESC tugmasi bilan reply mode ni bekor qilish
    if (e.key === 'Escape' && replyMode.active) {
        cancelReplyMode();
    }
});

commentSendBtn.addEventListener('click', () => {
    if (commentSendBtn.disabled) return;
    submitCommentOrReply();
});

// Fikr bildiring bo'limiga bosilganda reply mode ni bekor qilish
commentInput.addEventListener('click', () => {
    if (replyMode.active && commentInput.value.trim() === '') {
        cancelReplyMode();
    }
});

// Modal ochilganda focusni inputga o'tkazish
modal.addEventListener('transitionend', () => {
    if (modal.classList.contains('show')) {
        setTimeout(() => {
            if (!replyMode.active) {
                commentInput.focus();
            }
        }, 100);
    }
});

// Global functions for HTML onclick
window.toggleCommentLike = toggleCommentLike;
window.toggleReplyLike = toggleReplyLike;
window.startReplyMode = startReplyMode;
window.startReplyToReply = startReplyToReply;
window.editReply = editReply;
window.cancelReplyMode = cancelReplyMode;
window.toggleMenu = toggleMenu;
window.toggleReplyMenu = toggleReplyMenu;
window.deleteComment = deleteComment;
window.deleteReply = deleteReply;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
});