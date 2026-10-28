(() => {
  const reduceMotion = matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Hiện dần khi cuộn tới
  document.documentElement.classList.add("js");
  const revealTargets = document.querySelectorAll(
    [
      ".intro > *",
      ".family-photo",
      ".family-info",
      ".invite > *",
      ".calendar-frame",
      ".timeline .section-script",
      ".tl-item",
      ".wheel-stage",
      ".rsvp > *",
      ".gifts > *",
      ".gift",
      ".thanks img",
      "footer",
    ].join(","),
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          io.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    revealTargets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--d", `${(i % 3) * 0.12}s`);
      io.observe(el);
    });
  }

  // Cánh hoa rơi
  const petals = document.getElementById("petals");
  if (!reduceMotion) {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("i");
      p.className = "petal";
      p.style.cssText =
        `left:${Math.random() * 100}%;` +
        `--s:${8 + Math.random() * 8}px;` +
        `--t:${14 + Math.random() * 12}s;` +
        `--dl:${-Math.random() * 20}s;` +
        `--sway:${(Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 50)}px;` +
        `--o:${0.45 + Math.random() * 0.4}`;
      petals.append(p);
    }
  }

  // Nhạc nền
  const bgm = document.getElementById("bgm");
  const musicBtn = document.getElementById("musicBtn");
  let userToggled = false;
  const syncBtn = () => {
    const on = !bgm.paused;
    musicBtn.classList.toggle("playing", on);
    musicBtn.setAttribute("aria-label", on ? "Tắt nhạc" : "Bật nhạc");
  };
  bgm.addEventListener("play", syncBtn);
  bgm.addEventListener("pause", syncBtn);
  // Một số trình duyệt không phát được file nhạc mở trực tiếp từ ổ đĩa, nên thử nạp lại qua blob
  let triedBlob = false;
  const playMusic = () =>
    bgm.play().catch(async (err) => {
      if (triedBlob || err.name === "NotAllowedError") throw err;
      triedBlob = true;
      const res = await fetch(bgm.src);
      const data = await res.arrayBuffer();
      bgm.src = URL.createObjectURL(
        new Blob([data], { type: "audio/mpeg" }),
      );
      bgm.load();
      await bgm.play();
    });
  musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userToggled = true;
    if (!bgm.paused) return bgm.pause();
    playMusic().catch(() =>
      showToast("Không phát được nhạc, vui lòng kiểm tra file trong thư mục music"),
    );
  });
  // Thử tự phát ngay; nếu trình duyệt chặn thì phát ở lần tương tác đầu tiên
  const unlockEvents = ["pointerdown", "touchstart", "keydown", "click"];
  const autoStart = (e) => {
    if (userToggled || !bgm.paused || musicBtn.contains(e?.target)) return;
    unlockEvents.forEach((ev) => removeEventListener(ev, autoStart, true));
    playMusic()
      .catch(() =>
        showToast("Không phát được nhạc, vui lòng kiểm tra file trong thư mục music"),
      );
  };
  unlockEvents.forEach((ev) => addEventListener(ev, autoStart, true));

  const YEAR = 2026;
  const MONTH = 11; // tháng 12 (chỉ số bắt đầu từ 0)
  const EVENT_DAY = 6;

  // Lịch bắt đầu từ thứ Hai
  const cal = document.getElementById("calendar");
  const offset = (new Date(YEAR, MONTH, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  for (let i = 0; i < offset; i++) {
    cal.append(document.createElement("span"));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const e = document.createElement("span");
    e.textContent = d;
    if (d === EVENT_DAY) e.className = "wedding-day";
    cal.append(e);
  }

  const target = new Date("2026-12-06T10:00:00+07:00").getTime();
  const counters = document.querySelectorAll("#countdown strong");
  function tick() {
    const gap = Math.max(0, target - Date.now());
    const vals = [
      Math.floor(gap / 86400000),
      Math.floor(gap / 3600000) % 24,
      Math.floor(gap / 60000) % 60,
      Math.floor(gap / 1000) % 60,
    ];
    counters.forEach(
      (el, i) => (el.textContent = String(vals[i]).padStart(2, "0")),
    );
  }
  tick();
  setInterval(tick, 1000);

  const toast = document.getElementById("toast");
  let timer;
  const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 2600);
  };
  document
    .getElementById("rsvpBtn")
    .addEventListener("click", () =>
      showToast("Cảm ơn bạn! Hẹn gặp bạn trong ngày vui."),
    );

  const box = document.getElementById("lightbox");
  const big = box.querySelector("img");
  const closeBox = () => box.classList.remove("open");

  // Vòng đu quay dọc
  const wheel = document.getElementById("wheel");
  const slides = [...wheel.querySelectorAll(".wheel-slide")];
  const dotsWrap = document.getElementById("wheelDots");
  const STEP = 360 / slides.length;
  // step tăng/giảm liên tục để bánh xe luôn quay cùng chiều khi vòng lại
  let step = 0;
  const current = () =>
    ((step % slides.length) + slides.length) % slides.length;
  const dots = slides.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Ảnh ${i + 1}`);
    d.addEventListener("click", () => goTo(i));
    dotsWrap.append(d);
    return d;
  });
  const render = (dragDeg = 0) => {
    wheel.style.setProperty("--rot", `${-step * STEP + dragDeg}deg`);
    const idx = current();
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  };
  const move = (delta) => {
    step += delta;
    render();
  };
  const goTo = (i) => {
    let diff = i - current();
    if (diff > slides.length / 2) diff -= slides.length;
    if (diff < -slides.length / 2) diff += slides.length;
    move(diff);
  };
  document.getElementById("wheelPrev").addEventListener("click", () => {
    move(-1);
    startAuto();
  });
  document.getElementById("wheelNext").addEventListener("click", () => {
    move(1);
    startAuto();
  });
  let dragged = false;
  slides.forEach((s, i) => {
    s.draggable = false;
    s.addEventListener("click", () => {
      if (dragged) return;
      if (i !== current()) return goTo(i);
      big.src = s.src;
      box.classList.add("open");
    });
  });

  // Kéo bằng chuột (dọc hoặc ngang) hoặc vuốt ngang trên điện thoại
  const stage = wheel.parentElement;
  let drag = null;
  const dragDelta = (e) => {
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (e.pointerType !== "mouse") return -dx;
    return Math.abs(dy) >= Math.abs(dx) ? dy : -dx;
  };
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
    dragged = false;
    clearInterval(autoplay);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = dragDelta(e);
    if (!dragged && Math.abs(d) > 6) {
      dragged = true;
      wheel.classList.add("dragging");
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {}
    }
    if (dragged) render(d * 0.25);
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = dragged ? dragDelta(e) : 0;
    drag = null;
    wheel.classList.remove("dragging");
    // cứ ~1 ảnh cho mỗi 140px kéo, tối thiểu 1 ảnh nếu kéo đủ xa
    const n = Math.abs(d) > 40 ? Math.max(1, Math.round(Math.abs(d) / 140)) : 0;
    step += d < 0 ? n : -n;
    render();
    startAuto();
    // giữ cờ dragged tới sau sự kiện click để không mở lightbox
    setTimeout(() => (dragged = false), 0);
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  let autoplay;
  // thời gian quay (khớp transition 2s trong CSS) + 1.5s dừng ở mỗi ảnh
  const SPIN_MS = 2000;
  const HOLD_MS = 1500;
  const startAuto = () => {
    if (reduceMotion) return;
    clearInterval(autoplay);
    autoplay = setInterval(() => move(1), SPIN_MS + HOLD_MS);
  };
  render();
  startAuto();

  box.addEventListener("click", (e) => {
    if (e.target === box || e.target.tagName === "BUTTON") closeBox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBox();
  });
})();
