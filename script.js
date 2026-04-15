document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach((el) => {
        observer.observe(el);
    });

    window.switchPage = function(pageId) {
        document.querySelectorAll('.page-section').forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('block');
        });
        const targetPage = document.getElementById('page-' + pageId);
        targetPage.classList.remove('hidden');
        targetPage.classList.add('block');
        
        window.scrollTo({top: 0, behavior: 'instant'});
        
        targetPage.querySelectorAll('.reveal-up').forEach(el => {
            el.classList.remove('active');
            observer.observe(el);
        });
    };

    // Global interceptor for anchor links to handle cross-page navigation flawlessly
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        
        const targetId = anchor.getAttribute('href').substring(1);
        if (!targetId) return;

        // Skip if this anchor is specifically triggering switchPage via onclick to avoid conflicts
        if (anchor.getAttribute('onclick') && anchor.getAttribute('onclick').includes('switchPage')) return;
        
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const parentPage = targetElement.closest('.page-section');
            
            // If the target section is inside a currently hidden page, switch to it first
            if (parentPage && parentPage.classList.contains('hidden')) {
                document.querySelectorAll('.page-section').forEach(page => {
                    page.classList.add('hidden');
                    page.classList.remove('block');
                });
                parentPage.classList.remove('hidden');
                parentPage.classList.add('block');
                
                // Re-observe animations for the revealed page
                parentPage.querySelectorAll('.reveal-up').forEach(el => {
                    el.classList.remove('active');
                    observer.observe(el);
                });
            }
            
            // Prevent default instant jump and smoothly scroll to the target instead
            e.preventDefault();
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Update URL hash seamlessly
                history.replaceState(null, null, '#' + targetId);
            }, 50); // Tiny delay to allow the browser to render display:block
        }
    });

    const counters = document.querySelectorAll('.counter');
    const speed = 200; 

    const startCounters = (entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                counters.forEach(counter => {
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const inc = target / speed;

                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 10);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                observer.unobserve(entry.target);
            }
        });
    };

    const counterObserver = new IntersectionObserver(startCounters, observerOptions);
    const counterSection = document.getElementById('counter-section');
    if(counterSection) {
        counterObserver.observe(counterSection);
    }

    const photoSlider = document.getElementById('photo-slider');
    const photoBtnPrev = document.getElementById('prev-photo');
    const photoBtnNext = document.getElementById('next-photo');

    if(photoSlider && photoBtnPrev && photoBtnNext) {
        photoBtnNext.addEventListener('click', () => {
            photoSlider.scrollBy({ left: photoSlider.clientWidth / 1.5, behavior: 'smooth' });
        });
        photoBtnPrev.addEventListener('click', () => {
            photoSlider.scrollBy({ left: -(photoSlider.clientWidth / 1.5), behavior: 'smooth' });
        });
    }

    const reviewSlider = document.getElementById('review-slider');
    const reviewBtnPrev = document.getElementById('prev-review');
    const reviewBtnNext = document.getElementById('next-review');

    if(reviewSlider && reviewBtnPrev && reviewBtnNext) {
        reviewBtnNext.addEventListener('click', () => {
            reviewSlider.scrollBy({ left: reviewSlider.clientWidth / 1.5, behavior: 'smooth' });
        });
        reviewBtnPrev.addEventListener('click', () => {
            reviewSlider.scrollBy({ left: -(reviewSlider.clientWidth / 1.5), behavior: 'smooth' });
        });
    }

    const videoSlider = document.getElementById('video-slider');
    const videoBtnPrev = document.getElementById('prev-video');
    const videoBtnNext = document.getElementById('next-video');

    if(videoSlider && videoBtnPrev && videoBtnNext) {
        videoBtnNext.addEventListener('click', () => {
            videoSlider.scrollBy({ left: videoSlider.clientWidth / 1.2, behavior: 'smooth' });
        });
        videoBtnPrev.addEventListener('click', () => {
            videoSlider.scrollBy({ left: -(videoSlider.clientWidth / 1.2), behavior: 'smooth' });
        });
    }

    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if(ans !== answer && ans.style.maxHeight) {
                    ans.style.maxHeight = null;
                    ans.previousElementSibling.querySelector('i').classList.remove('rotate-45', 'text-red-500');
                    ans.previousElementSibling.setAttribute('aria-expanded', 'false');
                }
            });

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.classList.remove('rotate-45', 'text-red-500');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                icon.classList.add('rotate-45', 'text-red-500');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement) {
        const words = ['Paralysis Rehab.', 'Knee Replacement.', 'Sports Injuries.', 'Manual Therapy.'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        // --- Fix for Up/Down Movement (Layout Shift) ---
        // 1. Give the parent heading a minimum height so it doesn't resize when words wrap
        const heading = typewriterElement.closest('h1');
        if (heading) {
            heading.style.minHeight = '3.5em'; 
        }
        
        // 2. Prevent the span itself from collapsing to 0 width/height when empty
        typewriterElement.style.display = 'inline-block';
        // -----------------------------------------------

        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                // Use a non-breaking space fallback (\u00A0) to maintain line height even when empty
                typewriterElement.textContent = currentWord.substring(0, charIndex - 1) || '\u00A0';
                charIndex--;
            } else {
                // Use a non-breaking space fallback (\u00A0) to maintain line height even when empty
                typewriterElement.textContent = currentWord.substring(0, charIndex + 1) || '\u00A0';
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        setTimeout(type, 1000);
    }
    
    const modal = document.getElementById('treatment-modal');
    const modalContent = document.getElementById('modal-content');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const btnClose = document.getElementById('close-modal');
    
    const modalTitle = document.getElementById('modal-title');
    const modalIcon = document.getElementById('modal-icon');
    const modalDesc = document.getElementById('modal-description');
    const learnMoreBtns = document.querySelectorAll('.learn-more-btn');

    function openModal(title, emoji, desc) {
        modalTitle.textContent = title;
        modalIcon.innerHTML = emoji;
        modalDesc.innerHTML = desc;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    function closeModal() {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    window.closeTreatmentModal = closeModal;

    document.addEventListener('click', (e) => {
        if(e.target.closest('.learn-more-btn')) {
            const btn = e.target.closest('.learn-more-btn');
            const title = btn.getAttribute('data-title');
            const emoji = btn.getAttribute('data-emoji');
            const desc = btn.getAttribute('data-desc');
            openModal(title, emoji, desc);
        }
    });

    btnClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    const submitBtn = document.getElementById('submit-whatsapp');
    if(submitBtn) {
        submitBtn.addEventListener('click', () => {
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const date = document.getElementById('form-date').value;
            const dept = document.getElementById('form-dept').value;
            const symptoms = document.getElementById('form-symptoms').value.trim();
            const errorMsg = document.getElementById('form-error');

            if(!name || !phone) {
                errorMsg.classList.remove('hidden');
                return;
            } else {
                errorMsg.classList.add('hidden');
            }

            const textMessage = `*New Appointment Request*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Email:* ${email || 'Not Provided'}%0A*Date:* ${date || 'Not Provided'}%0A*Department:* ${dept || 'Not Provided'}%0A*Symptoms:* ${symptoms || 'Not Provided'}`;
            
            const targetPhone = "918343861695";
            const whatsappUrl = `https://wa.me/${targetPhone}?text=${textMessage}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }

    document.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
            e.preventDefault();
        }
        
        if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) {
            e.preventDefault();
        }
    });
});
