document.addEventListener('DOMContentLoaded', () => {
    // Elementlarni tanlab olish
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const saveBtn = document.getElementById('save-btn');
    const commentsBtn = document.getElementById('comments-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const modal = document.getElementById('commentsModal');
    const closeBtn = document.querySelector('.close-btn');
    const mainCommentInput = document.getElementById('main-comment-input');
    const submitMainCommentBtn = document.getElementById('submit-main-comment');
    const cancelMainCommentBtn = document.getElementById('cancel-main-comment');
    const commentsList = document.getElementById('commentsList');
    const noCommentsIndicator = document.getElementById('no-comments-indicator');
    const commentsMainCount = document.getElementById('comments-main-count');
    const commentsModalCount = document.getElementById('comments-modal-count');
    const likeCountDisplay = document.getElementById('like-count');
    const dislikeCountDisplay = document.getElementById('dislike-count');
    
    // Tahrirlash modal elementlari
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveEditBtn = document.getElementById('save-edit');

    // Joriy foydalanuvchi
    const currentUser = "Siz";
    
    // Like/dislike ma'lumotlarini saqlash
    let userActions = JSON.parse(localStorage.getItem('commentActions')) || {};
    
    // Boshlang'ich ma'lumotlar
    let likeCount = 12000;
    let dislikeCount = 2500;
    let commentsCount = 0;
    let userReaction = null;
    let isSubscribed = false;
    
    // Fikrlar ma'lumotlari
    let comments = [
        {
            id: 1,
            author: "nafisaning_dunyosi",
            avatar: null,
            text: "Nechi dubl bo'ldi😂 shapaloqqa",
            time: "2 kun oldin",
            likes: 1743,
            dislikes: 5,
            replies: []
        },
        {
            id: 2,
            author: "shoirabonu_essens",
            avatar: null,
            text: "Yegan oshim burnimdan chiqdi degan joyi wu😂",
            time: "22 soat oldin",
            likes: 5,
            dislikes: 1,
            replies: []
        },
        {
            id: 3,
            author: currentUser,
            avatar: null,
            text: "Bu mening fikrim, men uni o'chirishim yoki tahrirlashim mumkin",
            time: "5 daqiqa oldin",
            likes: 0,
            dislikes: 0,
            replies: []
        }
    ];

    // Tahrirlash uchun joriy komment ID
    let currentEditId = null;

    // Ma'lumotlarni saqlash funksiyasi
    const saveToStorage = () => {
        const data = {
            likeCount,
            dislikeCount,
            commentsCount,
            userReaction,
            isSubscribed
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

    // Like tugmasi logikasi
    likeBtn.addEventListener('click', () => {
        const wasActive = likeBtn.classList.contains('active');
        
        if (wasActive) {
            // Like olib tashlanmoqda
            likeBtn.classList.remove('active');
            likeCount--;
            userReaction = null;
            showNotification("Siz like ni olib tashladingiz");
        } else {
            // Like qo'shilmoqda
            likeBtn.classList.add('active');
            likeCount++;
            
            // Agar dislike aktiv bo'lsa, uni olib tashlash
            if (dislikeBtn.classList.contains('active')) {
                dislikeBtn.classList.remove('active');
                dislikeCount--;
            }
            
            userReaction = 'like';
            showNotification("Siz videoni like qildingiz");
        }
        updateCounts();
    });

    // Dislike tugmasi logikasi
    dislikeBtn.addEventListener('click', () => {
        const wasActive = dislikeBtn.classList.contains('active');
        
        if (wasActive) {
            // Dislike olib tashlanmoqda
            dislikeBtn.classList.remove('active');
            dislikeCount--;
            userReaction = null;
            showNotification("Siz dislike ni olib tashladingiz");
        } else {
            // Dislike qo'shilmoqda
            dislikeBtn.classList.add('active');
            dislikeCount++;
            
            // Agar like aktiv bo'lsa, uni olib tashlash
            if (likeBtn.classList.contains('active')) {
                likeBtn.classList.remove('active');
                likeCount--;
            }
            
            userReaction = 'dislike';
            showNotification("Siz videoni dislike qildingiz");
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
        setTimeout(() => mainCommentInput.focus(), 300);
        renderComments();
    });

    // Modalni yopish
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    });

    // Modal tashqarisiga bosilganda yopish
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    });

    // Textarea avto kengayishi
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Fikr qoldirish maydoni bo'sh bo'lsa, tugmani o'chirib qo'yish
    mainCommentInput.addEventListener('input', () => {
        adjustTextareaHeight(mainCommentInput);
        if (mainCommentInput.value.trim() !== '') {
            submitMainCommentBtn.disabled = false;
        } else {
            submitMainCommentBtn.disabled = true;
        }
    });

    // Bekor qilish tugmasi
    cancelMainCommentBtn.addEventListener('click', () => {
        mainCommentInput.value = '';
        submitMainCommentBtn.disabled = true;
        adjustTextareaHeight(mainCommentInput);
    });

    // 1. RENDER
    function renderComments() {
        commentsList.innerHTML = '';
        let total = 0;
        
        // Barcha kommentlarni va ularning javoblarini tekis ro'yxatda chiqaramiz
        function renderCommentList(commentList, isReply = false) {
            commentList.forEach(comment => {
                total++;
                commentsList.appendChild(createCommentHTML(comment, isReply));
                
                // Javoblarni ham tekis ro'yxatda chiqaramiz
                if (comment.replies && comment.replies.length > 0) {
                    renderCommentList(comment.replies, true);
                }
            });
        }
        
        renderCommentList(comments);
        commentsCount = total;
        updateCounts();
    }

    function formatText(text) {
        return text.replace(/@(\w+)/g, '<a href="#" class="user-mention">@$1</a>');
    }

    // 2. COMMENT COMPONENT
    function createCommentHTML(data, isReply = false) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comment-wrapper';
        wrapper.id = `comment-wrapper-${data.id}`;

        const avatarClass = isReply ? "add-comment-avatar small-avatar" : "add-comment-avatar";
        const avatarHTML = data.avatar 
            ? `<img src="${data.avatar}" class="${avatarClass}" style="object-fit:cover;">` 
            : `<div class="${avatarClass}">${data.author.charAt(0).toUpperCase()}</div>`;

        // Menyu tugmasi (faqat o'z fikrlari uchun)
        const menuButton = data.author === currentUser 
            ? `<button class="menu-btn" onclick="toggleMenu(${data.id})">⋯</button>
               <div class="dropdown-menu" id="menu-${data.id}">
                 <button class="dropdown-item" onclick="editComment(${data.id})">Tahrirlash</button>
                 <button class="dropdown-item delete" onclick="deleteComment(${data.id})">O'chirish</button>
               </div>` 
            : '';

        // Foydalanuvchi amali
        const userAction = userActions[data.id] || null;
        const likeClass = userAction === 'like' ? 'active-like' : '';
        const dislikeClass = userAction === 'dislike' ? 'active-dislike' : '';

        // BODY
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'comment-body';
        bodyDiv.innerHTML = `
            ${avatarHTML}
            <div class="comment-content">
                <div class="comment-info">
                    <div>
                        <span class="author-name">${data.author}</span>
                        <span class="comment-time">${data.time}</span>
                    </div>
                    ${menuButton}
                </div>
                <div class="comment-text">${formatText(data.text)}</div>
                
                <div class="comment-actions">
                    <button class="action-btn ${likeClass}" onclick="handleLike(${data.id})">
                        <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        <span>${data.likes || 0}</span>
                    </button>
                    <button class="action-btn ${dislikeClass}" onclick="handleDislike(${data.id})">
                        <svg viewBox="0 0 24 24" style="transform: rotate(180deg)"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        <span>${data.dislikes || 0}</span>
                    </button>
                    <button class="action-btn reply-trigger" onclick="toggleReplyBox(${data.id})">Javob berish</button>
                </div>
                <div id="reply-box-${data.id}"></div>
            </div>
        `;
        wrapper.appendChild(bodyDiv);

        return wrapper;
    }

    // 3. LIKE/DISLIKE FUNKSIYALARI
    function handleLike(commentId) {
        const comment = findCommentRecursive(comments, commentId);
        if (!comment) return;
        
        const currentAction = userActions[commentId];
        
        // Agar oldin like bosilgan bo'lsa, uni olib tashlash
        if (currentAction === 'like') {
            comment.likes = Math.max(0, comment.likes - 1);
            delete userActions[commentId];
        } 
        // Agar oldin dislike bosilgan bo'lsa, uni likega o'zgartirish
        else if (currentAction === 'dislike') {
            comment.likes += 1;
            comment.dislikes = Math.max(0, comment.dislikes - 1);
            userActions[commentId] = 'like';
        }
        // Hech qanday amal qilinmagan bo'lsa, like qo'shish
        else {
            comment.likes += 1;
            userActions[commentId] = 'like';
        }
        
        // Ma'lumotlarni saqlash va yangilash
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    }
    
    function handleDislike(commentId) {
        const comment = findCommentRecursive(comments, commentId);
        if (!comment) return;
        
        const currentAction = userActions[commentId];
        
        // Agar oldin dislike bosilgan bo'lsa, uni olib tashlash
        if (currentAction === 'dislike') {
            comment.dislikes = Math.max(0, comment.dislikes - 1);
            delete userActions[commentId];
        } 
        // Agar oldin like bosilgan bo'lsa, uni dislikega o'zgartirish
        else if (currentAction === 'like') {
            comment.dislikes += 1;
            comment.likes = Math.max(0, comment.likes - 1);
            userActions[commentId] = 'dislike';
        }
        // Hech qanday amal qilinmagan bo'lsa, dislike qo'shish
        else {
            comment.dislikes += 1;
            userActions[commentId] = 'dislike';
        }
        
        // Ma'lumotlarni saqlash va yangilash
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    }

    // 4. MENYU BOSHQARISH
    function toggleMenu(commentId) {
        // Barcha menyalarni yopish
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
        
        // Faqat tanlangan menyuni ko'rsatish
        const menu = document.getElementById(`menu-${commentId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    // 5. FIKRNI O'CHIRISH
    function deleteComment(commentId) {
        if (confirm("Bu fikrni o'chirishni istaysizmi?")) {
            // Komentni topish va o'chirish
            const comment = findCommentRecursive(comments, commentId);
            if (comment) {
                // Asosiy ro'yxatdan o'chirish
                removeCommentRecursive(comments, commentId);
                // User actions dan ham o'chirish
                delete userActions[commentId];
                localStorage.setItem('commentActions', JSON.stringify(userActions));
                renderComments();
            }
        }
    }
    
    // 6. FIKRNI TAHRIRLASH
    function editComment(commentId) {
        const comment = findCommentRecursive(comments, commentId);
        if (comment) {
            currentEditId = commentId;
            editInput.value = comment.text;
            editModal.style.display = 'flex';
        }
    }
    
    // 7. TAHRIRLASHNI SAQLASH
    function saveEditedComment() {
        if (!currentEditId) return;
        
        const comment = findCommentRecursive(comments, currentEditId);
        if (comment) {
            comment.text = editInput.value.trim();
            comment.time = comment.time.includes("tahrirlandi") 
                ? comment.time 
                : comment.time + " (tahrirlandi)";
            
            renderComments();
            closeEditModal();
        }
    }
    
    // 8. TAHRIRLASH MODALINI YOPISH
    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditId = null;
    }

    // 9. REPLY BOX & SENDING LOGIC
    function toggleReplyBox(id) {
        const box = document.getElementById(`reply-box-${id}`);
        if (box.innerHTML !== '') { box.innerHTML = ''; return; }
        document.querySelectorAll('[id^="reply-box-"]').forEach(el => el.innerHTML = '');

        const target = findCommentRecursive(comments, id);
        const mention = target ? `@${target.author} ` : '';

        box.innerHTML = `
            <div class="inline-reply-box">
                <div class="add-comment-avatar small-avatar">S</div>
                <div style="flex:1">
                    <div class="input-wrap