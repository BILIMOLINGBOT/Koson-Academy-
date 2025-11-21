// =========================================================================
// YOUTUBE FIKRLAR MODALI FUNKSIONALLIGI
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ... (Mavjud like, dislike, obuna, saqlash va notification funksiyalari) ...

    // Fikrlar modali uchun yangi JS logikasi
    const commentsModal = document.getElementById('commentsModal');
    const closeBtnModal = document.querySelector('#commentsModal .close-btn');
    const commentsBtn = document.getElementById('comments-btn');
    const commentsList = document.getElementById('commentsList');
    const noCommentsIndicator = document.getElementById('no-comments-indicator');
    const commentsMainCount = document.getElementById('comments-main-count');
    const commentsModalCount = document.getElementById('comments-modal-count');

    const addCommentInput = document.querySelector('.add-comment .comment-input');
    const submitCommentBtn = document.querySelector('.add-comment .submit-btn');
    const cancelCommentBtn = document.querySelector('.add-comment .cancel-btn');
    const commentInputContainer = document.querySelector('.comment-input-container');

    const currentUser = "Siz"; // Joriy foydalanuvchi nomi
    
    // Fikrlar ma'lumotlari (simulyatsiya)
    let commentsData = JSON.parse(localStorage.getItem('videoComments')) || [];
    let commentActions = JSON.parse(localStorage.getItem('commentReactions')) || {};
    let currentCommentId = commentsData.length > 0 ? Math.max(...commentsData.map(c => c.id)) + 1 : 1;

    // --- Helper funksiyalar ---

    function saveComments() {
        localStorage.setItem('videoComments', JSON.stringify(commentsData));
        localStorage.setItem('commentReactions', JSON.stringify(commentActions));
        updateCounts();
    }
    
    function findCommentById(id, list = commentsData) {
        for (const comment of list) {
            if (comment.id === id) return comment;
            if (comment.replies) {
                const foundReply = findCommentById(id, comment.replies);
                if (foundReply) return foundReply;
            }
        }
        return null;
    }

    // --- Rendering ---

    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function renderComments() {
        commentsList.innerHTML = '';
        let totalCommentCount = 0;
        
        function createCommentHTML(comment, isReply = false) {
            totalCommentCount++;
            const userReaction = commentActions[comment.id] || null;
            const likeClass = userReaction === 'like' ? 'active-like' : '';
            const dislikeClass = userReaction === 'dislike' ? 'active-dislike' : '';
            const isMyComment = comment.author === currentUser;
            const avatarChar = comment.author.charAt(0).toUpperCase();

            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.id = `comment-${comment.id}`;
            
            const menuHTML = isMyComment ? `
                <div class="comment-menu">
                    <button class="menu-btn" onclick="toggleCommentMenu(event, ${comment.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="19" cy="12" r="1"/>
                            <circle cx="5" cy="12" r="1"/>
                        </svg>
                    </button>
                    <div class="dropdown-menu" id="menu-${comment.id}">
                        <button class="dropdown-item" onclick="editComment(${comment.id})">Tahrirlash</button>
                        <button class="dropdown-item delete" onclick="deleteComment(${comment.id})">O'chirish</button>
                    </div>
                </div>
            ` : '';

            commentElement.innerHTML = `
                <div class="comment-avatar" style="background: ${isMyComment ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : 'linear-gradient(135deg, #ff6b6b, #ffa726)'};">${avatarChar}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-time">${comment.time}</div>
                        ${menuHTML}
                    </div>
                    <div class="comment-text">${comment.text.replace(/\n/g, '<br>')}</div>
                    <div class="comment-actions">
                        <div class="comment-action ${likeClass}" onclick="handleCommentLike(${comment.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            <span>${comment.likes || 0}</span>
                        </div>
                        <div class="comment-action ${dislikeClass}" onclick="handleCommentDislike(${comment.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            <span>${comment.dislikes || 0}</span>
                        </div>
                        <div class="comment-reply" onclick="toggleReplyInput(${comment.id})">Javob berish</div>
                    </div>
                    <div class="reply-container" id="reply-container-${comment.id}"></div>
                </div>
            `;
            
            if (comment.replies && comment.replies.length > 0) {
                const repliesList = document.createElement('div');
                repliesList.className = 'replies-list';
                comment.replies.forEach(reply => {
                    const replyElement = createCommentHTML(reply, true);
                    replyElement.classList.add('reply');
                    repliesList.appendChild(replyElement);
                });
                commentElement.querySelector('.comment-content').appendChild(repliesList);
            }

            return commentElement;
        }

        commentsData.forEach(comment => {
            commentsList.appendChild(createCommentHTML(comment));
        });

        // Boshqaruvchi holatini yangilash
        if (totalCommentCount > 0) {
            noCommentsIndicator.style.display = 'none';
            commentsList.style.display = 'block';
        } else {
            noCommentsIndicator.style.display = 'flex';
            commentsList.style.display = 'none';
        }
        
        commentsMainCount.textContent = totalCommentCount;
        commentsModalCount.textContent = totalCommentCount;
    }

    // --- Fikrga Reaksiya (Like/Dislike) ---
    
    window.handleCommentLike = function(commentId) {
        const comment = findCommentById(commentId);
        if (!comment) return;

        const currentAction = commentActions[commentId];

        if (currentAction === 'like') {
            comment.likes = Math.max(0, comment.likes - 1);
            delete commentActions[commentId];
        } else {
            if (currentAction === 'dislike') {
                comment.dislikes = Math.max(0, comment.dislikes - 1);
            }
            comment.likes++;
            commentActions[commentId] = 'like';
        }
        
        saveComments();
        renderComments();
    }
    
    window.handleCommentDislike = function(commentId) {
        const comment = findCommentById(commentId);
        if (!comment) return;

        const currentAction = commentActions[commentId];

        if (currentAction === 'dislike') {
            comment.dislikes = Math.max(0, comment.dislikes - 1);
            delete commentActions[commentId];
        } else {
            if (currentAction === 'like') {
                comment.likes = Math.max(0, comment.likes - 1);
            }
            comment.dislikes++;
            commentActions[commentId] = 'dislike';
        }
        
        saveComments();
        renderComments();
    }
    
    // --- Menyu (Tahrirlash/O'chirish) ---

    window.toggleCommentMenu = function(event, commentId) {
        event.stopPropagation(); // Dropdown yopilmasligi uchun

        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu.id !== `menu-${commentId}`) {
                menu.style.display = 'none';
            }
        });

        const menu = document.getElementById(`menu-${commentId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
        
        document.addEventListener('click', closeMenusOnClickOutside, { once: true });
    }
    
    function closeMenusOnClickOutside(event) {
        if (!event.target.closest('.comment-menu')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
        } else {
             // Agar target menu bo'lsa, qayta tinglash kerak
             document.addEventListener('click', closeMenusOnClickOutside, { once: true });
        }
    }

    // --- Fikrni Tahrirlash ---

    window.editComment = function(commentId) {
        const comment = findCommentById(commentId);
        if (!comment || comment.author !== currentUser) return;
        
        // Menuni yopish
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');

        // Inline tahrirlash maydoni yaratish
        const commentElement = document.getElementById(`comment-${commentId}`);
        const commentTextDiv = commentElement.querySelector('.comment-text');
        const originalText = comment.text;

        const editBox = document.createElement('div');
        editBox.className = 'edit-box';
        editBox.style.marginTop = '10px';
        editBox.innerHTML = `
            <textarea class="comment-input" style="width:100%; min-height:80px; padding:10px; margin-bottom:10px; border:1px solid #3e3e3e; background:#1c1c1c; color:white; border-radius:4px;">${originalText}</textarea>
            <div class="comment-buttons" style="justify-content: flex-end; position: static;">
                <button class="comment-btn cancel-btn edit-cancel-btn">Bekor qilish</button>
                <button class="comment-btn submit-btn edit-save-btn">Saqlash</button>
            </div>
        `;
        
        // Asl matnni o'chirish va tahrirlash maydonini qo'shish
        commentTextDiv.style.display = 'none';
        commentElement.querySelector('.comment-content').insertBefore(editBox, commentElement.querySelector('.comment-actions'));
        
        const editTextarea = editBox.querySelector('textarea');
        const saveEditBtn = editBox.querySelector('.edit-save-btn');
        const cancelEditBtn = editBox.querySelector('.edit-cancel-btn');

        adjustTextareaHeight(editTextarea);
        editTextarea.focus();
        
        // Tahrirlashni saqlash
        saveEditBtn.onclick = () => {
            const newText = editTextarea.value.trim();
            if (newText) {
                comment.text = newText;
                comment.time = comment.time.includes("(tahrirlandi)") ? comment.time : comment.time + " (tahrirlandi)";
                saveComments();
                renderComments();
                showNotification("Fikr tahrirlandi");
            } else {
                showNotification("Fikr matni bo'sh bo'lishi mumkin emas", 2000);
            }
        };

        // Tahrirlashni bekor qilish
        cancelEditBtn.onclick = () => {
            editBox.remove();
            commentTextDiv.style.display = 'block';
        };
    }

    // --- Fikrni O'chirish ---

    window.deleteComment = function(commentId) {
        if (!confirm("Haqiqatan ham bu fikrni o'chirmoqchimisiz?")) return;
        
        const deleteRecursive = (list, id) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === id) {
                    list.splice(i, 1);
                    return true;
                }
                if (list[i].replies && deleteRecursive(list[i].replies, id)) return true;
            }
            return false;
        };

        if (deleteRecursive(commentsData, commentId)) {
            delete commentActions[commentId]; // Reaksiyani ham o'chirish
            saveComments();
            renderComments();
            showNotification("Fikr o'chirildi");
        }
    }

    // --- Javob Berish Inputi ---

    window.toggleReplyInput = function(parentId) {
        document.querySelectorAll('[id^="reply-container-"]').forEach(container => {
            if (container.id !== `reply-container-${parentId}`) {
                container.innerHTML = '';
            }
        });

        const replyContainer = document.getElementById(`reply-container-${parentId}`);
        if (replyContainer.innerHTML !== '') {
            replyContainer.innerHTML = '';
            return;
        }
        
        const parentComment = findCommentById(parentId);
        const mention = parentComment.author !== currentUser ? `@${parentComment.author} ` : '';

        replyContainer.innerHTML = `
            <div class="add-comment" style="margin-top: 10px;">
                <div class="add-comment-avatar">S</div>
                <div class="comment-input-container">
                    <textarea class="comment-input reply-input" placeholder="Javob bildiring...">${mention}</textarea>
                    <div class="comment-buttons">
                        <button class="comment-btn cancel-btn reply-cancel-btn">Bekor qilish</button>
                        <button class="comment-btn submit-btn reply-submit-btn" disabled>Yuborish</button>
                    </div>
                </div>
            </div>
        `;
        
        const replyInput = replyContainer.querySelector('.reply-input');
        const replySubmitBtn = replyContainer.querySelector('.reply-submit-btn');
        const replyCancelBtn = replyContainer.querySelector('.reply-cancel-btn');
        
        replyInput.focus();
        if (mention) replyInput.setSelectionRange(replyInput.value.length, replyInput.value.length);
        
        adjustTextareaHeight(replyInput);

        replyInput.oninput = () => {
            adjustTextareaHeight(replyInput);
            replySubmitBtn.disabled = replyInput.value.trim() === '';
        };

        replyCancelBtn.onclick = () => replyContainer.innerHTML = '';

        replySubmitBtn.onclick = () => submitReply(parentId, replyInput.value, replySubmitBtn);
    }

    function submitReply(parentId, text, button) {
        if (!text.trim()) return;

        // Loading holati
        button.disabled = true;
        button.innerHTML = '<div class="spinner"></div> Yuborilmoqda...';

        setTimeout(() => {
            const parent = findCommentById(parentId);
            if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push({
                    id: currentCommentId++,
                    author: currentUser,
                    text: text,
                    time: "hozirgina",
                    likes: 0,
                    dislikes: 0,
                });
                saveComments();
                renderComments();
                showNotification("Javobingiz qo'shildi");
                document.getElementById(`reply-container-${parentId}`).innerHTML = ''; // Javob maydonini yopish
            }
        }, 1500); // Simulyatsiya vaqti
    }


    // --- Asosiy Fikr Yuborish ---

    addCommentInput.oninput = () => {
        adjustTextareaHeight(addCommentInput);
        submitCommentBtn.disabled = addCommentInput.value.trim() === '';
    };

    cancelCommentBtn.onclick = () => {
        addCommentInput.value = '';
        submitCommentBtn.disabled = true;
        adjustTextareaHeight(addCommentInput);
    };

    submitCommentBtn.onclick = () => {
        const text = addCommentInput.value.trim();
        if (!text) return;

        // Loading holati
        submitCommentBtn.disabled = true;
        submitCommentBtn.innerHTML = '<div class="spinner"></div> Yuborilmoqda...'; // JS dagi spinner tugmasini o'zgartiring

        setTimeout(() => {
            commentsData.unshift({
                id: currentCommentId++,
                author: currentUser,
                text: text,
                time: "hozirgina",
                likes: 0,
                dislikes: 0,
                replies: []
            });
            saveComments();
            renderComments();
            showNotification("Fikringiz muvaffaqiyatli qo'shildi");
            
            // Inputni tozalash
            addCommentInput.value = '';
            submitCommentBtn.innerHTML = 'Yuborish';
            submitCommentBtn.disabled = true;
            adjustTextareaHeight(addCommentInput);
        }, 1500); // Simulyatsiya vaqti
    };

    // --- Modal Boshqaruvi ---

    commentsBtn.addEventListener('click', () => {
        commentsModal.style.display = 'block';
        setTimeout(() => commentsModal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        renderComments(); // Modal ochilganda fikrlarni yuklash
        setTimeout(() => adjustTextareaHeight(addCommentInput), 300);
    });

    closeBtnModal.addEventListener('click', () => {
        commentsModal.classList.remove('show');
        setTimeout(() => {
            commentsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    });
    
    // Modal tashqarisiga bosilganda yopish
    window.addEventListener('click', (event) => {
        if (event.target === commentsModal) {
            commentsModal.classList.remove('show');
            setTimeout(() => {
                commentsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    });

    // Dastlabki yuklash
    updateCounts();
    // Boshqa barcha event listenerlar shu yerda tugaydi.
});

// `showNotification` va `updateCounts` funksiyalari mavjud bo'lishi kerak.
// `formatNumber` funksiyasi ham mavjud bo'lishi kerak.
