document.addEventListener('DOMContentLoaded', () => {
    // Elementlarni tanlab olish
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const saveBtn = document.getElementById('save-btn');
    const commentsBtn = document.getElementById('comments-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const modal = document.getElementById('commentsModal');
    const replyModal = document.getElementById('replyModal');
    const closeBtn = document.querySelector('.close-btn');
    const replyCloseBtn = document.querySelector('.reply-close');
    const backToCommentsBtn = document.getElementById('back-to-comments');
    const commentInput = document.querySelector('.comment-input');
    const replyInput = document.querySelector('.reply-input');
    const submitBtn = document.querySelector('.submit-btn');
    const submitReplyBtn = document.querySelector('.submit-reply-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const cancelReplyBtn = document.querySelector('.cancel-reply-btn');
    const commentsList = document.getElementById('commentsList');
    const repliesList = document.getElementById('repliesList');
    const originalComment = document.getElementById('original-comment');
    const noCommentsIndicator = document.getElementById('no-comments-indicator');
    const commentsMainCount = document.getElementById('comments-main-count');
    const commentsModalCount = document.getElementById('comments-modal-count');
    const likeCountDisplay = document.getElementById('like-count');
    const dislikeCountDisplay = document.getElementById('dislike-count');

    // Boshlang'ich ma'lumotlar
    let likeCount = 12000;
    let dislikeCount = 2500;
    let commentsCount = 0;
    let userReaction = null;
    let isSubscribed = false;
    let currentReplyingTo = null;
    let comments = [];
    let typingTimer = null;

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            likeCount,
            dislikeCount,
            commentsCount,
            userReaction,
            isSubscribed,
            comments
        };
        localStorage.setItem('videoReactions', JSON.stringify(data));
    };

    // Ma'lumotlarni yuklash funksiyasi
    const loadFromStorage = () => {
        const savedData = localStorage.getItem('videoReactions');
        if (savedData) {
            const data = JSON.parse(savedData);
            likeCount = data.likeCount || likeCount;
            dislikeCount = data.dislikeCount || dislikeCount;
            commentsCount = data.commentsCount || commentsCount;
            userReaction = data.userReaction || null;
            isSubscribed = data.isSubscribed || false;
            comments = data.comments || [];
            
            // Foydalanuvchi reaktsiyasini ko'rsatish
            if (userReaction === 'like') {
                likeBtn.classList.add('active');
            } else if (userReaction === 'dislike') {
                dislikeBtn.classList.add('active');
            }
            
            // Obuna holatini ko'rsatish
            if (isSubscribed) {
                subscribeBtn.textContent = "Obuna bo'lingan";
                subscribeBtn.classList.add('subscribed');
            }
            
            // Fikrlarni yuklash
            renderComments();
        }
    };

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
        likeCountDisplay.textContent = formatNumber(likeCount);
        dislikeCountDisplay.textContent = formatNumber(dislikeCount);
        commentsMainCount.textContent = commentsCount;
        commentsModalCount.textContent = commentsCount;

        // Fikrlar ro'yxati va "fikrlar yo'q" xabarini boshqarish
        if (commentsCount > 0) {
            noCommentsIndicator.style.display = 'none';
            commentsList.style.display = 'block';
        } else {
            noCommentsIndicator.style.display = 'flex';
            commentsList.style.display = 'none';
        }
        
        // Ma'lumotlarni saqlash
        saveToStorage();
    }

    // Fikrlarni ko'rsatish funksiyasi
    function renderComments() {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
        updateCounts();
    }

    // Fikr elementini yaratish
    function createCommentElement(comment, isReply = false) {
        const commentDiv = document.createElement('div');
        commentDiv.className = isReply ? 'reply-item' : 'comment';
        commentDiv.dataset.id = comment.id;
        
        const likesCount = comment.likes || 0;
        const isLiked = comment.userReaction === 'like';
        const isDisliked = comment.userReaction === 'dislike';
        
        commentDiv.innerHTML = `
            <div class="comment-avatar">${comment.author.charAt(0)}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-time">${comment.time}</div>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions">
                    <div class="comment-like ${isLiked ? 'active' : ''}" data-id="${comment.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>${likesCount}</span>
                    </div>
                    <div class="comment-dislike ${isDisliked ? 'active' : ''}" data-id="${comment.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                        </svg>
                    </div>
                    <div class="comment-reply-btn" data-id="${comment.id}">
                        Javob berish
                    </div>
                </div>
                ${!isReply && comment.replies && comment.replies.length > 0 ? `
                    <div class="view-replies" data-id="${comment.id}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        ${comment.replies.length} javob
                    </div>
                    <div class="replies-container" id="replies-${comment.id}" style="display: none;">
                        ${comment.replies.map(reply => createCommentElement(reply, true).outerHTML).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        return commentDiv;
    }

    // Fikrga like/dislike qo'shish
    function handleCommentReaction(commentId, reaction) {
        const comment = findComment(comments, commentId);
        if (comment) {
            const previousReaction = comment.userReaction;
            
            if (previousReaction === reaction) {
                // Reaktsiyani olib tashlash
                comment.userReaction = null;
                if (reaction === 'like') {
                    comment.likes = Math.max(0, (comment.likes || 0) - 1);
                }
            } else {
                // Yangi reaktsiya qo'shish
                comment.userReaction = reaction;
                if (reaction === 'like') {
                    comment.likes = (comment.likes || 0) + 1;
                    // Agar oldin dislike bo'lsa, uni olib tashlash
                    if (previousReaction === 'dislike') {
                        // Dislike ni olib tashlash
                    }
                } else if (reaction === 'dislike') {
                    // Agar oldin like bo'lsa, like ni kamaytirish
                    if (previousReaction === 'like') {
                        comment.likes = Math.max(0, (comment.likes || 0) - 1);
                    }
                }
            }
            
            renderComments();
            saveToStorage();
            showNotification(`Fikr ${reaction === 'like' ? 'like' : 'dislike'} qilindi`);
        }
    }

    // Fikrni topish (nested replies bilan ishlash uchun)
    function findComment(commentList, id) {
        for (let comment of commentList) {
            if (comment.id === id) return comment;
            if (comment.replies) {
                const found = findComment(comment.replies, id);
                if (found) return found;
            }
        }
        return null;
    }

    // Javoblar modalini ochish
    function openReplyModal(commentId) {
        const comment = findComment(comments, commentId);
        if (comment) {
            currentReplyingTo = commentId;
            
            // Asosiy fikrni ko'rsatish
            originalComment.innerHTML = `
                <div class="comment">
                    <div class="comment-avatar">${comment.author.charAt(0)}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-time">${comment.time}</div>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                    </div>
                </div>
            `;
            
            // Javoblarni ko'rsatish
            renderReplies(comment.replies || []);
            
            // Modalni ochish
            replyModal.style.display = 'block';
            setTimeout(() => replyModal.classList.add('show'), 10);
            document.body.style.overflow = 'hidden';
            
            // Fokusni reply inputga o'tkazish
            setTimeout(() => replyInput.focus(), 300);
        }
    }

    // Javoblarni ko'rsatish
    function renderReplies(replies) {
        repliesList.innerHTML = '';
        if (replies.length === 0) {
            repliesList.innerHTML = `
                <div class="no-comments">
                    <div class="no-comments-icon">💬</div>
                    <div class="no-comments-text">Hozircha javoblar yo'q</div>
                    <div class="no-comments-subtext">Birinchi javob beruvchi bo'ling</div>
                </div>
            `;
        } else {
            replies.forEach(reply => {
                const replyElement = createCommentElement(reply, true);
                repliesList.appendChild(replyElement);
            });
        }
    }

    // Javob qo'shish
    function addReply() {
        if (replyInput.value.trim() !== '' && currentReplyingTo) {
            const comment = findComment(comments, currentReplyingTo);
            if (comment) {
                const newReply = {
                    id: Date.now().toString(),
                    author: 'Siz',
                    text: replyInput.value,
                    time: 'hozirgina',
                    likes: 0,
                    userReaction: null,
                    replies: []
                };
                
                if (!comment.replies) {
                    comment.replies = [];
                }
                comment.replies.push(newReply);
                
                // Inputni tozalash
                replyInput.value = '';
                submitReplyBtn.disabled = true;
                adjustTextareaHeight(replyInput);
                
                // Javoblarni yangilash
                renderReplies(comment.replies);
                renderComments();
                saveToStorage();
                
                showNotification("Javobingiz muvaffaqiyatli qo'shildi");
            }
        }
    }

    // Textarea balandligini sozlash
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Xabarlarni ko'rsatish funksiyasi
    function showNotification(message, duration = 3000) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        notification.appendChild(progressBar);
        
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Event Listeners
    commentsList.addEventListener('click', (e) => {
        const target = e.target.closest('.comment-like, .comment-dislike, .comment-reply-btn, .view-replies');
        if (!target) return;
        
        const commentId = target.dataset.id;
        
        if (target.classList.contains('comment-like')) {
            handleCommentReaction(commentId, 'like');
        } else if (target.classList.contains('comment-dislike')) {
            handleCommentReaction(commentId, 'dislike');
        } else if (target.classList.contains('comment-reply-btn')) {
            openReplyModal(commentId);
        } else if (target.classList.contains('view-replies')) {
            const repliesContainer = document.getElementById(`replies-${commentId}`);
            if (repliesContainer) {
                repliesContainer.style.display = repliesContainer.style.display === 'none' ? 'block' : 'none';
                target.querySelector('svg').style.transform = 
                    repliesContainer.style.display === 'none' ? 'rotate(0deg)' : 'rotate(90deg)';
            }
        }
    });

    // Replies list uchun event listener
    repliesList.addEventListener('click', (e) => {
        const target = e.target.closest('.comment-like, .comment-dislike');
        if (!target) return;
        
        const commentId = target.dataset.id;
        
        if (target.classList.contains('comment-like')) {
            handleCommentReaction(commentId, 'like');
        } else if (target.classList.contains('comment-dislike')) {
            handleCommentReaction(commentId, 'dislike');
        }
    });

    // Fikr qo'shish funksiyasi
    function addComment() {
        if (commentInput.value.trim() !== '') {
            const newComment = {
                id: Date.now().toString(),
                author: 'Siz',
                text: commentInput.value,
                time: 'hozirgina',
                likes: 0,
                userReaction: null,
                replies: []
            };
            
            comments.unshift(newComment);
            commentsCount = comments.length;
            
            // Input maydonini tozalash
            commentInput.value = '';
            submitBtn.disabled = true;
            adjustTextareaHeight(commentInput);
            
            // Fikrlarni yangilash
            renderComments();
            showNotification("Fikringiz muvaffaqiyatli qo'shildi");
        }
    }

    // Modalni yopish funksiyalari
    function closeReplyModal() {
        replyModal.classList.remove('show');
        setTimeout(() => {
            replyModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentReplyingTo = null;
            replyInput.value = '';
            submitReplyBtn.disabled = true;
            adjustTextareaHeight(replyInput);
        }, 300);
    }

    // Input event listenerlari
    commentInput.addEventListener('input', () => {
        adjustTextareaHeight(commentInput);
        submitBtn.disabled = commentInput.value.trim() === '';
    });

    replyInput.addEventListener('input', () => {
        adjustTextareaHeight(replyInput);
        submitReplyBtn.disabled = replyInput.value.trim() === '';
    });

    // Enter bilan yuborish
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !submitBtn.disabled) {
            e.preventDefault();
            addComment();
        }
    });

    replyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !submitReplyBtn.disabled) {
            e.preventDefault();
            addReply();
        }
    });

    // Tugmalar uchun event listenerlar
    submitBtn.addEventListener('click', addComment);
    submitReplyBtn.addEventListener('click', addReply);
    
    cancelBtn.addEventListener('click', () => {
        commentInput.value = '';
        submitBtn.disabled = true;
        adjustTextareaHeight(commentInput);
    });

    cancelReplyBtn.addEventListener('click', () => {
        replyInput.value = '';
        submitReplyBtn.disabled = true;
        adjustTextareaHeight(replyInput);
    });

    // Modal yopish
    backToCommentsBtn.addEventListener('click', closeReplyModal);
    replyCloseBtn.addEventListener('click', closeReplyModal);

    // Tashqariga bosilganda yopish
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
        if (event.target === replyModal) {
            closeReplyModal();
        }
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

    // Avvalgi fikrlar qo'shish (demo maqsadida)
    if (comments.length === 0) {
        comments = [
            {
                id: '1',
                author: 'Dilshod',
                text: 'Ajoyib kontsert! Ozoda juda zo\'r qo\'shiqlarni kuyladi.',
                time: '2 kun avval',
                likes: 24,
                userReaction: null,
                replies: [
                    {
                        id: '1-1',
                        author: 'Sanjar',
                        text: 'Rost! Men ham shu fikrdaman.',
                        time: '1 kun avval',
                        likes: 5,
                        userReaction: null,
                        replies: []
                    }
                ]
            },
            {
                id: '2',
                author: 'Madina',
                text: 'Yangi qo\'shiqlar juda yoqdi, albom chiqarishini kutayapman.',
                time: '1 kun avval',
                likes: 15,
                userReaction: null,
                replies: []
            }
  