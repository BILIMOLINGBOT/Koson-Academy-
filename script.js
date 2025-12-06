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
    
    // Tahrirlash modal elementlari
    const editModal = document.getElementById('editModal');
    const editCommentTextarea = document.getElementById('editCommentTextarea');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');

    // Boshlang'ich ma'lumotlar
    let heartCount = 12000;
    let commentsCount = 0;
    let isHearted = false;
    let isSubscribed = false;
    let currentComments = [];
    let currentEditCommentId = null;
    let isEditing = false;
    let isLoading = false;
    let currentReplyTo = null; // Hozirgi javob berilayotgan fikr IDsi
    let replyCommentId = null; // Javob berilayotgan fikr IDsi

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
                    replyTo: "Sanjar",
                    replyToId: 1
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
            replies: []
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
            replies: []
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
            commentsCount,
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
            commentsCount = data.commentsCount || commentsCount;
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
            commentsCount = currentComments.length;
            displayComments();
        }
    };

    // Fikrlarni ko'rsatish funksiyasi
    function displayComments() {
        if (currentComments.length > 0) {
            commentsList.innerHTML = '';
            currentComments.forEach((comment, index) => {
                const commentElement = createCommentElement(comment, index);
                commentsList.appendChild(commentElement);
            });
            
            noCommentsIndicator.style.display = 'none';
            commentsList.style.display = 'block';
        } else {
            noCommentsIndicator.style.display = 'flex';
            commentsList.style.display = 'none';
        }
        
        updateCounts();
    }

    // Fikr elementi yaratish funksiyasi
    function createCommentElement(comment, index) {
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.setAttribute('data-id', comment.id || index);
        
        // Agar fikr sizniki bo'lsa, uchta nuqta tugmasi qo'shamiz
        const isMyComment = comment.author === 'Siz';
        
        // Javoblar soni
        const repliesCount = comment.replies ? comment.replies.length : 0;
        
        // Matnda @mention larni formatlash
        let formattedText = comment.text;
        if (comment.replyTo) {
            formattedText = `<span class="mention">@${comment.replyTo}</span> ${comment.text}`;
        }
        
        newComment.innerHTML = `
            <img src="${comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80'}" alt="User Avatar" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">${comment.author || 'Siz'}</div>
                    <div class="comment-time">${comment.time || 'hozirgina'}</div>
                </div>
                <div class="comment-text">${formattedText}</div>
                <div class="comment-actions">
                    <div class="comment-action comment-like ${comment.liked ? 'active' : ''}" data-id="${comment.id || index}">
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
        
        // Javoblar konteyneri
        const repliesContainer = document.createElement('div');
        repliesContainer.className = `replies-container ${comment.showReplies ? 'show' : ''}`;
        
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach((reply, replyIndex) => {
                const replyElement = createReplyElement(reply, replyIndex, comment.id || index);
                repliesContainer.appendChild(replyElement);
            });
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
            
            // Javoblar konteyneridan oldin joylashtirish
            newComment.appendChild(replyForm);
            newComment.appendChild(toggleRepliesBtn);
            newComment.appendChild(repliesContainer);
        } else {
            // Faqat reply formani qo'shamiz
            newComment.appendChild(replyForm);
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
            
            newComment.appendChild(commentMenu);
            
            // Uchta nuqta tugmasi va menyu uchun hodislarni qo'shamiz
            const optionsBtn = newComment.querySelector('.comment-options');
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
            
            // Tahrirlash tugmasi - "Fikr bildiring" maydoniga qaytarish
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
        const likeBtn = newComment.querySelector('.comment-like');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleLike(commentId);
            });
        }
        
        // Javob berish tugmasi uchun hodis
        const replyBtn = newComment.querySelector('.comment-reply');
        if (replyBtn) {
            replyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleReplyForm(commentId);
            });
        }
        
        // Javoblar soni tugmasi uchun hodis
        const repliesCountBtn = newComment.querySelector('.replies-count');
        if (repliesCountBtn) {
            repliesCountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleReplies(commentId);
            });
        }
        
        
        // Javob berish formasi uchun hodislar
        const replyInput = newComment.querySelector('.reply-input');
        const replySendBtn = newComment.querySelector('.reply-send-btn');
        const replyCancelBtn = newComment.querySelector('.reply-cancel-btn');
        
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
            replySendBtn.addEventListener('click', () => {
                addReply(comment.id || index, replyInput.value.trim());
            });
        }
        
        if (replyCancelBtn) {
            replyCancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const commentId = e.currentTarget.getAttribute('data-id');
                toggleReplyForm(commentId);
            });
        }
        
        return newComment;
    }

    // Javob elementi yaratish funksiyasi
    function createReplyElement(reply, replyIndex, parentCommentId) {
        const replyElement = document.createElement('div');
        replyElement.className = 'comment reply-comment';
        replyElement.setAttribute('data-id', reply.id || `${parentCommentId}-${replyIndex}`);
        
        // Matnda @mention larni formatlash
        let formattedText = reply.text;
        if (reply.replyTo) {
            formattedText = `<span class="mention">@${reply.replyTo}</span> ${reply.text}`;
        }
        
        replyElement.innerHTML = `
            <img src="${reply.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80'}" alt="User Avatar" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">${reply.author || 'Siz'}</div>
                    <div class="comment-time">${reply.time || 'hozirgina'}</div>
                </div>
                <div class="comment-text">${formattedText}</div>
                <div class="comment-actions">
                    <div class="comment-action comment-like ${reply.liked ? 'active' : ''}" data-id="${reply.id || `${parentCommentId}-${replyIndex}`}" data-parent="${parentCommentId}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${reply.liked ? '#ff0000' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span class="like-count">${reply.likes || 0}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Like tugmasi uchun hodis
        const likeBtn = replyElement.querySelector('.comment-like');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const replyId = e.currentTarget.getAttribute('data-id');
                const parentId = e.currentTarget.getAttribute('data-parent');
                toggleLikeReply(replyId, parentId);
            });
        }
        
        return replyElement;
    }

    // Like tugmasi funksiyasi (asosiy fikrlar uchun)
    function toggleLike(commentId) {
        const comment = currentComments.find(c => c.id == commentId || currentComments.indexOf(c) == commentId);
        if (comment) {
            comment.liked = !comment.liked;
            comment.likes = comment.liked ? (comment.likes || 0) + 1 : Math.max(0, (comment.likes || 1) - 1);
            
            // UI ni yangilash
            displayComments();
            
            // Ma'lumotlarni saqlash
            saveToStorage();
            
            // Xabar ko'rsatish
            showNotification(comment.liked ? "Fikrni sevdingiz ❤️" : "Fikrni sevmadingiz");
        }
    }

    // Javob like tugmasi funksiyasi
    function toggleLikeReply(replyId, parentCommentId) {
        const parentComment = currentComments.find(c => c.id == parentCommentId || currentComments.indexOf(c) == parentCommentId);
        if (parentComment && parentComment.replies) {
            const reply = parentComment.replies.find(r => r.id == replyId || parentComment.replies.indexOf(r) == replyId.split('-')[1]);
            if (reply) {
                reply.liked = !reply.liked;
                reply.likes = reply.liked ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 1) - 1);
                
                // UI ni yangilash
                displayComments();
                
                // Ma'lumotlarni saqlash
                saveToStorage();
                
                // Xabar ko'rsatish
                showNotification(reply.liked ? "Javobni sevdingiz ❤️" : "Javobni sevmadingiz");
            }
        }
    }

    // Javob berish formasini ochish/yopish
    function toggleReplyForm(commentId) {
        if (currentReplyTo === commentId) {
            currentReplyTo = null;
            replyCommentId = null;
        } else {
            currentReplyTo = commentId;
            replyCommentId = commentId;
            
            // Oldingi reply formani yopish
            document.querySelectorAll('.reply-form.show').forEach(form => {
                form.classList.remove('show');
            });
            
            // Javob berish tugmalarini yangilash
            document.querySelectorAll('.comment-reply.replying').forEach(btn => {
                btn.classList.remove('replying');
            });
        }
        
        // Fikrlarni qayta ko'rsatish
        displayComments();
        
        // Agar forma ochilgan bo'lsa, inputga fokus qilish
        if (currentReplyTo === commentId) {
            setTimeout(() => {
                const replyInput = document.getElementById(`replyInput-${commentId}`);
                if (replyInput) {
                    replyInput.focus();
                }
            }, 100);
        }
    }

    // Javoblarni ko'rsatish/yashirish
    function toggleReplies(commentId) {
        const comment = currentComments.find(c => c.id == commentId || currentComments.indexOf(c) == commentId);
        if (comment) {
            comment.showReplies = !comment.showReplies;
            
            // UI ni yangilash
            displayComments();
            
            // Ma'lumotlarni saqlash
            saveToStorage();
        }
    }

    // Javob qo'shish funksiyasi
    function addReply(commentId, text) {
        if (text.trim() !== '') {
            const parentComment = currentComments.find(c => c.id == commentId || currentComments.indexOf(c) == commentId);
            if (parentComment) {
                // Yangi javob yaratish
                const newReply = {
                    id: Date.now(), // Unique ID
                    text: text,
                    author: 'Siz',
                    time: 'hozirgina',
                    timestamp: Date.now(),
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
                    likes: 0,
                    liked: false,
                    replyTo: parentComment.author,
                    replyToId: commentId
                };
                
                // Javoblar ro'yxatini ishlatish
                if (!parentComment.replies) {
                    parentComment.replies = [];
                }
                
                parentComment.replies.push(newReply);
                parentComment.showReplies = true;
                
                // UI ni yangilash
                displayComments();
                
                // Javob berish formasini yopish
                currentReplyTo = null;
                replyCommentId = null;
                
                // Xabar ko'rsatish
                showNotification("Javobingiz muvaffaqiyatli qo'shildi");
                
                // Ma'lumotlarni saqlash
                saveToStorage();
            }
        }
    }

    // Raqamlarni formatlash funksiyasi
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    // Hisoblagichlarni yangilash funksiyasi
    function updateCounts() {
        heartCountDisplay.textContent = formatNumber(heartCount);
        commentsMainCount.textContent = commentsCount;
        commentsModalCount.textContent = commentsCount;
        
        // Ma'lumotlarni saqlash
        saveToStorage();
    }
    
    // Xabarlarni ko'rsatish funksiyasi
    function showNotification(message, duration = 3000) {
        // Mavjud xabarni olib tashlash
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Yangi xabar yaratish
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Progress bar yaratish
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        notification.appendChild(progressBar);
        
        // Animatsiya
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 10);
        
        // Xabarni olib tashlash
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Modalni yopish funksiyasi
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Yurak tugmasi logikasi
    heartBtn.addEventListener('click', () => {
        isHearted = !isHearted;
        
        if (isHearted) {
            // Yurak qo'shilmoqda
            heartBtn.classList.add('active');
            heartCount++;
            showNotification("Siz videoni sevdingiz ❤️");
        } else {
            // Yurak olib tashlanmoqda
            heartBtn.classList.remove('active');
            heartCount--;
            showNotification("Siz videoni sevmadingiz");
        }
        updateCounts();
    });

    // Saqlash tugmasi logikasi
    saveBtn.addEventListener('click', () => {
        const isActive = saveBtn.classList.toggle('active');
        
        // Saqlash holatini saqlash
        const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '{}');
        if (isActive) {
            savedVideos['currentVideo'] = true;
            showNotification("Video saqlandi");
        } else {
            delete savedVideos['currentVideo'];
            showNotification("Video saqlanganlar ro'yxatidan olib tashlandi");
        }
        localStorage.setItem('savedVideos', JSON.stringify(savedVideos));
    });

    // Obuna bo'lish tugmasi logikasi
    subscribeBtn.addEventListener('click', () => {
        isSubscribed = !isSubscribed;
        
        if (isSubscribed) {
            subscribeBtn.textContent = "Obuna bo'lingan";
            subscribeBtn.classList.add('subscribed');
            showNotification("Asia Films HD kanaliga obuna bo'ldingiz");
        } else {
            subscribeBtn.textContent = "Obuna bo'lish";
            subscribeBtn.classList.remove('subscribed');
            showNotification("Asia Films HD kanalidan obunani olib tashladingiz");
        }
        
        saveToStorage();
    });

    // Fikrlar tugmasi bosilganda modalni ochish
    commentsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        // Fokusni fikr qoldirish maydoniga o'tkazish
        setTimeout(() => commentInput.focus(), 300);
    });

    // Modalni yopish (close-comments-btn orqali)
    closeCommentsBtn.addEventListener('click', closeModal);

    // Modal tashqarisiga bosilganda yopish
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Textarea avto kengayishi funksiyasi
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Fikr qoldirish maydoni bo'sh bo'lsa, tugmani o'chirib qo'yish
    commentInput.addEventListener('input', () => {
        adjustTextareaHeight(commentInput);
        if (commentInput.value.trim() !== '' && !isLoading) {
            commentSendBtn.disabled = false;
            commentSendBtn.classList.add('active');
        } else {
            commentSendBtn.disabled = true;
            commentSendBtn.classList.remove('active');
        }
    });

    // Enter tugmasi bilan fikr qo'shish (shift+enter yangi qator uchun)
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !commentSendBtn.disabled && !isLoading) {
            e.preventDefault();
            if (isEditing) {
                updateComment();
            } else {
                addComment();
            }
        }
    });

    // Loading holatini o'rnatish
    function setLoading(isLoadingState) {
        isLoading = isLoadingState;
        if (isLoading) {
            commentSendBtn.classList.add('loading');
            commentSendBtn.disabled = true;
            commentInput.disabled = true;
        } else {
            commentSendBtn.classList.remove('loading');
            commentSendBtn.disabled = commentInput.value.trim() === '';
            commentInput.disabled = false;
            if (commentInput.value.trim() !== '') {
                commentSendBtn.classList.add('active');
            }
        }
    }

    // Fikr qo'shish funksiyasi
    function addComment() {
        if (commentInput.value.trim() !== '' && !isLoading) {
            setLoading(true);
            
            // Simulyatsiya qilish uchun 1 soniya kutish
            setTimeout(() => {
                const now = new Date();
                const newComment = {
                    id: Date.now(), // Unique ID
                    text: commentInput.value.trim(),
                    author: 'Siz',
                    time: formatTime(now),
                    timestamp: now.getTime(),
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
                    likes: 0,
                    liked: false,
                    replies: [],
                    showReplies: false
                };
                
                currentComments.unshift(newComment);
                commentsCount++;
                
                // Yangi fikrni modal ichida ko'rsatish
                displayComments();
                
                // Input maydonini tozalash
                commentInput.value = '';
                setLoading(false);
                adjustTextareaHeight(commentInput);
                
                // Fikr muvaffaqiyatli qo'shildi xabari
                showNotification("Fikringiz muvaffaqiyatli qo'shildi");
                
                // Fokusni qaytarish
                commentInput.focus();
            }, 1000);
        }
    }

    // Fikrni "Fikr bildiring" maydoniga o'tkazish va tahrirlash
    function openEditInInput(commentId) {
        currentEditCommentId = commentId;
        const comment = currentComments.find(c => c.id == commentId || currentComments.indexOf(c) == commentId);
        
        if (comment) {
            // Tahrirlash holatini o'rnatish
            isEditing = true;
            
            // Matnni "Fikr bildiring" maydoniga o'tkazish
            commentInput.value = comment.text;
            
            // Tugma matnini o'zgartirish
            commentSendBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
            `;
            
            // Tugmani faollashtirish
            commentSendBtn.disabled = false;
            commentSendBtn.classList.add('active');
            
            // Textarea balandligini sozlash
            adjustTextareaHeight(commentInput);
            
            // Fokusni inputga o'tkazish
            commentInput.focus();
            commentInput.selectionStart = commentInput.value.length;
            commentInput.selectionEnd = commentInput.value.length;
            
            // Xabar ko'rsatish
            showNotification("Fikrni tahrirlash uchun tayyor", 2000);
        }
    }

    // Fikrni yangilash funksiyasi
    function updateComment() {
        if (currentEditCommentId !== null && commentInput.value.trim() !== '' && !isLoading) {
            setLoading(true);
            
            // Simulyatsiya qilish uchun 1 soniya kutish
            setTimeout(() => {
                const comment = currentComments.find(c => c.id == currentEditCommentId || currentComments.indexOf(c) == currentEditCommentId);
                if (comment) {
                    // Fikrni yangilash
                    comment.text = commentInput.value.trim();
                    comment.time = formatTime(new Date()) + " (tahrirlangan)";
                    comment.timestamp = new Date().getTime();
                    
                    // Fikrlarni qayta ko'rsatish
                    displayComments();
                    
                    // Input maydonini tozalash
                    commentInput.value = '';
                    isEditing = false;
                    currentEditCommentId = null;
                    
                    
                    // Tugma matnini asl holiga qaytarish
                    commentSendBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    `;
                    
                    setLoading(false);
                    adjustTextareaHeight(commentInput);
                    
                    // Xabar ko'rsatish
                    showNotification("Fikr muvaffaqiyatli tahrirlandi");
                }
            }, 1000);
        }
    }

    // Fikr qo'shish/yangilash tugmasi
    commentSendBtn.addEventListener('click', () => {
        if (isLoading) return;
        
        if (isEditing) {
            updateComment();
        } else {
            addComment();
        }
    });

    // Ulashish tugmasi logikasi
    document.getElementById('share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Ozoda - YANGI SHOU 2025 konsert dasturi',
                text: 'Ozoda - YANGI SHOU 2025 konsert dasturi | Eng yangi qo\'shiqlar',
                url: window.location.href,
            })
            .then(() => showNotification("Video muvaffaqiyatli ulashildi"))
            .catch((error) => showNotification("Ulashishda xatolik yuz berdi"));
        } else {
            // Fallback: URL ni clipboard ga nusxalash
            navigator.clipboard.writeText(window.location.href)
                .then(() => showNotification("Havola nusxalandi"))
                .catch(() => showNotification("Nusxalashda xatolik yuz berdi"));
        }
    });

    // Tahrirlash modalini yopish funksiyasi (eski usul - faqat saqlash uchun)
    function openEditModal(commentId) {
        currentEditCommentId = commentId;
        const comment = currentComments.find(c => c.id == commentId || currentComments.indexOf(c) == commentId);
        
        if (comment) {
            // Matnni modal textareaga o'tkazish
            editCommentTextarea.value = comment.text;
            editModal.classList.add('show');
            
            // Fokusni textareaga o'tkazish
            setTimeout(() => {
                editCommentTextarea.focus();
                editCommentTextarea.selectionStart = editCommentTextarea.value.length;
                editCommentTextarea.selectionEnd = editCommentTextarea.value.length;
                adjustTextareaHeight(editCommentTextarea);
            }, 100);
        }
    }

    // Tahrirlash modalini yopish funksiyasi
    function closeEditModal() {
        editModal.classList.remove('show');
        currentEditCommentId = null;
        editCommentTextarea.value = '';
    }

    // Tahrirlash modalini yopish
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);

    // Modal tashqarisiga bosilganda yopish
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });

    // Tahrirlangan fikrni saqlash (eski usul)
    saveEditBtn.addEventListener('click', () => {
        if (currentEditCommentId !== null && editCommentTextarea.value.trim() !== '') {
            const comment = currentComments.find(c => c.id == currentEditCommentId || currentComments.indexOf(c) == currentEditCommentId);
            if (comment) {
                // Fikrni yangilash
                comment.text = editCommentTextarea.value.trim();
                comment.time = formatTime(new Date()) + " (tahrirlangan)";
                comment.timestamp = new Date().getTime();
                
                // Fikrlarni qayta ko'rsatish
                displayComments();
                
                // Modalni yopish
                closeEditModal();
                
                // Xabar ko'rsatish
                showNotification("Fikr muvaffaqiyatli tahrirlandi");
            }
        }
    });

    // Fikrni o'chirish funksiyasi
    function deleteComment(commentId) {
        // Tasdiqlash
        if (confirm("Haqiqatan ham ushbu fikrni o'chirmoqchimisiz?")) {
            // Fikrni o'chirish
            const index = currentComments.findIndex(c => c.id == commentId || currentComments.indexOf(c) == commentId);
            if (index !== -1) {
                currentComments.splice(index, 1);
                commentsCount = currentComments.length;
                
                // Fikrlarni qayta ko'rsatish
                displayComments();
                
                // Xabar ko'rsatish
                showNotification("Fikr muvaffaqiyatli o'chirildi");
                
                // Ma'lumotlarni saqlash
                saveToStorage();
            }
        }
    }

    // Tahrirlash textarea uchun avto kengayish
    editCommentTextarea.addEventListener('input', () => {
        adjustTextareaHeight(editCommentTextarea);
    });

    // Sahifa yuklanganda ma'lumotlarni yuklash
    loadFromStorage();
    updateCounts();
    adjustTextareaHeight(commentInput);
    
    // Saqlash tugmasining holatini yuklash
    const savedVideos = JSON.parse(localStorage.getItem('savedVideos') || '{}');
    if (savedVideos['currentVideo']) {
        saveBtn.classList.add('active');
    }
});