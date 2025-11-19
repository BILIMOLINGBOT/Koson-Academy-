class InstagramComments {
    constructor() {
        this.comments = [];
        this.currentUser = 'current_user';
        this.replyModal = document.getElementById('replyModal');
        this.repliesList = document.getElementById('repliesList');
        this.originalComment = document.getElementById('originalComment');
        this.replyInput = document.getElementById('replyInput');
        this.postReplyBtn = document.getElementById('postReplyBtn');
        this.backBtn = document.getElementById('backBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.commentInput = document.getElementById('commentInput');
        this.postBtn = document.getElementById('postBtn');
        this.commentsList = document.getElementById('commentsList');
        
        this.currentReplyingTo = null;
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderComments();
    }

    loadSampleData() {
        this.comments = [
            {
                id: 1,
                username: 'javlonbek_rustamov',
                avatar: 'user-javlonbek',
                text: 'Ajoyib kontsert! Biletlarni qayerdan sotib olsa bo\'ladi? 🎫',
                timestamp: '2h',
                likes: 45,
                liked: false,
                replies: [
                    {
                        id: 101,
                        username: 'ozoda_music',
                        avatar: 'user-ozoda',
                        text: 'Biletlar tez orada @ticketuz saytida sotuvga chiqadi 😊',
                        timestamp: '1h',
                        likes: 23,
                        liked: true
                    },
                    {
                        id: 102,
                        username: 'sardor_music',
                        avatar: 'user-sardor',
                        text: 'Men ham kutayapman!',
                        timestamp: '45m',
                        likes: 8,
                        liked: false
                    }
                ]
            },
            {
                id: 2,
                username: 'dilshod_rahmonov',
                avatar: 'user-dilshod',
                text: 'Qanday qo\'shiqlar yangi? O\'tgan yilgi kontsertdagi qo\'shiqlarni ham kuylaysizmi?',
                timestamp: '3h',
                likes: 32,
                liked: false,
                replies: []
            },
            {
                id: 3,
                username: 'aziza_photography',
                avatar: 'user-aziza',
                text: 'Ranglar va dekoratsiya juda chiroyli! Suratlar ajoyib chiqgan 📸',
                timestamp: '4h',
                likes: 67,
                liked: true,
                replies: [
                    {
                        id: 301,
                        username: 'ozoda_music',
                        avatar: 'user-ozoda',
                        text: 'Rahmat! Sizning suratlaringiz ham juda zo\'r 😍',
                        timestamp: '3h',
                        likes: 15,
                        liked: true
                    }
                ]
            },
            {
                id: 4,
                username: 'bekzod_travel',
                avatar: 'user-bekzod',
                text: 'Qaysi shaharlarga kelasiz? Samarqandga ham kelasizmi?',
                timestamp: '5h',
                likes: 28,
                liked: false,
                replies: []
            },
            {
                id: 5,
                username: 'shaxnoza_art',
                avatar: 'user-shaxnoza',
                text: 'Kostyumlaringiz juda chiroyli! Kim dizayn qilgan? 👗',
                timestamp: '6h',
                likes: 41,
                liked: false,
                replies: []
            }
        ];
    }

    setupEventListeners() {
        // Comment input
        this.commentInput.addEventListener('input', () => {
            this.postBtn.disabled = this.commentInput.value.trim() === '';
        });

        this.commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.postBtn.disabled) {
                e.preventDefault();
                this.addComment();
            }
        });

        this.postBtn.addEventListener('click', () => {
            this.addComment();
        });

        // Reply input
        this.replyInput.addEventListener('input', () => {
            this.postReplyBtn.disabled = this.replyInput.value.trim() === '';
        });

        this.replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.postReplyBtn.disabled) {
                e.preventDefault();
                this.addReply();
            }
        });

        this.postReplyBtn.addEventListener('click', () => {
            this.addReply();
        });

        // Modal controls
        this.backBtn.addEventListener('click', () => {
            this.closeReplyModal();
        });

        this.closeModalBtn.addEventListener('click', () => {
            this.closeReplyModal();
        });

        // Click outside modal to close
        this.replyModal.addEventListener('click', (e) => {
            if (e.target === this.replyModal) {
                this.closeReplyModal();
            }
        });

        // Like button for post
        document.querySelector('.like-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            btn.classList.toggle('active');
            
            const likesCount = document.querySelector('.likes-count');
            const currentLikes = parseInt(likesCount.textContent.replace(/,/g, ''));
            
            if (btn.classList.contains('active')) {
                likesCount.textContent = this.formatNumber(currentLikes + 1);
                btn.classList.add('like-animation');
                setTimeout(() => btn.classList.remove('like-animation'), 300);
            } else {
                likesCount.textContent = this.formatNumber(currentLikes - 1);
            }
        });
    }

    addComment() {
        const text = this.commentInput.value.trim();
        if (!text) return;

        const newComment = {
            id: Date.now(),
            username: this.currentUser,
            avatar: 'user-current',
            text: text,
            timestamp: 'Just now',
            likes: 0,
            liked: false,
            replies: []
        };

        this.comments.unshift(newComment);
        this.commentInput.value = '';
        this.postBtn.disabled = true;
        this.renderComments();
        
        // Update comments count
        this.updateCommentsCount();
        
        this.showNotification('Comment added successfully');
    }

    addReply() {
        const text = this.replyInput.value.trim();
        if (!text || !this.currentReplyingTo) return;

        const newReply = {
            id: Date.now(),
            username: this.currentUser,
            avatar: 'user-current',
            text: text,
            timestamp: 'Just now',
            likes: 0,
            liked: false
        };

        const comment = this.comments.find(c => c.id === this.currentReplyingTo);
        if (comment) {
            comment.replies.push(newReply);
            this.replyInput.value = '';
            this.postReplyBtn.disabled = true;
            this.renderReplies();
            
            this.showNotification('Reply added successfully');
        }
    }

    openReplyModal(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        this.currentReplyingTo = commentId;
        this.renderOriginalComment(comment);
        this.renderReplies();
        this.replyModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on reply input
        setTimeout(() => {
            this.replyInput.focus();
        }, 100);
    }

    closeReplyModal() {
        this.replyModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        this.currentReplyingTo = null;
    }

    renderOriginalComment(comment) {
        this.originalComment.innerHTML = this.createCommentHTML(comment, true);
    }

    renderReplies() {
        if (!this.currentReplyingTo) return;

        const comment = this.comments.find(c => c.id === this.currentReplyingTo);
        if (!comment) return;

        this.repliesList.innerHTML = comment.replies
            .map(reply => this.createCommentHTML(reply, false))
            .join('');
    }

    renderComments() {
        this.commentsList.innerHTML = this.comments
            .map(comment => this.createCommentHTML(comment, false))
            .join('');
    }

    createCommentHTML(comment, isOriginal = false) {
        const hasReplies = comment.replies && comment.replies.length > 0;
        const showReplies = hasReplies && !isOriginal;

        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-avatar ${comment.avatar}">${comment.username.charAt(0).toUpperCase()}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-username">${comment.username}</span>
                        <span class="comment-time">${comment.timestamp}</span>
                    </div>
                    <div class="comment-text">${this.escapeHTML(comment.text)}</div>
                    <div class="comment-actions">
                        <button class="comment-action like ${comment.liked ? 'active' : ''}" 
                                onclick="app.toggleLike(${comment.id}, ${isOriginal})">
                            <svg viewBox="0 0 24 24" fill="${comment.liked ? 'currentColor' : 'none'}" stroke="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>${comment.likes}</span>
                        </button>
                        ${!isOriginal ? `
                            <button class="reply-btn" onclick="app.openReplyModal(${comment.id})">
                                Reply
                            </button>
                        ` : ''}
                    </div>
                    ${showReplies ? `
                        <div class="replies">
                            ${comment.replies.slice(0, 2).map(reply => this.createCommentHTML(reply, false)).join('')}
                            ${comment.replies.length > 2 ? `
                                <button class="view-replies" onclick="app.openReplyModal(${comment.id})">
                                    View ${comment.replies.length - 2} more replies
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    toggleLike(commentId, isOriginal) {
        let comment;
        
        if (isOriginal) {
            comment = this.comments.find(c => c.id === this.currentReplyingTo);
        } else {
            if (this.currentReplyingTo) {
                // Like in reply modal
                const parentComment = this.comments.find(c => c.id === this.currentReplyingTo);
                comment = parentComment.replies.find(r => r.id === commentId);
            } else {
                // Like in main comments
                comment = this.comments.find(c => c.id === commentId);
            }
        }

        if (comment) {
            comment.liked = !comment.liked;
            comment.likes += comment.liked ? 1 : -1;
            
            if (this.currentReplyingTo) {
                this.renderReplies();
                if (isOriginal) {
                    this.renderOriginalComment(this.comments.find(c => c.id === this.currentReplyingTo));
                }
            } else {
                this.renderComments();
            }
        }
    }

    updateCommentsCount() {
        const totalComments = this.comments.reduce((total, comment) => {
            return total + 1 + comment.replies.length;
        }, 0);
        
        document.querySelector('.comments-count').textContent = `${totalComments} Comments`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #262626;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the app
const app = new InstagramComments();

// Make app globally available for onclick handlers
window.app = app;