// 3d-bg.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles Data
    const particlesCount = 80;
    const positions = new Float32Array(particlesCount * 3);
    const velocities = [];

    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 300; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 300; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // z

        velocities.push({
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create a circular texture for particles
    const circleCanvas = document.createElement('canvas');
    circleCanvas.width = 32;
    circleCanvas.height = 32;
    const context = circleCanvas.getContext('2d');
    context.beginPath();
    context.arc(16, 16, 14, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    const texture = new THREE.CanvasTexture(circleCanvas);

    const particlesMaterial = new THREE.PointsMaterial({
        size: 2.5,
        map: texture,
        transparent: true,
        opacity: 0.3,
        color: 0x00a8ff, // Bright Blue
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);



    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const positions = particles.geometry.attributes.position.array;
        
        // Move particles
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            // Bounce off boundaries
            if (Math.abs(positions[i * 3]) > 150) velocities[i].x *= -1;
            if (Math.abs(positions[i * 3 + 1]) > 150) velocities[i].y *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 150) velocities[i].z *= -1;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;



        // Camera movement based on mouse
        const targetX = mouseX * 0.05;
        const targetY = mouseY * 0.05;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();
});
