document.addEventListener('DOMContentLoaded', () => {
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

    // State (Holat)
    let state = {
        heartCount: 12000,
        isHearted: false,
        isSubscribed: false,
        comments: []
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
            
            // Vaqtni formatlash (eski timestampdan)
            state.comments = state.comments.map(c => {
                if (c.timestamp) c.time = formatTime(new Date(c.timestamp));
                if (c.likes === undefined) c.likes = 0;
                if (c.isLiked === undefined) c.isLiked = false;
                if (c.replies === undefined) c.replies = [];
                return c;
            });
        }
        updateUI();
    };

    // ========== UI RENDER FUNCTIONS ==========

    function updateUI() {
        heartCountDisplay.textContent = formatNumber(state.heartCount);
        if (state.isHearted) heartBtn.classList.add('active');
        else heartBtn.classList.remove('active');

        if (state.isSubscribed) {
            subscribeBtn.textContent = "Obuna bo'lingan";
            subscribeBtn.classList.add('subscribed');
        } else {
            subscribeBtn.textContent = "Obuna bo'lish";
            subscribeBtn.classList.remove('subscribed');
        }

        renderComments();
        
        // Jami commentlar sonini hisoblash (replylar bilan birga)
        let totalComments = state.comments.length;
        state.comments.forEach(c => totalComments += (c.replies ? c.replies.length : 0));
        
        commentsMainCount.textContent = totalComments;
        commentsModalCount.textContent = totalComments;
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
        }
    }

    function createCommentElement(comment, index) {
        const div = document.createElement('div');
        div.className = 'comment-wrapper';
        
        // Asosiy Comment HTML
        const isMyComment = comment.author === 'Siz';
        
        let html = `
        <div class="comment" id="comment-${index}">
            <img src="${comment.avatar}" alt="Avatar" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                
                <div class="comment-actions">
                    <button class="comment-action-btn like-btn ${comment.isLiked ? 'active' : ''}" onclick="toggleCommentLike(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                        <span>${comment.likes || 0}</span>
                    </button>
                    <div class="reply-btn" onclick="toggleReplyForm(${index})">Javob berish</div>
                </div>

                <div class="reply-form-container" id="reply-form-${index}">
                    <div class="reply-input-wrapper">
                        <textarea class="reply-textarea" id="reply-input-${index}" placeholder="Javob yozing..."></textarea>
                        <div class="reply-actions">
                            <button class="btn-cancel" onclick="toggleReplyForm(${index})">Bekor qilish</button>
                            <button class="btn-reply-submit" onclick="submitReply(${index})">Javob berish</button>
                        </div>
                    </div>
                </div>
            </div>
            
            ${isMyComment ? `
            <div class="comment-options" onclick="toggleMenu(event, ${index})">
                <div class="comment-options-dot"></div><div class="comment-options-dot"></div><div class="comment-options-dot"></div>
            </div>
            <div class="comment-menu" id="menu-${index}">
                <div class="comment-menu-item comment-menu-delete" onclick="deleteComment(${index})">O'chirish</div>
            </div>
            ` : ''}
        </div>

        <div class="replies-container">
            ${comment.replies && comment.replies.length > 0 ? comment.replies.map(reply => `
                <div class="reply-item">
                    <img src="${reply.avatar}" class="comment-avatar">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${reply.author}</span>
                            <span class="comment-time">${reply.time}</span>
                        </div>
                        <div class="comment-text">${reply.text}</div>
                    </div>
                </div>
            `).join('') : ''}
        </div>
        `;

        div.innerHTML = html;
        return div;
    }

    // ========== GLOBAL FUNCTIONS ==========

    window.toggleCommentLike = (index) => {
        const comment = state.comments[index];
        if (comment.isLiked) {
            comment.likes--;
            comment.isLiked = false;
        } else {
            comment.likes++;
            comment.isLiked = true;
        }
        saveToStorage();
        updateUI();
    };

    window.toggleReplyForm = (index) => {
        const form = document.getElementById(`reply-form-${index}`);
        const input = document.getElementById(`reply-input-${index}`);
        
        if (form.classList.contains('show')) {
            form.classList.remove('show');
        } else {
            document.querySelectorAll('.reply-form-container').forEach(f => f.classList.remove('show'));
            form.classList.add('show');
            setTimeout(() => input.focus(), 100);
        }
    };

    window.submitReply = (index) => {
        const input = document.getElementById(`reply-input-${index}`);
        const text = input.value.trim();
        
        if (!text) return;

        const reply = {
            text: text,
            author: 'Siz',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80',
            time: 'hozirgina',
            timestamp: Date.now()
        };

        if (!state.comments[index].replies) state.comments[index].replies = [];
        state.comments[index].replies.push(reply);

        saveToStorage();
        input.value = '';
        toggleReplyForm(index);
        updateUI();
        showNotification("Javobingiz qo'shildi");
    };

    window.toggleMenu = (e, index) => {
        e.stopPropagation();
        const menu = document.getElementById(`menu-${index}`);
        document.querySelectorAll('.comment-menu').forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
    };

    window.deleteComment = (index) => {
        if(confirm("Fikrni o'chirmoqchimisiz?")) {
            state.comments.splice(index, 1);
            saveToStorage();
            updateUI();
        }
    };

    // ========== EVENT LISTENERS ==========

    // Video Actions
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
        }, 300);
    };

    closeCommentsBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
        if (!e.target.closest('.comment-options')) {
            document.querySelectorAll('.comment-menu.show').forEach(m => m.classList.remove('show'));
        }
    });

    // Add Main Comment
    commentInput.addEventListener('input', () => {
        commentInput.style.height = 'auto';
        commentInput.style.height = commentInput.scrollHeight + 'px';
        commentSendBtn.disabled = commentInput.value.trim() === '';
        if(commentInput.value.trim() !== '') commentSendBtn.classList.add('active');
        else commentSendBtn.classList.remove('active');
    });

    commentSendBtn.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (!text) return;

        commentSendBtn.innerHTML = `<span style="width: 16px; height: 16px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; display:block;"></span>`;
        
        setTimeout(() => {
            const newComment = {
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
            
            commentInput.value = '';
            commentInput.style.height = 'auto';
            commentSendBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
            commentSendBtn.disabled = true;
            commentSendBtn.classList.remove('active');
            
            updateUI();
            showNotification("Fikr muvaffaqiyatli qo'shildi");
        }, 600);
    });

    // CSS Animation for spinner
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);

    // Initialize
    loadFromStorage();
});