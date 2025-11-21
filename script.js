document.addEventListener('DOMContentLoaded', () => {
    // ... oldingi kod ...

    // Javob berish funksiyalari
    function initReplySystem() {
        // Javob berish tugmalari
        document.querySelectorAll('.comment-reply').forEach(btn => {
            btn.addEventListener('click', function() {
                const comment = this.closest('.comment');
                const replyContainer = comment.querySelector('.reply-input-container');
                const allReplyContainers = document.querySelectorAll('.reply-input-container');
                
                // Boshqa barcha javob maydonlarini yopish
                allReplyContainers.forEach(container => {
                    if (container !== replyContainer) {
                        container.style.display = 'none';
                    }
                });
                
                // Joriy javob maydonini ochish/yopish
                if (replyContainer.style.display === 'block') {
                    replyContainer.style.display = 'none';
                } else {
                    replyContainer.style.display = 'block';
                    replyContainer.querySelector('.reply-input').focus();
                }
            });
        });

        // Javob yuborish
        document.querySelectorAll('.submit-reply-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const replyContainer = this.closest('.reply-input-container');
                const replyInput = replyContainer.querySelector('.reply-input');
                const comment = replyContainer.closest('.comment');
                const repliesContainer = comment.querySelector('.replies-container');
                
                addReply(repliesContainer, replyInput.value.trim());
                
                // Tozalash
                replyInput.value = '';
                replyContainer.style.display = 'none';
                this.disabled = true;
            });
        });

        // Javob bekor qilish
        document.querySelectorAll('.cancel-reply-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const replyContainer = this.closest('.reply-input-container');
                const replyInput = replyContainer.querySelector('.reply-input');
                
                replyInput.value = '';
                replyContainer.style.display = 'none';
            });
        });

        // Javob input validatsiyasi
        document.querySelectorAll('.reply-input').forEach(input => {
            input.addEventListener('input', function() {
                const submitBtn = this.closest('.reply-input-container').querySelector('.submit-reply-btn');
                submitBtn.disabled = this.value.trim() === '';
            });
        });

        // Fikr like/dislike
        document.querySelectorAll('.comment-action').forEach(action => {
            action.addEventListener('click', function() {
                if (this.classList.contains('like-action')) {
                    handleCommentLike(this);
                } else if (this.classList.contains('dislike-action')) {
                    handleCommentDislike(this);
                }
            });
        });
    }

    // Javob qo'shish funksiyasi
    function addReply(container, replyText) {
        const replyId = Date.now();
        const replyElement = document.createElement('div');
        replyElement.className = 'reply';
        replyElement.setAttribute('data-reply-id', replyId);
        
        replyElement.innerHTML = `
            <div class="comment-avatar">S</div>
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">Siz</div>
                    <div class="comment-time">hozirgina</div>
                </div>
                <div class="comment-text">${replyText}</div>
                <div class="comment-actions">
                    <div class="comment-action like-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1-2-2h3"/>
                        </svg>
                        <span class="like-count">0</span>
                    </div>
                    <div class="comment-action dislike-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38-9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(replyElement);
        
        // Yangi javobga event listener qo'shish
        replyElement.querySelectorAll('.comment-action').forEach(action => {
            action.addEventListener('click', function() {
                if (this.classList.contains('like-action')) {
                    handleCommentLike(this);
                } else if (this.classList.contains('dislike-action')) {
                    handleCommentDislike(this);
                }
            });
        });
        
        showNotification("Javobingiz muvaffaqiyatli qo'shildi");
    }

    // Fikr like funksiyasi
    function handleCommentLike(likeBtn) {
        const isActive = likeBtn.classList.contains('active');
        const likeCountElement = likeBtn.querySelector('.like-count');
        let likeCount = parseInt(likeCountElement.textContent);
        
        if (isActive) {
            likeBtn.classList.remove('active');
            likeCount--;
            showNotification("Like olib tashlandi");
        } else {
            likeBtn.classList.add('active');
            likeCount++;
            
            // Dislike ni olib tashlash
            const dislikeBtn = likeBtn.closest('.comment-actions').querySelector('.dislike-action');
            if (dislikeBtn.classList.contains('active')) {
                dislikeBtn.classList.remove('active');
            }
            
            showNotification("Fikr like qilindi");
        }
        
        likeCountElement.textContent = likeCount;
    }

    // Fikr dislike funksiyasi
    function handleCommentDislike(dislikeBtn) {
        const isActive = dislikeBtn.classList.contains('active');
        
        if (isActive) {
            dislikeBtn.classList.remove('active');
            showNotification("Dislike olib tashlandi");
        } else {
            dislikeBtn.classList.add('active');
            
            // Like ni olib tashlash
            const likeBtn = dislikeBtn.closest('.comment-actions').querySelector('.like-action');
            if (likeBtn.classList.contains('active')) {
                likeBtn.classList.remove('active');
                const likeCountElement = likeBtn.querySelector('.like-count');
                let likeCount = parseInt(likeCountElement.textContent);
                likeCountElement.textContent = Math.max(0, likeCount - 1);
            }
            
            showNotification("Fikr dislike qilindi");
        }
    }

    // Sahifa yuklanganda
    loadFromStorage();
    updateCounts();
    adjustTextareaHeight();
    initReplySystem(); // Javob berish tizimini ishga tushirish
    
    // ... qolgan kod ...
});