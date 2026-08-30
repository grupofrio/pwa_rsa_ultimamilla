import type { RouteSummary } from '@/services/api/types'

const MARKERS = [
  { x: 20, y: 30, fallback: 'VA-12', progress: '18%', risk: true },
  { x: 35, y: 58, fallback: 'VA-18', progress: '42%', risk: true },
  { x: 53, y: 37, fallback: 'VA-07', progress: '61%', risk: false },
  { x: 68, y: 67, fallback: 'VA-21', progress: '76%', risk: true },
  { x: 80, y: 31, fallback: 'VA-03', progress: '88%', risk: false },
  { x: 86, y: 75, fallback: 'VA-15', progress: '96%', risk: false },
]

export default function LiveMap({ routes }: { routes: RouteSummary[] }) {
  return (
    <div
      className="relative h-[520px] w-full overflow-hidden bg-[#0b1b28]"
      role="img"
      aria-label={'Mapa operativo de Guadalajara con ' + (routes.length || 6) + ' unidades localizadas'}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 720" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="map-background" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0c2231" />
            <stop offset="1" stopColor="#102b3d" />
          </linearGradient>
          <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="small-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="#7f9cad" strokeOpacity=".055" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1000" height="720" fill="url(#map-background)" />
        <rect width="1000" height="720" fill="url(#small-grid)" />

        <g fill="#143446" stroke="#284b5e" strokeWidth="1">
          <path d="M26 42h180l32 75-45 68H42z" />
          <path d="M270 26h214l-20 112-112 42-90-60z" />
          <path d="M545 46h183l66 85-52 92-185-31-38-75z" />
          <path d="M809 28h163v205l-96-8-51-75z" />
          <path d="M42 230l166-30 64 89-29 125-201 27z" />
          <path d="M302 217l190-41 63 99-36 132-184 8-72-108z" />
          <path d="M587 249l150-12 76 87-33 113-169 7-68-94z" />
          <path d="M836 272l136-18v186l-155-13-14-92z" />
          <path d="M30 485l220-36 63 99-72 137H30z" />
          <path d="M340 455l209-4 39 118-74 126H298l-20-115z" />
          <path d="M632 480l161-23 65 88-41 150H596l21-126z" />
          <path d="M873 475l99 15v205H853l-9-116z" />
        </g>

        <g fill="none" stroke="#96afbd" strokeOpacity=".22" strokeWidth="5">
          <path d="M-20 610C170 500 260 470 448 388S736 206 1020 128" />
          <path d="M94 -20c73 190 144 281 314 406s308 151 612 184" />
          <path d="M-10 176c208 33 334 41 492 17s318-18 548 54" />
          <path d="M257 -10c31 168 59 315 41 470s-6 194 38 280" />
          <path d="M751 -20c-36 160-45 291-5 431s66 222 55 329" />
        </g>
        <g fill="none" stroke="#87a8ba" strokeOpacity=".13" strokeWidth="2">
          <path d="M-20 356c147-14 285 18 422 84s337 91 618 63" />
          <path d="M470 -20c18 114 24 241-11 340s-24 237 57 420" />
          <path d="M888 -10c-50 95-72 178-55 260s74 189 187 285" />
          <path d="M-10 76c113 61 223 73 326 40s210-27 332 42" />
        </g>

        <path d="M188 218C269 266 314 350 404 369S566 280 675 360 812 512 906 548" fill="none" stroke="#eef6f8" strokeOpacity=".42" strokeWidth="5" strokeDasharray="12 12" />
        <path d="M188 218C274 270 331 337 415 351S567 274 670 350 802 481 899 531" fill="none" stroke="#18b9aa" strokeWidth="8" strokeLinecap="round" filter="url(#route-glow)" />
        <path d="M340 428C390 374 456 350 515 310S617 209 716 223" fill="none" stroke="#f5a623" strokeWidth="7" strokeLinecap="round" strokeDasharray="17 8" filter="url(#route-glow)" />
        <path d="M522 548C602 531 650 482 708 451S823 401 915 408" fill="none" stroke="#18b9aa" strokeWidth="7" strokeLinecap="round" />

        <g fill="#8ca5b3" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="600" opacity=".72">
          <text x="44" y="210">Zapopan</text>
          <text x="418" y="211">Guadalajara Centro</text>
          <text x="756" y="269">Tonalá</text>
          <text x="142" y="518">Mariano Otero</text>
          <text x="650" y="612">Tlaquepaque</text>
        </g>
      </svg>

      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <span className="rounded-lg border border-white/10 bg-[#07131e]/90 px-3 py-2 text-xs font-semibold text-white shadow-xl">CEDIS ML GDL R</span>
        <span className="rounded-lg border border-white/10 bg-[#07131e]/90 px-3 py-2 text-xs text-white/70 shadow-xl">Última señal: hace 18 s</span>
      </div>

      {MARKERS.map((marker, index) => {
        const route = routes[index]
        const risk = route ? route.vehicle.gpsQuality !== 'ok' || route.hasLoadDifference : marker.risk
        const code = route?.vehicle.code ?? marker.fallback
        return (
          <div
            key={route?.id ?? marker.fallback}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: marker.x + '%', top: marker.y + '%' }}
          >
            <span className={'absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-15 ' + (risk ? 'bg-[var(--va-amber)]' : 'bg-[var(--va-teal)]')} />
            <span className={'relative grid h-9 min-w-14 place-items-center rounded-xl border-2 px-2 text-[11px] font-black shadow-xl ' + (risk ? 'border-[#ffbf4f] bg-[#f5a623] text-[#07131e]' : 'border-[#71e2d8] bg-[var(--va-teal)] text-[#07131e]')}>
              {code}
            </span>
            <span className="absolute left-1/2 top-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#07131e] px-2 py-1 text-[10px] text-white shadow-xl group-hover:block">
              {route?.folio ?? 'Ruta ' + (index + 1)} · {marker.progress}
            </span>
          </div>
        )
      })}

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="rounded-xl border border-white/10 bg-[#07131e]/90 p-3 text-xs shadow-xl">
          <p className="font-bold text-white">Cobertura metropolitana</p>
          <p className="mt-1 text-white/55">Ruta oficial · recorrido GPS · geocercas activas</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#07131e]/90 px-3 py-2 text-right text-xs shadow-xl">
          <p className="font-bold text-[var(--va-teal)]">29 de 30 transmitiendo</p>
          <p className="text-white/55">Sincronización automática</p>
        </div>
      </div>
    </div>
  )
}
