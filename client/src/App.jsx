import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_STORAGE_KEY = 'chronos_token'
const HERO_HEADLINE_PREFIX = 'Turn scattered links into one '
const HERO_HEADLINE_HIGHLIGHT = 'daily brief'
const HERO_HEADLINE_SUFFIX = ' that actually helps you start the day.'
const HERO_HEADLINE = `${HERO_HEADLINE_PREFIX}${HERO_HEADLINE_HIGHLIGHT}${HERO_HEADLINE_SUFFIX}`
const BRIEF_ROUTE = '/brief'
const DEFAULT_BRIEF_TIME = '08:00'

const readTokenFromStorage = () => localStorage.getItem(TOKEN_STORAGE_KEY) || ''
const getBriefDateLabel = () =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date())
const getSavedLinksStorageKey = (email) => `chronos_saved_links:${email}`
const getBriefTimeStorageKey = (email) => `chronos_brief_time:${email}`
const readSavedLinks = (email) => {
  try {
    return JSON.parse(localStorage.getItem(getSavedLinksStorageKey(email)) || '[]')
  } catch {
    return []
  }
}
const readBriefTime = (email) => localStorage.getItem(getBriefTimeStorageKey(email)) || DEFAULT_BRIEF_TIME

const featureCards = [
  {
    tone: 'wide',
    eyebrow: 'Signal intake',
    title: 'Track the links that matter',
    copy: 'Add creators, newsletters, threads, research pages, and articles you want ChronoBrief to watch every day.',
    pills: ['Newsletters', 'Research', 'Threads', 'Articles', 'Creators']
  },
  {
    tone: 'brief',
    eyebrow: 'Daily clarity',
    title: 'Wake up to one clear brief',
    copy: 'ChronoBrief turns scattered updates into a focused summary so you do not lose time checking every source manually.'
  },
  {
    tone: 'premium',
    eyebrow: 'Higher coverage',
    title: 'Grow with premium coverage',
    copy: 'Premium users get more updates across more links in a single day, so fast-moving topics stay truly current.'
  }
]

const workflowCards = [
  {
    label: 'Step 01',
    display: 'Capture.',
    title: 'Collect from your saved sources',
    copy: 'ChronoBrief watches the links you add and checks for meaningful changes and fresh posts.'
  },
  {
    label: 'Step 02',
    display: 'Distill.',
    title: 'Condense the noise',
    copy: 'Important updates are filtered, grouped, and turned into a briefing that feels readable instead of overwhelming.'
  },
  {
    label: 'Step 03',
    display: 'Deliver.',
    title: 'Deliver on your schedule',
    copy: 'Your digest is ready when your day starts, with stronger coverage for premium users who track more sources.'
  }
]

const workflowLogs = [
  '> Fetching 15 saved links from MongoDB...',
  '> ChronoBrief AI agent initializing...',
  '> Condensing content...',
  '> Email digest successfully dispatched.'
]

const plans = [
  {
    name: 'Starter',
    price: '$5',
    suffix: '/month',
    points: [
      'Daily brief for essential saved links',
      'Built for personal tracking and lightweight monitoring',
      'A clean daily summary delivered in one place'
    ]
  },
  {
    name: 'Premium',
    price: '$12',
    suffix: '/month',
    badge: 'Most value',
    points: [
      'More updates across more links each day',
      'Better fit for fast-moving topics and research-heavy workflows',
      'Priority coverage for users who need higher update volume'
    ]
  }
]

const faqs = [
  {
    question: 'What does ChronoBrief do?',
    answer: 'ChronoBrief watches the links you care about and turns fresh changes into a daily briefing.'
  },
  {
    question: 'Why would I choose Premium?',
    answer: 'Premium is designed for users who follow more links and want more update coverage during the day.'
  },
  {
    question: 'Do I need technical knowledge?',
    answer: 'No. The product is meant to feel simple: connect, save sources, and receive your brief.'
  }
]

