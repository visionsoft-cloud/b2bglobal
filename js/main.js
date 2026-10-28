/**
 * B2B DATA GLOBAL LLC — Main Application JavaScript
 * Controls UI Interactivity, Sliders, Modals, Searches, Accordions & Visualizer Orchestration
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Top Scroll Progress Bar
  const scrollBar = document.getElementById('scrollBar');
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    if (scrollBar && total > 0) {
      scrollBar.style.width = ((doc.scrollTop / total) * 100) + '%';
    }
  }, { passive: true });

  // 2. Mobile Menu Navigation
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.getElementById('navMenu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      menuBtn.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });

    // Close when clicking outside or on a link
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header')) {
        navMenu.classList.remove('open');
        menuBtn.textContent = '☰';
      }
    });
  }

  // Mobile dropdown toggles
  document.querySelectorAll('.menu > li.has-dd > a').forEach(item => {
    item.addEventListener('click', (e) => {
      if (window.innerWidth <= 960) {
        e.preventDefault();
        const parent = item.parentElement;
        parent.classList.toggle('open-mobile');
      }
    });
  });

  // 3. Industry Carousel Slider
  const track = document.getElementById('indTrack');
  const indPrevBtn = document.getElementById('indPrev');
  const indNextBtn = document.getElementById('indNext');
  const indDotsContainer = document.getElementById('indDots');

  if (track && indPrevBtn && indNextBtn) {
    const cards = Array.from(track.children);
    let currentIndex = 0;
    let autoTimer = null;

    function getVisibleCards() {
      const w = window.innerWidth;
      return w <= 560 ? 1 : w <= 960 ? 2 : 4;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCards());
    }

    function renderDots() {
      if (!indDotsContainer) return;
      indDotsContainer.innerHTML = '';
      const total = getMaxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = i === currentIndex ? 'on' : '';
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        indDotsContainer.appendChild(dot);
      }
    }

    function updateSlider() {
      if (!cards[0]) return;
      const cardWidth = cards[0].getBoundingClientRect().width + 20; // 20px gap
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      renderDots();
    }

    function goToSlide(idx) {
      const max = getMaxIndex();
      currentIndex = Math.max(0, Math.min(idx, max));
      updateSlider();
    }

    indPrevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });

    indNextBtn.addEventListener('click', () => {
      const max = getMaxIndex();
      goToSlide(currentIndex >= max ? 0 : currentIndex + 1);
      resetAutoPlay();
    });

    function startAutoPlay() {
      autoTimer = setInterval(() => {
        const max = getMaxIndex();
        currentIndex = (currentIndex >= max) ? 0 : currentIndex + 1;
        updateSlider();
      }, 4000);
    }

    function resetAutoPlay() {
      clearInterval(autoTimer);
      startAutoPlay();
    }

    const sliderWrapper = track.closest('.slider');
    if (sliderWrapper) {
      sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
      sliderWrapper.addEventListener('mouseleave', () => startAutoPlay());
    }

    window.addEventListener('resize', () => {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      updateSlider();
    });

    updateSlider();
    startAutoPlay();
  }

  // 4. Interactive Live Search with Suggestions
  const searchInput = document.getElementById('evSearch');
  const searchSuggest = document.getElementById('evSuggest');
  const searchBtn = document.getElementById('evSearchBtn');

  if (searchInput && searchSuggest) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query || !window.B2B_SEARCH) {
        searchSuggest.classList.remove('on');
        searchSuggest.innerHTML = '';
        return;
      }

      const results = window.B2B_SEARCH.search(query).slice(0, 5);
      if (results.length > 0) {
        searchSuggest.innerHTML = `
          <div class="sg-head">${results.length} event databases available</div>
          ${results.map(r => `
            <a href="events.html?q=${encodeURIComponent(r.name)}" class="sg-item">
              <b>${r.name}</b>
              <span>${r.city ? r.city + ', ' : ''}${r.country} · ${r.industry}</span>
              <i>${r.attendees.toLocaleString()} attendees · ${r.exhibitors.toLocaleString()} exhibitors</i>
            </a>
          `).join('')}
          <a href="events.html?q=${encodeURIComponent(query)}" class="sg-all">View all results on Events page →</a>
        `;
        searchSuggest.classList.add('on');
      } else {
        searchSuggest.classList.remove('on');
      }
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const q = searchInput.value.trim();
        window.location.href = `events.html${q ? '?q=' + encodeURIComponent(q) : ''}`;
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrap')) {
        searchSuggest.classList.remove('on');
      }
    });
  }

  // 5. Interactive FAQ Accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.faq');
      const isOpen = card.classList.contains('open');
      // Close other accordions in the same grid
      document.querySelectorAll('.faq.open').forEach(f => f.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
      }
    });
  });

  // 6. Multi-Step Requirement Modal Form
  const modal = document.getElementById('requirementModal');
  const openModalBtns = document.querySelectorAll('[data-open-modal="requirement"]');
  const closeModalBtns = document.querySelectorAll('[data-close-modal]');
  const step1 = document.getElementById('modalStep1');
  const step2 = document.getElementById('modalStep2');
  const stepDone = document.getElementById('modalDone');
  const modalNextBtn = document.getElementById('modalNext');
  const modalBackBtn = document.getElementById('modalBack');
  const modalSendBtn = document.getElementById('modalSend');
  const modalNote = document.getElementById('modalNote');

  function openRequirementModal(prefillTopic) {
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (step1 && step2 && stepDone) {
      step1.style.display = 'block';
      step2.style.display = 'none';
      stepDone.style.display = 'none';
    }
    const topicField = document.getElementById('reqTopic');
    if (topicField && prefillTopic) {
      topicField.value = prefillTopic;
    }
  }

  function closeRequirementModal() {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = btn.getAttribute('data-prefill') || '';
      openRequirementModal(topic);
    });
  });

  closeModalBtns.forEach(btn => btn.addEventListener('click', closeRequirementModal));

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRequirementModal();
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      const need = document.getElementById('reqNeed');
      const when = document.getElementById('reqWhen');
      if (need && !need.value) {
        if (modalNote) modalNote.textContent = 'Please choose your requirement type.';
        return;
      }
      if (when && !when.value) {
        if (modalNote) modalNote.textContent = 'Please choose your project timeline.';
        return;
      }
      if (modalNote) modalNote.textContent = '';
      step1.style.display = 'none';
      step2.style.display = 'block';
      const pills = document.querySelectorAll('.rq-steps span');
      if (pills[0]) pills[0].classList.add('done');
      if (pills[1]) pills[1].classList.add('on');
    });
  }

  if (modalBackBtn) {
    modalBackBtn.addEventListener('click', () => {
      step2.style.display = 'none';
      step1.style.display = 'block';
      const pills = document.querySelectorAll('.rq-steps span');
      if (pills[1]) pills[1].classList.remove('on');
    });
  }

  if (modalSendBtn) {
    modalSendBtn.addEventListener('click', () => {
      const name = document.getElementById('reqName');
      const email = document.getElementById('reqEmail');
      if (!name || !name.value.trim()) {
        if (modalNote) modalNote.textContent = 'Please enter your full name.';
        return;
      }
      if (!email || !email.value.trim() || !email.value.includes('@')) {
        if (modalNote) modalNote.textContent = 'Please enter a valid work email address.';
        return;
      }
      modalSendBtn.disabled = true;
      modalSendBtn.textContent = 'Submitting…';

      setTimeout(() => {
        step2.style.display = 'none';
        stepDone.style.display = 'block';
        modalSendBtn.disabled = false;
        modalSendBtn.textContent = 'Submit requirement';
      }, 700);
    });
  }

  // Automatic Modal Trigger: Exit Intent & Scroll
  let hasTriggeredAutoModal = false;
  try {
    if (sessionStorage.getItem('b2b_modal_seen')) hasTriggeredAutoModal = true;
  } catch (_) {}

  window.addEventListener('scroll', () => {
    if (hasTriggeredAutoModal) return;
    const scrollPos = window.scrollY + window.innerHeight;
    const threshold = document.documentElement.scrollHeight * 0.65;
    if (scrollPos > threshold) {
      hasTriggeredAutoModal = true;
      try { sessionStorage.setItem('b2b_modal_seen', '1'); } catch (_) {}
      openRequirementModal();
    }
  }, { passive: true });

  // 7. Interactive Sample Preview Table Switcher ("Built" vs "Planned")
  const planBtn = document.querySelector('[data-view="plan"]');
  const builtBtn = document.querySelector('[data-view="built"]');
  const sampleTable = document.querySelector('.sb-file');
  const sampleCap = document.getElementById('sampleCap');

  if (planBtn && builtBtn && sampleTable) {
    planBtn.addEventListener('click', () => {
      planBtn.classList.add('on');
      builtBtn.classList.remove('on');
      sampleTable.classList.add('planned');
      if (sampleCap) sampleCap.textContent = 'Schema planned · awaiting custom sourcing & fields validation';
    });

    builtBtn.addEventListener('click', () => {
      builtBtn.classList.add('on');
      planBtn.classList.remove('on');
      sampleTable.classList.remove('planned');
      if (sampleCap) sampleCap.textContent = 'Records sourced into one consistent, CRM-ready verified schema';
    });
  }

  // 8. Seven Checks Verification Interactive Carousel (About & Home)
  const verSteps = document.querySelectorAll('.dsx-step');
  const verPanels = document.querySelectorAll('.dsx-panel-card');

  verSteps.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      verSteps.forEach(s => s.classList.remove('on'));
      btn.classList.add('on');
      verPanels.forEach((p, pIdx) => {
        p.style.display = (pIdx === idx) ? 'block' : 'none';
      });
    });
  });

  // 9. Initialize 3D Globe Visualizer if element exists
  if (window.B2B_VIS && typeof window.B2B_VIS.initGlobe === 'function') {
    window.B2B_VIS.initGlobe('globe');
  }

  // 10. Initialize 3D Segment Mesh Visualizer if element exists
  if (window.B2B_MESH && typeof window.B2B_MESH.initSegmentMesh === 'function') {
    window.B2B_MESH.initSegmentMesh('segmentMesh');
  }

  // 11. Initialize Live Pipeline Stream Simulation if element exists
  if (window.B2B_STREAM && typeof window.B2B_STREAM.initPipelineStream === 'function') {
    window.B2B_STREAM.initPipelineStream('pipelineStream');
  }

  // 12. Initialize Footer Ambient Particles if element exists
  if (window.B2B_STREAM && typeof window.B2B_STREAM.initFooterParticles === 'function') {
    window.B2B_STREAM.initFooterParticles('fparticles');
  }

});
