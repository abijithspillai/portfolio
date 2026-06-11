document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open);
        });
    }

    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Terminal Typing Effect
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const textToType = "run build_portfolio\\n> Assembling components...\\n> Optimizing algorithms...\\n> Ready to deploy.";
        let index = 0;
        
        function type() {
            if (index < textToType.length) {
                if(textToType.substring(index, index+2) === '\\n') {
                    typingText.innerHTML += '<br>';
                    index += 2;
                } else {
                    typingText.innerHTML += textToType.charAt(index);
                    index++;
                }
                setTimeout(type, 50 + Math.random() * 50);
            }
        }
        
        const terminalSection = document.querySelector('.terminal-section');
        if(terminalSection) {
            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) {
                    setTimeout(type, 800);
                    observer.disconnect();
                }
            });
            observer.observe(terminalSection);
        }
    }
});