const todaysBrief = {
  edition: 'Today\'s brief',
  title: 'A quieter way to catch up',
  dek: 'ChronoBrief scanned your saved sources overnight and turned the meaningful changes into a clean morning read.',
  intro:
    'Good morning. Here is the signal worth carrying into the day: a few meaningful shifts, a few themes gaining momentum, and the links that deserve attention before everything starts to fragment across tabs.',
  sections: [
    {
      eyebrow: 'Top line',
      heading: 'The conversation is narrowing around quality, not volume.',
      body:
        'Across newsletters, research notes, and creator feeds, the biggest movement is not more posting. It is better filtering. The strongest sources are packaging fewer updates with more conviction, which means your brief can stay short without becoming shallow.'
    },
    {
      eyebrow: 'What changed',
      heading: 'Three saved sources moved from background noise to actual relevance.',
      body:
        'Two long-followed newsletters published unusually concrete guidance this morning, while a creator thread reframed the same topic from the operator side. Together, they point in the same direction, which is exactly the kind of overlap ChronoBrief elevates instead of leaving scattered.'
    },
    {
      eyebrow: 'Why it matters',
      heading: 'The useful edge is not seeing more links. It is seeing the pattern sooner.',
      body:
        'When the same idea starts surfacing independently across different saved sources, it usually means the market has moved beyond speculation. ChronoBrief treats that overlap as a stronger signal, so your morning brief feels editorial instead of merely aggregated.'
    }
  ],
  watchlist: [
    'A cluster of AI productivity writers is shifting from tool roundups toward opinionated workflow playbooks.',
    'Premium-only research notes are showing up earlier in the briefing because they are generating stronger cross-source agreement.',
    'Founder threads are becoming more useful when paired with slower, better-written analysis from newsletters.'
  ],
  closing:
    'That is the read for today. If you want to change what tomorrow looks like, open the profile menu to manage saved links or adjust how ChronoBrief builds your brief.'
}

