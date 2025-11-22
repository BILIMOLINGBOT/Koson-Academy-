document.addEventListener('DOMContentLoaded', () => {
    /* --- GLOBAL O'ZGARUVCHILAR --- */
    const currentUser = "Mening Profilim"; // Joriy foydalanuvchi
    let comments = [
        {
            id: 1,
            author: "nafisaning_dunyosi",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            text: "Nechi dubl bo'ldi😂 shapaloqqa",
            time: "2 kun oldin",
            likes: 1743,
            dislikes: 5,
            replies: []
        },
        {
            id: 2,
            author: "shoirabonu_essens",
            text: "Yegan oshim burnimdan chiqdi degan joyi wu😂",
            time: "22 soat oldin",
            likes: 5,
            dislikes: 1,
            replies: [
                {
                    id: 21,
                    author: "admin_uz",
                    text: "Haqiqatdan ham kulgili joyi shu bo'ldi",
                    time: "1 soat oldin",
                    likes: 2,
                    dislikes: 0,
                    replies: []
                }
            ]
        }
    ];

    // Foydalanuvchi harakatlarini saqlash (Like/Dislike)
    let userActions = JSON.parse(localStorage.getItem('commentActions')) || {};
    let currentEditId = null;

    /* --- DOM ELEMENTLAR --- */
    const modal = document.getElementById('commentsModal');
    const commentsListEl = document.getElementById('comments-list');
    const totalCountEl = document.getElementById('total-comments-count');
    const noCommentsMsg = document.getElementById('no-comments-msg');
    const mainInput = document.getElementById('main-input');
    const submitMainBtn = document.getElementById('submit-main');
    const cancelMainBtn = document.getElementById('cancel-main');
    
    // Asosiy sahifa tugmalari
    const commentsBtn = document.getElementById('comments-btn');
    const closeBtn = document.querySelector('.close-btn');
    const editModal = document.getElementById('edit-modal');
    
    /* --- RENDER QILISH FUNKSIYASI --- */
    function renderComments() {
        commentsListEl.innerHTML = '';
        let total = 0;

        if (comments.length === 0) {
            noCommentsMsg.style.display = 'block';
        } else {
            noCommentsMsg.style.display = 'none';
        }

        // Rekursiv funksiya
        function renderList(list, container) {
            list.forEach(comment => {
                total++;
                const commentEl = createCommentHTML(comment);
                container.appendChild(commentEl);

                // Agar javoblar (replies) bo'lsa
                if (comment.replies && comment.replies.length > 0) {
                    const replyContainer = document.createElement('div');
                    replyContainer.className = 'reply-container';
                    renderList(comment.replies, replyContainer);
                    container.appendChild(replyContainer);
                }
            });
        }

        renderList(comments, commentsListEl);
        totalCountEl.innerText = total;
        document.getElementById('comments-main-count').innerText = total;
    }

    /* --- HTML ELEMENT YARATISH --- */
    function createCommentHTML(data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comment-wrapper';
        wrapper.id = `comment-${data.id}`;

        const avatarHTML = data.avatar 
            ? `<img src="${data.avatar}" class="user-avatar" style="object-fit:cover;">` 
            : `<div class="user-avatar">${data.author.charAt(0).toUpperCase()}</div>`;

        // Menyu tugmasi (faqat o'zimizniki bo'lsa)
        const isMyComment = data.author === currentUser;
        const menuHTML = isMyComment 
            ? `<div style="position:relative;">
                 <button class="menu-btn" onclick="toggleMenu(${data.id})">⋮</button>
                 <div class="dropdown-menu" id="menu-${data.id}">
                    <button class="dropdown-item" onclick="openEditModal(${data.id})">Tahrirlash</button>
                    <button class="dropdown-item delete" onclick="deleteComment(${data.id})">O'chirish</button>
                 </div>
               </div>` 
            : '';

        // Like holati
        const action = userActions[data.id];
        const likeClass = action === 'like' ? 'active-like' : '';
        const dislikeClass = action === 'dislike' ? 'active-dislike' : '';

        wrapper.innerHTML = `
            <div class="comment-body">
                ${avatarHTML}
                <div class="comment-content">
                    <div class="comment-info">
                        <div>
                            <a href="#" class="author-name">${data.author}</a>
                            <span class="comment-time">${data.time}</span>
                        </div>
                        ${menuHTML}
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
                        <button class="action-btn" onclick="toggleReplyBox(${data.id})">Javob berish</button>
                    </div>
                    <div id="reply-box-${data.id}"></div>
                </div>
            </div>
        `;
        return wrapper;
    }

    /* --- UTILS --- */
    function formatText(text) {
        return text.replace(/@(\w+)/g, '<a href="#" class="user-mention">@$1</a>');
    }

    function findComment(list, id) {
        for (let item of list) {
            if (item.id === id) return item;
            if (item.replies.length) {
                const found = findComment(item.replies, id);
                if (found) return found;
            }
        }
        return null;
    }

    function removeComment(list, id) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                list.splice(i, 1);
                return true;
            }
            if (list[i].replies.length) {
                if (removeComment(list[i].replies, id)) return true;
            }
        }
        return false;
    }

    /* --- GLOBAL FUNCTIONS (HTML onclick uchun) --- */
    window.handleLike = function(id) {
        const comment = findComment(comments, id);
        if (!comment) return;
        
        if (userActions[id] === 'like') {
            comment.likes--;
            delete userActions[id];
        } else {
            if (userActions[id] === 'dislike') comment.dislikes--;
            comment.likes++;
            userActions[id] = 'like';
        }
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    };

    window.handleDislike = function(id) {
        const comment = findComment(comments, id);
        if (!comment) return;

        if (userActions[id] === 'dislike') {
            comment.dislikes--;
            delete userActions[id];
        } else {
            if (userActions[id] === 'like') comment.likes--;
            comment.dislikes++;
            userActions[id] = 'dislike';
        }
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    };

    window.toggleMenu = function(id) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        const menu = document.getElementById(`menu-${id}`);
        if(menu) menu.style.display = 'block';
        
        // Tashqariga bosganda yopish
        setTimeout(() => {
            window.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest('.menu-btn')) {
                    menu.style.display = 'none';
                    window.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    };

    window.deleteComment = function(id) {
        if(confirm("Fikrni o'chirasizmi?")) {
            removeComment(comments, id);
            delete userActions[id];
            renderComments();
        }
    };

    window.openEditModal = function(id) {
        const comment = findComment(comments, id);
        if(comment) {
            currentEditId = id;
            document.getElementById('edit-input').value = comment.text;
            editModal.style.display = 'flex';
        }
    };

    window.toggleReplyBox = function(id) {
        const box = document.getElementById(`reply-box-${id}`);
        if (box.innerHTML) { box.innerHTML = ''; return; }
        
        // Boshqa ochiq replylarni yopish
        document.querySelectorAll('[id^="reply-box-"]').forEach(b => b.innerHTML = '');

        const parent = findComment(comments, id);
        const mention = parent ? `@${parent.author} ` : '';

        box.innerHTML = `
            <div class="inline-reply-box">
                <div class="user-avatar small-avatar" style="background:#555;">Siz</div>
                <div style="flex:1">
                    <div class="input-wrapper">
                        <input type="text" id="reply-input-${id}" class="comment-input" value="${mention}">
                    </div>
                    <div class="submit-actions" style="justify-content: flex-start;">
                        <button class="btn btn-cancel" onclick="toggleReplyBox(${id})">Bekor</button>
                        <button class="btn btn-submit" onclick="submitReply(${id})">Yuborish</button>
                    </div>
                </div>
            </div>
        `;
        const inp = document.getElementById(`reply-input-${id}`);
        inp.focus();
    };

    window.submitReply = function(parentId) {
        const inp = document.getElementById(`reply-input-${parentId}`);
        const text = inp.value.trim();
        if(!text) return;

        const parent = findComment(comments, parentId);
        if(parent) {
            parent.replies.push({
                id: Date.now(),
                author: currentUser,
                text: text,
                time: "Hozirgina",
                likes: 0, dislikes: 0, replies: []
            });
            renderComments();
        }
    };

    /* --- EVENT LISTENERS --- */
    // Modalni ochish/yopish
    commentsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        renderComments();
    });
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === editModal) editModal.style.display = 'none';
    };

    // Asosiy Fikr yuborish
    mainInput.addEventListener('input', (e) => {
        submitMainBtn.disabled = e.target.value.trim() === '';
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    });

    submitMainBtn.addEventListener('click', () => {
        const text = mainInput.value.trim();
        if(!text) return;
        
        // Loading animatsiyasi
        submitMainBtn.disabled = true;
        submitMainBtn.innerHTML = '<span class="spinner"></span> Yuborilmoqda...';

        setTimeout(() => {
            comments.unshift({
                id: Date.now(),
                author: currentUser,
                text: text,
                time: "Hozirgina",
                likes: 0, dislikes: 0, replies: []
            });
            mainInput.value = '';
            submitMainBtn.innerHTML = 'Yuborish';
            renderComments();
        }, 800); // Simulyatsiya
    });

    cancelMainBtn.addEventListener('click', () => {
        mainInput.value = '';
        submitMainBtn.disabled = true;
    });

    // Edit Modal Actions
    document.getElementById('close-edit-modal').onclick = () => editModal.style.display = 'none';
    document.getElementById('cancel-edit').onclick = () => editModal.style.display = 'none';
    
    document.getElementById('save-edit').onclick = () => {
        const newText = document.getElementById('edit-input').value.trim();
        if(currentEditId && newText) {
            const comment = findComment(comments, currentEditId);
            comment.text = newText;
            comment.time += " (tahrirlandi)";
            renderComments();
            editModal.style.display = 'none';
        }
    };

    // Boshlang'ich yuklash
    renderComments();
});
