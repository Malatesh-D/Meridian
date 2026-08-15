'use client'

import { useMemo, useState, useEffect } from 'react'

const NAV = ['Command Center', 'Digital Twin', 'Scenario Simulator', 'AI Recovery Plan', 'Action Desk']

const initialIntelligence = [
  { 
    id: 1,
    category: 'MILITARY & KINETIC',
    tag: 'UKMTO Advisory #042', 
    text: 'Kinetic strike and unmanned surface vessel activity reported in the primary shipping fairway. Zero commercial transits permitted.', 
    meta: 'Confidence: 96% · CRITICAL ALERT', 
    impact: 'Disrupted Flow: -18.2M bpd',
    tone: 'red',
    time: '2m ago'
  },
  { 
    id: 2,
    category: 'INSURANCE & WAR RISK',
    tag: "Lloyd's Joint War Committee", 
    text: 'Underwriters issue immediate notice expanding high-risk area. Gulf transit breach premiums increased by +350%.', 
    meta: 'Dynamic Cost Surcharge: +$12.40/bbl', 
    impact: 'War Risk Multiplier: 4.5x',
    tone: 'amber',
    time: '8m ago'
  },
  { 
    id: 3,
    category: 'LOGISTICS & PORTS',
    tag: 'Fujairah Terminal Telemetry', 
    text: 'Anchorage congestion reaching 88% nominal capacity. Berth turnaround queues extended to 96+ hours.', 
    meta: 'Bypass Bottleneck Flagged', 
    impact: 'ADCOP Throughput Throttled: -0.2M bpd',
    tone: 'cyan',
    time: '14m ago'
  },
  { 
    id: 4,
    category: 'DIPLOMACY & TRADE',
    tag: 'IEA Strategic Coordination', 
    text: 'Member states evaluating coordinated 60M barrel SPR release to buffer East Asian utility deficits.', 
    meta: 'Multilateral Reserve Action', 
    impact: 'Global Strategic Reserve Drawdown Eligible',
    tone: 'emerald',
    time: '21m ago'
  }
]

const nodes = [
  { id:'qatar', label:'Qatar Energy', type:'SUPPLIER', x:8, y:20, info:'LNG train output · 77 MTPA nominal capacity', status:'LNG export halted via Hormuz' },
  { id:'ras', label:'Ras Tanura', type:'SUPPLIER', x:8, y:50, info:'Arab Light / Medium · API 33–34° · sulfur 1.8%', status:'Stranded supply: 5.4M bpd' },
  { id:'das', label:'Das Island', type:'SUPPLIER', x:8, y:80, info:'Murban blend · API 40° · sulfur 0.8%', status:'Stranded supply: 2.2M bpd' },
  { id:'hormuz', label:'Strait of Hormuz', type:'CHOKEPOINT', x:32, y:50, info:'Primary maritime chokepoint closed by security advisory.', status:'BLOCKED · 134 tankers awaiting transit' },
  { id:'yanbu', label:'Petroline / Yanbu', type:'BYPASS', x:50, y:24, info:'Saudi East–West Petroline · 5.0M bpd capacity', status:'82% utilized · 0.9M bpd headroom' },
  { id:'fujairah', label:'ADCOP / Fujairah', type:'BYPASS', x:50, y:76, info:'UAE Abu Dhabi Crude Oil Pipeline · 1.5M bpd capacity', status:'94% utilized · 0.1M bpd headroom' },
  { id:'ulsan', label:'Ulsan Complex', type:'REFINERY', x:72, y:22, info:'API 30–36° · sulfur tolerance 2.2% · ullage 21%', status:'Burn rate 0.68M bpd · catalyst sensitive' },
  { id:'jurong', label:'Jurong Island', type:'REFINERY', x:72, y:50, info:'API 35–42° · sulfur tolerance 1.5% · ullage 31%', status:'Burn rate 0.45M bpd · running on reserves' },
  { id:'jamnagar', label:'Jamnagar Mega', type:'REFINERY', x:72, y:78, info:'API 24–38° · sulfur tolerance 3.0% · ullage 18%', status:'Burn rate 1.24M bpd · severe deficit' },
  { id:'asia', label:'Asia-Pacific Grid', type:'MARKET', x:92, y:50, info:'Key consumer cluster across East & South Asia', status:'Priority deficit alert · Jet & diesel shortfall' },
]

