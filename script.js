/* ============================================
   Kobe Hibachi Catering - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---- Mobile Navigation ---- */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        navItems.forEach(function (item) {
            item.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ---- Header Scroll Effect ---- */
    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', function () {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    /* ---- Scroll Animations ---- */
    const fadeElements = document.querySelectorAll('.fade-in');

    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        fadeElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    /* ---- FAQ Accordion ---- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function () {
                const isActive = item.classList.contains('active');

                faqItems.forEach(function (otherItem) {
                    otherItem.classList.remove('active');
                    const answer = otherItem.querySelector('.faq-answer');
                    if (answer) answer.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    const answer = item.querySelector('.faq-answer');
                    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    /* ---- Smooth Scroll for Anchor Links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            const pageHeader = document.querySelector('header');

            if (target && pageHeader) {
                e.preventDefault();
                const headerHeight = pageHeader.offsetHeight;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    /* ---- Counter Animation ---- */
    const statNumbers = document.querySelectorAll('.stat-number');

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalVal = Number(target.getAttribute('data-count')) || 0;
                    const suffix = target.getAttribute('data-suffix') || '';
                    const duration = 2000;
                    let startTime = null;

                    function animate(timestamp) {
                        if (!startTime) startTime = timestamp;
                        const progress = Math.min((timestamp - startTime) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * finalVal);
                        target.textContent = current + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            target.textContent = finalVal + suffix;
                        }
                    }

                    requestAnimationFrame(animate);
                    counterObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function (el) {
            counterObserver.observe(el);
        });
    }

    /* ---- Lazy Load YouTube Iframes ---- */
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(function (placeholder) {
        placeholder.addEventListener('click', function () {
            const videoId = this.getAttribute('data-video-id');
            if (!videoId) return;

            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
            iframe.setAttribute('allow', 'autoplay; encrypted-media');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('title', 'Kobe Hibachi Catering Video');

            if (this.parentNode) {
                this.parentNode.replaceChild(iframe, this);
            }
        });
    });

    /* ---- Booking CTA Conversion Tracking ---- */
    const bookingButtons = document.querySelectorAll(
        '#continue-booking-btn, #mobile-booking-btn'
    );

    bookingButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            if (typeof gtag === 'function') {
                e.preventDefault(); // 阻止立即跳转

                gtag('event', 'conversion', {
                    'send_to': 'AW-18087654321/7rjMCM7K1ZscELHn7rBD',
                    'event_callback': function () {
                        window.location = btn.href;
                    }
                });

                // fallback（防止 callback 没执行）
                setTimeout(function () {
                    window.location = btn.href;
                }, 500);
            }
        });
    });

});