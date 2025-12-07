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
    const commentsMainCount = document.getElementById('comments-main-count');
    const commentsModalCount = document.getElementById('comments-modal-count');
    const heartCountDisplay = document.getElementById('heart-count');

    // Boshlang'ich ma'lumotlar
    let heartCount = 12000;
    let isHearted = false;
    let isSubscribed = false;
    let currentComments = [];
    let isEditing = false;
    let isLoading = false;
    let currentReplyTo = null;
    let currentEditCommentId = null;

    // Boshlang'ich fikrlar (namuna uchun)
    const initialComments = [
        {
            id: 1,
            text: "Juda zo'r video bo'libdi 👍",
            author: "Sanjar",
            time: "2 soat avval",
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            likes: 3,
            liked: false,
            replies: [
                {
                    id: 11,
                    text: "@Sanjar Ha, to'g'ri aytasiz",
                    author: "Doston",
                    time: "1 soat avval",
                    timestamp: Date.now() - 1 * 60 * 60 * 1000,
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
                    likes: 1,
                    liked: false,
                    replyTo: "Sanjar"
                },
                {
                    id: 12,
                    text: "Qo'shiqlar haqiqatan ham juda zo'r",
                    author: "Siz",
                    time: "30 daqiqa avval",
                    timestamp: Date.now() - 30 * 60 * 1000,
                    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
                    likes: 0,
                    liked: false,
                    replyTo: "Sanjar"
                }
            ],
            showReplies: true
        },
        {
            id: 2,
            text: "Konsert juda chiroyli tashkil qilingan, Ozoda yana bir bor o'zining mahoratini namoyish etdi!",
            author: "Malika",
            time: "5 soat avval",
            timestamp: Date.now() - 5 * 60 * 60 * 1000,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
            likes: 7,
            liked: true,
            replies: [],
            showReplies: false
        },
        {
            id: 3,
            text: "Qo'shiqlar juda yoqimli, yangi albom chiqqanda ham yaxshi bo'ladi",
            author: "Siz",
            time: "1 kun avval",
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
            likes: 2,
            liked: false,
            replies: [],
            showReplies: false
        }
    ];

    // Vaqtni formatlash funksiyasi
    function formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffDay > 7) {
            return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
        } else if (diffDay > 0) {
            return `${diffDay} kun avval`;
        } else if (diffHour > 0) {
            return `${diffHour} soat avval`;
        } else if (diffMin > 0) {
            return `${diffMin} daqiqa avval`;
        } else {
            return 'hozirgina';
        }
    }

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            heartCount,
            isHearted,
            isSubscribed,
            comments: currentComments
        };
        localStorage.setItem('videoReactions', JSON.stringify(data));
    };

    // Ma'lumotlarni yuklash funksiyasi
    const loadFromStorage = () => {
        const savedData = localStorage.getItem('videoReactions');
        if (savedData) {
            const data = JSON.parse(savedData);
            heartCount = data.heartCount || heartCount;
            isHearted = data.isHearted || false;
            isSubscribed = data.isSubscribed || false;
            currentComments = data.comments || initialComments;
            
            // Saqlangan fikrlarni formatlash
            currentComments = currentComments.map(comment => {
                // Agar eski formatda saqlangan bo'lsa, vaqtni formatlash
                if (comment.timestamp && !comment.time) {
                    const date = new Date(comment.timestamp);
                    comment.time = formatTime(date);
                }
                
                // Reply lar uchun ham formatlash
                if (comment.replies && comment.replies.length > 0) {
                    comment.replies = comment.replies.map(reply => {
                        if (reply.timestamp && !reply.time) {
                            const replyDate = new Date(reply.timestamp);
                            reply.time = formatTime(replyDate);
                        }
                        return reply;
                    });
                }
                
                return comment;
            });
            
            // Foydalanuvchi reaktsiyasini ko'rsatish
            if (isHearted) {
                heartBtn.classList.add('active');
            }
            
            // Obuna holatini ko'rsatish
            if (isSubscribed) {
                subscribeBtn.textContent = "Obuna bo'lingan";
                subscribeBtn.classList.add('subscribed');
            }
            
            // Saqlangan fikrlarni ko'rsatish
            displayComments();
        } else {
            // Agar saqlangan ma'lumot bo'lmasa, boshlang'ich fikrlarni yuklash
            currentComments = initialComments;
            displayComments();
        }
    };

    // Fikrlarni ko'rsatish funksiyasi
    function displayComments() {
        commentsList.innerHTML = '';
        
        currentComments.forEach((comment, index) => {
            const commentElement = createCommentElement(comment, index);
            commentsList.appendChild(commentElement);
        });
        
        updateCounts();
    }

    // Fikr elementi yaratish funksiyasi
    function createCommentElement(comment, index) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.setAttribute('data-id', comment.id || index);
        
        // Javoblar soni
        const repliesCount = comment.replies ? comment.replies.length : 0;
        
        // Agar fikr sizniki bo'lsa, uchta nuqta tugmasi qo'shamiz
        const isMyComment = comment.author === 'Siz';
        
        // Like tugmasi uchun class
        const likeClass = comment.liked ? 'comment-like active' : 'comment-like';
        
        commentElement.innerHTML = `
            <div class="comment-main">
                <img src="${comment.avatar}" alt="User Avatar" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-time">${comment.time}</div>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <div class="comment-action ${likeClass}" data-id="${comment.id || index}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${comment.liked ? '#ff0000' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span class="like-count">${comment.likes || 0}</span>
                        </div>
                        <div class="comment-reply ${currentReplyTo === comment.id ? 'replying' : ''}" data-id="${comment.id || index}">
                            Javob berish
                        </div>
                        ${repliesCount > 0 ? `
                        <div class="replies-count" data-id="${comment.id || index}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 17 4 12 9 7"></polyline>
                                <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                            </svg>
                            ${repliesCount}
                        </div>
                        ` : ''}
                    </div>
                </div>
                ${isMyComment ? `
                <div class="comment-options">
                    <div class="comment-options-dot"></div>
                    <div class="comment-options-dot"></div>
                    <div class="comment-options-dot"></div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Javob berish formasi
        const replyForm = document.createElement('div');
        replyForm.className = `reply-form ${currentReplyTo === comment.id ? 'show' : ''}`;
        replyForm.innerHTML = `
            <div class="add-comment">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80" alt="User Avatar" class="add-comment-avatar">
                <div class="comment-input-container">
                    <div class="reply-input-wrapper">
                        <textarea class="reply-input" placeholder="@${comment.author} ga javob yozing..." id="replyInput-${comment.id || index}"></textarea>
                        <button class="reply-send-btn" id="replySendBtn-${comment.id || index}" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="19" x2="12" y2="5"></line>
                                <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                        </button>
                    </div>
                    <div class="reply-actions">
                        <button class="reply-cancel-btn" data-id="${comment.id || index}">Bekor qilish</button>
                    </div>
                </div>
            </div>
        `;
        
        commentElement.appendChild(replyForm);
        
        // Javoblar konteyneri
        if (repliesCount > 0 && comment.showReplies) {
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            
            comment.replies.forEach((reply, replyIndex) => {
                const replyElement = createReplyElement(reply, replyIndex, comment.id || index);
                repliesContainer.appendChild(replyElement);
            });
            
            commentElement.appendChild(repliesContainer);
        }
        
        // Javoblarni ko'rsatish/yashirish tugmasi
        if (repliesCount > 0) {
            const toggleRepliesBtn = document.createElement('button');
            toggleRepliesBtn.className = comment.showReplies ? 'hide-replies-btn' : 'show-replies-btn';
            toggleRepliesBtn.setAttribute('data-id', comment.id || index);
            toggleRepliesBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${comment.showReplies ? '<polyline points="18 15 12 9 6 15"></polyline>' : '<polyline points="6 9 12 15 18 9"></polyline>'}
                </svg>
                ${comment.showReplies ? 'Javoblarni yashirish' : `${repliesCount} javobni ko'rsatish`}
            `;
            
            commentElement.appendChild(toggleRepliesBtn);
        }
        
        // Agar fikr sizniki bo'lsa, menyu qo'shamiz
        if (isMyComment) {
            const commentMenu = document.createElement('div');
            commentMenu.className = 'comment-menu';
            commentMenu.innerHTML = `
                <div class="comment-menu-item edit-comment-btn" data-id="${comment.id || index}">
                    <div class="comment-menu-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    Tahrirlash
                </div>
                <div class="comment-menu-item comment-menu-delete delete-comment-btn" data-id="${comment.id || index}">
                    <div class="comment-menu-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                    O'chirish
                </div>
            `;
            
            commentElement.appendChild(commentMenu);
            
            // Uchta nuqta tugmasi va menyu uchun hodislarni qo'shamiz
            const optionsBtn = commentElement.querySelector('.comment-options');
            const editBtn = commentMenu.querySelector('.edit-comment-btn');
            const deleteBtn = commentMenu.querySelector('.delete-comment-btn');
            
            // Uchta nuqta bosilganda menyuni ko'rsatish
            optionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Boshqa barcha menyularni yopish
                document.querySelectorAll('.comment-menu.show').forEach(menu => {
                    if (menu !== commentMenu) menu.classList.remove('show');
                });
                commentMenu.classList.toggle('show');
            });
            
            // Tahrirlash tugmasi
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = parseInt(e.currentTarget.getAttribute('data-id'));
                openEditInInput(commentId);
                commentMenu.classList.remove('show');
            });
            
            // O'chirish tugmasi
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteComment(commentId);
                commentMenu.classList.remove('show');
            });
            
            // Sahifaning boshqa joyiga bosilganda menyuni yopish
            document.addEventListener('click', () => {
                if (commentMenu.classList.contains('show')) {
                    commentMenu.classList.remove('show');
                }
            });
            
            // Menyu ichida bosilganda menyu yopilmasligi uchun
            commentMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Like tugmasi uchun hodis
        const likeBtn = commentElement.querySelector('.comment-like');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleLike(commentId);
            });
        }
        
        // Javob berish tugmasi uchun hodis
        const replyBtn = commentElement.querySelector('.comment-reply');
        if (replyBtn) {
            replyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleReplyForm(commentId);
            });
        }
        
        // Javoblar soni tugmasi uchun hodis
        const repliesCountBtn = commentElement.querySelector('.replies-count');
        if (repliesCountBtn) {
            repliesCountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleReplies(commentId);
            });
        }
        
        // Javoblarni ko'rsatish/yashirish tugmasi uchun hodis
        const toggleRepliesBtn = commentElement.querySelector('.show-replies-btn, .hide-replies-btn');
        if (toggleRepliesBtn) {
            toggleRepliesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleReplies(commentId);
            });
        }
        
        // Javob berish formasi uchun hodislar
        const replyInput = commentElement.querySelector('.reply-input');
        const replySendBtn = commentElement.querySelector('.reply-send-btn');
        const replyCancelBtn = commentElement.querySelector('.reply-cancel-btn');
        
        if (replyInput && replySendBtn) {
            // Input o'zgarganda
            replyInput.addEventListener('input', () => {
                adjustTextareaHeight(replyInput);
                if (replyInput.value.trim() !== '') {
                    replySendBtn.disabled = false;
                    replySendBtn.classList.add('active');
                } else {
                    replySendBtn.disabled = true;
                    replySendBtn.classList.remove('active');
                }
            });
            
            // Enter tugmasi
            replyInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !replySendBtn.disabled) {
                    e.preventDefault();
                    addReply(comment.id || index, replyInput.value.trim());
                }
            });
            
            // Yuborish tugmasi
            replySendBtn.addEventList