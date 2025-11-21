// DASTLABKI MA'LUMOTLAR
let comments = [
    {
        id: 1,
        author: "nafisaning_dunyosi",
        avatar: null,
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
        avatar: null,
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
const commentsModal = document.getElementById('commentsModal');
const closeBtn = document.querySelector('.close-btn');
const commentsBtn = document.getElementById('comments-btn');
const commentsList = document.getElementById('commentsList');
const noCommentsIndicator = document.getElementById('no-comments-indicator');
const commentInput = document.querySelector('.comment-input');
const submitCommentBtn = document.querySelector('.submit-btn');
const cancelCommentBtn = document.querySelector('.cancel-btn');
const commentsModalCount = document.getElementById('comments-modal-count');
const commentsMainCount = document.getElementById('comments-main-count');
const subscribeBtn = document.getElementById('subscribe-btn');
const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');
const likeCount = document.getElementById('like-count');
const dislikeCount = document.getElementById('dislike-count');

// Modalni ochish
commentsBtn.addEventListener('click', () => {
    commentsModal.style.display = 'block';
    renderComments();
});

// Modalni yopish
closeBtn.addEventListener('click', () => {
    commentsModal.style.display = 'none';
});

// Tashqariga bosganda modalni yopish
window.addEventListener('click', (e) => {
    if (e.target === commentsModal) {
        commentsModal.style.display = 'none';
    }
});

// Obuna bo'lish tugmasi
subscribeBtn.addEventListener('click', () => {
    if (subscribeBtn.classList.contains('subscribed')) {
        subscribeBtn.classList.remove('subscribed');
        subscribeBtn.textContent = 'Obuna bo\'lish';
    } else {
        subscribeBtn.classList.add('subscribed');
        subscribeBtn.textContent = 'Obuna bo\'lingan';
    }
});

// Like tugmasi
let isLiked = false;
let isDisliked = false;
let currentLikes = 12000;
let currentDislikes = 2500;

likeBtn.addEventListener('click', () => {
    if (isLiked) {
        currentLikes--;
        isLiked = false;
        likeBtn.style.backgroundColor = '';
    } else {
        currentLikes++;
        isLiked = true;
        likeBtn.style.backgroundColor = 'rgba(62, 166, 255, 0.2)';
        
        if (isDisliked) {
            currentDislikes--;
            isDisliked = false;
            dislikeBtn.style.backgroundColor = '';
        }
    }
    updateCounts();
});

dislikeBtn.addEventListener('click', () => {
    if (isDisliked) {
        currentDislikes--;
        isDisliked = false;
        dislikeBtn.style.backgroundColor = '';
    } else {
        currentDislikes++;
        isDisliked = true;
        dislikeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        
        if (isLiked) {
            currentLikes--;
            isLiked = false;
            likeBtn.style.backgroundColor = '';
        }
    }
    updateCounts();
});

function updateCounts() {
    likeCount.textContent = formatNumber(currentLikes);
    dislikeCount.textContent = formatNumber(currentDislikes);
}

// Fikrlarni ekranga chiqarish
function renderComments() {
    commentsList.innerHTML = '';
    let total = 0;

    comments.forEach(comment => {
        total++; // Asosiy fikr
        total += countReplies(comment.replies); // Javoblar sonini qo'shish
        commentsList.appendChild(createCommentHTML(comment));
    });
    
    commentsModalCount.textContent = total;
    commentsMainCount.textContent = total;
    
    // Agar fikrlar bo'lsa, "fikrlar yo'q" ko'rsatkichini yashirish
    if (total > 0) {
        noCommentsIndicator.style.display = 'none';
        commentsList.style.display = 'block';
    } else {
        noCommentsIndicator.style.display = 'block';
        commentsList.style.display = 'none';
    }
}

// Javoblarni sanash uchun yordamchi
function countReplies(replies) {
    if (!replies) return 0;
    let count = replies.length;
    replies.forEach(r => count += countReplies(r.replies));
    return count;
}

// HTML Element yaratish (Komponent)
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

// Like / Dislike Logikasi
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

// Javob berish (Reply) qutisini ochish/yopish
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
                <div class="comment-buttons" style="justify-content: flex-start;">
                    <button class="comment-btn submit-btn" style="padding: 6px 12px; font-size: 12px;" onclick="submitReply(${id})">Yuborish</button>
                    <button class="comment-btn cancel-btn" style="padding: 6px 12px; font-size: 12px;" onclick="toggleReplyBox(${id})">Bekor qilish</button>
                </div>
            </div>
        </div>
    `;
    setTimeout(() => document.getElementById(`input-${id}`).focus(), 100);
}

// Javobni yuborish
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
        toggleReplyBox(parentId); // Yopish
    }
}

// Asosiy fikr qo'shish
commentInput.addEventListener('input', (e) => {
    submitCommentBtn.disabled = e.target.value.trim() === '';
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
});

submitCommentBtn.addEventListener('click', () => {
    const text = commentInput.value.trim();
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

    commentInput.value = '';
    commentInput.style.height = 'auto';
    submitCommentBtn.disabled = true;
    renderComments();
});

cancelCommentBtn.addEventListener('click', () => {
    commentInput.value = '';
    submitCommentBtn.disabled = true;
});

// --- YORDAMCHI FUNKSIYALAR ---

// Emojini inputga qo'shish
window.addEmoji = function(emoji) {
    commentInput.value += emoji;
    submitCommentBtn.disabled = false;
    commentInput.focus();
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
updateCounts();