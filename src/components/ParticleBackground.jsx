import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../ThemeContext";

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const materialRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles Data
    const particlesCount = 80;
    const positions = new Float32Array(particlesCount * 3);
    const velocities = [];

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      velocities.push({
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.2,
      });
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Create a circular texture for particles
    const circleCanvas = document.createElement("canvas");
    circleCanvas.width = 32;
    circleCanvas.height = 32;
    const context = circleCanvas.getContext("2d");
    context.beginPath();
    context.arc(16, 16, 14, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    const texture = new THREE.CanvasTexture(circleCanvas);

    const particlesMaterial = new THREE.PointsMaterial({
      size: 2.5,
      map: texture,
      transparent: true,
      opacity: theme === "light" ? 0.4 : 0.3,
      color: theme === "light" ? 0x0050aa : 0x00a8ff,
      blending: theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    materialRef.current = particlesMaterial;

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const pos = particles.geometry.attributes.position.array;

      for (let i = 0; i < particlesCount; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        if (Math.abs(pos[i * 3]) > 150) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 150) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 150) velocities[i].z *= -1;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      const targetX = mouseX * 0.05;
      const targetY = mouseY * 0.05;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      texture.dispose();
    };
  }, []); // Only run once on mount

  // Watch for theme changes and update material
  useEffect(() => {
    if (materialRef.current) {
      if (theme === "light") {
        materialRef.current.color.setHex(0x0050aa);
        materialRef.current.opacity = 0.4;
        materialRef.current.blending = THREE.NormalBlending;
      } else {
        materialRef.current.color.setHex(0x00a8ff);
        materialRef.current.opacity = 0.3;
        materialRef.current.blending = THREE.AdditiveBlending;
      }
      materialRef.current.needsUpdate = true;
    }
  }, [theme]);

  return <canvas ref={canvasRef} id="bg-canvas" />;
}