const connections = [
  { from: 'qatar', to: 'hormuz', status: 'blocked' },
  { from: 'ras', to: 'hormuz', status: 'blocked' },
  { from: 'das', to: 'hormuz', status: 'blocked' },
  { from: 'hormuz', to: 'ulsan', status: 'blocked' },
  { from: 'hormuz', to: 'jurong', status: 'blocked' },
  { from: 'jamnagar', to: 'asia', status: 'normal' },
  { from: 'hormuz', to: 'jamnagar', status: 'blocked' },
  { from: 'ras', to: 'yanbu', status: 'bypass' },
  { from: 'das', to: 'fujairah', status: 'bypass' },
  { from: 'yanbu', to: 'ulsan', status: 'bypass' },
  { from: 'yanbu', to: 'jurong', status: 'bypass' },
  { from: 'fujairah', to: 'jamnagar', status: 'bypass' },
  { from: 'ulsan', to: 'asia', status: 'normal' },
  { from: 'jurong', to: 'asia', status: 'normal' },
]

const PLANS = {
  'Plan A': {
    id: 'Plan A',
    title: 'Balanced Mitigation',
    badge: 'AI RECOMMENDED',
    tone: 'cyan',
    desc: 'Optimal equilibrium between refinery assay integrity, pipeline bypass headroom, and financial exposure.',
    bypass: 1.4,
    blend: true,
    spr: 1.8,
    swaps: 0.8,
    priority: true,
    shaving: 5,
    cost: '$26.4M/day',
    shortage: '22%',
    runway: '12.6 Days',
    rationale: 'Plan A is recommended over Plan B and C because it achieves 78% supply continuity while keeping spot premium costs balanced and preserving critical coker units.'
  },
  'Plan B': {
    id: 'Plan B',
    title: 'Capital Preservation',
    badge: 'LOW COST FOCUS',
    tone: 'emerald',
    desc: 'Minimizes expensive transatlantic spot market purchases by drawing down SPR reserves and aggressive non-essential load shaving.',
    bypass: 2.1,
    blend: false,
    spr: 2.8,
    swaps: 0.2,
    priority: true,
    shaving: 9,
    cost: '$19.2M/day',
    shortage: '34%',
    runway: '10.8 Days',
    rationale: 'Plan B saves $7.2M/day compared to Plan A by throttling Atlantic spot buys, but results in 12% higher regional fuel rationing.'
  },
  'Plan C': {
    id: 'Plan C',
    title: 'Max Asset Protection',
    badge: 'MAX CONTINUITY',
    tone: 'amber',
    desc: 'Aggressively procures Atlantic Basin light sweet crudes to prevent any refinery run-cuts or contractual Force Majeure declarations.',
    bypass: 1.8,
    blend: true,
    spr: 1.2,
    swaps: 1.5,
    priority: false,
    shaving: 2,
    cost: '$34.8M/day',
    shortage: '11%',
    runway: '14.8 Days',
    rationale: 'Plan C delivers maximum operational security (shortage risk down to 11%), but incurs a heavy $34.8M/day landed cost exposure.'
  }
}

const notices = {
  'BIMCO War Risk Notice': `WAR RISK NOTICE\n\nTo: MV Meridian Star Charterers\nCharterparty dated 12 August 2026\n\nWe hereby notify you that the Strait of Hormuz has been designated an additional premium war-risk area. Transit of the affected 1.15 million barrel Arab Medium cargo is suspended pending naval security clearance. All rights under the BIMCO War Risks Clause are expressly reserved.`,
  'Force Majeure Declaration Draft': `FORCE MAJEURE DECLARATION\n\nThe full physical suspension of navigation through the Strait of Hormuz constitutes a force majeure event beyond reasonable operational control. Meridian Operations hereby gives formal notice that delivery of 420,000 bbl scheduled for 18 August 2026 is delayed. Multimodal bypass routing is underway.`,
  'Refinery Run-Cut Notification': `REFINERY RUN-CUT NOTIFICATION\n\nEffective 16 August 2026, refinery units will calibrate crude throughput based on the authorized mitigation plan to protect catalytic cracking integrity. Tier-1 contracted commercial supply remains prioritized.`
}