function App() {
  const [token, setToken] = useState(() => readTokenFromStorage())
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(readTokenFromStorage()))
  const [profile, setProfile] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isBriefSettingsOpen, setIsBriefSettingsOpen] = useState(false)
  const [savedLinks, setSavedLinks] = useState([])
  const [newLink, setNewLink] = useState('')
  const [briefDeliveryTime, setBriefDeliveryTime] = useState(DEFAULT_BRIEF_TIME)
  const [status, setStatus] = useState('Connect Google to start your daily ChronoBrief brief.')
  const [error, setError] = useState('')
  const [typedHeadline, setTypedHeadline] = useState('')
  const [terminalLines, setTerminalLines] = useState(() => workflowLogs.map(() => ''))
  const [activeWorkflowCard, setActiveWorkflowCard] = useState(0)
  const [activeFaqIndex, setActiveFaqIndex] = useState(0)
  const [typedFaqAnswer, setTypedFaqAnswer] = useState('')
  const featurePillCloudRef = useRef(null)
  const featurePillRefs = useRef([])
  const profileMenuRef = useRef(null)
  const briefSettingsRef = useRef(null)

  useEffect(() => {
    const existingScript = document.querySelector('script[data-spline-viewer="true"]')

    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.90/build/spline-viewer.js'
    script.dataset.splineViewer = 'true'
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')

    if (!tokenFromUrl) {
      return
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, tokenFromUrl)
    setToken(tokenFromUrl)
    setIsLoggedIn(true)
    setStatus('Login successful. Loading your workspace...')
    setError('')

    window.history.replaceState({}, '', BRIEF_ROUTE)
  }, [])

  useEffect(() => {
    setTypedHeadline('')
    let index = 0
    let isDeleting = false
    let timeoutId

    const tick = () => {
      if (!isDeleting) {
        index += 1
        setTypedHeadline(HERO_HEADLINE.slice(0, index))

        if (index >= HERO_HEADLINE.length) {
          isDeleting = true
          timeoutId = window.setTimeout(tick, 6000)
          return
        }

        timeoutId = window.setTimeout(tick, 52)
        return
      }

      index -= 1
      setTypedHeadline(HERO_HEADLINE.slice(0, index))

      if (index <= 0) {
        isDeleting = false
        timeoutId = window.setTimeout(tick, 420)
        return
      }

      timeoutId = window.setTimeout(tick, 30)
    }

    timeoutId = window.setTimeout(tick, 320)

    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false)
      return
    }

    const loadProfile = async () => {
      try {
        setStatus('Loading your profile...')
        setError('')

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile')
        }

        setProfile(data.user)
        setIsLoggedIn(true)
        setStatus('Your brief is ready.')
        window.history.replaceState({}, '', BRIEF_ROUTE)
      } catch (loadError) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken('')
        setProfile(null)
        setIsLoggedIn(false)
        setError(loadError.message)
        setStatus('Your session expired. Please sign in again.')
      }
    }

    loadProfile()
  }, [token])

  useEffect(() => {
    let lineIndex = 0
    let charIndex = 0
    let timeoutId

    const resetLines = () => workflowLogs.map(() => '')
    setTerminalLines(resetLines())

    const tick = () => {
      const currentLine = workflowLogs[lineIndex]

      if (charIndex <= currentLine.length) {
        setTerminalLines((prev) => {
          const next = [...prev]
          next[lineIndex] = currentLine.slice(0, charIndex)
          return next
        })
        charIndex += 1
        timeoutId = window.setTimeout(tick, 28)
        return
      }

      if (lineIndex < workflowLogs.length - 1) {
        lineIndex += 1
        charIndex = 0
        timeoutId = window.setTimeout(tick, 260)
        return
      }

      timeoutId = window.setTimeout(() => {
        lineIndex = 0
        charIndex = 0
        setTerminalLines(resetLines())
        tick()
      }, 1800)
    }

    timeoutId = window.setTimeout(tick, 420)

    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const cloud = featurePillCloudRef.current

    if (!cloud) {
      return undefined
    }

    const pills = featurePillRefs.current.filter(Boolean)

    if (!pills.length) {
      return undefined
    }

    const rotations = [-9, 7, -5, 8, -10]
    let animationFrameId = 0
    let previousTime = 0
    let cloudRect = cloud.getBoundingClientRect()
    let states = []

    const buildStates = () =>
      pills.map((pill, index) => {
        const rect = pill.getBoundingClientRect()
        const availableX = Math.max(cloudRect.width - rect.width, 0)
        const availableY = Math.max(cloudRect.height - rect.height, 0)
        const baseX = availableX * [0.54, 0.78, 0.3, 0.62, 0.08][index]
        const baseY = availableY * [0.08, 0.3, 0.58, 0.74, 0.42][index]

        return {
          x: Math.min(baseX, availableX),
          y: Math.min(baseY, availableY),
          vx: [34, -41, 38, -36, 43][index],
          vy: [29, 35, -31, -39, 33][index],
          width: rect.width,
          height: rect.height,
          rotation: rotations[index] ?? 0,
          driftSeed: index * 1.7 + 0.9
        }
      })

    const applyPositions = () => {
      states.forEach((state, index) => {
        pills[index].style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg)`
      })
    }

    const syncBounds = () => {
      cloudRect = cloud.getBoundingClientRect()
      states = buildStates()
      applyPositions()
    }

    const step = (timestamp) => {
      if (!previousTime) {
        previousTime = timestamp
      }

      const deltaSeconds = Math.min((timestamp - previousTime) / 1000, 0.032)
      previousTime = timestamp

      states.forEach((state) => {
        const driftX = Math.sin(timestamp * 0.00042 + state.driftSeed) * 4.8
        const driftY = Math.cos(timestamp * 0.00036 + state.driftSeed * 1.3) * 4.2

        state.vx += driftX * deltaSeconds
        state.vy += driftY * deltaSeconds

        state.vx = Math.max(Math.min(state.vx, 52), -52)
        state.vy = Math.max(Math.min(state.vy, 48), -48)

        state.x += state.vx * deltaSeconds
        state.y += state.vy * deltaSeconds

        const maxX = Math.max(cloudRect.width - state.width, 0)
        const maxY = Math.max(cloudRect.height - state.height, 0)

        if (state.x <= 0) {
          state.x = 0
          state.vx = Math.abs(state.vx) * 0.92
        } else if (state.x >= maxX) {
          state.x = maxX
          state.vx = -Math.abs(state.vx) * 0.92
        }

        if (state.y <= 0) {
          state.y = 0
          state.vy = Math.abs(state.vy) * 0.92
        } else if (state.y >= maxY) {
          state.y = maxY
          state.vy = -Math.abs(state.vy) * 0.92
        }
      })

      applyPositions()
      animationFrameId = window.requestAnimationFrame(step)
    }

    syncBounds()
    animationFrameId = window.requestAnimationFrame(step)
    window.addEventListener('resize', syncBounds)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', syncBounds)
    }
  }, [])

  useEffect(() => {
    const answer = faqs[activeFaqIndex]?.answer ?? ''
    let charIndex = 0
    let timeoutId

    setTypedFaqAnswer('')

    const typeAnswer = () => {
      charIndex += 1
      setTypedFaqAnswer(answer.slice(0, charIndex))

      if (charIndex < answer.length) {
        timeoutId = window.setTimeout(typeAnswer, 18)
      }
    }

    timeoutId = window.setTimeout(typeAnswer, 180)

    return () => window.clearTimeout(timeoutId)
  }, [activeFaqIndex])

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isProfileMenuOpen])

  useEffect(() => {
    if (!profile?.email) {
      return
    }

    setSavedLinks(readSavedLinks(profile.email))
    setBriefDeliveryTime(readBriefTime(profile.email))
  }, [profile?.email])

  useEffect(() => {
    if (!profile?.email) {
      return
    }

    localStorage.setItem(getSavedLinksStorageKey(profile.email), JSON.stringify(savedLinks))
  }, [profile?.email, savedLinks])

  useEffect(() => {
    if (!profile?.email) {
      return
    }

    localStorage.setItem(getBriefTimeStorageKey(profile.email), briefDeliveryTime)
  }, [briefDeliveryTime, profile?.email])

  useEffect(() => {
    if (!isBriefSettingsOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!briefSettingsRef.current?.contains(event.target)) {
        setIsBriefSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isBriefSettingsOpen])

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
    setProfile(null)
    setIsLoggedIn(false)
    setIsProfileMenuOpen(false)
    setIsBriefSettingsOpen(false)
    setError('')
    setStatus('You have been logged out.')
    window.history.replaceState({}, '', '/')
  }

  const handleAddLink = (event) => {
    event.preventDefault()

    const trimmedLink = newLink.trim()

    if (!trimmedLink || savedLinks.includes(trimmedLink)) {
      return
    }

    setSavedLinks((prev) => [trimmedLink, ...prev])
    setNewLink('')
  }

  const handleRemoveLink = (linkToRemove) => {
    setSavedLinks((prev) => prev.filter((link) => link !== linkToRemove))
  }

  const userInitial = profile?.name?.trim()?.charAt(0)?.toUpperCase() || 'C'
  const briefDateLabel = getBriefDateLabel()
  const hasSavedLinks = savedLinks.length > 0

  if (token && !profile && !error) {
    return (
      <main className="brief-page-shell">
        <div className="page-glow page-glow-top"></div>
        <div className="page-glow page-glow-bottom"></div>
        <section className="brief-page brief-page-loading">
          <header className="brief-topbar">
            <div className="brief-brand-lockup">
              <div className="brand-mark"></div>
              <span>ChronoBrief</span>
            </div>
          </header>
          <div className="brief-loading-copy">{status || 'Loading today’s brief...'}</div>
        </section>
      </main>
    )
  }

  if (isLoggedIn && profile) {
    return (
      <main className="brief-page-shell">
        <div className="page-glow page-glow-top"></div>
        <div className="page-glow page-glow-bottom"></div>

        <section className="brief-page">
          <header className="brief-topbar">
            <div className="brief-brand-lockup">
              <div className="brand-mark"></div>
              <span>ChronoBrief</span>
            </div>

            <div className="brief-profile-shell" ref={profileMenuRef}>
              <button
                type="button"
                className="brief-avatar-button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-expanded={isProfileMenuOpen}
                aria-label="Open profile menu"
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="brief-avatar-image" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </button>

              {isProfileMenuOpen ? (
                <div className="brief-profile-menu">
                  <div className="brief-profile-meta">
                    <strong>{profile.name}</strong>
                    <span>{profile.email}</span>
                  </div>
                  <button
                    type="button"
                    className="brief-menu-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      setIsBriefSettingsOpen(true)
                    }}
                  >
                    Add saved links
                  </button>
                  <button
                    type="button"
                    className="brief-menu-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      setIsBriefSettingsOpen(true)
                    }}
                  >
                    Brief settings
                  </button>
                  <button type="button" className="brief-menu-item" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <article className="brief-reader">
            <header className="brief-reader-header">
              <span className="section-kicker brief-kicker">{todaysBrief.edition}</span>
              <h1 className="brief-title">{todaysBrief.title}</h1>
            </header>

            <section className="brief-editor-shell" aria-label="Today&apos;s brief editor">
              <div className="brief-editor-topbar">
                <span>{briefDateLabel}</span>
                <button type="button" className="brief-inline-action" onClick={() => setIsBriefSettingsOpen(true)}>
                  Settings
                </button>
              </div>

              <div className="brief-editor" role="document" tabIndex={0}>
                <p className="brief-editor-dek">{todaysBrief.dek}</p>
                <p>{todaysBrief.intro}</p>

                {todaysBrief.sections.map((section) => (
                  <section key={section.heading} className="brief-editor-section">
                    <p className="brief-section-eyebrow">{section.eyebrow}</p>
                    <h2 className="brief-section-heading">{section.heading}</h2>
                    <p>{section.body}</p>
                  </section>
                ))}

                <section className="brief-editor-section">
                  <p className="brief-section-eyebrow">Keep watching</p>
                  <h2 className="brief-section-heading">Signals to keep in view next.</h2>
                  <ul className="brief-watchlist-list">
                    {todaysBrief.watchlist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <p>{todaysBrief.closing}</p>
              </div>
            </section>

            <p className="brief-footer-note">Open the profile menu anytime to manage links, delivery time, or sign out.</p>
          </article>
        </section>

        {isBriefSettingsOpen ? (
          <div className="brief-settings-overlay">
            <div className="brief-settings-modal" ref={briefSettingsRef}>
              <div className="brief-settings-header">
                <div>
                  <p className="section-kicker brief-kicker">Brief settings</p>
                  <h2 className="brief-settings-title">Manage saved links and your delivery time.</h2>
                </div>
                <button
                  type="button"
                  className="brief-settings-close"
                  onClick={() => setIsBriefSettingsOpen(false)}
                  aria-label="Close brief settings"
                >
                  ×
                </button>
              </div>

              <form className="brief-settings-form" onSubmit={handleAddLink}>
                <label className="brief-field">
                  <span>Add a link</span>
                  <div className="brief-link-input-row">
                    <input
                      type="url"
                      placeholder="https://example.com/article"
                      value={newLink}
                      onChange={(event) => setNewLink(event.target.value)}
                    />
                    <button type="submit" className="brief-submit-button">
                      Save
                    </button>
                  </div>
                </label>

                <label className="brief-field">
                  <span>Email time</span>
                  <input
                    type="time"
                    value={briefDeliveryTime}
                    onChange={(event) => setBriefDeliveryTime(event.target.value)}
                  />
                </label>
              </form>

              <div className="brief-settings-links">
                <p className="brief-section-eyebrow">Current links</p>
                {hasSavedLinks ? (
                  <div className="brief-settings-link-list">
                    {savedLinks.map((link) => (
                      <div key={link} className="brief-settings-link-item">
                        <span>{link}</span>
                        <button type="button" onClick={() => handleRemoveLink(link)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="brief-empty-state">Nothing added yet, add your links and get a brief.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="page-glow page-glow-top"></div>
      <div className="page-glow page-glow-bottom"></div>

      <section className="site-frame">
        <section className="hero-section">
          <div className="hero-stage">
            <header className="topbar">
              <div className="brand-lockup">
                <div className="brand-mark"></div>
                <span>ChronoBrief</span>
              </div>

              <nav className="topnav">
                <a href="#features">Features</a>
                <a href="#workflow">Workflow</a>
                <a href="#pricing">Pricing</a>
                <a href="#faq">FAQ</a>
              </nav>

              <div className="nav-actions">
                {isLoggedIn ? (
                  <button type="button" className="ghost-button" onClick={handleLogout}>
                    Log out
                  </button>
                ) : (
                  <button type="button" className="ghost-button" onClick={handleLogin}>
                    Login
                  </button>
                )}
              </div>
            </header>

            <div className="spline-shell">
              <spline-viewer
                class="spline-viewer"
                url="https://prod.spline.design/YjHejSlJsWlgZ3vm/scene.splinecode"
              ></spline-viewer>
              <div className="spline-fade"></div>
            </div>
          </div>

          <div className="hero-content-row">
            <div className="hero-copy-block">
              <h1 className="typing-headline" aria-label={HERO_HEADLINE}>
                <span>{typedHeadline.slice(0, HERO_HEADLINE_PREFIX.length)}</span>
                <span className="headline-accent">
                  {typedHeadline.slice(
                    HERO_HEADLINE_PREFIX.length,
                    HERO_HEADLINE_PREFIX.length + HERO_HEADLINE_HIGHLIGHT.length
                  )}
                </span>
                <span>
                  {typedHeadline.slice(
                    HERO_HEADLINE_PREFIX.length + HERO_HEADLINE_HIGHLIGHT.length
                  )}
                </span>
                <span className="typing-caret" aria-hidden="true"></span>
              </h1>
            </div>

            <div className="hero-visual">
              <div className="hero-grid"></div>
              <article className="floating-card floating-card-left">
                <span className="floating-label">Monitored links</span>
                <strong>Sources synced for daily scan</strong>
              </article>
              <article className="floating-card floating-card-center">
                <span className="floating-label">Morning brief</span>
                <strong>Condensed updates, ready before work</strong>
              </article>
              <article className="floating-card floating-card-right">
                <span className="floating-label">Premium mode</span>
                <strong>More updates across more links per day</strong>
              </article>
              <div className="orb orb-one"></div>
              <div className="orb orb-two"></div>
            </div>
          </div>
        </section>

        <section id="features" className="content-section">
          <div className="section-heading split-heading">
            <div>
              <p className="section-kicker">Why ChronoBrief</p>
              <h2 className="workflow-headline">
                Start the day with signal,
                <br />
                not tab overload.
              </h2>
            </div>
          </div>

          <div className="feature-grid">
            {featureCards.map((card) => (
              <article key={card.title} className={`feature-card feature-card-${card.tone}`}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
                {card.pills ? (
                  <div className="feature-pill-cloud" aria-hidden="true" ref={featurePillCloudRef}>
                    {card.pills.map((pill, index) => (
                      <span
                        key={pill}
                        className="feature-pill"
                        ref={(node) => {
                          featurePillRefs.current[index] = node
                        }}
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="content-section">
          <div className="workflow-layout">
            <div className="workflow-copy-column">
              <div className="section-heading">
                <p className="section-kicker">Workflow</p>
                <h2 className="workflow-headline">Simple on the surface, powerful in the background.</h2>
              </div>

              <div className="workflow-detail-panel">
                <span className="workflow-detail-label">{workflowCards[activeWorkflowCard].label}</span>
                <p>{workflowCards[activeWorkflowCard].copy}</p>
              </div>

              <div className="workflow-grid">
                {workflowCards.map((card, index) => (
                  <article
                    key={card.title}
                    className={`workflow-card workflow-arc-card ${index === activeWorkflowCard ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveWorkflowCard(index)}
                    onFocus={() => setActiveWorkflowCard(index)}
                    onClick={() => setActiveWorkflowCard(index)}
                    tabIndex={0}
                  >
                    <span className="workflow-label">{card.label}</span>
                    <h3>{card.display}</h3>
                  </article>
                ))}
              </div>
            </div>

            <div className="terminal-shell" aria-label="ChronoBrief workflow activity">
              <div className="terminal-topbar">
                <span className="terminal-dot terminal-dot-red"></span>
                <span className="terminal-dot terminal-dot-yellow"></span>
                <span className="terminal-dot terminal-dot-green"></span>
                <span className="terminal-title">chronobrief-agent</span>
              </div>

              <div className="terminal-body">
                {workflowLogs.map((line, index) => (
                  <p key={line} className="terminal-line">
                    <span>{terminalLines[index]}</span>
                    {index === terminalLines.findIndex((entry) => entry.length < workflowLogs[index].length) ||
                    (terminalLines.every((entry, entryIndex) => entry.length === workflowLogs[entryIndex].length) &&
                      index === workflowLogs.length - 1) ? (
                      <span className="terminal-caret" aria-hidden="true"></span>
                    ) : null}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="content-section">
          <div className="section-heading pricing-heading-wrap">
            <p className="section-kicker">Pricing</p>
            <h2 className="workflow-headline pricing-headline">
              Choose the brief that
              <br />
              matches your pace.
            </h2>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`price-card ${plan.badge ? 'price-card-premium' : ''}`}>
                <div className="price-header">
                  <div>
                    <p className="price-name">{plan.name}</p>
                    <div className="price-row">
                      <strong>{plan.price}</strong>
                      <span>{plan.suffix}</span>
                    </div>
                  </div>
                  {plan.badge ? <span className="price-badge">{plan.badge}</span> : null}
                </div>

                <div className="price-points">
                  {plan.points.map((point) => (
                    <p key={point}>{point}</p>
                  ))}
                </div>

                <button
                  type="button"
                  className={plan.badge ? 'primary-button price-button' : 'ghost-button price-button'}
                  onClick={isLoggedIn ? handleLogout : handleLogin}
                >
                  {isLoggedIn ? 'Logged in' : 'Get started'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="content-section faq-section">
          <div className="faq-copy-column">
            <p className="section-kicker">Questions</p>
            <h2 className="workflow-headline faq-headline">Ask ChronoBrief what happens after you save the links.</h2>
          </div>

          <div className="faq-console">
            <div className="faq-console-topbar">
              <div className="faq-console-dots" aria-hidden="true">
                <span className="terminal-dot terminal-dot-red"></span>
                <span className="terminal-dot terminal-dot-yellow"></span>
                <span className="terminal-dot terminal-dot-green"></span>
              </div>
              <span className="faq-console-title">ChronoBrief chat</span>
              <span className="faq-console-status">Agent online</span>
            </div>

            <div className="faq-chat-thread">
              <article className="faq-message faq-message-agent">
                <span className="faq-message-label">ChronoBrief</span>
                <p>Pick a prompt below and I&apos;ll show you how the daily brief works.</p>
              </article>

              <article className="faq-message faq-message-user">
                <span className="faq-message-label">You</span>
                <p>{faqs[activeFaqIndex].question}</p>
              </article>

              <article className="faq-message faq-message-agent faq-message-answer">
                <span className="faq-message-label">ChronoBrief</span>
                <p>
                  {typedFaqAnswer}
                  {typedFaqAnswer.length < faqs[activeFaqIndex].answer.length ? (
                    <span className="faq-typing-caret" aria-hidden="true"></span>
                  ) : null}
                </p>
              </article>
            </div>

            <div className="faq-prompt-bar" aria-label="Suggested prompts">
              {faqs.map((item, index) => (
                <button
                  key={item.question}
                  type="button"
                  className={`faq-prompt-pill ${index === activeFaqIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveFaqIndex(index)}
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-banner">
          <div>
            <p className="section-kicker">Start your routine</p>
            <h2 className="workflow-headline cta-headline">
              Daily updates when you need them.
            </h2>
          </div>
          {isLoggedIn ? (
            <div className="cta-loggedin">You are logged in and on the dashboard.</div>
          ) : (
            <button type="button" className="primary-button" onClick={handleLogin}>
              Continue with Google
            </button>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
