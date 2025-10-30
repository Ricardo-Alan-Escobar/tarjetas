document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  // Selección de elementos
  // -------------------------------
  const contactCards = document.querySelectorAll(".contact-card");
  const skillBadges = document.querySelectorAll(".skill-badge");
  const fadeLeftTexts = document.querySelectorAll(".fade-left");
  const fadeRightTexts = document.querySelectorAll(".fade-right");
  const fadeUpTexts = document.querySelectorAll(".fade-up");
  const skillsContainer = document.querySelector(".skills-container");

  // -------------------------------
  // Intersection Observer para fade
  // -------------------------------
  const observerOptions = { threshold: 0.2 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translate(0,0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const initFade = (elements, direction) => {
    elements.forEach((el) => {
      // NO aplicar fade a skill badges si están en el contenedor flotante
      if (el.classList.contains('skill-badge') && skillsContainer && skillsContainer.contains(el)) {
        return;
      }
      
      el.style.opacity = "0";
      switch (direction) {
        case "left":
          el.style.transform = "translateX(-30px)";
          break;
        case "right":
          el.style.transform = "translateX(30px)";
          break;
        case "up":
          el.style.transform = "translateY(20px)";
          break;
      }
      observer.observe(el);
    });
  };

  // Aplicamos fade (excepto a los badges flotantes)
  initFade(contactCards, "up");
  initFade(fadeLeftTexts, "left");
  initFade(fadeRightTexts, "right");
  initFade(fadeUpTexts, "up");

  // -------------------------------
  // Flotación y colisiones para skills
  // -------------------------------
  if (skillsContainer && skillBadges.length > 0) {
    // Obtener solo los badges que están dentro del contenedor flotante
    const floatingBadges = Array.from(skillBadges).filter(badge => 
      skillsContainer.contains(badge)
    );

    if (floatingBadges.length === 0) return;

    const skillData = floatingBadges.map((el) => {
      // Hacer visible y posicionar absolutamente
      el.style.opacity = "1";
      el.style.position = "absolute";
      el.style.transition = "none";
      
      // Obtener dimensiones reales
      const rect = el.getBoundingClientRect();
      const containerRect = skillsContainer.getBoundingClientRect();
      
      // Posición aleatoria dentro del contenedor
      const x = Math.random() * (containerRect.width - rect.width - 20);
      const y = Math.random() * (containerRect.height - rect.height - 20);
      
      // Velocidad aleatoria
      const vx = (Math.random() - 0.5) * 1.5;
      const vy = (Math.random() - 0.5) * 1.5;
      
      el.style.left = x + "px";
      el.style.top = y + "px";
      
      return { 
        el, 
        x, 
        y, 
        vx, 
        vy, 
        width: rect.width, 
        height: rect.height 
      };
    });

    const animateSkills = () => {
      const containerWidth = skillsContainer.clientWidth;
      const containerHeight = skillsContainer.clientHeight;

      skillData.forEach((skill, i) => {
        // Actualizar posición
        skill.x += skill.vx;
        skill.y += skill.vy;

        // Rebote con bordes
        if (skill.x <= 0) {
          skill.x = 0;
          skill.vx *= -1;
        }
        if (skill.x + skill.width >= containerWidth) {
          skill.x = containerWidth - skill.width;
          skill.vx *= -1;
        }
        if (skill.y <= 0) {
          skill.y = 0;
          skill.vy *= -1;
        }
        if (skill.y + skill.height >= containerHeight) {
          skill.y = containerHeight - skill.height;
          skill.vy *= -1;
        }

        // Detectar colisiones entre badges
        skillData.forEach((other, j) => {
          if (i >= j) return; // Evitar duplicados

          const dx = (skill.x + skill.width / 2) - (other.x + other.width / 2);
          const dy = (skill.y + skill.height / 2) - (other.y + other.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (skill.width + other.width) / 2;

          if (distance < minDistance) {
            // Colisión detectada - intercambiar velocidades
            const tempVx = skill.vx;
            const tempVy = skill.vy;
            skill.vx = other.vx;
            skill.vy = other.vy;
            other.vx = tempVx;
            other.vy = tempVy;

            // Separar badges para evitar que se queden pegados
            const angle = Math.atan2(dy, dx);
            const overlap = minDistance - distance;
            skill.x += Math.cos(angle) * overlap / 2;
            skill.y += Math.sin(angle) * overlap / 2;
            other.x -= Math.cos(angle) * overlap / 2;
            other.y -= Math.sin(angle) * overlap / 2;
          }
        });

        // Aplicar posición
        skill.el.style.left = skill.x + "px";
        skill.el.style.top = skill.y + "px";
      });

      requestAnimationFrame(animateSkills);
    };

    // Iniciar animación después de un pequeño delay
    setTimeout(() => animateSkills(), 100);
  }

  // -------------------------------
  // Hover dinámico para skills NO flotantes
  // -------------------------------
  skillBadges.forEach((badge) => {
    // Solo aplicar hover a badges que NO están flotando
    if (skillsContainer && skillsContainer.contains(badge)) return;
    
    badge.addEventListener("mouseenter", () => {
      badge.style.transition = "all 0.3s ease";
      badge.style.transform = "scale(1.1)";
      badge.style.backgroundColor = "#374151";
    });
    badge.addEventListener("mouseleave", () => {
      badge.style.transition = "all 0.3s ease";
      badge.style.transform = "scale(1)";
      badge.style.backgroundColor = "#1f2937";
    });
  });
});