const Metric = ({ label, value, detail, color='white' }) => (
  <div className="metric">
    <div className="eyebrow">{label}</div>
    <div className={`metric-value ${color}`}>{value}</div>
    <div className="detail">{detail}</div>
  </div>
)

const Pill = ({ children, tone='' }) => <span className={`pill ${tone}`}>{children}</span>

export default function Meridian() {
  const [screen, setScreen] = useState(0)
  const [commodity, setCommodity] = useState('Crude Oil')
  const [selected, setSelected] = useState(nodes[3])

  // Intelligence State
  const [intelList, setIntelList] = useState(initialIntelligence)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [isIngesting, setIsIngesting] = useState(false)

  // Multi-Plan State
  const [activePlanKey, setActivePlanKey] = useState('Plan A')
  const [bypass, setBypass] = useState(PLANS['Plan A'].bypass)
  const [blend, setBlend] = useState(PLANS['Plan A'].blend)
  const [spr, setSpr] = useState(PLANS['Plan A'].spr)
  const [swaps, setSwaps] = useState(PLANS['Plan A'].swaps)
  const [priority, setPriority] = useState(PLANS['Plan A'].priority)
  const [shaving, setShaving] = useState(PLANS['Plan A'].shaving)

  const [days, setDays] = useState(30)
  const [notice, setNotice] = useState('BIMCO War Risk Notice')
  const [toast, setToast] = useState('')
  const [approved, setApproved] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  
  // Video Modal State
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const applyPlan = (key) => {
    setActivePlanKey(key)
    const p = PLANS[key]
    setBypass(p.bypass)
    setBlend(p.blend)
    setSpr(p.spr)
    setSwaps(p.swaps)
    setPriority(p.priority)
    setShaving(p.shaving)
    setToast(`Loaded ${key}: ${p.title}`)
    setTimeout(() => setToast(''), 2000)
  }

  // Simulated Live Signal Ingestion
  const simulateLiveSignal = () => {
    setIsIngesting(true)
    setTimeout(() => {
      const newSignal = {
        id: Date.now(),
        category: 'MILITARY & KINETIC',
        tag: 'Satellite SAR Intel #089',
        text: 'AIS dark vessel cluster detected 18nm North of Musandam Peninsula. Commercial corridor confirmation remains negative.',
        meta: 'Confidence: 99% · VERIFIED SATELLITE RADAR',
        impact: 'Persian Gulf Exit Risk: EXTREME',
        tone: 'red',
        time: 'Just now'
      }
      setIntelList(prev => [newSignal, ...prev])
      setIsIngesting(false)
      setToast('Ingested new real-time intelligence signal')
      setTimeout(() => setToast(''), 2200)
    }, 900)
  }

  const impact = useMemo(() => Math.min(57, Math.round(bypass * 9 + (blend ? 8 : 0) + spr * 4 + swaps * 7 + (priority ? 7 : 0) + shaving * 1.2)), [bypass, blend, spr, swaps, priority, shaving])
  const afterShortage = Math.max(8, 68 - impact)
  const afterExposure = (42.8 * (1 - impact / 115)).toFixed(1)
  const runway = (6.2 + impact * 0.14).toFixed(1)

  const goPlan = () => setScreen(3)
  const copy = async () => {
    try { await navigator.clipboard.writeText(notices[notice]) } catch {}
    setToast('Notice copied to clipboard')
    setTimeout(() => setToast(''), 2200)
  }

  const slider = (name, value, set, max, step = 0.1, suffix = '') => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    return (
      <div className="lever">
        <div className="lever-header">
          <span className="lever-name">{name}</span>
          <span className="lever-val-badge">
            {value}{suffix}
          </span>
        </div>
        <div className="range-wrapper">
          <input
            type="range"
            min="0"
            max={max}
            step={step}
            value={value}
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #22d3ee ${pct}%, #1e293b ${pct}%, #1e293b 100%)`
            }}
            className="modern-range"
            onChange={e => {
              set(Number(e.target.value))
              setActivePlanKey('Custom')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <main>
      <header>
        <div className="brand">
          <div className="logo">M</div>
          <div><strong>MERIDIAN</strong><small>EMERGENCY NETWORK OS</small></div>
        </div>
        <div className="alert"><i /> CRITICAL ALERT: STRAIT OF HORMUZ TRANSIT SUSPENDED</div>
        
        {/* Updated right side of header with GLOWING Video Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="commodity">
            <button className={commodity === 'Crude Oil' ? 'selected' : ''} onClick={() => setCommodity('Crude Oil')}>Crude Oil</button>
            <button className={commodity === 'LNG' ? 'selected' : ''} onClick={() => setCommodity('LNG')}>LNG</button>
          </div>
          <button 
            onClick={() => setIsVideoOpen(true)}
            style={{ 
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
              color: '#ffffff', 
              border: 'none',
              fontWeight: 700, 
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '6px',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.9)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.6)'
            }}
          >
            <span style={{ fontSize: '14px' }}>▶</span> Watch Demo
          </button>
        </div>
      </header>

      <nav>
        {NAV.map((n, i) => (
          <button key={n} className={screen === i ? 'active' : ''} onClick={() => setScreen(i)}>
            <span>0{i + 1}</span>{n}
          </button>
        ))}
      </nav>

      <section className="quick">
        <Pill tone="red">Disrupted Flow: {commodity === 'LNG' ? '78 MTPA' : '18.2M bpd'}</Pill>
        <Pill tone="amber">Inventory Runway: 11.2 Days</Pill>
        <Pill>Active Plan: {activePlanKey === 'Custom' ? 'Custom Configuration' : `${activePlanKey} · ${PLANS[activePlanKey].title}`}</Pill>
        <div className="live"><i /> LIVE OPTIMIZER ONLINE</div>
      </section>

      <div className="content">
        {screen === 0 && (
          <Command
            goPlan={goPlan}
            commodity={commodity}
            intelList={intelList}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            simulateLiveSignal={simulateLiveSignal}
            isIngesting={isIngesting}
          />
        )}
        {screen === 1 && <Twin selected={selected} setSelected={setSelected} />}
        {screen === 2 && <Simulator days={days} setDays={setDays} commodity={commodity} />}
        {screen === 3 && (
          <Recovery
            {...{
              activePlanKey,
              setActivePlanKey,
              applyPlan,
              bypass,
              setBypass,
              blend,
              setBlend,
              spr,
              setSpr,
              swaps,
              setSwaps,
              priority,
              setPriority,
              shaving,
              setShaving,
              impact,
              afterShortage,
              afterExposure,
              runway,
              slider
            }}
          />
        )}
        {screen === 4 && (
          <Action
            {...{
              activePlanKey,
              notice,
              setNotice,
              copy,
              goPlan,
              approved,
              setApproved,
              rejecting,
              setRejecting
            }}
          />
        )}
      </div>

      {toast && <div className="toast">✓ {toast}</div>}

      {/* The Video Modal Popup */}
      {isVideoOpen && (
        <div className="modal-backdrop" onClick={() => setIsVideoOpen(false)}>
          <div 
            className="modal" 
            style={{ width: '85%', maxWidth: '1000px', padding: '16px', background: '#020617' }} 
            onClick={e => e.stopPropagation()} 
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Meridian Demo</h2>
              <button 
                onClick={() => setIsVideoOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <video 
              src="/demo.mp4" 
              controls 
              autoPlay 
              style={{ width: '100%', borderRadius: '8px', outline: 'none', backgroundColor: '#000', maxHeight: '75vh' }}
            />
          </div>
        </div>
      )}

    </main>
  )
}

function Command({ goPlan, commodity, intelList, activeCategory, setActiveCategory, simulateLiveSignal, isIngesting }) {
  const filteredIntel = activeCategory === 'ALL'
    ? intelList
    : intelList.filter(item => item.category.includes(activeCategory))

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="kicker">SITUATION ROOM / MULTI-SOURCE INTELLIGENCE</div>
          <h1>Global Energy Network Under Stress</h1>
          <p>Real-time early warning telemetry categorized across military, financial, and logistical domains.</p>
        </div>
        <button className="primary" onClick={goPlan}>Generate recovery plan options →</button>
      </div>

      <div className="metrics">
        <Metric label="CHOKEPOINT STATUS" value="CLOSED / CRITICAL" detail="Hormuz blocked · 134 stranded tankers" color="red" />
        <Metric label="REFINERY INVENTORY RUNWAY" value="11.2 Days" detail="⚠ Depletion cliff projected Day 12" color="amber" />
        <Metric label="ACTIVE SUPPLY AT RISK" value={commodity === 'LNG' ? '78 MTPA' : '18.2M bpd'} detail="42% of active regional contracts" />
        <Metric label="DAILY VALUE-AT-RISK" value="$42.8M / Day" detail="Demurrage + war insurance surge" color="red" />
      </div>

      <div className="two">
        <article className="panel">
          <div className="panel-title">
            <div className="intel-title-wrap">
              <span>LIVE MULTIMODAL INTELLIGENCE STREAM</span>
              <Pill tone="cyan">{filteredIntel.length} ACTIVE SIGNALS</Pill>
            </div>
            <button className="ingest-btn" onClick={simulateLiveSignal} disabled={isIngesting}>
              {isIngesting ? '⚡ Ingesting...' : '↻ Poll live feeds'}
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="category-filter-bar">
            {['ALL', 'MILITARY', 'INSURANCE', 'LOGISTICS', 'DIPLOMACY'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Categorized Feed List */}
          <div className="intel-stream">
            {filteredIntel.map(x => (
              <div className="intel-card" key={x.id}>
                <div className="intel-header">
                  <div className="intel-cat-tag">
                    <span className={`signal-dot ${x.tone}`}></span>
                    <strong className={`cat-label ${x.tone}`}>{x.category}</strong>
                  </div>
                  <span className="intel-time">{x.time}</span>
                </div>

                <div className="intel-body">
                  <b className="intel-tag">{x.tag}</b>
                  <p className="intel-desc">“{x.text}”</p>
                  
                  <div className="intel-footer">
                    <span className={`intel-meta ${x.tone}`}>{x.meta}</span>
                    <span className="intel-impact-badge">{x.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel executive">
          <div className="panel-title">EXECUTIVE SITUATION BRIEF</div>
          <h2>Scarcity allocation begins before vessels move.</h2>
          <p>The Strait of Hormuz chokepoint closure immediately cuts off 18.2M bpd of sour crude. Refineries cannot simply switch to random light sweet crude without catalyst degradation. Meridian's optimization engine parameterizes these incoming alerts to reallocate flows.</p>
          
          <div className="brief-breakdown">
            <div className="breakdown-row">
              <span>Primary Failure:</span>
              <strong className="red">Transit corridor compromised</strong>
            </div>
            <div className="breakdown-row">
              <span>Immediate Bottleneck:</span>
              <strong className="amber">Yanbu & Fujairah pipeline capacities</strong>
            </div>
            <div className="breakdown-row">
              <span>Recommended Next Step:</span>
              <strong className="cyan">Execute Plan A Blending Strategy</strong>
            </div>
          </div>

          <div className="brief-stat">
            <span>Model Solver Confidence</span>
            <b>96.4%</b>
          </div>
          
          <button className="secondary" style={{ width: '100%', marginTop: '12px' }} onClick={goPlan}>
            Review multi-plan mitigation →
          </button>
        </article>
      </div>
    </>
  )
}

function Twin({ selected, setSelected }) {
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [])

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="kicker">DIGITAL TWIN / MULTIMODAL NETWORK GRAPH</div>
          <h1>End-to-End Supply Chain Topology</h1>
          <p>Follow the physical commodity flow from Gulf wells, through bypass pipelines and refineries, to final markets.</p>
        </div>
        <div className="legend-pills">
          <span className="pill red">● Blocked Channel</span>
          <span className="pill cyan">● Bypass Route</span>
          <span className="pill emerald">● Market Delivery</span>
        </div>
      </div>

      <div className="twin">
        <div className="network-container">
          <div className="flow-stages">
            <div className="stage-tag">1. UPSTREAM SOURCES</div>
            <div className="stage-tag">2. CHOKEPOINT & BYPASS</div>
            <div className="stage-tag">3. REFINERY HUBS</div>
            <div className="stage-tag">4. CONSUMPTION GRID</div>
          </div>

          <svg className="network-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {connections.map((c, i) => {
              const src = nodeMap[c.from]
              const dst = nodeMap[c.to]
              if (!src || !dst) return null
              const dx = (dst.x - src.x) * 0.5
              const pathD = `M ${src.x} ${src.y} C ${src.x + dx} ${src.y}, ${dst.x - dx} ${dst.y}, ${dst.x} ${dst.y}`

              return (
                <g key={i}>
                  <path d={pathD} className={`svg-flow-line ${c.status}`} />
                  {c.status === 'blocked' && (
                    <circle cx={(src.x + dst.x) / 2} cy={(src.y + dst.y) / 2} r="1.2" fill="#ef4444" />
                  )}
                </g>
              )
            })}
          </svg>

          {nodes.map(n => (
            <button
              onClick={() => setSelected(n)}
              key={n.id}
              className={`node-card ${n.type.toLowerCase()} ${selected.id === n.id ? 'picked' : ''}`}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className="node-head">
                <span className="node-dot">
                  {n.type === 'CHOKEPOINT' ? '✕' : n.type === 'REFINERY' ? '◈' : n.type === 'BYPASS' ? '⇄' : '●'}
                </span>
                <b>{n.label}</b>
              </div>
              <small>{n.type}</small>
            </button>
          ))}
        </div>

        <aside className="inspector">
          <div className="eyebrow">NODE INSPECTOR</div>
          <h2>{selected.label}</h2>
          <Pill tone={selected.type === 'CHOKEPOINT' ? 'red' : selected.type === 'BYPASS' ? 'cyan' : 'amber'}>
            {selected.type}
          </Pill>
          <p>{selected.info}</p>
          <div className="statusbox">{selected.status}</div>

          {['BYPASS', 'REFINERY'].includes(selected.type) && (
            <>
              <div className="gauge-label">
                <span>Operational capacity</span>
                <b>{selected.id === 'yanbu' ? '82%' : selected.id === 'fujairah' ? '94%' : '79%'}</b>
              </div>
              <div className="gauge">
                <i style={{ width: selected.id === 'fujairah' ? '94%' : '82%' }} />
              </div>
            </>
          )}

          <div className="note">
            Telemetry synchronized with satellite AIS, pipeline throughput sensors, and crude assay databases.
          </div>
        </aside>
      </div>
    </>
  )
}

