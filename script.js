document.addEventListener('DOMContentLoaded', () => {
    // --- ASOSIY VIDEO PLAYER LOGIKASI ---
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const saveBtn = document.getElementById('save-btn');
    const commentsBtn = document.getElementById('comments-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const commentsModal = document.getElementById('commentsModal');
    const closeMainModalBtn = document.querySelector('.close-btn');
    const likeCountDisplay = document.getElementById('like-count');
    const dislikeCountDisplay = document.getElementById('dislike-count');
    const commentsMainCount = document.getElementById('comments-main-count');

    // Ma'lumotlar
    let videoData = {
        likeCount: 12000,
        dislikeCount: 2500,
        isSubscribed: false,
        userReaction: null
    };

    // Formatlash
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toString();
    }

    function updateVideoStats() {
        likeCountDisplay.textContent = formatNumber(videoData.likeCount);
        dislikeCountDisplay.textContent = formatNumber(videoData.dislikeCount);
        
        // Obuna
        if (videoData.isSubscribed) {
            subscribeBtn.textContent = "Obuna bo'lingan";
            subscribeBtn.classList.add('subscribed');
        } else {
            subscribeBtn.textContent = "Obuna bo'lish";
            subscribeBtn.classList.remove('subscribed');
        }

        // Like/Dislike button holati
        likeBtn.classList.remove('active');
        dislikeBtn.classList.remove('active');
        if (videoData.userReaction === 'like') likeBtn.classList.add('active');
        if (videoData.userReaction === 'dislike') dislikeBtn.classList.add('active');
    }

    function showNotification(message) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        notif.appendChild(bar);
        
        setTimeout(() => { bar.style.width = '100%'; }, 10);
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    // Video Player Events
    likeBtn.addEventListener('click', () => {
        if (videoData.userReaction === 'like') {
            videoData.userReaction = null;
            videoData.likeCount--;
        } else {
            if (videoData.userReaction === 'dislike') videoData.dislikeCount--;
            videoData.userReaction = 'like';
            videoData.likeCount++;
            showNotification("Siz videoni like qildingiz");
        }
        updateVideoStats();
    });

    dislikeBtn.addEventListener('click', () => {
        if (videoData.userReaction === 'dislike') {
            videoData.userReaction = null;
            videoData.dislikeCount--;
        } else {
            if (videoData.userReaction === 'like') videoData.likeCount--;
            videoData.userReaction = 'dislike';
            videoData.dislikeCount++;
            showNotification("Siz videoni dislike qildingiz");
        }
        updateVideoStats();
    });

    subscribeBtn.addEventListener('click', () => {
        videoData.isSubscribed = !videoData.isSubscribed;
        updateVideoStats();
        showNotification(videoData.isSubscribed ? "Obuna bo'ldingiz" : "Obuna bekor qilindi");
    });

    saveBtn.addEventListener('click', () => {
        saveBtn.classList.toggle('active');
        showNotification(saveBtn.classList.contains('active') ? "Video saqlandi" : "Saqlanganlardan olib tashlandi");
    });

    // MODAL OCHISH/YOPISH
    commentsBtn.addEventListener('click', () => {
        commentsModal.style.display = 'block';
        setTimeout(() => commentsModal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        renderComments(); // Modal ochilganda fikrlarni yangilash
    });

    function closeMainModal() {
        commentsModal.classList.remove('show');
        setTimeout(() => {
            commentsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    closeMainModalBtn.addEventListener('click', closeMainModal);
    window.addEventListener('click', (e) => {
        if (e.target === commentsModal) closeMainModal();
    });

    updateVideoStats();


    // --- YANGI FIKRLAR TIZIMI LOGIKASI ---
    
    const currentUser = "Mening Profilim";
    let userActions = JSON.parse(localStorage.getItem('commentActions')) || {};
    
    let comments = [
        {
            id: 1, author: "nafisaning_dunyosi", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            text: "Nechi dubl bo'ldi😂 shapaloqqa", time: "2 kun oldin", likes: 1743, dislikes: 5, replies: []
        },
        {
            id: 2, author: "shoirabonu_essens", avatar: null,
            text: "Yegan oshim burnimdan chiqdi degan joyi wu😂", time: "22 soat oldin", likes: 5, dislikes: 1, replies: []
        },
        {
            id: 3, author: "Mening Profilim", avatar: null,
            text: "Bu mening fikrim, men uni o'chirishim yoki tahrirlashim mumkin", time: "5 daqiqa oldin", likes: 0, dislikes: 0, replies: []
        }
    ];

    const commentsListContainer = document.getElementById('comments-list');
    const mainInput = document.getElementById('main-input');
    const submitMainBtn = document.getElementById('submit-main');
    const cancelMainBtn = document.getElementById('cancel-main');
    const totalCountSpan = document.getElementById('total-comments-count');

    // Tahrirlash modal elementlari
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveEditBtn = document.getElementById('save-edit');
    let currentEditId = null;

    // RENDER
    window.renderComments = function() {
        commentsListContainer.innerHTML = '';
        let total = 0;
        
        function renderRecursive(list, isReply = false) {
            list.forEach(comment => {
                total++;
                commentsListContainer.appendChild(createCommentHTML(comment, isReply));
                if (comment.replies && comment.replies.length > 0) {
                    renderRecursive(comment.replies, true);
                }
            });
        }
        
        renderRecursive(comments);
        totalCountSpan.innerText = total;
        commentsMainCount.innerText = total; // Asosiy sahifadagi raqamni ham yangilash
    }

    function formatText(text) {
        return text.replace(/@(\w+)/g, '<a href="#" class="user-mention">@$1</a>');
    }

    // HTML GENERATION
    function createCommentHTML(data, isReply = false) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comment-wrapper';
        wrapper.id = `comment-wrapper-${data.id}`;
        if (isReply) wrapper.style.marginLeft = '40px'; // Javoblar sal ichkarida tursin

        const avatarClass = isReply ? "user-avatar small-avatar" : "user-avatar";
        const avatarHTML = data.avatar 
            ? `<img src="${data.avatar}" class="${avatarClass}" style="object-fit:cover;">` 
            : `<div class="${avatarClass}">${data.author.charAt(0).toUpperCase()}</div>`;

        // Dropdown Menu
        const menuButton = data.author === currentUser 
            ? `<button class="menu-btn" onclick="window.toggleMenu(${data.id}, event)">⋯</button>
               <div class="dropdown-menu" id="menu-${data.id}">
                 <button class="dropdown-item" onclick="window.editComment(${data.id})">Tahrirlash</button>
                 <button class="dropdown-item delete" onclick="window.deleteComment(${data.id})">O'chirish</button>
               </div>` 
            : '';

        const userAction = userActions[data.id] || null;
        const likeClass = userAction === 'like' ? 'active-like' : '';
        const dislikeClass = userAction === 'dislike' ? 'active-dislike' : '';

        wrapper.innerHTML = `
            <div class="comment-body">
                ${avatarHTML}
                <div class="comment-content">
                    <div class="comment-info">
                        <div>
                            <span class="author-name">${data.author}</span>
                            <span class="comment-time">${data.time}</span>
                        </div>
                        <div style="position:relative;">${menuButton}</div>
                    </div>
                    <div class="comment-text">${formatText(data.text)}</div>
                    
                    <div class="comment-actions">
                        <button class="action-btn ${likeClass}" onclick="window.handleLike(${data.id})">
                            <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            <span>${data.likes || 0}</span>
                        </button>
                        <button class="action-btn ${dislikeClass}" onclick="window.handleDislike(${data.id})">
                            <svg viewBox="0 0 24 24" style="transform: rotate(180deg)"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            <span>${data.dislikes || 0}</span>
                        </button>
                        <button class="action-btn reply-trigger" onclick="window.toggleReplyBox(${data.id})">Javob berish</button>
                    </div>
                    <div id="reply-box-${data.id}"></div>
                </div>
            </div>
        `;
        return wrapper;
    }

    // Global funksiyalar (HTML onclick uchun window ga biriktirilgan)
    window.toggleMenu = function(id, event) {
        event.stopPropagation();
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        const menu = document.getElementById(`menu-${id}`);
        if (menu) menu.style.display = 'block';
    };
    
    window.onclick = function(event) {
        if (!event.target.matches('.menu-btn')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        }
    };

    // HELPER FUNCTIONS
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

    // ACTIONS
    window.handleLike = function(id) {
        const comment = findCommentRecursive(comments, id);
        if (!comment) return;
        
        const action = userActions[id];
        if (action === 'like') {
            comment.likes--;
            delete userActions[id];
        } else {
            if (action === 'dislike') comment.dislikes--;
            comment.likes++;
            userActions[id] = 'like';
        }
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    };

    window.handleDislike = function(id) {
        const comment = findCommentRecursive(comments, id);
        if (!comment) return;

        const action = userActions[id];
        if (action === 'dislike') {
            comment.dislikes--;
            delete userActions[id];
        } else {
            if (action === 'like') comment.likes--;
            comment.dislikes++;
            userActions[id] = 'dislike';
        }
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    };

    window.deleteComment = function(id) {
        if (confirm("Bu fikrni o'chirishni istaysizmi?")) {
            removeCommentRecursive(comments, id);
            delete userActions[id];
            localStorage.setItem('commentActions', JSON.stringify(userActions));
            renderComments();
            showNotification("Fikr o'chirildi");
        }
    };

    // EDITING
    window.editComment = function(id) {
        const comment = findCommentRecursive(comments, id);
        if (comment) {
            currentEditId = id;
            editInput.value = comment.text;
            editModal.style.display = 'flex';
        }
    };

    saveEditBtn.addEventListener('click', () => {
        if (!currentEditId) return;
        const comment = findCommentRecursive(comments, currentEditId);
        if (comment) {
            comment.text = editInput.value.trim();
            if (!comment.time.includes("(tahrirlandi)")) comment.time += " (tahrirlandi)";
            renderComments();
            editModal.style.display = 'none';
            showNotification("Fikr tahrirlandi");
        }
    });

    function closeEditModal() { editModal.style.display = 'none'; }
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);

    // REPLY LOGIC
    window.toggleReplyBox = function(id) {
        const box = document.getElementById(`reply-box-${id}`);
        if (box.innerHTML !== '') { box.innerHTML = ''; return; }
        document.querySelectorAll('[id^="reply-box-"]').forEach(el => el.innerHTML = '');

        const target = findCommentRecursive(comments, id);
        const mention = target ? `@${target.author} ` : '';

        box.innerHTML = `
            <div class="inline-reply-box">
                <div class="user-avatar small-avatar">M</div>
                <div style="flex:1">
                    <div class="input-wrapper"><input type="text" id="input-${id}" class="comment-input" value="${mention}"></div>
                    <div class="submit-actions" style="justify-content: flex-start;">
                        <button class="btn btn-submit" id="btn-reply-${id}" style="padding: 6px 12px; font-size: 12px;" onclick="window.submitReply(${id})">Yuborish</button>
                        <button class="btn btn-cancel" style="padding: 6px 12px; font-size: 12px;" onclick="window.toggleReplyBox(${id})">Bekor qilish</button>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const inp = document.getElementById(`input-${id}`);
            inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
        }, 50);
    };

    window.submitReply = function(parentId) {
        const input = document.getElementById(`input-${parentId}`);
        const btn = document.getElementById(`btn-reply-${parentId}`);
        const text = input.value.trim();
        if (!text) return;

        btn.disabled = true;
        btn.innerHTML = `<div class="spinner"></div>`;

        setTimeout(() => {
            const target = findCommentRecursive(comments, parentId);
            if (target) {
                target.replies.push({
                    id: Date.now(), author: currentUser, avatar: null,
                    text: text, time: "hozirgina", likes: 0, dislikes: 0, replies: []
                });
                renderComments();
                showNotification("Javob yuborildi");
            }
        }, 1000);
    };

    // MAIN INPUT LOGIC
    submitMainBtn.addEventListener('click', () => {
        const text = mainInput.value.trim();
        if (!text) return;

        submitMainBtn.disabled = true;
        submitMainBtn.innerHTML = `<div class="spinner"></div> Yuborilmoqda...`;

        setTimeout(() => {
            comments.unshift({
                id: Date.now(), author: currentUser, avatar: null,
                text: text, time: "hozirgina", likes: 0, dislikes: 0, replies: []
            });
            mainInput.value = '';
            submitMainBtn.innerHTML = "Yuborish";
            submitMainBtn.disabled = true;
            renderComments();
            showNotification("Fikr yuborildi");
        }, 1000);
    });

    mainInput.addEventListener('input', (e) => {
        if(submitMainBtn.innerHTML.includes('Yuborilmoqda')) return;
        submitMainBtn.disabled = e.target.value.trim() === '';
        e.target.style.height = 'auto'; 
        e.target.style.height = e.target.scrollHeight + 'px';
    });

    cancelMainBtn.addEventListener('click', () => {
        mainInput.value = '';
        submitMainBtn.disabled = true;
        mainInput.style.height = 'auto';
    });

    // Initial render
    updateVideoStats();
    renderComments();
});
