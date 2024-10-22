function createFireflies(num) {
    const firefliesContainer = document.getElementById('fireflies');

    for (let i = 0; i < num; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        
        // Random position
        firefly.style.left = Math.random() * 100 + 'vw'; // Position within the viewport width
        firefly.style.top = Math.random() * 100 + 'vh'; // Position within the viewport height
        
        // Random animation duration
        firefly.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
        
        firefliesContainer.appendChild(firefly);
    }
}

// Create 50 fireflies
// createFireflies(50);