function Simulator({ days, setDays, commodity }) {
  const forced = Math.min(11.2, 8 + days * 0.11).toFixed(1)

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="kicker">SCENARIO SIMULATOR / CASCADE ANALYSIS</div>
          <h1>Simulate the network drawdown over time.</h1>
          <p>Unmitigated depletion trajectory for {commodity} across your operating horizon.</p>
        </div>
      </div>

      <div className="panel simulator">
        <div className="scrub">
          <div><span>DISRUPTION HORIZON</span><strong>{days} DAYS</strong></div>
          <input type="range" min="15" max="90" step="15" value={days} onChange={e => setDays(+e.target.value)} />
          <div className="ticks"><span>15 days</span><span>30 days</span><span>60 days</span><span>90 days</span></div>
        </div>

        <div className="chart-title">
          <div><b>UNMITIGATED INVENTORY DEPLETION</b><small>Percent of safe operating stock</small></div>
          <div className="legend"><i /> Inventory <em /> 65% minimum safe threshold</div>
        </div>

        <svg className="chart" viewBox="0 0 900 280" preserveAspectRatio="none">
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#ef4444" stopOpacity=".42" />
              <stop offset="1" stopColor="#ef4444" stopOpacity=".01" />
            </linearGradient>
          </defs>
          <path className="grid" d="M0 54H900M0 126H900M0 198H900" />
          <path className="threshold" d="M0 98H900" />
          <path fill="url(#area)" d="M0 30 C170 42 260 80 360 115 S580 205 900 260 L900 280H0Z" />
          <path className="curve" d="M0 30 C170 42 260 80 360 115 S580 205 900 260" />
          <circle cx="360" cy="115" r="7" className="dot" />
          <text x="370" y="108">CRITICAL SHUT-IN: DAY {forced}</text>
        </svg>
      </div>

      <div className="metrics">
        <Metric label="POWER GRID BROWNOUT" value={`${Math.min(89, 39 + days / 2)}%`} detail="Probability post-refinery cut" color="amber" />
        <Metric label="DIESEL YIELD LOSS" value={`${Math.min(36, 11 + days / 5)}%`} detail="Regional commercial transport loss" color="red" />
        <Metric label="JET FUEL YIELD LOSS" value={`${Math.min(31, 8 + days / 5)}%`} detail="Priority aviation fuel deficit" color="red" />
      </div>
    </>
  )
}

