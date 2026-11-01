const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/Y5SXM5AYV8';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== шапка: прячется при скролле вниз =====
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  let lastY = window.scrollY;
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    header.classList.remove('is-hidden');
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      const plan = a.dataset.plan;
      if (plan) { const sel = $('#f-plan'); if (sel) sel.value = plan; }
    });
  });

  // ===== вход героя =====
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')));

  // ===== появление с задержками внутри групп =====
  $$('[data-rg]').forEach(g => $$('[data-r]', g).forEach((el, i) => el.style.setProperty('--d', Math.min(i, 8) * 80 + 'ms')));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  $$('[data-r], .footer__mark').forEach(el => io.observe(el));

  // ===== разбор реплики (транзакции Берна) =====
  const NAMES = { p: 'Родитель', a: 'Взрослый', c: 'Ребёнок' };
  const LET = { p: 'Р', a: 'В', c: 'Д' };
  const COL = { p: 'var(--parent)', a: 'var(--adult)', c: 'var(--child)' };
  const TINT = { p: 'var(--parent-t)', a: 'var(--adult-t)', c: 'var(--child-t)' };
  const SITS = [
    { name: 'Просьба убирать', who: 'Родитель обращается к Ребёнку', stim: '«Сколько можно говорить: убирай за собой!»', from: 'p', to: 'c',
      replies: [
        { t: '«Хорошо, сейчас уберу».', f: 'c', to: 'p', type: 'Дополнительная транзакция', v: 'Ответ идёт по тому же маршруту, что и реплика, поэтому разговор гладкий. Но роли закрепляются: один командует, другой подчиняется. Пока это всех устраивает, ссоры нет, потом копится обида.' },
        { t: '«Давай обсудим, как нам удобнее делить дела».', f: 'a', to: 'a', type: 'Пересекающаяся транзакция', v: 'Реплика ждала ответа от Ребёнка, а пришёл ответ от Взрослого. Привычный маршрут сломан, и разговор может свернуть к делу: что мешает и как договориться. Иногда собеседнику нужна пауза, чтобы выйти из роли Родителя.' },
        { t: '«Сначала на себя посмотри!»', f: 'p', to: 'c', type: 'Пересекающаяся транзакция', v: 'Отвечают из Родителя вместо Ребёнка: два Родителя одновременно ищут виноватого. Такой обмен быстро набирает обороты и обычно заканчивается ссорой.' }
      ] },
    { name: 'Просьба о помощи', who: 'Ребёнок обращается к Родителю', stim: '«Я не справлюсь… Помоги, пожалуйста».', from: 'c', to: 'p',
      replies: [
        { t: '«Конечно, давай я всё сделаю за тебя».', f: 'p', to: 'c', type: 'Дополнительная транзакция', v: 'Заботливый Родитель отвечает Ребёнку. Тепло, но если так происходит всегда, человек привыкает не верить в свои силы, а помогающий привыкает всё тянуть.' },
        { t: '«Покажи, что уже получилось, и решим, с чего начать».', f: 'a', to: 'a', type: 'Пересекающаяся транзакция', v: 'Взрослый приглашает Взрослого. Помощь остаётся, а ответственность возвращается тому, кто просил. Это тот случай, когда пересечение полезно.' },
        { t: '«Ты опять ничего не можешь!»', f: 'p', to: 'c', type: 'Дополнительная транзакция', v: 'Критикующий Родитель отвечает Ребёнку. Маршрут «правильный», поэтому разговор не прерывается, но Ребёнок получает подтверждение: «я не справляюсь». Дополнительная не значит добрая.' }
      ] },
    { name: 'Рабочий вопрос', who: 'Взрослый обращается ко Взрослому', stim: '«Отчёт готов?»', from: 'a', to: 'a',
      replies: [
        { t: '«Будет к шести, пришлю».', f: 'a', to: 'a', type: 'Дополнительная транзакция', v: 'Взрослый отвечает Взрослому: информация туда, информация обратно. Обмен короткий и без лишних эмоций.' },
        { t: '«Вы всё время давите, я и так не успеваю!»', f: 'c', to: 'p', type: 'Пересекающаяся транзакция', v: 'Спрашивали о фактах, ответили о чувствах. Реплика Взрослого попала в Родителя, и собеседнику придётся выбирать: оправдываться, давить в ответ или вернуться к делу.' },
        { t: '«Ой, простите, сейчас всё доделаю!»', f: 'c', to: 'p', type: 'Пересекающаяся транзакция', v: 'Вопрос был деловой, а ответ прозвучал как извинение Ребёнка перед Родителем. Теперь собеседник может утешать, ругать или поправить разговор, вернув его ко фактам.' }
      ] }
  ];

  const sitBox = $('#situations');
  if (sitBox) {
    const repBox = $('#replies');
    const stimEl = $('#stim');
    const who1 = $('#who1');
    const vtype = $('#vtype');
    const vtext = $('#vtext');
    const verdict = $('.verdict');
    const svg = $('#tx');
    const circles = $('#txCircles');
    const arrS = $('#arrStim');
    const arrR = $('#arrResp');
    const L = 110, R = 530, Y = { p: 62, a: 180, c: 298 }, RAD = 48;
    const nodes = {};
    ['L', 'R'].forEach(side => {
      ['p', 'a', 'c'].forEach(k => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node');
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', side === 'L' ? L : R); c.setAttribute('cy', Y[k]); c.setAttribute('r', RAD);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', side === 'L' ? L : R); t.setAttribute('y', Y[k] + 10); t.setAttribute('text-anchor', 'middle');
        t.textContent = LET[k];
        g.append(c, t); circles.append(g);
        nodes[side + k] = { c, t };
      });
    });
    const paint = (side, k, on) => {
      const n = nodes[side + k];
      n.c.style.fill = on ? COL[k] : TINT[k];
      n.t.style.fill = on ? '#fff' : COL[k];
    };
    const curve = (x1, y1, x2, y2, bend) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
      return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
    };
    let sit = 0, rep = 0;

    const draw = animate => {
      const s = SITS[sit], r = s.replies[rep];
      stimEl.textContent = s.stim;
      who1.textContent = s.who;
      ['p', 'a', 'c'].forEach(k => { paint('L', k, false); paint('R', k, false); });
      paint('L', s.from, true); paint('R', s.to, true);
      paint('R', r.f, true); paint('L', r.to, true);
      const sameRow = s.from === r.to && s.to === r.f;
      const x1 = L + RAD, x2 = R - RAD;
      const dS = curve(x1 + 4, Y[s.from], x2 - 6, Y[s.to], sameRow ? -30 : 0);
      const dR = curve(x2 - 4, Y[r.f], x1 + 6, Y[r.to], sameRow ? 30 : 0);
      arrS.setAttribute('d', dS); arrR.setAttribute('d', dR);
      [arrS, arrR].forEach(a => { a.setAttribute('pathLength', '1'); a.classList.remove('is-drawn'); });
      void svg.getBoundingClientRect();
      requestAnimationFrame(() => { arrS.classList.add('is-drawn'); arrR.classList.add('is-drawn'); });
      if (animate && !reduce) verdict.classList.add('is-swap');
      setTimeout(() => {
        vtype.textContent = r.type;
        vtext.textContent = r.v;
        verdict.classList.remove('is-swap');
      }, animate && !reduce ? 220 : 0);
      $$('.opt', repBox).forEach((b, i) => b.setAttribute('aria-pressed', String(i === rep)));
    };
    const renderReplies = () => {
      repBox.innerHTML = '';
      SITS[sit].replies.forEach((r, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'opt'; b.textContent = r.t;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => { rep = i; draw(true); });
        repBox.append(b);
      });
    };
    SITS.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt opt--pill'; b.textContent = s.name;
      b.setAttribute('aria-pressed', String(i === 0));
      b.addEventListener('click', () => {
        sit = i; rep = 0;
        $$('.opt', sitBox).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
        renderReplies(); draw(true);
      });
      sitBox.append(b);
    });
    renderReplies();
    const liveIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { draw(false); liveIO.disconnect(); }
    }), { threshold: 0.25 });
    // первый рендер без анимации стрелок, затем рисуем при входе в экран
    draw(false);
    [arrS, arrR].forEach(a => a.classList.remove('is-drawn'));
    liveIO.observe($('.live__stage'));
  }

  // ===== темы: индекс с превью =====
  const rows = $$('.row[data-img]');
  const imgs = $$('.preview__img');
  const showImg = key => imgs.forEach(im => im.classList.toggle('is-on', im.dataset.key === key));
  rows.forEach(row => {
    const on = () => { rows.forEach(r => r.classList.remove('is-active')); row.classList.add('is-active'); showImg(row.dataset.img); };
    row.addEventListener('mouseenter', on);
    row.addEventListener('focus', on);
  });

  // ===== процесс: аккордеон =====
  const panels = $$('.acc__p');
  const openPanel = p => panels.forEach(x => {
    const on = x === p;
    x.classList.toggle('is-open', on);
    x.setAttribute('aria-expanded', String(on));
  });
  panels.forEach(p => {
    p.addEventListener('click', () => openPanel(p));
    p.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches && window.innerWidth > 900) openPanel(p); });
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(p); } });
  });

  // ===== цены: счётчик =====
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const cIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count;
    cIO.unobserve(el);
    if (reduce) return;
    const t0 = performance.now(), dur = 1500;
    const tick = t => {
      const p = clamp((t - t0) / dur, 0, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cIO.observe(el));

  // ===== скролл: шапка и параллакс кругов героя =====
  const heroCircles = $('.hero__circles');
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY;
    if (header && !nav.classList.contains('is-open')) header.classList.toggle('is-hidden', y > lastY && y > 240);
    lastY = y;
    if (reduce || !heroCircles) return;
    heroCircles.style.transform = `translateY(${clamp(y, 0, 900) * 0.18}px)`;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  // ===== маска телефона =====
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let o = '+7';
      if (v.length > 1) o += ' (' + v.slice(1, 4);
      if (v.length >= 4) o += ') ' + v.slice(4, 7);
      if (v.length >= 7) o += '-' + v.slice(7, 9);
      if (v.length >= 9) o += '-' + v.slice(9, 11);
      e.target.value = o;
    });
  });

  // ===== форма → Cloudflare Worker → Telegram =====
  const form = $('#leadForm');
  const status = $('#formStatus');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    status.classList.remove('is-err');
    if (!payload.name || !payload.phone || payload.phone.replace(/\D/g, '').length < 11) {
      status.textContent = 'Укажите имя и телефон полностью.';
      status.classList.add('is-err');
      return;
    }
    if (!payload.consent) {
      status.textContent = 'Нужно согласие на обработку данных.';
      status.classList.add('is-err');
      return;
    }
    delete payload.consent;
    payload.source = 'Лендинг: психолог, транзактный анализ';
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      status.textContent = 'Заявка отправлена. Напишу, чтобы согласовать время.';
      form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = 'Не получилось отправить. Попробуйте ещё раз чуть позже.';
      status.classList.add('is-err');
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
})();
