// Toggles the sidebar visibility when the hamburger menu is clicked
document.getElementById('hamburger-menu').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('active');
});

// Closes the sidebar when the close button is clicked
document.getElementById('close-btn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.remove('active');
});

// Post creation
let posts = [];

// Function to render posts and their comments dynamically
function renderPosts() {
    const postList = document.getElementById('post-list');
    postList.innerHTML = ""; // Clear current posts

    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <div class="post-header">
                <img src="img/userprofile.png" alt="User Avatar">
                <span class="username">@Jack</span>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            <div class="post-actions">
                <i class="fas fa-thumbs-up ${post.likes > 0 ? 'liked' : ''}" 
                   onclick="toggleLike(${index})" style="cursor: pointer;">
                </i> ${post.likes} Likes
                <i class="fas fa-share-alt"></i>
            </div>
            <div class="comment-section" id="comment-section-${index}">
                ${post.comments ? post.comments.map(comment => `
                    <div class="comment">
                        <img src="img/userprofile2.png" alt="User Avatar">
                        <div class="comment-text">${comment}</div>
                    </div>
                `).join('') : ''}
                <div class="comment">
                    <img src="img/userprofile4.png" alt="User Avatar">
                    <input type="text" placeholder="Add a comment..." id="new-comment-${index}">
                    <button onclick="addComment(${index})">Comment</button>
                </div>
            </div>
        `;
        postList.appendChild(postElement);
    });
}

// Fetch posts from the server
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        posts = await response.json();
        renderPosts();
    } catch (error) {
        console.error(error);
    }
}

// Function to handle new post creation
async function createPost() {
    const postContent = document.getElementById('post-content').value;
    if (postContent.trim() === "") {
        alert("Please enter something to post.");
        return;
    }
    const newPost = { content: postContent, likes: 0 };

    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
        });
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        const savedPost = await response.json();
        posts.push(savedPost);
        document.getElementById('post-content').value = ''; // Clear the textarea
        renderPosts();
    } catch (error) {
        console.error(error);
    }
}

// Function to handle adding a comment
async function addComment(postIndex) {
    const commentInput = document.getElementById(`new-comment-${postIndex}`);
    const commentText = commentInput.value.trim();
    if (commentText === "") {
        alert("Please enter a comment.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${posts[postIndex]._id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: commentText })
        });
        if (!response.ok) {
            throw new Error('Failed to add comment');
        }
        const updatedPost = await response.json();
        posts[postIndex] = updatedPost;
        renderPosts();
    } catch (error) {
        console.error(error);
    }
}

// Function to handle like button toggle
async function toggleLike(postIndex) {
    const post = posts[postIndex];

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${post._id}/like`, {
            method: 'PATCH'
        });
        if (!response.ok) {
            throw new Error('Failed to like post');
        }
        const updatedPost = await response.json();
        posts[postIndex] = updatedPost;
        renderPosts();
    } catch (error) {
        console.error(error);
    }
}

// Event listener for the post button
document.querySelector('.post-btn').addEventListener('click', createPost);

// Follow button toggle
function toggleFollow(userId) {
    const followButton = document.querySelector(`.follow-btn[data-id='${userId}']`);
    if (followButton.innerText === "Follow") {
        followButton.innerText = "Following";
        followButton.style.backgroundColor = "#28a745"; // Green for following
    } else {
        followButton.innerText = "Follow";
        followButton.style.backgroundColor = "#007bff"; // Default blue
    }
}

// Initial rendering of posts
fetchPosts();
