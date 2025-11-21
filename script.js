// DASTLABKI MA'LUMOTLAR (Ma'lumotlar bazasiga taqlid)
let comments = [
    {
        id: 1,
        author: "nafisaning_dunyosi",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        text: "Nechi dubl bo'ldi😂 shapaloqqa",
        time: "2 kun oldin",
        likes: 1743,
        dislikes: 0,
        myAction: null, // 'like' or 'dislike'
        replies: []
    },
    {
        id: 2,
        author: "shoirabonu_essens",
        avatar: null, // Avatar yo'q bo'lsa harf chiqadi
        text: "Yegan oshim burnimdan chiqdi degan joyi wu😂",
        time: "22 soat oldin",
        likes: 5,
        dislikes: 0,
        myAction: null,
        replies: [
            {
                id: 21,
                author: "Admin",
                avatar: null,
                text: "Haqiqatdan ham, juda kulgili chiqibdi!",
                time: "10 soat oldin",
                likes: 2,
                dislikes: 0,
                myAction: null,
                replies: []
            }
        ]
    }
];

// DOM Elementlar
const commentsContainer = document.getElementById('comments-list');
const mainInput = document.getElementById('main-input');
const submitMainBtn = document.getElementById('submit-main');
const cancelMainBtn = document.getElementById('cancel-main');
const totalCountSpan = document.getElementById('total-comments-count');

// --- FUNKSIYALAR ---

// 1. Fikrlarni ekranga chiqarish (Recursive render)
function renderComments() {
    commentsContainer.innerHTML = '';
    let total = 0;

    comments.forEach(comment => {
        total++; // Asosiy fikr
        total += countReplies(comment.replies); // Javoblar sonini qo'shish
        commentsContainer.appendChild(createCommentHTML(comment));
    });
    
    totalCountSpan.innerText = total;
}

// Javoblarni sanash uchun yordamchi
function countReplies(replies) {
    if (!replies) return 0;
    let count = replies.length;
    replies.forEach(r => count += countReplies(r.replies));
    return count;
}

// 2. HTML Element yaratish (Komponent)
function createCommentHTML(data, isReply = false) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.id = `comment-${data.id}`;

    // Avatar rasmi bormi yoki harfmi?
    const avatarHTML = data.avatar 
        ? `<img src="${data.avatar}" class="user-avatar" style="object-fit:cover;">` 
        : `<div class="user-avatar">${data.author.charAt(0).toUpperCase()}</div>`;

    div.innerHTML = `
        ${avatarHTML}
        <div class="comment-content">
            <div class="comment-info">
                <span class="author-name">${data.author}</span>
                <span class="comment-time">${data.time}</span>
            </div>
            <div class="comment-text">${data.text}</div>
            
            <div class="comment-actions">
                <button class="action-btn ${data.myAction === 'like' ? 'active-like' : ''}" onclick="handleLike(${data.id})">
                    <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    <span>${formatNumber(data.likes)}</span>
                </button>
                
                <button class="action-btn ${data.myAction === 'dislike' ? 'active-dislike' : ''}" onclick="handleDislike(${data.id})">
                    <svg viewBox="0 0 24 24" style="transform: rotate(180deg)"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    ${data.dislikes > 0 ? `<span>${data.dislikes}</span>` : ''}
                </button>

                <button class="action-btn reply-trigger" onclick="toggleReplyBox(${data.id})">Javob berish</button>
            </div>

            <div id="reply-box-${data.id}"></div>

            <div class="replies-list" id="replies-${data.id}">
                </div>
        </div>
    `;

    // Agar javoblari bo'lsa, ularni ham render qilamiz (Recursion)
    const repliesContainer = div.querySelector(`#replies-${data.id}`);
    if (data.replies && data.replies.length > 0) {
        data.replies.forEach(reply => {
            repliesContainer.appendChild(createCommentHTML(reply, true));
        });
    }

    return div;
}

