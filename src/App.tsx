import { useState, useEffect, useRef, type RefObject } from 'react'

const ANNIVERSARY_START = new Date('2025-10-26T00:00:00') // Ngày bắt đầu yêu nhau
const BIRTHDAY_DATE     = new Date('2027-01-28T00:00:00') // Sinh nhật người yêu
const TET_DATE          = new Date('2027-01-26T00:00:00') // Tết Nguyên Đán 2027
const PARTNER_NAME      = 'Em'
// ────────────────────────────────────────────────────────────

const IMGS = {
  tet:         'https://images.unsplash.com/photo-1563354860-799d15199ac3?w=1400&h=1100&fit=crop&auto=format',
  anniversary: '../public/Ani.jpg',
  birthday:    'https://images.unsplash.com/photo-1680563899402-26c3a712831f?w=1400&h=1100&fit=crop&auto=format',
}

type Time = { days: number; hours: number; minutes: number; seconds: number }

function msToTime(ms: number): Time {
  ms = Math.max(0, ms)
  return {
    days:    Math.floor(ms / 86_400_000),
    hours:   Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1_000),
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function useNow(): number {
  const [ts, setTs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setTs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return ts
}

function useInView(threshold = 0.12): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ── Hero particles ─────────────────────────────────────────
const P_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  s: ['💕', '🌸', '✨', '🏮', '💛', '🌺', '⭐', '💖', '🌷', '🎀'][i % 10],
  left: `${(i * 5.1 + 1.5) % 96}%`,
  dur:  `${10 + (i * 1.4) % 10}s`,
  del:  `-${(i * 1.3) % 9}s`,
  fs:   `${0.8 + (i * 0.1) % 0.75}rem`,
}))

function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {P_DOTS.map(p => (
        <div
          key={p.id}
          className="absolute bottom-[-2rem] animate-float-up"
          style={{ left: p.left, fontSize: p.fs, animationDuration: p.dur, animationDelay: p.del }}
        >
          {p.s}
        </div>
      ))}
    </div>
  )
}

// ── Digit block with pop animation on change ───────────────
function Digit({ value, glowColor, accentColor }: { value: string; glowColor: string; accentColor: string }) {
  const [key, setKey] = useState(0)
  const prev = useRef(value)
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setKey(k => k + 1)
    }
  }, [value])
  return (
    <span
      key={key}
      className="digit-pop font-display font-bold tabular-nums leading-none"
      style={{
        fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
        color: accentColor,
        textShadow: `0 0 50px ${glowColor}80, 0 0 100px ${glowColor}30`,
      }}
    >
      {value}
    </span>
  )
}

