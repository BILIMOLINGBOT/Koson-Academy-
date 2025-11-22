document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VIDEO PLAYER ASOSIY MANTIQ ---
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const shareBtn = document.getElementById('share-btn');
    
    let videoLikes = 12000;
    let isSubscribed = false;

    // Like tugmasi
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('active');
        dislikeBtn.classList.remove('active');
        
        const countSpan = likeBtn.querySelector('span');
        if (likeBtn.classList.contains('active')) {
            videoLikes++;
            showNotification("Videoga like bosildi");
        } else {
            videoLikes--;
        }
        countSpan.innerText = formatNumber(videoLikes);
    });

    // Dislike tugmasi
    dislikeBtn.addEventListener('click', () => {
        dislikeBtn.classList.toggle('active');
        likeBtn.classList.remove('active');
        
        const countSpan = likeBtn.querySelector('span');
        // Agar like bosilgan bo'lsa va dislike bosilsa, like ni kamaytiramiz
        if (videoLikes > 12000) {
            videoLikes = 12000;
            countSpan.innerText = "12K";
        }
        
        if (dislikeBtn.classList.contains('active')) {
            showNotification("Videoga dislike bosildi");
        }
    });

    // Obuna bo'lish
    subscribeBtn.addEventListener('click', () => {
        isSubscribed = !isSubscribed;
        if (isSubscribed) {
            subscribeBtn.classList.add('subscribed');
            subscribeBtn.innerText = "Obuna bo'lingan";
            showNotification("Obuna bo'ldingiz");
        } else {
            subscribeBtn.classList.remove('subscribed');
            subscribeBtn.innerText = "Obuna bo'lish";
            showNotification("Obuna bekor qilindi");
        }
    });

    // Ulashish
    shareBtn.addEventListener('click', () => {
        showNotification("Nusxa olindi");
    });


    // --- 2. FIKRLAR TIZIMI (KOMPLEKS MANTIQ) ---
    
    const commentsModal = document.getElementById('commentsModal');
    const commentsBtn = document.getElementById('comments-btn');
    const closeBtn = document.querySelector('.close-btn');
    const commentsListEl = document.getElementById('comments-list');
    const mainInput = document.getElementById('main-input');
    const submitMainBtn = document.getElementById('submit-main');
    const totalCountSpan = document.getElementById('total-comments-count');
    
    // Tahrirlash elementlari
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');

    const currentUser = "Mening Profilim";
    let currentEditId = null;
    
    // Boshlang'ich ma'lumotlar
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
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            text: "Yegan oshim burnimdan chiqdi degan joyi wu😂",
            time: "22 soat oldin",
            likes: 54,
            dislikes: 1,
            replies: [
                {
                    id: 21,
                    author: "Mening Profilim",
                    avatar: null,
                    text: "Haqiqatdan ham juda kulgili chiqibdi!",
                    time: "1 soat oldin",
                    likes: 2,
                    dislikes: 0,
                    replies: []
                }
            ]
        },
        {
            id: 3,
            author: "Mening Profilim",
            avatar: null,
            text: "Konsert juda zo'r o'tibdi, omad!",
            time: "5 daqiqa oldin",
            likes: 0,
            dislikes: 0,
            replies: []
        }
    ];

    // LocalStorage dan user harakatlarini olish
    let userActions = JSON.parse(localStorage.getItem('commentActions')) || {};

    // --- MODAL OCHISH/YOPISH ---
    commentsBtn.addEventListener('click', () => {
        commentsModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Orqa fonni qotirish
        renderComments();
    });

    closeBtn.addEventListener('click', () => {
        commentsModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === commentsModal) {
            commentsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
        // Dropdown menyularini yopish
        if (!e.target.closest('.menu-btn')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        }
    });

    // --- RENDER QILISH FUNKSIYASI ---
    function renderComments() {
        commentsListEl.innerHTML = '';
        let total = 0;
        
        // Rekursiv funksiya (tekis ro'yxatga aylantirish uchun)
        function flattenAndRender(list, isReply = false) {
            // Vaqt bo'yicha saralash (yangi yuqorida)
            list.sort((a, b) => b.id - a.id);
            
            list.forEach(comment => {
                total++;
                commentsListEl.appendChild(createCommentHTML(comment, isReply));
                
                if (comment.replies && comment.replies.length > 0) {
                    flattenAndRender(comment.replies, true);
                }
            });
        }
        
        flattenAndRender(comments);
        totalCountSpan.innerText = total;
    }

    // HTML YARATISH
    function createCommentHTML(data, isReply) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comment-wrapper';
        // Javoblar uchun chapdan ozgina joy tashlash
        if (isReply) wrapper.style.marginLeft = '56px';

        const avatarClass = isReply ? "user-avatar small-avatar" : "user-avatar";
        const avatarContent = data.avatar 
            ? `<img src="${data.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` 
            : data.author.charAt(0).toUpperCase();

        // Menyu (faqat o'zimizniki uchun)
        const menuHTML = data.author === currentUser 
            ? `<div style="position:relative;">
                 <button class="menu-btn" onclick="window.toggleMenu(${data.id})">●●●</button>
                 <div class="dropdown-menu" id="menu-${data.id}">
                    <button class="dropdown-item" onclick="window.editComment(${data.id})">Tahrirlash</button>
                    <button class="dropdown-item delete" onclick="window.deleteComment(${data.id})">O'chirish</button>
                 </div>
               </div>` 
            : '';

        // Like/Dislike holati
        const action = userActions[data.id];
        const activeLike = action === 'like' ? 'active-like' : '';
        const activeDislike = action === 'dislike' ? 'active-dislike' : '';

        wrapper.innerHTML = `
            <div class="comment-body">
                <div class="${avatarClass}">${avatarContent}</div>
                <div class="comment-content">
                    <div class="comment-info">
                        <div>
                            <span class="author-name">${data.author}</span>
                            <span class="comment-time">${data.time}</span>
                        </div>
                        ${menuHTML}
                    </div>
                    <div class="comment-text">${formatText(data.text)}</div>
                    
                    <div class="comment-actions">
                        <button class="action-btn ${activeLike}" onclick="window.handleLike(${data.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            <span>${data.likes || 0}</span>
                        </button>
                        <button class="action-btn ${activeDislike}" onclick="window.handleDislike(${data.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg)"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        </button>
                        <button class="action-btn" onclick="window.toggleReplyBox(${data.id})">Javob berish</button>
                    </div>
                    <div id="reply-box-${data.id}"></div>
                </div>
            </div>
        `;
        return wrapper;
    }

    // --- ACTIONS (GLOBAL WINDOW UCHUN) ---
    
    window.toggleMenu = (id) => {
        // Event bubblingni to'xtatish kerak bo'lishi mumkin
        setTimeout(() => {
            const menu = document.getElementById(`menu-${id}`);
            const allMenus = document.querySelectorAll('.dropdown-menu');
            allMenus.forEach(m => {
                if(m !== menu) m.style.display = 'none';
            });
            
            if(menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }, 0);
    };

    window.handleLike = (id) => {
        const item = findRecursive(comments, id);
        if(!item) return;

        const current = userActions[id];
        if(current === 'like') {
            item.likes--;
            delete userActions[id];
        } else {
            if(current === 'dislike') item.dislikes--;
            item.likes++;
            userActions[id] = 'like';
        }
        saveAndRender();
    };

    window.handleDislike = (id) => {
        const item = findRecursive(comments, id);
        if(!item) return;

        const current = userActions[id];
        if(current === 'dislike') {
            item.dislikes--;
            delete userActions[id];
        } else {
            if(current === 'like') item.likes--;
            item.dislikes++;
            userActions[id] = 'dislike';
        }
        saveAndRender();
    };

    // JAVOB BERISH OYNASINI OCHISH
    window.toggleReplyBox = (id) => {
        const box = document.getElementById(`reply-box-${id}`);
        if(box.innerHTML !== '') {
            box.innerHTML = '';
            return;
        }
        
        // Boshqa ochiq oynalarni yopish
        document.querySelectorAll('[id^="reply-box-"]').forEach(el => el.innerHTML = '');

        const item = findRecursive(comments, id);
        const placeholder = item ? `@${item.author} ` : '';

        box.innerHTML = `
            <div class="inline-reply-box">
                <div class="user-avatar small-avatar">M</div>
                <div style="flex: 1;">
                    <div class="input-wrapper">
                        <input type="text" id="reply-input-${id}" class="comment-input" value="${placeholder}">
                    </div>
                    <div class="submit-actions" style="justify-content:flex-start;">
                         <button class="btn btn-submit" onclick="window.submitReply(${id}, this)">Yuborish</button>
                         <button class="btn btn-cancel" onclick="window.toggleReplyBox(${id})">Bekor</button>
                    </div>
                </div>
            </div>
        `;
        
        // Fokus
        setTimeout(() => {
            const inp = document.getElementById(`reply-input-${id}`);
            inp.focus();
            inp.setSelectionRange(inp.value.length, inp.value.length);
        }, 50);
    };

    // JAVOB YUBORISH
    window.submitReply = (parentId, btn) => {
        const input = document.getElementById(`reply-input-${parentId}`);
        const text = input.value.trim();
        if(!text) return;

        btn.innerHTML = `<div class="spinner"></div>`;
        btn.disabled = true;

        setTimeout(() => {
            const parent = findRecursive(comments, parentId);
            if(parent) {
                parent.replies.push({
                    id: Date.now(),
                    author: currentUser,
                    avatar: null,
                    text: text,
                    time: "hozirgina",
                    likes: 0,
                    dislikes: 0,
                    replies: []
                });
                saveAndRender();
            }
        }, 800);
    };

    // O'CHIRISH
    window.deleteComment = (id) => {
        if(confirm("Rostdan ham o'chirmoqchimisiz?")) {
            deleteRecursive(comments, id);
            delete userActions[id];
            saveAndRender();
            showNotification("Fikr o'chirildi");
        }
    };

    // TAHRIRLASH
    window.editComment = (id) => {
        const item = findRecursive(comments, id);
        if(item) {
            currentEditId = id;
            editInput.value = item.text;
            editModal.style.display = 'flex';
            // Menyuni yopish
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        }
    };

    saveEditBtn.addEventListener('click', () => {
        if(!currentEditId) return;
        const text = editInput.value.trim();
        if(!text) return;

        const item = findRecursive(comments, currentEditId);
        if(item) {
            item.text = text;
            if(!item.time.includes('(tahrirlangan)')) {
                item.time += " (tahrirlangan)";
            }
            editModal.style.display = 'none';
            saveAndRender();
            showNotification("Fikr o'zgartirildi");
        }
    });

    closeEditModalBtn.onclick = () => editModal.style.display = 'none';
    cancelEditBtn.onclick = () => editModal.style.display = 'none';

    // --- ASOSIY INPUT LOGIKASI ---
    mainInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        submitMainBtn.disabled = this.value.trim() === '';
    });

    submitMainBtn.addEventListener('click', () => {
        const text = mainInput.value.trim();
        if(!text) return;

        submitMainBtn.innerHTML = `<div class="spinner"></div>`;
        submitMainBtn.disabled = true;

        setTimeout(() => {
            comments.unshift({
                id: Date.now(),
                author: currentUser,
                avatar: null,
                text: text,
                time: "hozirgina",
                likes: 0,
                dislikes: 0,
                replies: []
            });
            
            mainInput.value = '';
            mainInput.style.height = 'auto';
            submitMainBtn.innerHTML = "Yuborish";
            submitMainBtn.disabled = true;
            
            saveAndRender();
            showNotification("Fikr yuborildi");
        }, 1000);
    });

    document.getElementById('cancel-main').addEventListener('click', () => {
        mainInput.value = '';
        submitMainBtn.disabled = true;
    });

    // --- YORDAMCHI FUNKSIYALAR ---
    
    function saveAndRender() {
        localStorage.setItem('commentActions', JSON.stringify(userActions));
        renderComments();
    }

    function findRecursive(list, id) {
        for(let item of list) {
            if(item.id === id) return item;
            if(item.replies.length) {
                const found = findRecursive(item.replies, id);
                if(found) return found;
            }
        }
        return null;
    }

    function deleteRecursive(list, id) {
        for(let i=0; i<list.length; i++) {
            if(list[i].id === id) {
                list.splice(i, 1);
                return true;
            }
            if(list[i].replies.length) {
                if(deleteRecursive(list[i].replies, id)) return true;
            }
        }
        return false;
    }

    function formatText(text) {
        // @belgi ni ko'k rangga bo'yash
        return text.replace(/@(\w+)/g, '<span class="user-mention">@$1</span>');
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    }

    function showNotification(msg) {
        const div = document.createElement('div');
        div.className = 'notification';
        div.innerText = msg;
        document.body.appendChild(div);
        
        setTimeout(() => div.classList.add('show'), 10);
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
});
