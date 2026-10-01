import { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck, AlertTriangle, Calendar, Layers, Truck, Users,
  Sparkles, Search, Sun, Moon, Hash, CheckCircle2, ChevronRight,
  ChevronLeft, X, Bell, User, Lock, Eye, Package,
  TrendingUp, Clock, MapPin, Camera, FileText, Zap, Star,
  Building, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Plus, RefreshCw, Activity, BarChart3, Shield, Key,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'Executive' | 'Platform Admin' | 'Project Manager' | 'Warehouse Lead' | 'Ground Crew'
type View = 'executive' | 'damage' | 'events' | 'deficit'
type Theme = 'light' | 'dark'

interface KpiCard {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
  trendVal: string
  glow?: boolean
  alert?: boolean
}

interface DamageRow {
  id: string
  asset: string
  event: string
  reporter: string
  severity: 'Minor Scuff' | 'Structural Fracture' | 'Total Loss'
  verdict: 'Pending Review' | 'Validated' | 'Audit Hold' | 'Second Sign-off Required' | 'Dismissed'
  amount: number
  photo: string
  sha256: string
  gps: string
  exif: string
  signOffs: number
}

interface EventRow {
  id: string
  title: string
  client: string
  venue: string
  date: string
  tier: string
  status: 'In Production' | 'Reserved' | 'Completed' | 'Advisory Conflict' | 'Hard Block'
}

interface DeficitRow {
  id: string
  item: string
  event: string
  needed: number
  inStock: number
  deficit: number
  urgency: 'Immediate Ingress' | 'High' | 'Standard'
  vendor: string
  leadTime: string
  cost: number
  rating: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DAMAGE_ROWS: DamageRow[] = [
  { id: 'D-001', asset: 'Crystal Chandelier Set (12pc)', event: 'Montserrat Gala Night', reporter: 'J. Reyes', severity: 'Structural Fracture', verdict: 'Second Sign-off Required', amount: 8400, photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', sha256: 'a3f9e1b2c4d5...', gps: '14.5995 N, 120.9842 E', exif: '2026-09-28 22:14:07', signOffs: 1 },
  { id: 'D-002', asset: 'Ivory Satin Table Linen (48pc)', event: 'Bellavista Wedding', reporter: 'M. Santos', severity: 'Minor Scuff', verdict: 'Pending Review', amount: 320, photo: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400', sha256: 'b7c2d4e6f8a1...', gps: '14.6017 N, 121.0287 E', exif: '2026-09-30 09:42:11', signOffs: 0 },
  { id: 'D-003', asset: 'Mahogany Arch Frame (2pc)', event: 'Casa Verde Corp Summit', reporter: 'L. Cruz', severity: 'Total Loss', verdict: 'Audit Hold', amount: 15200, photo: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400', sha256: 'c9d3e5f7a2b4...', gps: '14.5547 N, 121.0244 E', exif: '2026-10-01 18:33:55', signOffs: 0 },
  { id: 'D-004', asset: 'Brass Candelabra (6pc)', event: 'La Florencia Soiree', reporter: 'A. Garcia', severity: 'Minor Scuff', verdict: 'Validated', amount: 780, photo: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=400', sha256: 'd1e4f6a8b3c5...', gps: '14.6079 N, 120.9851 E', exif: '2026-09-27 20:11:03', signOffs: 2 },
]

const EVENT_ROWS: EventRow[] = [
  { id: 'E-001', title: 'Montserrat Diamond Gala Night', client: 'BSM Holdings', venue: 'Grand Hyatt Manila', date: 'Oct 15-16, 2026', tier: 'Diamond Signature', status: 'In Production' },
  { id: 'E-002', title: 'Bellavista Garden Wedding', client: 'Reyes-Santos Family', venue: 'Tagaytay Highlands', date: 'Oct 18, 2026', tier: 'Gold Tier', status: 'Reserved' },
  { id: 'E-003', title: 'Casa Verde Corporate Summit', client: 'Casa Verde Group', venue: 'Makati Shangri-La', date: 'Oct 18-19, 2026', tier: 'Corporate Gala', status: 'Advisory Conflict' },
  { id: 'E-004', title: 'La Florencia Intimate Soiree', client: 'A. Villanueva', venue: 'BGC Private Estate', date: 'Oct 22, 2026', tier: 'Intimate Soiree', status: 'Reserved' },
  { id: 'E-005', title: 'Grand Palacio Winter Gala', client: 'Palacio Group', venue: 'Manila Hotel Ballroom', date: 'Nov 1, 2026', tier: 'Diamond Signature', status: 'Hard Block' },
]

const DEFICIT_ROWS: DeficitRow[] = [
  { id: 'DEF-001', item: 'Burgundy Velvet Table Runners', event: 'Montserrat Diamond Gala', needed: 80, inStock: 30, deficit: 50, urgency: 'Immediate Ingress', vendor: 'Prestige Linen Co.', leadTime: '48 hrs', cost: 1250, rating: 4.8 },
  { id: 'DEF-002', item: 'Crystal Wine Glasses (stemless)', event: 'Bellavista Wedding', needed: 200, inStock: 140, deficit: 60, urgency: 'High', vendor: 'Manila Glass Works', leadTime: '72 hrs', cost: 480, rating: 4.5 },
  { id: 'DEF-003', item: 'Ivory Pillar Candles (12in)', event: 'La Florencia Soiree', needed: 120, inStock: 95, deficit: 25, urgency: 'Standard', vendor: 'Lumina Candle Supply', leadTime: '5 days', cost: 375, rating: 4.2 },
  { id: 'DEF-004', item: 'Gold Charger Plates (10in)', event: 'Grand Palacio Winter Gala', needed: 300, inStock: 180, deficit: 120, urgency: 'High', vendor: 'Prestige Tableware PH', leadTime: '3 days', cost: 3600, rating: 4.7 },
]

const ACTIVITY_FEED = [
  { time: '2m ago', msg: 'D-003 escalated to Audit Hold — awaiting second executive sign-off', type: 'alert' },
  { time: '8m ago', msg: 'Deficit PO generated for Burgundy Velvet Table Runners (50 pcs)', type: 'info' },
  { time: '15m ago', msg: 'Event E-005 flagged Hard Block — venue conflict with E-003', type: 'alert' },
  { time: '31m ago', msg: 'Manning SLA verified: 98.4% compliance — Checkpoint sync', type: 'success' },
  { time: '1h ago', msg: 'Canvas workspace saved — Montserrat Gala layout v3', type: 'info' },
  { time: '2h ago', msg: 'Bellavista Wedding crew deployed: 12 members assigned', type: 'success' },
]

const NAV_GROUPS = [
  { label: 'Strategic Oversight', role: 'Executive' },
  { label: 'Identity & Governance', role: 'Platform Admin' },
  { label: 'Event Planning & Canvas', role: 'Project Manager' },
  { label: 'Warehouse Floor Logistics', role: 'Warehouse Lead' },
  { label: 'Mobile Field Operations', role: 'Ground Crew' },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold'

function StatusBadge({ label, variant, pulse }: { label: string; variant: BadgeVariant; pulse?: boolean }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase'
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/15 text-red-600 dark:text-red-400',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    neutral: 'bg-[--muted] text-[--muted-foreground]',
    gold: 'bg-[--primary]/15 text-[--primary]',
  }
  return (
    <span className={cn(base, variants[variant])}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'currentColor' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'currentColor' }} />
        </span>
      )}
      {label}
    </span>
  )
}

function verdictBadge(verdict: DamageRow['verdict']) {
  const map: Record<string, BadgeVariant> = {
    'Pending Review': 'warning',
    'Validated': 'success',
    'Audit Hold': 'danger',
    'Second Sign-off Required': 'danger',
    'Dismissed': 'neutral',
  }
  return <StatusBadge label={verdict} variant={map[verdict] || 'neutral'} pulse={verdict === 'Pending Review' || verdict === 'Second Sign-off Required'} />
}

function statusBadge(status: EventRow['status']) {
  const map: Record<string, BadgeVariant> = {
    'In Production': 'gold',
    'Reserved': 'info',
    'Completed': 'success',
    'Advisory Conflict': 'warning',
    'Hard Block': 'danger',
  }
  return <StatusBadge label={status} variant={map[status] || 'neutral'} pulse={status === 'Advisory Conflict' || status === 'Hard Block'} />
}

function urgencyBadge(urgency: DeficitRow['urgency']) {
  const map: Record<string, BadgeVariant> = {
    'Immediate Ingress': 'danger',
    'High': 'warning',
    'Standard': 'neutral',
  }
  return <StatusBadge label={urgency} variant={map[urgency] || 'neutral'} />
}

// ─── Command Palette ──────────────────────────────────────────────────────────

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  const allResults = [
    { cat: 'Events', items: ['Montserrat Diamond Gala Night', 'Bellavista Garden Wedding', 'Casa Verde Corporate Summit'] },
    { cat: 'Assets', items: ['Crystal Chandelier Set (12pc)', 'Burgundy Velvet Table Runners (80pc)', 'Gold Charger Plates (10in)'] },
    { cat: 'Crew', items: ['J. Reyes — Field Crew Lead', 'M. Santos — Warehouse Associate', 'L. Cruz — Ground Crew'] },
    { cat: 'Manifests', items: ['Dispatch #DM-2026-089', 'Dispatch #DM-2026-090'] },
  ]

  const results = allResults
    .map(g => ({ ...g, items: g.items.filter(i => !query || i.toLowerCase().includes(query.toLowerCase())) }))
    .filter(g => g.items.length)

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search size={18} style={{ color: 'var(--muted-foreground)' }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events, assets, manifests, crew..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[--muted-foreground]" style={{ color: 'var(--foreground)' }} />
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0
            ? <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>No results for "{query}"</p>
            : results.map(group => (
              <div key={group.cat}>
                <p className="px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{group.cat}</p>
                {group.items.map(item => (
                  <button key={item} className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors hover:bg-[--muted]" style={{ color: 'var(--foreground)' }} onClick={onClose}>
                    <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
                    {item}
                  </button>
                ))}
              </div>
            ))}
        </div>
        <div className="px-4 py-2 border-t flex items-center gap-4 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <span className="ml-auto flex items-center gap-1"><Activity size={10} /> Checkpoint sync active</span>
        </div>
      </div>
    </div>
  )
}