// 3. Like / Dislike Logikasi
function handleLike(id) {
    const item = findCommentRecursive(comments, id);
    if (!item) return;

    if (item.myAction === 'like') {
        item.myAction = null;
        item.likes--;
    } else {
        if (item.myAction === 'dislike') {
            item.dislikes--;
        }
        item.myAction = 'like';
        item.likes++;
    }
    renderComments(); // O'zgarishni ko'rsatish uchun qayta chizamiz
}

function handleDislike(id) {
    const item = findCommentRecursive(comments, id);
    if (!item) return;

    if (item.myAction === 'dislike') {
        item.myAction = null;
        item.dislikes--;
    } else {
        if (item.myAction === 'like') {
            item.likes--;
        }
        item.myAction = 'dislike';
        item.dislikes++;
    }
    renderComments();
}

// 4. Javob berish (Reply) qutisini ochish/yopish
function toggleReplyBox(id) {
    const box = document.getElementById(`reply-box-${id}`);
    
    // Agar ochiq bo'lsa yopamiz
    if (box.innerHTML !== '') {
        box.innerHTML = '';
        return;
    }

    // Barcha ochiq inputlarni yopish (ixtiyoriy)
    document.querySelectorAll('[id^="reply-box-"]').forEach(el => el.innerHTML = '');

    // Input HTML ni qo'shish
    box.innerHTML = `
        <div class="inline-reply-box">
            <div class="user-avatar" style="width:24px; height:24px; font-size:12px;">M</div>
            <div style="flex:1">
                <div class="input-wrapper">
                    <input type="text" id="input-${id}" class="comment-input" placeholder="Javob yozing...">
                </div>
                <div class="submit-actions" style="justify-content: flex-start;">
                    <button class="btn btn-submit" style="padding: 6px 12px; font-size: 12px;" onclick="submitReply(${id})">Yuborish</button>
                    <button class="btn btn-cancel" style="padding: 6px 12px; font-size: 12px;" onclick="toggleReplyBox(${id})">Bekor qilish</button>
                </div>
            </div>
        </div>
    `;
    setTimeout(() => document.getElementById(`input-${id}`).focus(), 100);
}

// 5. Javobni yuborish
function submitReply(parentId) {
    const input = document.getElementById(`input-${parentId}`);
    const text = input.value.trim();
    
    if (!text) return;

    const parent = findCommentRecursive(comments, parentId);
    if (parent) {
        parent.replies.push({
            id: Date.now(),
            author: "Mening Profilim",
            avatar: null,
            text: text,
            time: "hozirgina",
            likes: 0,
            dislikes: 0,
            myAction: null,
            replies: []
        });
        renderComments();
    }
}

// 6. Asosiy fikr qo'shish
mainInput.addEventListener('input', (e) => {
    submitMainBtn.disabled = e.target.value.trim() === '';
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
});

submitMainBtn.addEventListener('click', () => {
    const text = mainInput.value.trim();
    if (!text) return;

    comments.unshift({
        id: Date.now(),
        author: "Mening Profilim",
        avatar: null,
        text: text,
        time: "hozirgina",
        likes: 0,
        dislikes: 0,
        myAction: null,
        replies: []
    });

    mainInput.value = '';
    mainInput.style.height = 'auto';
    submitMainBtn.disabled = true;
    renderComments();
});

cancelMainBtn.addEventListener('click', () => {
    mainInput.value = '';
    submitMainBtn.disabled = true;
});

// --- YORDAMCHI FUNKSIYALAR ---

// Emojini inputga qo'shish
window.addEmoji = function(emoji) {
    mainInput.value += emoji;
    submitMainBtn.disabled = false;
    mainInput.focus();
};

// ID bo'yicha fikrni topish (Rekursiv qidiruv)
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

// Raqamlarni chiroyli formatlash (1.2K)
function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

// Dastur ishga tushishi
renderComments();
