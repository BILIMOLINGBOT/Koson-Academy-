// Soxta ma'lumotlar bazasi (Boshlang'ich fikrlar)
let commentsData = [
    {
        id: 1,
        author: "nafisaning_dunyosi",
        avatar: "N", // Yoki rasm URL
        text: "Nechi dubl bo'ldi😂 shapaloqqa",
        time: "2 kun oldin",
        likes: 1743,
        dislikes: 12,
        userAction: null, // 'liked', 'disliked' yoki null
        replies: []
    },
    {
        id: 2,
        author: "shoirabonu_essens",
        avatar: "S",
        text: "Yegan oshim burnimdan chiqdi degan joyi shu😂",
        time: "22 soat oldin",
        likes: 5,
        dislikes: 0,
        userAction: null,
        replies: [
            {
                id: 21,
                author: "admin_page",
                avatar: "A",
                text: "Haqiqatdan ham zo'r chiqibdi!",
                time: "10 soat oldin",
                likes: 2,
                dislikes: 0,
                userAction: null,
                replies: []
            }
        ]
    }
];

const commentsListElement = document.getElementById('commentsList');
const mainCommentInput = document.querySelector('.comment-input'); // Asosiy input
const mainSubmitBtn = document.querySelector('.submit-btn');

// 1. Fikrlarni ekranga chiqarish (Render) funksiyasi
function renderComments() {
    commentsListElement.innerHTML = ''; // Tozalash
    commentsData.forEach(comment => {
        commentsListElement.appendChild(createCommentElement(comment));
    });
}

// 2. Bitta fikr elementini yaratish (HTML yasash)
function createCommentElement(comment, isReply = false) {
    const div = document.createElement('div');
    
    // Fikr tuzilishi
    div.innerHTML = `
        <div class="comment-item" id="comment-${comment.id}">
            <div class="comment-avatar" style="${comment.avatar.length > 1 ? `background-image: url('${comment.avatar}')` : 'background: linear-gradient(45deg, #ff9966, #ff5e62)'}">
                ${comment.avatar.length === 1 ? comment.avatar : ''}
            </div>
            <div class="comment-main">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                
                <div class="comment-actions">
                    <button class="action-btn ${comment.userAction === 'liked' ? 'liked' : ''}" onclick="toggleLike(${comment.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        <span>${formatCount(comment.likes)}</span>
                    </button>
                    
                    <button class="action-btn ${comment.userAction === 'disliked' ? 'disliked' : ''}" onclick="toggleDislike(${comment.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                        </svg>
                        <span>${comment.dislikes > 0 ? formatCount(comment.dislikes) : ''}</span>
                    </button>

                    <button class="action-btn reply-text-btn" onclick="openReplyBox(${comment.id})">
                        Javob berish
                    </button>
                </div>

                <div id="reply-box-${comment.id}"></div>

                <div class="replies-container" id="replies-${comment.id}"></div>
            </div>
        </div>
    `;

    // Agar javoblari bo'lsa, ularni ham chiqaramiz (Rekursiya)
    const repliesContainer = div.querySelector(`#replies-${comment.id}`);
    if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
            repliesContainer.appendChild(createCommentElement(reply, true));
        });
    }

    return div;
}

// 3. Like bosilganda
function toggleLike(id) {
    const comment = findCommentById(commentsData, id);
    if (!comment) return;

    if (comment.userAction === 'liked') {
        comment.userAction = null;
        comment.likes--;
    } else {
        if (comment.userAction === 'disliked') {
            comment.dislikes--;
        }
        comment.userAction = 'liked';
        comment.likes++;
    }
    renderComments(); // Ekranni yangilash
}

// 4. Dislike bosilganda
function toggleDislike(id) {
    const comment = findCommentById(commentsData, id);
    if (!comment) return;

    if (comment.userAction === 'disliked') {
        comment.userAction = null;
        comment.dislikes--;
    } else {
        if (comment.userAction === 'liked') {
            comment.likes--;
        }
        comment.userAction = 'disliked';
        comment.dislikes++;
    }
    renderComments();
}

// 5. Javob berish oynasini ochish
function openReplyBox(id) {
    // Oldin ochilgan barcha inputlarni yopish (ixtiyoriy)
    document.querySelectorAll('[id^="reply-box-"]').forEach(el => el.innerHTML = '');

    const box = document.getElementById(`reply-box-${id}`);
    const comment = findCommentById(commentsData, id);

    box.innerHTML = `
        <div class="reply-input-box">
            <input type="text" class="reply-input" id="input-${id}" placeholder="@${comment.author} ga javob yozish...">
            <button class="send-reply-btn" onclick="submitReply(${id})">Yuborish</button>
            <button class="action-btn" onclick="document.getElementById('reply-box-${id}').innerHTML=''">❌</button>
        </div>
    `;
    
    // Avtomatik fokus qo'yish
    setTimeout(() => document.getElementById(`input-${id}`).focus(), 100);
}

// 6. Javobni yuborish
function submitReply(parentId) {
    const input = document.getElementById(`input-${parentId}`);
    const text = input.value.trim();

    if (!text) return;

    const parentComment = findCommentById(commentsData, parentId);
    
    const newReply = {
        id: Date.now(), // Unikal ID
        author: "Siz",
        avatar: "M", // Mening avatarim
        text: text,
        time: "hozirgina",
        likes: 0,
        dislikes: 0,
        userAction: null,
        replies: []
    };

    parentComment.replies.push(newReply);
    renderComments();
}

// Yordamchi funksiya: ID bo'yicha fikrni topish (Ichma-ich qidiruv)
function findCommentById(list, id) {
    for (let comment of list) {
        if (comment.id === id) return comment;
        if (comment.replies.length > 0) {
            const found = findCommentById(comment.replies, id);
            if (found) return found;
        }
    }
    return null;
}

// Yordamchi funksiya: Raqamlarni formatlash (1.2K)
function formatCount(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    renderComments();
    
    // Asosiy (pastdagi) fikr qoldirish
    mainSubmitBtn.addEventListener('click', () => {
        if(mainCommentInput.value.trim()) {
             commentsData.unshift({
                id: Date.now(),
                author: "Siz",
                avatar: "M",
                text: mainCommentInput.value,
                time: "hozirgina",
                likes: 0,
                dislikes: 0,
                userAction: null,
                replies: []
             });
             mainCommentInput.value = '';
             renderComments();
        }
    });
});
