// === Modal toggling ===
const commentsModal = document.getElementById("commentsModal");
const replyModal = document.getElementById("replyModal");

document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
    });
});

document.getElementById("back-to-comments").addEventListener("click", () => {
    replyModal.style.display = "none";
    commentsModal.style.display = "block";
});

// === Add Comment ===
const commentInput = document.querySelector(".comment-input");
const submitBtn = document.querySelector(".submit-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const commentsList = document.getElementById("commentsList");
const noCommentsIndicator = document.getElementById("no-comments-indicator");
const commentsCount = document.getElementById("comments-modal-count");

commentInput.addEventListener("input", () => {
    submitBtn.disabled = commentInput.value.trim() === "";
});

submitBtn.addEventListener("click", () => {
    const text = commentInput.value.trim();
    if (!text) return;

    const commentItem = document.createElement("div");
    commentItem.className = "comment-with-replies";
    commentItem.innerHTML = `
        <div class="reply-item">
            <div class="comment-avatar">S</div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">User</span>
                    <span class="comment-time">hozir</span>
                </div>
                <div class="comment-text">${text}</div>
                <div class="comment-actions">
                    <div class="comment-like">👍 <span>0</span></div>
                    <div class="comment-dislike">👎 <span>0</span></div>
                    <div class="comment-reply-btn">Javob berish</div>
                </div>
            </div>
        </div>
    `;

    commentsList.appendChild(commentItem);
    commentsList.style.display = "block";
    noCommentsIndicator.style.display = "none";

    commentsCount.textContent = parseInt(commentsCount.textContent) + 1;
    commentInput.value = "";
    submitBtn.disabled = true;

    // Reply button logic
    commentItem.querySelector(".comment-reply-btn").addEventListener("click", () => {
        commentsModal.style.display = "none";
        replyModal.style.display = "block";
        document.getElementById("original-comment").innerHTML = commentItem.outerHTML;
    });

    // Like/Dislike logic
    const likeBtn = commentItem.querySelector(".comment-like");
    const dislikeBtn = commentItem.querySelector(".comment-dislike");

    likeBtn.addEventListener("click", () => {
        likeBtn.classList.toggle("active");
        const count = likeBtn.querySelector("span");
        count.textContent = likeBtn.classList.contains("active") ? 1 : 0;
        dislikeBtn.classList.remove("active");
        dislikeBtn.querySelector("span").textContent = 0;
    });

    dislikeBtn.addEventListener("click", () => {
        dislikeBtn.classList.toggle("active");
        const count = dislikeBtn.querySelector("span");
        count.textContent = dislikeBtn.classList.contains("active") ? 1 : 0;
        likeBtn.classList.remove("active");
        likeBtn.querySelector("span").textContent = 0;
    });
});

cancelBtn.addEventListener("click", () => {
    commentInput.value = "";
    submitBtn.disabled = true;
});

// === Add Reply ===
const replyInput = document.querySelector(".reply-input");
const submitReplyBtn = document.querySelector(".submit-reply-btn");
const cancelReplyBtn = document.querySelector(".cancel-reply-btn");
const repliesList = document.getElementById("repliesList");

replyInput.addEventListener("input", () => {
    submitReplyBtn.disabled = replyInput.value.trim() === "";
});

submitReplyBtn.addEventListener("click", () => {
    const text = replyInput.value.trim();
    if (!text) return;

    const replyItem = document.createElement("div");
    replyItem.className = "reply-item";
    replyItem.innerHTML = `
        <div class="comment-avatar">S</div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">User</span>
                <span class="comment-time">hozir</span>
            </div>
            <div class="comment-text">${text}</div>
            <div class="comment-actions">
                <div class="comment-like">👍 <span>0</span></div>
                <div class="comment-dislike">👎 <span>0</span></div>
            </div>
        </div>
    `;

    repliesList.appendChild(replyItem);
    replyInput.value = "";
    submitReplyBtn.disabled = true;
});

cancelReplyBtn.addEventListener("click", () => {
    replyInput.value = "";
    submitReplyBtn.disabled = true;
});