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
    var header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', function () {
            var currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    /* ---- Scroll Animations ---- */
    var fadeElements = document.querySelectorAll('.fade-in');

    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        var observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        var observer = new IntersectionObserver(function (entries) {
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
    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function () {
                var isActive = item.classList.contains('active');

                faqItems.forEach(function (otherItem) {
                    otherItem.classList.remove('active');
                    var answer = otherItem.querySelector('.faq-answer');
                    if (answer) answer.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    var answer = item.querySelector('.faq-answer');
                    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    /* ---- Smooth Scroll for Anchor Links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            var pageHeader = document.querySelector('header');

            if (target && pageHeader) {
                e.preventDefault();
                var headerHeight = pageHeader.offsetHeight;
                var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    /* ---- Booking Form Validation + Submit ---- */
    var bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var requiredFields = bookingForm.querySelectorAll('[required]');
            var isValid = true;

            requiredFields.forEach(function (field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ff4d00';
                    field.addEventListener('input', function () {
                        this.style.borderColor = '';
                    }, { once: true });
                }
            });

            if (!isValid) {
                var firstInvalid = bookingForm.querySelector('[required]:invalid, [required][style*="border-color"]');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            var honeypot = bookingForm.querySelector('input[name="url"]');
            if (honeypot && honeypot.value.trim() !== '') {
                return;
            }

            var submitButton = bookingForm.querySelector('button[type="submit"]');
            var originalButtonText = submitButton ? submitButton.textContent : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }

            var formData = {
                name: bookingForm.name.value.trim(),
                phone: bookingForm.phone.value.trim(),
                email: bookingForm.email.value.trim(),
                date: bookingForm.date.value,
                guests: bookingForm.guests.value.trim(),
                address: bookingForm.address.value.trim(),
                service: bookingForm.service ? bookingForm.service.value : '',
                message: bookingForm.message.value.trim()
            };

            try {
                console.log('Sending booking form data:', formData);

                var response = await fetch('/api/send-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                var result = await response.json();
                console.log('API response:', result);

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to submit booking request.');
                }

                alert('Booking submitted successfully! We will contact you soon.');
                bookingForm.reset();
            } catch (error) {
                console.error('Booking submission error:', error);
                alert(error.message || 'Something went wrong. Please try again.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        });
    }

    /* ---- Counter Animation ---- */
    var statNumbers = document.querySelectorAll('.stat-number');

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var target = entry.target;
                    var finalVal = Number(target.getAttribute('data-count')) || 0;
                    var suffix = target.getAttribute('data-suffix') || '';
                    var duration = 2000;
                    var startTime = null;

                    function animate(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var progress = Math.min((timestamp - startTime) / duration, 1);
                        var eased = 1 - Math.pow(1 - progress, 3);
                        var current = Math.floor(eased * finalVal);
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
    var videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(function (placeholder) {
        placeholder.addEventListener('click', function () {
            var videoId = this.getAttribute('data-video-id');
            if (!videoId) return;

            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
            iframe.setAttribute('allow', 'autoplay; encrypted-media');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('title', 'Kobe Hibachi Catering Video');

            if (this.parentNode) {
                this.parentNode.replaceChild(iframe, this);
            }
        });
    });

});