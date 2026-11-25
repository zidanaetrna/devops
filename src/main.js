// Waktu build ditanem pas `npm run build`, jadi tiap deploy baru angkanya berubah.
// Gampang buat ngecek: "web gua udah ke-update belum?"
document.getElementById('build-time').textContent = __BUILD_TIME__
document.getElementById('year').textContent = new Date().getFullYear()

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- Elemen muncul pas di-scroll ----------
// Elemen yang sebaris (satu parent) munculnya gantian, jeda 0.1 detik.
const revealEls = document.querySelectorAll('[data-reveal]')
const siblingIndex = new Map()
revealEls.forEach((el) => {
  const i = siblingIndex.get(el.parentElement) ?? 0
  el.style.setProperty('--delay', `${i * 0.1}s`)
  siblingIndex.set(el.parentElement, i + 1)
})

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      revealObserver.unobserve(entry.target)
    })
  },
  { threshold: 0.15 }
)
revealEls.forEach((el) => revealObserver.observe(el))

// ---------- Navbar jadi kaca pas di-scroll ----------
const nav = document.querySelector('.nav')
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20)
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

// ---------- Teks yang ngetik sendiri ----------
const typed = document.querySelector('.typed')
const roles = typed.dataset.roles.split(',').map((r) => r.trim()).filter(Boolean)

if (!reduceMotion && roles.length > 1) {
  let roleIndex = 0
  let charIndex = roles[0].length
  let deleting = true

  const tick = () => {
    const word = roles[roleIndex]
    charIndex += deleting ? -1 : 1
    typed.textContent = word.slice(0, charIndex)

    let wait = deleting ? 40 : 80
    if (!deleting && charIndex === word.length) {
      deleting = true
      wait = 1800
    } else if (deleting && charIndex === 0) {
      deleting = false
      roleIndex = (roleIndex + 1) % roles.length
      wait = 300
    }
    setTimeout(tick, wait)
  }
  setTimeout(tick, 2200)
}

// ---------- Angka statistik ngitung naik ----------
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const target = Number(el.dataset.count)
      countObserver.unobserve(el)

      if (reduceMotion) {
        el.textContent = target
        return
      }
      const start = performance.now()
      const duration = 1400
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        el.textContent = Math.round(target * eased)
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  },
  { threshold: 0.6 }
)
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el))

// ---------- Marquee skill: daftar diduplikat biar muternya nyambung ----------
const track = document.querySelector('.marquee__track')
if (track) {
  track.querySelectorAll('li').forEach((li) => {
    const copy = li.cloneNode(true)
    copy.setAttribute('aria-hidden', 'true')
    track.appendChild(copy)
  })
}

// ---------- Cahaya di kartu ngikutin kursor ----------
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    card.style.setProperty('--my', `${e.clientY - rect.top}px`)
  })
})
