import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_STORAGE_KEY = 'chronos_token'
const HERO_HEADLINE_PREFIX = 'Turn scattered links into one '
const HERO_HEADLINE_HIGHLIGHT = 'daily brief'
const HERO_HEADLINE_SUFFIX = ' that actually helps you start the day.'
const HERO_HEADLINE = `${HERO_HEADLINE_PREFIX}${HERO_HEADLINE_HIGHLIGHT}${HERO_HEADLINE_SUFFIX}`

const readTokenFromStorage = () => localStorage.getItem(TOKEN_STORAGE_KEY) || ''

const featureCards = [
  {
    tone: 'wide',
    eyebrow: 'Signal intake',
    title: 'Track the links that matter',
    copy: 'Add creators, newsletters, threads, research pages, and articles you want Chronos to watch every day.',
    pills: ['Newsletters', 'Research', 'Threads', 'Articles', 'Creators']
  },
  {
    tone: 'brief',
    eyebrow: 'Daily clarity',
    title: 'Wake up to one clear brief',
    copy: 'Chronos turns scattered updates into a focused summary so you do not lose time checking every source manually.'
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
    copy: 'Chronos watches the links you add and checks for meaningful changes and fresh posts.'
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
  '> Chronos AI agent initializing...',
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
    question: 'What does Chronos do?',
    answer: 'Chronos watches the links you care about and turns fresh changes into a daily briefing.'
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

function App() {
  const [token, setToken] = useState(() => readTokenFromStorage())
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(readTokenFromStorage()))
  const [status, setStatus] = useState('Connect Google to start your daily Chronos brief.')
  const [error, setError] = useState('')
  const [typedHeadline, setTypedHeadline] = useState('')
  const [terminalLines, setTerminalLines] = useState(() => workflowLogs.map(() => ''))
  const [activeWorkflowCard, setActiveWorkflowCard] = useState(0)
  const [activeFaqIndex, setActiveFaqIndex] = useState(0)
  const [typedFaqAnswer, setTypedFaqAnswer] = useState('')
  const featurePillCloudRef = useRef(null)
  const featurePillRefs = useRef([])

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

    window.history.replaceState({}, '', '/dashboard')
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

        setIsLoggedIn(true)
        setStatus('You are logged in and on your dashboard.')
      } catch (loadError) {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken('')
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

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
    setIsLoggedIn(false)
    setError('')
    setStatus('You have been logged out.')
    window.history.replaceState({}, '', '/')
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
                <span>Chronos</span>
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
              <p className="section-kicker">Why Chronos</p>
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

            <div className="terminal-shell" aria-label="Chronos workflow activity">
              <div className="terminal-topbar">
                <span className="terminal-dot terminal-dot-red"></span>
                <span className="terminal-dot terminal-dot-yellow"></span>
                <span className="terminal-dot terminal-dot-green"></span>
                <span className="terminal-title">chronos-agent</span>
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
            <h2 className="workflow-headline faq-headline">Ask Chronos what happens after you save the links.</h2>
          </div>

          <div className="faq-console">
            <div className="faq-console-topbar">
              <div className="faq-console-dots" aria-hidden="true">
                <span className="terminal-dot terminal-dot-red"></span>
                <span className="terminal-dot terminal-dot-yellow"></span>
                <span className="terminal-dot terminal-dot-green"></span>
              </div>
              <span className="faq-console-title">Chronos chat</span>
              <span className="faq-console-status">Agent online</span>
            </div>

            <div className="faq-chat-thread">
              <article className="faq-message faq-message-agent">
                <span className="faq-message-label">Chronos</span>
                <p>Pick a prompt below and I&apos;ll show you how the daily brief works.</p>
              </article>

              <article className="faq-message faq-message-user">
                <span className="faq-message-label">You</span>
                <p>{faqs[activeFaqIndex].question}</p>
              </article>

              <article className="faq-message faq-message-agent faq-message-answer">
                <span className="faq-message-label">Chronos</span>
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