function Recovery(p) {
  const currentPlan = PLANS[p.activePlanKey]

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="kicker">MERIDIAN AI / RECOVERY ORCHESTRATION</div>
          <h1>Generate & Compare Recovery Plans</h1>
          <p>Select a pre-optimized strategy or customize individual supply chain levers.</p>
        </div>
        <Pill tone="cyan">MILP SOLVER ONLINE · 3 PLANS READY</Pill>
      </div>

      <div className="plan-grid">
        {Object.entries(PLANS).map(([key, item]) => {
          const isSelected = p.activePlanKey === key
          return (
            <div
              key={key}
              onClick={() => p.applyPlan(key)}
              className={`plan-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="plan-card-head">
                <span className={`plan-badge ${item.tone}`}>{item.badge}</span>
                <b>{key}</b>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="plan-stats">
                <div><span>Cost</span><strong>{item.cost}</strong></div>
                <div><span>Shortage</span><strong>{item.shortage}</strong></div>
                <div><span>Runway</span><strong>{item.runway}</strong></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="recovery">
        <section className="panel levers">
          <div className="panel-title">
            <span>CONFIGURED LEVERS</span>
            <Pill tone={p.activePlanKey === 'Custom' ? 'amber' : 'cyan'}>
              {p.activePlanKey === 'Custom' ? 'CUSTOM CONFIGURATION' : `${p.activePlanKey} ACTIVE`} ({p.impact} PTS)
            </Pill>
          </div>

          {p.slider('01 Pipeline bypass rerouting', p.bypass, p.setBypass, 2.5, 0.1, 'M bpd')}
          
          <Toggle
            label="02 Assay blend substitution"
            sub="Arab Heavy + West African Sweet + US WTI"
            value={p.blend}
            set={v => { p.setBlend(v); p.setActivePlanKey('Custom') }}
          />

          {p.slider('03 Strategic petroleum reserve release', p.spr, p.setSpr, 3, 0.1, 'M bbl')}
          {p.slider('04 Atlantic Basin spot swaps', p.swaps, p.setSwaps, 1.5, 0.1, 'M bpd')}

          <Toggle
            label="05 Tier-1 contract prioritization"
            sub="Ration non-critical industrial deliveries"
            value={p.priority}
            set={v => { p.setPriority(v); p.setActivePlanKey('Custom') }}
          />

          {p.slider('06 Peak demand shaving', p.shaving, p.setShaving, 10, 1, '%')}
        </section>

        <section className="value">
          <div className="value-head">
            <div className="eyebrow">OPTIMIZED VALUE DELTA</div>
            <h2>{p.activePlanKey === 'Custom' ? 'Custom Optimized Configuration' : `${p.activePlanKey} · ${currentPlan.title}`}</h2>
            <p>Real-time performance relative to unmitigated closure.</p>
          </div>

          <Delta label="SHORTAGE PROBABILITY" before="68%" after={`${p.afterShortage}%`} color="emerald" />
          <Delta label="FINANCIAL EXPOSURE" before="$42.8M/day" after={`$${p.afterExposure}M/day`} color="emerald" />
          <Delta label="INVENTORY RUNWAY" before="6.2 Days" after={`${p.runway} Days`} color="cyan" />

          <div className="explain">
            ✦ <span><b>EXPLAINABLE OPTIMIZATION</b><br />MILP solver evaluated 3 Pareto-optimal trade-off frontiers in 142ms. LLM Copilot synthesized multi-plan business trade-offs.</span>
          </div>
        </section>
      </div>
    </>
  )
}

function Toggle({ label, sub, value, set }) {
  return (
    <div className="toggle-line">
      <div>
        <b className="toggle-title">{label}</b>
        <small className="toggle-sub">{sub}</small>
      </div>
      <button className={`switch ${value ? 'on' : ''}`} onClick={() => set(!value)}><i /></button>
    </div>
  )
}

function Delta({ label, before, after, color }) {
  return (
    <div className="delta">
      <div><span>{label}</span><b>{before}</b><small>UNMITIGATED</small></div>
      <strong>→</strong>
      <div><b className={color}>{after}</b><small>OPTIMIZED OUTCOME</small></div>
    </div>
  )
}

function Action({ activePlanKey, notice, setNotice, copy, goPlan, approved, setApproved, rejecting, setRejecting }) {
  const currentPlan = PLANS[activePlanKey] || PLANS['Plan A']

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="kicker">ACTION DESK / HUMAN GOVERNANCE</div>
          <h1>Decision authority remains human.</h1>
          <p>Review Meridian’s operational rationale, authorize execution for <b>{currentPlan.title}</b>, and issue responsive notices.</p>
        </div>
        <Pill tone="amber">READY FOR AUTHORIZATION</Pill>
      </div>

      <div className="action-grid">
        <section className="panel governance">
          <div className="panel-title">RECOMMENDATION RATIONALE</div>
          <h2>{activePlanKey} · {currentPlan.title} Trade-off Analysis</h2>
          <p>{currentPlan.rationale}</p>
          <div className="brief-stat">
            <span>Projected daily landed cost:</span>
            <b>{currentPlan.cost}</b>
          </div>
          <div className="actions">
            <button className="approve" onClick={() => setApproved(true)}>✓ Approve & execute {activePlanKey}</button>
            <button className="secondary" onClick={goPlan}>Compare / modify levers</button>
            <button className="reject" onClick={() => setRejecting(!rejecting)}>Reject plan</button>
          </div>
          {rejecting && <textarea autoFocus placeholder="Specify manual operating constraints for re-optimization…" />}
          <div className="audit">AUDIT READY · Model v4.2 · Deterministic MILP solver verified · Decisions logged</div>
        </section>

        <section className="panel notice">
          <div className="panel-title">AUTOMATED LEGAL & NOTICE GENERATOR</div>
          <div className="notice-tabs">
            {Object.keys(notices).map(n => (
              <button key={n} onClick={() => setNotice(n)} className={notice === n ? 'chosen' : ''}>
                {n.replace(' Draft', '').replace(' Notification', '')}
              </button>
            ))}
          </div>
          <pre>{notices[notice]}</pre>
          <button className="secondary copy" onClick={copy}>▣ Copy notice to clipboard</button>
        </section>
      </div>

      {approved && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="success">✓</div>
            <div className="eyebrow">AUTHORIZATION RECORDED</div>
            <h2>{currentPlan.title} Queued.</h2>
            <p>Multimodal bypass allocations, charterparty notices, and audit trail records have been dispatched.</p>
            <button className="primary" onClick={() => setApproved(false)}>Return to command desk</button>
          </div>
        </div>
      )}
    </>
  )
}