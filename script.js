// Event listenerlar
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditId = null;
});

document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditId = null;
});

document.getElementById('save-edit').addEventListener('click', () => {
    if (!currentEditId) return;
    
    const comment = findCommentRecursive(comments, currentEditId);
    if (comment) {
        comment.text = document.getElementById('edit-input').value.trim();
        comment.time = comment.time.includes('tahrirlandi') 
            ? comment.time 
            : comment.time + ' (tahrirlandi)';
        
        renderComments();
        document.getElementById('edit-modal').style.display = 'none';
        currentEditId = null;
        showNotification('Fikr tahrirlandi');
    }
});

// Modal tashqarisiga bosganda yopish
document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) {
        document.getElementById('edit-modal').style.display = 'none';
        currentEditId = null;
    }
});