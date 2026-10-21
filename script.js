const GOOGLE_FORM = { action: "", entries: { company: "", name: "", email: "", phone: "", message: "" } };

(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroScene = document.querySelector('.hero-scene');
  const about = document.querySelector('.intro');
  const belief = document.querySelector('.belief');
  const serviceJourney = document.querySelector('.service-journey');
  const messageScene = document.querySelector('.message-scene');
  const strengthPanels = [...document.querySelectorAll('.strength-panel')];
  const servicePanels = [...document.querySelectorAll('.service-panel')];
  const serviceDiagrams = [...document.querySelectorAll('.service-diagram')];
  const serviceNumber = document.querySelector('.service-index b');
  const messageBody = document.querySelector('.message-body');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  let ticking = false;
  let activeStrength = -1;
  let activeService = -1;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const sceneProgress = (element) => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
  };
  const viewportProgress = (element) => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
  };
  const switchPanel = (panels, index) => panels.forEach((panel, i) => {
    panel.classList.toggle('is-active', i === index);
  });
  const updateScenes = () => {
    ticking = false;
    if (reducedMotion.matches) return;
    const heroProgress = sceneProgress(heroScene);
    const aboutProgress = viewportProgress(about);
    const beliefProgress = sceneProgress(belief);
    const serviceProgress = sceneProgress(serviceJourney);
    const messageProgress = sceneProgress(messageScene);
    root.style.setProperty('--hero-progress', heroProgress.toFixed(4));
    root.style.setProperty('--about-progress', aboutProgress.toFixed(4));
    root.style.setProperty('--belief-progress', beliefProgress.toFixed(4));
    root.style.setProperty('--message-progress', messageProgress.toFixed(4));
    root.style.setProperty('--service-progress', serviceProgress.toFixed(4));
    const beliefStage = belief?.querySelector('.belief-stage');
    const beliefBlend = Math.round(beliefProgress * 100);
    root.style.setProperty('--belief-blend', `${beliefBlend}%`);
    if (beliefStage) {
      beliefStage.style.backgroundColor = `color-mix(in srgb, var(--paper) ${100 - beliefBlend}%, var(--red) ${beliefBlend}%)`;
      beliefStage.style.color = beliefBlend < 65 ? 'var(--ink)' : '#fff';
    }

    const strengthIndex = Math.min(2, Math.floor(beliefProgress * 3));
    if (strengthIndex !== activeStrength) {
      activeStrength = strengthIndex;
      switchPanel(strengthPanels, strengthIndex);
      const page = document.querySelector('.belief-pagination b');
      if (page) page.textContent = String(strengthIndex + 1).padStart(2, '0');
    }

    const serviceIndex = Math.min(3, Math.floor(serviceProgress * 4));
    if (serviceIndex !== activeService) {
      activeService = serviceIndex;
      switchPanel(servicePanels, serviceIndex);
      switchPanel(serviceDiagrams, serviceIndex);
      if (serviceNumber) {
        serviceNumber.classList.add('is-changing');
        serviceNumber.textContent = String(serviceIndex + 1).padStart(2, '0');
        window.setTimeout(() => {
          serviceNumber.classList.remove('is-changing');
        }, 140);
      }
    }
    const serviceFraction = serviceProgress * 4 - serviceIndex;
    const activeDiagram = serviceDiagrams[serviceIndex];
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    serviceDiagrams.forEach((diagram, index) => {
      if (index !== serviceIndex) diagram.style.removeProperty('clip-path');
    });
    if (activeDiagram) {
      if (serviceIndex === 0 || isMobile) {
        activeDiagram.style.clipPath = 'inset(0)';
      } else {
        const diagramReveal = clamp((serviceFraction - 0.01) / 0.05);
        activeDiagram.style.clipPath = `inset(0 ${100 - diagramReveal * 100}% 0 0)`;
      }
    }
    messageBody?.classList.toggle('is-revealed', messageProgress >= 0.5);
    document.querySelectorAll('.office,.faq,.contact').forEach((section) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--section-progress', clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height)).toFixed(4));
    });
    if (serviceJourney?.closest('.services')) {
      const section = serviceJourney.closest('.services');
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--section-progress', clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height)).toFixed(4));
    }
    const recruit = document.querySelector('.recruit');
    if (recruit) recruit.style.setProperty('--recruit-progress', viewportProgress(recruit).toFixed(4));
  };
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScenes);
    }
  };

  if (reducedMotion.matches) {
    root.classList.add('motion-static');
  } else {
    root.classList.add('js-motion');
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reducedMotion.addEventListener?.('change', () => {
      if (reducedMotion.matches) {
        root.classList.remove('js-motion');
        root.classList.add('motion-static');
        root.style.removeProperty('--belief-blend');
        belief?.querySelector('.belief-stage')?.style.removeProperty('background-color');
        belief?.querySelector('.belief-stage')?.style.removeProperty('color');
        serviceDiagrams.forEach((diagram) => diagram.style.removeProperty('clip-path'));
      } else {
        root.classList.remove('motion-static');
        root.classList.add('js-motion');
        requestUpdate();
      }
    });
    updateScenes();
  }

  menuButton?.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav?.classList.toggle('is-open', !expanded);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));

  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const configured = GOOGLE_FORM.action && Object.values(GOOGLE_FORM.entries).every(Boolean);
    if (!configured) {
      if (status) status.textContent = 'お問い合わせフォームは準備中です。お電話にてお問い合わせください。';
      return;
    }
    const body = new FormData();
    Object.entries(GOOGLE_FORM.entries).forEach(([field, entry]) => {
      body.append(entry, form.elements[field]?.value ?? '');
    });
    if (button) button.disabled = true;
    if (status) status.textContent = '送信中です。';
    try {
      await fetch(GOOGLE_FORM.action, { method: 'POST', mode: 'no-cors', body });
      form.reset();
      if (status) status.textContent = '送信しました。お問い合わせありがとうございます。';
    } catch {
      if (status) status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
