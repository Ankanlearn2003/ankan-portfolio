(function initLiveBackground() {
  const canvas = document.getElementById("live-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  const particles = [];

  const particleCount = () => (width < 520 ? 38 : width < 900 ? 62 : 88);
  const maxLinkDist = 118;
  const baseSpeed = 0.22;

  function randomVelocity() {
    return (Math.random() - 0.5) * baseSpeed;
  }

  function initParticles() {
    particles.length = 0;
    const n = particleCount();
    for (let i = 0; i < n; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomVelocity(),
        vy: randomVelocity(),
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function step() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -12) p.x = width + 12;
      if (p.x > width + 12) p.x = -12;
      if (p.y < -12) p.y = height + 12;
      if (p.y > height + 12) p.y = -12;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const n = particles.length;
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxLinkDist) {
          const t = 1 - dist / maxLinkDist;
          ctx.strokeStyle = `rgba(110, 168, 255, ${t * 0.22})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.fillStyle = "rgba(126, 240, 195, 0.42)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    step();
    draw();
    window.requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    resize();
    if (prefersReduced) {
      draw();
    }
  });

  resize();

  if (prefersReduced) {
    draw();
    return;
  }

  window.requestAnimationFrame(loop);
})();

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please fill in all fields.";
      formStatus.style.color = "#ff8a8a";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formStatus.textContent = "Please enter a valid email address.";
      formStatus.style.color = "#ff8a8a";
      return;
    }

    formStatus.textContent = "Sending your message...";
    formStatus.style.color = "#67d39e";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      contactForm.reset();
      formStatus.textContent = "Thanks! Your message has been sent successfully.";
      formStatus.style.color = "#67d39e";
    } catch (error) {
      formStatus.textContent = "Something went wrong. Please try again.";
      formStatus.style.color = "#ff8a8a";
    }
  });
}

const scrollTargets = document.querySelectorAll("section, .project-card");

if (scrollTargets.length > 0) {
  scrollTargets.forEach((element) => {
    element.classList.add("hidden-scroll");
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show-scroll");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  scrollTargets.forEach((element) => observer.observe(element));
}