// ─── Damage Detail Modal ──────────────────────────────────────────────────────

function DamageModal({ row, onClose, onSignOff }: { row: DamageRow; onClose: () => void; onSignOff: (id: string) => void }) {
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [signed, setSigned] = useState(false)

  function handleSignOff() {
    if (pin.length !== 6) { setPinError(true); return }
    setPinError(false)
    setSigned(true)
    setTimeout(() => { onSignOff(row.id); onClose() }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Forensic Damage Inspector</p>
            <h2 className="font-serif text-xl mt-0.5" style={{ color: 'var(--foreground)' }}>{row.asset}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-[--muted]" style={{ color: 'var(--muted-foreground)' }}><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-0">
          <div className="relative">
            <img src={row.photo} alt={row.asset} className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              <span className="flex items-center gap-1 text-white text-[10px] font-medium bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
                <ShieldCheck size={10} className="text-emerald-400" /> SHA-256 Verified
              </span>
              <span className="flex items-center gap-1 text-white text-[10px] font-medium bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
                <Camera size={10} className="text-sky-400" /> EXIF Intact
              </span>
              <span className="flex items-center gap-1 text-white text-[10px] font-medium bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
                <MapPin size={10} className="text-amber-400" /> GPS Tagged
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3" style={{ borderLeft: '1px solid var(--border)' }}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[['Event', row.event], ['Reporter', row.reporter], ['Severity', row.severity], ['Hold Amount', `P${row.amount.toLocaleString()}`]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ color: 'var(--muted-foreground)' }}>{l}</p>
                  <p className="font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{v}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg p-3 text-xs font-mono" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              <p className="flex items-center gap-1.5 mb-1"><Hash size={10} /> {row.sha256}</p>
              <p className="flex items-center gap-1.5 mb-1"><Clock size={10} /> {row.exif}</p>
              <p className="flex items-center gap-1.5"><MapPin size={10} /> {row.gps}</p>
            </div>

            <div className="flex flex-col gap-2">
              {verdictBadge(row.verdict)}
              <div className="flex items-center gap-2 mt-1">
                {[0, 1].map(i => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500" style={{ backgroundColor: i < row.signOffs ? 'var(--primary)' : 'var(--muted)' }} />
                ))}
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{row.signOffs}/2 sign-offs</span>
              </div>
            </div>
          </div>
        </div>

        {(row.verdict === 'Second Sign-off Required' || row.verdict === 'Audit Hold' || row.verdict === 'Pending Review') && (
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
            <p className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Key size={14} style={{ color: 'var(--primary)' }} />
              Executive Sign-off — Enter 6-digit confirmation PIN
            </p>
            <div className="flex items-center gap-3">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinError(false) }}
                placeholder="Enter PIN"
                className={cn('flex-1 rounded-lg px-4 py-2 text-center text-lg font-mono tracking-[0.4em] outline-none border transition-all', pinError ? 'border-[--destructive]' : 'border-[--border]')}
                style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              />
              <button onClick={handleSignOff} disabled={signed} className="px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                {signed ? <CheckCircle2 size={16} /> : 'Sign Off'}
              </button>
            </div>
            {pinError && <p className="text-xs mt-1.5" style={{ color: 'var(--destructive)' }}>PIN must be exactly 6 digits.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Event Registration Modal ─────────────────────────────────────────────────

function EventRegistrationModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', venue: '', dateStart: '', dateEnd: '' })
  const [conflict, setConflict] = useState<null | 'hard' | 'advisory'>(null)

  function check(f: typeof form) {
    const hardTitles = ['Grand Palacio Winter Gala']
    const advisoryDates = ['2026-10-18']
    const titleMatch = hardTitles.some(t => t.toLowerCase().includes(f.title.toLowerCase()) && f.title.length > 4)
    const dateMatch = advisoryDates.some(d => f.dateStart === d)
    if (titleMatch) setConflict('hard')
    else if (dateMatch) setConflict('advisory')
    else setConflict(null)
  }

  function update(key: string, val: string) {
    const next = { ...form, [key]: val }
    setForm(next)
    check(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Event Creation Engine</p>
            <h2 className="font-serif text-xl mt-0.5" style={{ color: 'var(--foreground)' }}>Register New Event</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[--muted]" style={{ color: 'var(--muted-foreground)' }}><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {conflict === 'hard' && (
            <div className="rounded-lg p-3 border flex items-start gap-3" style={{ backgroundColor: 'rgba(168,77,59,0.1)', borderColor: 'var(--destructive)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--destructive)', marginTop: 2 }} />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--destructive)' }}>HARD BLOCK — Title Conflict &gt;=75% Match</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>An event with a near-identical title already exists. Save is prevented.</p>
              </div>
            </div>
          )}
          {conflict === 'advisory' && (
            <div className="rounded-lg p-3 border flex items-start gap-3" style={{ backgroundColor: 'rgba(196,150,102,0.1)', borderColor: 'var(--primary)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>ADVISORY — Same Date, Different Venue</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Resource contention possible. Review asset availability before confirming.</p>
              </div>
            </div>
          )}

          {[
            { label: 'Event Title', key: 'title', type: 'text', placeholder: 'e.g. Bellavista Diamond Gala 2026' },
            { label: 'Venue', key: 'venue', type: 'text', placeholder: 'e.g. Grand Hyatt Manila Ballroom' },
            { label: 'Start Date', key: 'dateStart', type: 'date', placeholder: '' },
            { label: 'End Date', key: 'dateEnd', type: 'date', placeholder: '' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none border transition-all"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              />
            </div>
          ))}

          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:bg-[--muted]" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Cancel</button>
            <button disabled={conflict === 'hard'} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {conflict === 'hard' ? 'Blocked' : 'Register Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Vendor Requisition Modal ─────────────────────────────────────────────────

function VendorModal({ row, onClose }: { row: DeficitRow; onClose: () => void }) {
  const [generated, setGenerated] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Vendor Routing</p>
            <h2 className="font-serif text-lg mt-0.5" style={{ color: 'var(--foreground)' }}>Reorder Requisition</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[--muted]" style={{ color: 'var(--muted-foreground)' }}><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Item</p>
            <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--foreground)' }}>{row.item}</p>
            <div className="flex gap-6 mt-3 text-xs">
              <div><p style={{ color: 'var(--muted-foreground)' }}>Deficit</p><p className="font-bold text-base" style={{ color: 'var(--destructive)' }}>{row.deficit} pcs</p></div>
              <div><p style={{ color: 'var(--muted-foreground)' }}>Event</p><p className="font-medium" style={{ color: 'var(--foreground)' }}>{row.event}</p></div>
              <div><p style={{ color: 'var(--muted-foreground)' }}>Urgency</p>{urgencyBadge(row.urgency)}</div>
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)', boxShadow: '0 0 16px -4px rgba(155,107,63,0.2)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{row.vendor}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Top matched supplier</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                <Star size={12} fill="currentColor" /> {row.rating}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div><p style={{ color: 'var(--muted-foreground)' }}>Lead Time</p><p className="font-medium" style={{ color: 'var(--foreground)' }}>{row.leadTime}</p></div>
              <div><p style={{ color: 'var(--muted-foreground)' }}>Unit Cost</p><p className="font-medium" style={{ color: 'var(--foreground)' }}>P{(row.cost / row.deficit).toFixed(0)}</p></div>
              <div><p style={{ color: 'var(--muted-foreground)' }}>Total PO</p><p className="font-bold" style={{ color: 'var(--primary)' }}>P{row.cost.toLocaleString()}</p></div>
            </div>
          </div>

          <button onClick={() => setGenerated(true)} disabled={generated} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: generated ? 'var(--muted)' : 'var(--primary)', color: generated ? 'var(--foreground)' : 'var(--primary-foreground)' }}>
            {generated ? <><CheckCircle2 size={16} className="text-emerald-500" /> PO Generated Successfully</> : <><FileText size={16} /> Generate Purchase Order</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Views ────────────────────────────────────────────────────────────────────

function ExecutiveView({ onDamageClick }: { onDamageClick: () => void }) {
  const [flashIdx, setFlashIdx] = useState<number | null>(null)

  const kpis: KpiCard[] = [
    { label: 'Active High-Tier Galas', value: '4', sub: '2 Diamond · 1 Gold · 1 Corp', icon: <Sparkles size={20} />, trend: 'up', trendVal: '+1 this week', glow: true },
    { label: 'Equipment Buffer Lockouts', value: '12', sub: 'items in escrow hold', icon: <Lock size={20} />, trend: 'neutral', trendVal: 'Stable' },
    { label: 'Open Damage Liability', value: 'P18,450', sub: 'pending verdict resolution', icon: <AlertTriangle size={20} />, trend: 'up', trendVal: '2 new claims', alert: true },
    { label: 'Manning SLA Compliance', value: '98.4%', sub: 'checkpoint sync verified', icon: <Users size={20} />, trend: 'up', trendVal: '+0.6% vs last week' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Strategic Oversight</p>
          <h1 className="font-serif text-2xl mt-0.5" style={{ color: 'var(--foreground)' }}>Portfolio Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all hover:bg-[--muted]" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <RefreshCw size={12} /> Sync Now
          </button>
          <button onClick={onDamageClick} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <ShieldCheck size={12} /> Damage Verdicts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <button
            key={k.label}
            onClick={() => { setFlashIdx(i); setTimeout(() => setFlashIdx(null), 600) }}
            className="text-left w-full rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              transform: flashIdx === i ? 'scale(0.96)' : '',
              boxShadow: k.glow ? '0 0 20px -3px rgba(155,107,63,0.25)' : '',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: k.alert ? 'rgba(168,77,59,0.12)' : 'var(--muted)', color: k.alert ? 'var(--destructive)' : 'var(--primary)' }}>
                {k.icon}
              </div>
              <span className={cn('text-[10px] font-semibold flex items-center gap-1', k.trend === 'up' ? (k.alert ? 'text-red-500' : 'text-emerald-500') : 'text-[--muted-foreground]')}>
                {k.trend === 'up' ? <ArrowUpRight size={12} /> : k.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                {k.trendVal}
              </span>
            </div>
            <p className="font-serif text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{k.value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{k.label}</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--muted-foreground)' }}>Portfolio Distribution</p>
          <div className="flex flex-col gap-3">
            {[
              { tier: 'Diamond Signature', count: 2, pct: 40, color: '#c49666' },
              { tier: 'Gold Tier', count: 1, pct: 20, color: '#9b6b3f' },
              { tier: 'Corporate Gala', count: 1, pct: 20, color: '#756f67' },
              { tier: 'Intimate Soiree', count: 1, pct: 20, color: '#d8cec0' },
            ].map(row => (
              <div key={row.tier}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: 'var(--foreground)' }}>{row.tier}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{row.count} event{row.count > 1 ? 's' : ''}</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 rounded-xl border p-5 flex flex-col" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--muted-foreground)' }}>Live Activity Feed</p>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {ACTIVITY_FEED.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', a.type === 'alert' ? 'bg-red-500' : a.type === 'success' ? 'bg-emerald-500' : 'bg-sky-500')} />
                <p className="text-xs flex-1 leading-relaxed" style={{ color: 'var(--foreground)' }}>{a.msg}</p>
                <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DamageView() {
  const [rows, setRows] = useState<DamageRow[]>(DAMAGE_ROWS)
  const [selected, setSelected] = useState<DamageRow | null>(null)
  const [filter, setFilter] = useState('')

  function handleSignOff(id: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, signOffs: Math.min(r.signOffs + 1, 2), verdict: r.signOffs + 1 >= 2 ? 'Validated' : r.verdict } : r))
  }

  const filtered = rows.filter(r => !filter || r.asset.toLowerCase().includes(filter.toLowerCase()) || r.event.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="flex flex-col gap-6">
      {selected && <DamageModal row={selected} onClose={() => setSelected(null)} onSignOff={handleSignOff} />}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Forensic Damage Verification Center</p>
          <h1 className="font-serif text-2xl mt-0.5" style={{ color: 'var(--foreground)' }}>Incident Triage Ledger</h1>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter assets or events..." className="bg-transparent text-xs outline-none w-40" style={{ color: 'var(--foreground)' }} />
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
              {['ID', 'Asset', 'Event', 'Reporter', 'Severity', 'Hold Amount', 'Verdict', 'Sign-offs', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b last:border-0 transition-colors cursor-pointer" style={{ borderColor: 'var(--border)' }}
                onClick={() => setSelected(r)}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              >
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--primary)' }}>{r.id}</td>
                <td className="px-4 py-3 font-medium max-w-[160px]" style={{ color: 'var(--foreground)' }}>{r.asset}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{r.event}</td>
                <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{r.reporter}</td>
                <td className="px-4 py-3"><StatusBadge label={r.severity} variant={r.severity === 'Total Loss' ? 'danger' : r.severity === 'Structural Fracture' ? 'warning' : 'neutral'} /></td>
                <td className="px-4 py-3 font-semibold" style={{ color: r.amount > 5000 ? 'var(--destructive)' : 'var(--foreground)' }}>P{r.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{verdictBadge(r.verdict)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[0, 1].map(i => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: i < r.signOffs ? 'var(--primary)' : 'var(--border)', backgroundColor: i < r.signOffs ? 'var(--primary)' : 'transparent' }}>
                        {i < r.signOffs && <CheckCircle2 size={10} style={{ color: 'var(--primary-foreground)' }} />}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><Eye size={14} style={{ color: 'var(--primary)' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EventsView() {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('')
  const filtered = EVENT_ROWS.filter(r => !filter || r.title.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="flex flex-col gap-6">
      {showModal && <EventRegistrationModal onClose={() => setShowModal(false)} />}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Event Planning & Conflict Engine</p>
          <h1 className="font-serif text-2xl mt-0.5" style={{ color: 'var(--foreground)' }}>Event Registry</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search events..." className="bg-transparent text-xs outline-none w-36" style={{ color: 'var(--foreground)' }} />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <Plus size={14} /> Register Event
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
              {['ID', 'Event Title', 'Client', 'Venue', 'Date', 'Tier', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b last:border-0 transition-colors" style={{ borderColor: 'var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              >
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--primary)' }}>{r.id}</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{r.title}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{r.client}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{r.venue}</td>
                <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{r.date}</td>
                <td className="px-4 py-3"><StatusBadge label={r.tier} variant="gold" /></td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DeficitView() {
  const [selected, setSelected] = useState<DeficitRow | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {selected && <VendorModal row={selected} onClose={() => setSelected(null)} />}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted-foreground)' }}>Replenishment & Vendor Routing</p>
          <h1 className="font-serif text-2xl mt-0.5" style={{ color: 'var(--foreground)' }}>Asset Deficit Queue</h1>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(168,77,59,0.12)', color: 'var(--destructive)' }}>
          4 open deficits · P5,705 total PO
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {DEFICIT_ROWS.map(row => (
          <div key={row.id} className="rounded-xl border p-5 flex items-center gap-5 transition-all" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.15)')}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px]" style={{ color: 'var(--primary)' }}>{row.id}</span>
                {urgencyBadge(row.urgency)}
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{row.item}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{row.event}</p>
            </div>

            <div className="w-40">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--muted-foreground)' }}>
                <span>In stock: {row.inStock}</span><span>Need: {row.needed}</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="h-2 rounded-full" style={{ width: `${(row.inStock / row.needed) * 100}%`, backgroundColor: row.urgency === 'Immediate Ingress' ? 'var(--destructive)' : 'var(--primary)' }} />
              </div>
              <p className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--destructive)' }}>-{row.deficit} pcs deficit</p>
            </div>

            <div className="text-xs text-right">
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>{row.vendor}</p>
              <p style={{ color: 'var(--muted-foreground)' }}>Lead: {row.leadTime} · P{row.cost.toLocaleString()}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5" style={{ color: 'var(--primary)' }}>
                <Star size={10} fill="currentColor" /><span>{row.rating}</span>
              </div>
            </div>

            <button onClick={() => setSelected(row)} className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <Truck size={12} /> Route PO
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main AppShell ────────────────────────────────────────────────────────────

export function LumiereDemoPage() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [role, setRole] = useState<Role>('Executive')
  const [view, setView] = useState<View>('executive')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [syncPulse, setSyncPulse] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const id = setInterval(() => { setSyncPulse(true); setTimeout(() => setSyncPulse(false), 1500) }, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o) }
      if (e.key === 'Escape') { setCmdOpen(false); setShowRoleDropdown(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const roleDefaultView: Record<Role, View> = {
    'Executive': 'executive',
    'Platform Admin': 'executive',
    'Project Manager': 'events',
    'Warehouse Lead': 'deficit',
    'Ground Crew': 'executive',
  }

  const navItems = [
    { icon: <BarChart3 size={18} />, label: 'Overview', view: 'executive' as View },
    { icon: <ShieldCheck size={18} />, label: 'Damage', view: 'damage' as View },
    { icon: <Calendar size={18} />, label: 'Events', view: 'events' as View },
    { icon: <Package size={18} />, label: 'Deficit', view: 'deficit' as View },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Sidebar */}
      <aside className="flex flex-col border-r transition-all duration-300 z-20 flex-shrink-0" style={{ width: sidebarOpen ? 240 : 64, backgroundColor: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sidebar-primary)' }}>
            <Sparkles size={16} style={{ color: 'var(--sidebar-primary-foreground)' }} />
          </div>
          {sidebarOpen && <span className="font-serif text-lg tracking-wide" style={{ color: 'var(--sidebar-foreground)' }}>Lumiere</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map(item => {
            const active = view === item.view
            return (
              <button key={item.view} onClick={() => setView(item.view)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative"
                style={{ backgroundColor: active ? 'var(--sidebar-accent)' : 'transparent', color: active ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)' }}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ backgroundColor: 'var(--sidebar-primary)' }} />}
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}

          {sidebarOpen && (
            <>
              <div className="mt-4 mb-2 px-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-foreground)', opacity: 0.4 }}>Module Groups</p>
              </div>
              {NAV_GROUPS.map(g => (
                <div key={g.label} className="px-3 py-1.5">
                  <p className="text-[10px] font-semibold" style={{ color: 'var(--sidebar-primary)', opacity: 0.7 }}>{g.role}</p>
                  <p className="text-[11px]" style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}>{g.label}</p>
                </div>
              ))}
            </>
          )}
        </nav>

        <button onClick={() => setSidebarOpen(o => !o)} className="flex items-center justify-center p-4 border-t transition-colors" style={{ borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-foreground)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--sidebar-accent)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '')}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b flex-shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Role switcher */}
          <div className="relative">
            <button onClick={() => setShowRoleDropdown(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '')}
            >
              <User size={14} style={{ color: 'var(--primary)' }} />
              {role}
              <ChevronRight size={12} style={{ transform: showRoleDropdown ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />
            </button>
            {showRoleDropdown && (
              <div className="absolute top-full left-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-30 w-48" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {(['Executive', 'Platform Admin', 'Project Manager', 'Warehouse Lead', 'Ground Crew'] as Role[]).map(r => (
                  <button key={r} onClick={() => { setRole(r); setView(roleDefaultView[r]); setShowRoleDropdown(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                    style={{ color: r === role ? 'var(--primary)' : 'var(--foreground)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '')}
                  >
                    {r === role ? '✓ ' : ''}{r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sync pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all" style={{ backgroundColor: 'rgba(155,107,63,0.12)', color: 'var(--primary)', transform: syncPulse ? 'scale(1.05)' : '' }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'currentColor' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: 'currentColor' }} />
            </span>
            All Systems Synchronized — Checkpoint Polling 30s
          </div>

          <div className="flex-1" />

          {/* Search / Command Palette */}
          <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '')}
          >
            <Search size={14} />
            <span>Search events, assets, manifests...</span>
            <kbd className="ml-2 text-[10px] px-1.5 rounded font-mono" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>Ctrl+K</kbd>
          </button>

          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '')}
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {role.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === 'executive' && <ExecutiveView onDamageClick={() => setView('damage')} />}
          {view === 'damage' && <DamageView />}
          {view === 'events' && <EventsView />}
          {view === 'deficit' && <DeficitView />}
        </main>
      </div>
    </div>
  )
}