// ── Large editorial countdown row ──────────────────────────
function CountDisplay({ time, glowColor, accentColor }: { time: Time; glowColor: string; accentColor: string }) {
  const units = [
    { v: String(time.days).padStart(2, '0'), l: 'Ngày' },
    { v: pad(time.hours),   l: 'Giờ' },
    { v: pad(time.minutes), l: 'Phút' },
    { v: pad(time.seconds), l: 'Giây' },
  ]
  return (
    <div className="flex items-start gap-3 sm:gap-5 flex-wrap">
      {units.map((u, i) => (
        <div key={u.l} className="flex items-start gap-3 sm:gap-5">
          <div className="flex flex-col items-center gap-1">
            <Digit value={u.v} glowColor={glowColor} accentColor={accentColor} />
            <span
              className="text-[9px] uppercase tracking-[0.28em] font-bold"
              style={{ color: glowColor, opacity: 0.55 }}
            >
              {u.l}
            </span>
          </div>
          {i < 3 && (
            <span
              className="font-display font-bold animate-pulse-soft mt-1"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                color: glowColor,
                opacity: 0.28,
                lineHeight: 1,
              }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Event section ──────────────────────────────────────────
interface EventSectionProps {
  id: string
  num: string
  emoji: string
  title: string
  subtitle: string
  caption: string
  time: Time
  mode: 'countdown' | 'countup'
  dateLabel: string
  imgUrl: string
  imgAlt: string
  imgLeft: boolean
  mobileImageFirst?: boolean
  glowColor: string
  accentColor: string
  sectionBg: string
}

function EventSection({
  id, num, emoji, title, subtitle, caption,
  time, mode, dateLabel, imgUrl, imgAlt,
  imgLeft, mobileImageFirst = false, glowColor, accentColor, sectionBg,
}: EventSectionProps) {
  const [ref, inView] = useInView()

  const imgPanel = (
    <div
      className="relative h-[55vw] max-h-120 md:max-h-none md:h-full overflow-hidden order-1 md:order-0"
      style={{ backgroundColor: '#111' }}
    >
      <img
        src={imgUrl}
        alt={imgAlt}
        loading="lazy"
        className="w-full h-full object-cover"
        style={{
          transform: inView ? 'scale(1.04)' : 'scale(1.14)',
          transition: 'transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {/* Edge fade into content panel — desktop only */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background: imgLeft
            ? `linear-gradient(to right, transparent 45%, ${sectionBg} 100%)`
            : `linear-gradient(to left, transparent 45%, ${sectionBg} 100%)`,
        }}
        aria-hidden="true"
      />
      {/* Bottom fade — mobile */}
      <div
        className="absolute inset-0 md:hidden"
        style={{ background: `linear-gradient(to bottom, transparent 40%, ${sectionBg} 100%)` }}
        aria-hidden="true"
      />
    </div>
  )

  const contentPanel = (
    <div className="relative flex flex-col justify-center px-8 py-14 sm:px-10 lg:px-14 xl:px-20 overflow-hidden order-2 md:order-0">
      {/* Large faded section number */}
      <div
        className="absolute font-display font-bold leading-none select-none pointer-events-none"
        style={{
          color: glowColor,
          opacity: 0.045,
          fontSize: 'clamp(9rem, 20vw, 20rem)',
          top: '-1rem',
          right: imgLeft ? '0.5rem' : 'auto',
          left: imgLeft ? 'auto' : '0.5rem',
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {num}
      </div>

      <div
        ref={ref}
        className="relative z-10 flex flex-col gap-7"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : `translateX(${imgLeft ? '32px' : '-32px'})`,
          transition: 'opacity 1s ease, transform 1s cubic-bezier(0.22,1,0.36,1)',
          transitionDelay: '0.2s',
        }}
      >
        {/* Section tag */}
        <div className="flex items-center gap-3">
          <div className="h-px w-10" style={{ background: glowColor }} />
          <span
            className="text-[9px] uppercase tracking-[0.4em] font-bold"
            style={{ color: glowColor, opacity: 0.65 }}
          >
            {mode === 'countdown' ? `— ${num} — Đếm ngược` : `— ${num} — Đã yêu nhau`}
          </span>
        </div>

        {/* Title block */}
        <div className="flex flex-col gap-2">
          <div className="text-[3.5rem] leading-none mb-1">{emoji}</div>
          <h2
            className="font-display font-bold leading-[1.1]"
            style={{
              color: accentColor,
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            }}
          >
            {title}
          </h2>
          <p className="text-sm opacity-40 mt-0.5">{subtitle}</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 max-w-[3rem]" style={{ background: `${glowColor}40` }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: glowColor, opacity: 0.4 }} />
        </div>

        {/* Countdown numbers */}
        <CountDisplay time={time} glowColor={glowColor} accentColor={accentColor} />

        {/* Caption */}
        <p
          className="font-display italic text-sm sm:text-base leading-relaxed max-w-xs"
          style={{ color: 'rgba(245,230,211,0.32)' }}
        >
          "{caption}"
        </p>

        {/* Date */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(245,230,211,0.28)' }}>
          <div className="h-px w-5 bg-white/20" />
          <span>{dateLabel}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div
      id={id}
      className="min-h-screen flex flex-col md:grid"
      style={{
        gridTemplateColumns: imgLeft ? '54fr 46fr' : '46fr 54fr',
        background: sectionBg,
        color: '#f5e6d3',
      }}
    >
      {imgLeft
        ? <>{imgPanel}{contentPanel}</>
        : <>{contentPanel}{imgPanel}</>
      }
    </div>
  )
}

// ── Hero section ───────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #080211 0%, #0e0416 45%, #060112 100%)' }}
    >
      <FloatingParticles />

      {/* Ambient colour pools */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 left-1/4 w-[520px] h-[520px] rounded-full blur-[150px]"
          style={{ background: '#9b1a1a', opacity: 0.12 }} />
        <div className="absolute top-1/2 right-1/6 w-[380px] h-[380px] rounded-full blur-[130px]"
          style={{ background: '#e040a0', opacity: 0.09 }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full blur-[130px]"
          style={{ background: '#7b2ff7', opacity: 0.08 }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-9 text-center px-6 max-w-2xl">
        <div className="text-5xl sm:text-6xl animate-pulse-soft">🌸</div>

        <div className="flex flex-col gap-4">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-35" style={{ color: '#f5e6d3' }}>
            Những Khoảnh Khắc Quan Trọng Nhất
          </p>
          <h1 className="text-shimmer-gold font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
            Những Ngày<br />Đặc Biệt
          </h1>
        </div>

        <p className="text-sm sm:text-base leading-relaxed max-w-sm" style={{ color: 'rgba(245,230,211,0.38)' }}>
          Đếm từng giây hướng đến những khoảnh khắc trân trọng nhất — cùng {PARTNER_NAME}
        </p>

        {/* Event nav pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-1">
          {[
            { label: 'Tết Nguyên Đán', emoji: '🏮', href: '#tet',         color: '#e8a020' },
            { label: 'Kỉ Niệm Yêu Nhau', emoji: '💕', href: '#anniversary', color: '#ff6b9d' },
            { label: 'Sinh Nhật',       emoji: '🎀', href: '#birthday',    color: '#c084fc' },
          ].map(ev => (
            <a
              key={ev.href}
              href={ev.href}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 hover:brightness-125"
              style={{
                color: ev.color,
                background: `${ev.color}14`,
                border: `1px solid ${ev.color}2e`,
              }}
            >
              <span>{ev.emoji}</span>
              <span>{ev.label}</span>
            </a>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-4 flex flex-col items-center gap-2 opacity-20 animate-bounce-subtle">
          <span className="text-[9px] uppercase tracking-[0.35em]" style={{ color: '#f5e6d3' }}>
            Cuộn xuống
          </span>
          <div className="w-px h-8 bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="py-20 flex flex-col items-center gap-5 text-center px-6"
      style={{ background: '#040010', color: '#f5e6d3' }}
    >
      <div className="flex items-center gap-5">
        <div className="h-px w-20" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-2xl opacity-50">🌸</span>
        <div className="h-px w-20" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <p
        className="font-display italic text-base sm:text-xl max-w-xs leading-relaxed"
        style={{ color: 'rgba(245,230,211,0.24)' }}
      >
        "Mỗi giây trôi qua đều là một kỷ niệm đẹp..."
      </p>
      <div className="flex gap-3 text-lg opacity-20 mt-1">
        <span>🌸</span><span>💕</span><span>✨</span><span>💕</span><span>🌸</span>
      </div>
    </footer>
  )
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  const now = useNow()
  const sectionsRef = useRef<Array<HTMLElement | null>>([])
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    const sections = sectionsRef.current.filter(Boolean) as HTMLElement[]
    if (!sections.length) return

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 18 || isAnimatingRef.current) return

      event.preventDefault()

      const currentIndex = sections.reduce((best, section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top)
        if (distance < best.distance) {
          return { index, distance }
        }
        return best
      }, { index: 0, distance: Number.POSITIVE_INFINITY }).index

      const nextIndex = event.deltaY > 0
        ? Math.min(currentIndex + 1, sections.length - 1)
        : Math.max(currentIndex - 1, 0)

      if (nextIndex === currentIndex) return

      const target = sections[nextIndex]
      if (!target) return

      isAnimatingRef.current = true
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })

      window.setTimeout(() => {
        isAnimatingRef.current = false
      }, 900)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const tetTime   = msToTime(TET_DATE.getTime() - now)
  const annivTime = msToTime(now - ANNIVERSARY_START.getTime())
  const bdayTime  = msToTime(BIRTHDAY_DATE.getTime() - now)

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })

  const sectionOrder = [
    { id: 'hero', node: <HeroSection key="hero" /> },
    { id: 'tet', node: <EventSection key="tet" id="tet" num="01" emoji="🏮" title="Tết Nguyên Đán" subtitle="Năm Đinh Mùi 2027" caption="Mùa xuân về, sum vầy bên nhau — khoảnh khắc ý nghĩa nhất trong năm." time={tetTime} mode="countdown" dateLabel={fmtDate(TET_DATE)} imgUrl={IMGS.tet} imgAlt="Đèn lồng Tết rực rỡ về đêm" imgLeft={true} glowColor="#e8a020" accentColor="#f5c540" sectionBg="#080400" /> },
    { id: 'anniversary', node: <EventSection key="anniversary" id="anniversary" num="02" emoji="💕" title="Kỉ Niệm Yêu Nhau" subtitle={`Từ ${fmtDate(ANNIVERSARY_START)}`} caption="Mỗi ngày bên nhau là một trang kỷ niệm đẹp không bao giờ phai." time={annivTime} mode="countup" dateLabel="Mãi mãi yêu em ♡" imgUrl={IMGS.anniversary} imgAlt="Đôi tình nhân dưới hàng hoa anh đào" imgLeft={false} mobileImageFirst={true} glowColor="#ff6b9d" accentColor="#ff8fb3" sectionBg="#08010a" /> },
    { id: 'birthday', node: <EventSection key="birthday" id="birthday" num="03" emoji="🎀" title={`Sinh Nhật ${PARTNER_NAME}`} subtitle="Ngày của người đặc biệt nhất" caption="Sinh ra là điều tuyệt vời nhất đã xảy ra với anh — chúc em sinh nhật hạnh phúc." time={bdayTime} mode="countdown" dateLabel={fmtDate(BIRTHDAY_DATE)} imgUrl={IMGS.birthday} imgAlt="Bó hoa hồng hồng tươi tắn" imgLeft={true} glowColor="#c084fc" accentColor="#d8a4ff" sectionBg="#060012" /> },
    { id: 'footer', node: <Footer key="footer" /> },
  ]

  return (
    <div>
      {sectionOrder.map((item, index) => (
        <div
          key={item.id}
          ref={(node) => {
            sectionsRef.current[index] = node as HTMLElement | null
          }}
        >
          {item.node}
        </div>
      ))}
    </div>
  )
}
