import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

/* ─── Simulated Data ─── */
const costDataMonth = [
  { tag: '1.Mai', kosten: 2.10 }, { tag: '3.Mai', kosten: 3.40 }, { tag: '5.Mai', kosten: 1.80 },
  { tag: '7.Mai', kosten: 4.20 }, { tag: '9.Mai', kosten: 2.90 }, { tag: '11.Mai', kosten: 3.60 },
  { tag: '13.Mai', kosten: 5.10 }, { tag: '15.Mai', kosten: 2.40 }, { tag: '17.Mai', kosten: 4.80 },
  { tag: '19.Mai', kosten: 3.20 }, { tag: '21.Mai', kosten: 6.10 }, { tag: '23.Mai', kosten: 2.70 },
  { tag: '24.Mai', kosten: 1.20 },
];
const costDataWeek = [
  { tag: 'Mo', kosten: 3.20 }, { tag: 'Di', kosten: 4.50 }, { tag: 'Mi', kosten: 2.80 },
  { tag: 'Do', kosten: 3.90 }, { tag: 'Fr', kosten: 5.10 }, { tag: 'Sa', kosten: 1.40 }, { tag: 'So', kosten: 0.53 },
];
const costDataDay = [
  { tag: '6h', kosten: 0.00 }, { tag: '8h', kosten: 0.20 }, { tag: '10h', kosten: 0.45 },
  { tag: '12h', kosten: 0.80 }, { tag: '14h', kosten: 1.20 }, { tag: '16h', kosten: 1.80 },
  { tag: '18h', kosten: 2.30 }, { tag: '20h', kosten: 2.80 }, { tag: '22h', kosten: 3.10 }, { tag: '24h', kosten: 3.40 },
];
const costDataYear = [
  { tag: 'Jan', kosten: 98 }, { tag: 'Feb', kosten: 87 }, { tag: 'Mär', kosten: 102 },
  { tag: 'Apr', kosten: 91 }, { tag: 'Mai', kosten: 89 }, { tag: 'Jun', kosten: 76 },
  { tag: 'Jul', kosten: 71 }, { tag: 'Aug', kosten: 68 }, { tag: 'Sep', kosten: 83 },
  { tag: 'Okt', kosten: 95 }, { tag: 'Nov', kosten: 110 }, { tag: 'Dez', kosten: 119 },
];
const sharedEnergyData = [
  { monat: 'Feb', gekauft: 45, verkauft: 30 }, { monat: 'Mär', gekauft: 60, verkauft: 42 },
  { monat: 'Apr', gekauft: 38, verkauft: 55 }, { monat: 'Mai', gekauft: 52, verkauft: 48 },
];
const solarProductionData = [
  { tag: 'Mo', kwh: 12 }, { tag: 'Di', kwh: 15 }, { tag: 'Mi', kwh: 9 },
  { tag: 'Do', kwh: 18 }, { tag: 'Fr', kwh: 14 }, { tag: 'Sa', kwh: 20 }, { tag: 'So', kwh: 22 },
];

/* ─── Marktplatz Data ─── */
const marktplatzAnbieter = [
  { id: 'fm', name: 'Familie Müller',     kuerzel: 'FM', kwh: 12.4,  preis: 0.17, distanz: 0.3, gruen: 92,  color: '#4A90D9', mapX: 18, mapY: 22 },
  { id: 'sg', name: 'Solar Gemeinschaft', kuerzel: 'SG', kwh: 45.0,  preis: 0.15, distanz: 0.8, gruen: 98,  color: '#34D399', mapX: 50, mapY: 48 },
  { id: 'nm', name: 'Nachbar Max',        kuerzel: 'NM', kwh: 5.8,   preis: 0.19, distanz: 0.1, gruen: 85,  color: '#F97316', mapX: 72, mapY: 70 },
  { id: 'gp', name: 'GreenPower GbR',     kuerzel: 'GP', kwh: 128.0, preis: 0.14, distanz: 1.2, gruen: 100, color: '#A855F7', mapX: 80, mapY: 18 },
];

/* ─── Linear Regression ─── */
function linearRegression(data) {
  const n = data.length;
  const xs = data.map((_, i) => i);
  const ys = data.map(d => d.kwh);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  return m * n + b;
}

/* ─── Reusable UI ─── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`}>{children}</div>
);

const Toggle = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${value ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const StatCard = ({ label, value, color = 'text-blue-500' }) => (
  <Card className="flex flex-col gap-1">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-lg font-bold ${color}`}>{value}</span>
  </Card>
);

/* ─── Screen 1: Dashboard ─── */
function DashboardScreen() {
  const [period, setPeriod] = useState('Monat');
  const dataMap = { Tag: costDataDay, Woche: costDataWeek, Monat: costDataMonth, Jahr: costDataYear };
  const data = dataMap[period];
  const periods = ['Tag', 'Woche', 'Monat', 'Jahr'];

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Heute" value="0,00 €" color="text-gray-400" />
        <StatCard label="Diese Woche" value="17,43 €" />
        <StatCard label="Diesen Monat" value="89,79 €" />
        <StatCard label="Dieses Jahr" value="1.120,43 €" color="text-indigo-600" />
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Energiekosten</span>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${period === p ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="tag" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              formatter={(v) => [`${v} €`, 'Kosten']}
              contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line type="monotone" dataKey="kosten" stroke="#4A90D9" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ─── Screen 2: Verwaltung ─── */
function VerwaltungScreen({ verkaufAktiv, setVerkaufAktiv, produktion, verbrauch }) {
  const [preis, setPreis] = useState(0.18);
  const ueberschuss = Math.round(Math.max(0, produktion - verbrauch) * 10) / 10;
  const [geteilterStrom, setGeteilterStrom] = useState(() => Math.round(ueberschuss * 0.5 * 10) / 10);
  React.useEffect(() => {
    setGeteilterStrom(prev => Math.min(prev, ueberschuss));
  }, [ueberschuss]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <Toggle label="Verkauf aktiv" value={verkaufAktiv} onChange={setVerkaufAktiv} />
        <div className={`mt-3 p-2 rounded-xl ${verkaufAktiv ? 'bg-green-50' : 'bg-gray-100'}`}>
          <span className={`text-xs font-medium ${verkaufAktiv ? 'text-green-600' : 'text-gray-500'}`}>
            {verkaufAktiv ? 'Energie wird aktiv verkauft' : 'Automatische Steuerung deaktiviert'}
          </span>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Verkaufspreis</span>
          <span className="text-sm font-bold text-blue-500">{preis.toFixed(2)} €/kWh</span>
        </div>
        <input
          type="range" min={0.05} max={0.50} step={0.01} value={preis}
          onChange={e => setPreis(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full accent-blue-500"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">0,05 €</span>
          <span className="text-xs text-gray-400">0,50 €</span>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Geteilter Strom</span>
          <span className={`text-sm font-bold ${verkaufAktiv ? 'text-blue-500' : 'text-gray-400'}`}>
            {geteilterStrom.toFixed(1).replace('.', ',')} kWh
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={ueberschuss > 0 ? ueberschuss : 0.1}
          step={0.1}
          value={geteilterStrom}
          disabled={!verkaufAktiv || ueberschuss === 0}
          onChange={e => setGeteilterStrom(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-full ${verkaufAktiv ? 'accent-blue-500' : 'accent-gray-300'}`}
        />
        <div className="flex justify-between mt-1 mb-2">
          <span className="text-xs text-gray-400">0 kWh</span>
          <span className="text-xs text-gray-400">Verfügbar: {ueberschuss.toFixed(1).replace('.', ',')} kWh Überschuss</span>
        </div>
        {!verkaufAktiv ? (
          <div className="p-2 bg-gray-100 rounded-xl">
            <span className="text-xs text-gray-500">Verkauf inaktiv – Teilen deaktiviert</span>
          </div>
        ) : ueberschuss === 0 ? (
          <div className="p-2 bg-gray-100 rounded-xl">
            <span className="text-xs text-gray-500">Kein Überschuss verfügbar</span>
          </div>
        ) : geteilterStrom >= ueberschuss ? (
          <div className="p-2 bg-green-50 rounded-xl">
            <span className="text-xs font-medium text-green-600">Gesamter Überschuss wird geteilt ✓</span>
          </div>
        ) : geteilterStrom < 0.05 ? (
          <div className="p-2 bg-gray-100 rounded-xl">
            <span className="text-xs text-gray-500">Kein Strom wird geteilt</span>
          </div>
        ) : (
          <div className="p-2 bg-blue-50 rounded-xl">
            <span className="text-xs font-medium text-blue-600">{geteilterStrom.toFixed(1).replace('.', ',')} kWh wird geteilt</span>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">Basierend auf aktueller Produktion und Verbrauch</p>
      </Card>
      <Card>
        <span className="text-sm font-semibold text-gray-700 mb-3 block">Geteilte Energie (kWh)</span>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={sharedEnergyData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="monat" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="gekauft" fill="#4A90D9" radius={[4, 4, 0, 0]} name="Gekauft" />
            <Bar dataKey="verkauft" fill="#34D399" radius={[4, 4, 0, 0]} name="Verkauft" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /><span className="text-xs text-gray-500">Gekauft</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /><span className="text-xs text-gray-500">Verkauft</span></div>
        </div>
      </Card>
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Schweizer Solarmodul</p>
            <p className="text-xs text-gray-400 mt-0.5">Modell SW-400 · 400W</p>
          </div>
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Aktiv</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">Produktion diese Woche (kWh)</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={solarProductionData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="tag" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="kwh" fill="#4A90D9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ─── Screen 3: KI-Vorhersage ─── */
function VorhersageScreen({ solar, setSolar, verbrauch, setVerbrauch }) {
  const ueberschuss = Math.max(0, solar - verbrauch);
  const predicted = Math.max(0, linearRegression(solarProductionData) - verbrauch * 0.9);
  const erlos = (predicted * 0.18).toFixed(2);
  const niveau = predicted > 8 ? 'HOCH' : predicted > 4 ? 'MITTEL' : 'NIEDRIG';
  const niveauColor = predicted > 8 ? 'text-green-600 bg-green-100' : predicted > 4 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
  const gaugeValue = Math.min(100, Math.round((predicted / 25) * 100));
  const gaugeData = [{ value: gaugeValue, fill: predicted > 8 ? '#34D399' : predicted > 4 ? '#FBBF24' : '#F87171' }];

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">Eingabewerte</p>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">Solarproduktion</span>
              <span className="text-xs font-bold text-blue-500">{solar} kWh</span>
            </div>
            <input type="range" min={0} max={30} value={solar} onChange={e => setSolar(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-blue-500" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">Verbrauch</span>
              <span className="text-xs font-bold text-orange-500">{verbrauch} kWh</span>
            </div>
            <input type="range" min={0} max={30} value={verbrauch} onChange={e => setVerbrauch(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-orange-400" />
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-xl flex justify-between items-center">
          <span className="text-xs text-blue-700 font-medium">Aktueller Überschuss</span>
          <span className="text-sm font-bold text-blue-600">{ueberschuss} kWh</span>
        </div>
      </Card>
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-1">Vorhersage für morgen</p>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="70%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={gaugeData}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: '#f0f0f0' }} dataKey="value" angleAxisId={0} cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center -mt-10 mb-3">
          <p className="text-2xl font-bold text-gray-800">{predicted.toFixed(1)} kWh</p>
          <p className="text-xs text-gray-400">vorhergesagter Überschuss</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm font-semibold text-gray-700">Überschuss-Niveau:</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${niveauColor}`}>{niveau}</span>
        </div>
        <div className="p-3 bg-green-50 rounded-xl flex justify-between items-center">
          <span className="text-xs text-green-700 font-medium">Geschätzter Erlös</span>
          <span className="text-sm font-bold text-green-600">{erlos} €</span>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">💡</span>
          <p className="text-sm font-semibold text-gray-700">Wie funktioniert die Vorhersage?</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Die KI-Vorhersage verwendet eine lineare Regression auf Basis der Produktionsdaten der letzten 7 Tage.
          Aus dem Trend der Solarproduktion und dem eingegebenen Verbrauch wird der voraussichtliche Energieüberschuss
          für den nächsten Tag berechnet. Der geschätzte Erlös basiert auf dem aktuellen Verkaufspreis von 0,18 €/kWh.
        </p>
      </Card>
    </div>
  );
}

/* ─── Screen 4+5: Profil (merged) ─── */
function ProfilScreen() {
  const [ziel, setZiel] = useState('Kaufen');
  const [sprache, setSprache] = useState('Deutsch');
  const [darkMode, setDarkMode] = useState(false);
  const [benachrichtigungen, setBenachrichtigungen] = useState(true);
  const [pausiert, setPausiert] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── Top section ── */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            A
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">Alex B.</p>
            <p className="text-xs text-gray-500">Mitglied seit März 2024</p>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Verifiziert ✓</span>
          </div>
        </div>
      </Card>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Adresse</span>
          <span className="text-sm text-gray-700 font-medium">Musterstraße XY, 12345 Berlin</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">E-Mail</span>
          <span className="text-sm text-gray-700">alex.b@beispiel.de</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Netzwerk</span>
          <span className="text-sm text-gray-700 font-medium">Berliner Energienetz</span>
        </div>
      </Card>
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">Mein Ziel</p>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {['Kaufen', 'Verkaufen'].map(z => (
            <button key={z} onClick={() => setZiel(z)}
              className={`flex-1 text-sm py-2 rounded-lg font-semibold transition-colors ${ziel === z ? (z === 'Kaufen' ? 'bg-blue-500 text-white shadow-sm' : 'bg-green-500 text-white shadow-sm') : 'text-gray-500'}`}>
              {z === 'Kaufen' ? '⬇ Kaufen' : '⬆ Verkaufen'}
            </button>
          ))}
        </div>
      </Card>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Gehandelte Energie</span>
          <span className="text-sm font-bold text-blue-500">342 kWh</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Transaktionen</span>
          <span className="text-sm font-bold text-gray-700">28</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Ersparnis gesamt</span>
          <span className="text-sm font-bold text-green-600">+43,20 €</span>
        </div>
      </Card>
      <button className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm active:bg-gray-200 transition-colors">
        Abmelden
      </button>

      {/* ── Divider ── */}
      <div className="h-px bg-gray-200 mx-1" />

      {/* ── Bottom section (Einstellungen) ── */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Sprache</span>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {['Deutsch', 'Englisch'].map(s => (
              <button key={s} onClick={() => setSprache(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${sprache === s ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <Toggle label="Dark Mode" value={darkMode} onChange={setDarkMode} />
        <Toggle label="Benachrichtigungen" value={benachrichtigungen} onChange={setBenachrichtigungen} />
      </Card>
      <Card className="flex flex-col gap-4">
        <Toggle label="Konto pausieren" value={pausiert} onChange={setPausiert} />
        {pausiert && (
          <div className="p-2 bg-yellow-50 rounded-xl">
            <span className="text-xs text-yellow-700">Ihr Konto ist pausiert. Kein Handel aktiv.</span>
          </div>
        )}
      </Card>
      <Card>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm active:bg-red-100 transition-colors">
            Konto löschen
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-700 font-medium">Konto wirklich löschen?</p>
            <p className="text-xs text-gray-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">Abbrechen</button>
              <button className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm">Löschen</button>
            </div>
          </div>
        )}
      </Card>
      <div className="text-center">
        <p className="text-xs text-gray-400">SocialEnergy v1.0.0 · Datenschutz · AGB</p>
      </div>

    </div>
  );
}

/* ─── Screen 6: Prolog KI ─── */
const prologEmpfehlung = (prod, verb, batt) => {
  if (prod > verb * 1.5 && batt > 60) return 'verkaufen';
  if (verb > prod && batt < 30)        return 'kaufen';
  if (prod > verb && batt < 60)        return 'speichern';
  return 'abwarten';
};

const prologConfig = {
  verkaufen: {
    label: 'Verkaufen', icon: '↑',
    badge: 'bg-green-100 text-green-700', text: 'text-green-600',
    erklaerung: 'Hoher Überschuss erkannt. Prolog-Regel: überschuss(hoch) → verkaufen.',
  },
  kaufen: {
    label: 'Kaufen', icon: '↓',
    badge: 'bg-red-100 text-red-700', text: 'text-red-600',
    erklaerung: 'Energiebedarf erkannt. Prolog-Regel: bedarf(hoch) → kaufen.',
  },
  speichern: {
    label: 'Speichern', icon: '🔋',
    badge: 'bg-blue-100 text-blue-700', text: 'text-blue-600',
    erklaerung: 'Batterie aufladen empfohlen. Prolog-Regel: batterie(niedrig) → speichern.',
  },
  abwarten: {
    label: 'Abwarten', icon: '⏳',
    badge: 'bg-orange-100 text-orange-700', text: 'text-orange-600',
    erklaerung: 'Ausgeglichene Bilanz. Prolog-Regel: bilanz(ausgeglichen) → abwarten.',
  },
};

function PrologKIScreen({ verkaufAktiv }) {
  const [produktion,  setProduktion]  = useState(8.6);
  const [verbrauch,   setVerbrauch]   = useState(2.4);
  const [batteriestand, setBatteriestand] = useState(75);
  const [strompreis,  setStrompreis]  = useState(0.28);
  const [ergebnis,    setErgebnis]    = useState(null);
  const [toast,       setToast]       = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function startAnalyse() {
    setErgebnis(prologEmpfehlung(produktion, verbrauch, batteriestand));
  }

  const cfg         = ergebnis ? prologConfig[ergebnis] : null;
  const ueberschuss = Math.max(0, produktion - verbrauch).toFixed(1);
  const effizienz   = (produktion + verbrauch) > 0
    ? Math.round((produktion / (produktion + verbrauch)) * 100)
    : 0;

  const inputCls = "w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-300";

  return (
    <div className="flex flex-col gap-4 pb-4">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[340px] p-3 bg-gray-800 text-white text-xs rounded-xl shadow-lg text-center">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center pt-2 pb-1 gap-1">
        <span className="text-5xl">🧠</span>
        <p className="text-xl font-bold text-gray-800 mt-1">Prolog KI</p>
        <p className="text-sm text-gray-400">Biometrische Energieanalyse</p>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
        <p className="text-xs text-blue-700 leading-relaxed">
          Das KI-System analysiert deinen Energieverbrauch und gibt eine Empfehlung basierend auf Prolog-Regellogik.
        </p>
      </div>

      {/* Input card */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-4">Energiedaten eingeben</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'AKTUELLE PRODUKTION (KW)',   val: produktion,    set: setProduktion,    step: 0.1, min: 0, max: 50  },
            { label: 'AKTUELLER VERBRAUCH (KW)',    val: verbrauch,     set: setVerbrauch,     step: 0.1, min: 0, max: 50  },
            { label: 'BATTERIESTAND (%)',           val: batteriestand, set: setBatteriestand, step: 1,   min: 0, max: 100 },
            { label: 'AKTUELLER STROMPREIS (€/KWH)',val: strompreis,    set: setStrompreis,    step: 0.01,min: 0, max: 5   },
          ].map(({ label, val, set, step, min, max }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold text-gray-400 tracking-wide">{label}</p>
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={e => set(parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          ))}
        </div>
        <button
          onClick={startAnalyse}
          className="mt-5 w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm active:bg-green-600 transition-colors"
        >
          Analyse starten →
        </button>
      </Card>

      {/* Result card */}
      {ergebnis && cfg && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-3">KI-Empfehlung</p>

          {/* Badge */}
          <div className="flex justify-center my-4">
            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full ${cfg.badge}`}>
              <span className="text-2xl leading-none">{cfg.icon}</span>
              <span className={`text-lg font-bold ${cfg.text}`}>{cfg.label}</span>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 rounded-xl p-3 mb-3">
            {cfg.erklaerung}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Überschuss</p>
              <p className="text-base font-bold text-gray-800">{ueberschuss} kW</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">Effizienz</p>
              <p className="text-base font-bold text-gray-800">{effizienz}%</p>
            </div>
          </div>

          {/* Automatisch anwenden */}
          <button
            onClick={() => {
              if (!verkaufAktiv) showToast('Aktiviere Verkauf in der Verwaltung um automatisch anzuwenden');
            }}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
              verkaufAktiv ? 'bg-green-500 text-white active:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-default'
            }`}
          >
            Automatisch anwenden
          </button>
        </Card>
      )}
    </div>
  );
}

/* ─── Screen 7: Marktplatz ─── */
function MarktplatzScreen() {
  const [viewMode, setViewMode] = useState('liste');
  const [filter, setFilter] = useState('Alle');
  const [search, setSearch] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);
  const [fading, setFading] = useState(false);

  const filterTabs = ['Alle', 'Günstigste', 'Nächste', 'Grünste'];

  function switchView(v) {
    if (v === viewMode) return;
    setFading(true);
    setTimeout(() => { setViewMode(v); setSelectedPin(null); setFading(false); }, 160);
  }

  const filtered = [...marktplatzAnbieter]
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (filter === 'Günstigste') return a.preis - b.preis;
      if (filter === 'Nächste')    return a.distanz - b.distanz;
      if (filter === 'Grünste')    return b.gruen - a.gruen;
      return 0;
    });

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Anbieter suchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl shadow-sm text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-100 focus:border-blue-300"
        />
      </div>

      {/* View Toggle — segmented pill */}
      <div className="flex bg-gray-100 rounded-full p-1 gap-1">
        {[{ id: 'liste', label: '📋 Liste' }, { id: 'karte', label: '🗺️ Karte' }].map(v => (
          <button
            key={v.id}
            onClick={() => switchView(v.id)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              viewMode === v.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content with fade transition */}
      <div className={`transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        {viewMode === 'liste' ? (
          /* ── Liste View ── */
          <div className="flex flex-col gap-3">
            {filtered.map(a => (
              <Card key={a.id}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.kuerzel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.distanz} km · {a.gruen}% grün</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-blue-500">{a.preis.toFixed(2)} €/kWh</p>
                    <p className="text-xs text-gray-500">{a.kwh} kWh</p>
                  </div>
                </div>
                <button className="mt-3 w-full py-2 rounded-xl bg-green-500 text-white text-sm font-semibold active:bg-green-600 transition-colors">
                  Kaufen
                </button>
              </Card>
            ))}
          </div>
        ) : (
          /* ── Karte View ── */
          <div>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ height: 360, background: '#dff0d8' }}
              onClick={() => setSelectedPin(null)}
            >
              {/* Street grid SVG */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Background fill */}
                <rect width="100%" height="100%" fill="#e8f4e0" />
                {/* Blocks / parcels */}
                {[[5,5,38,30],[44,5,50,30],[5,37,38,28],[44,37,50,28],[5,68,38,27],[44,68,50,27]].map(([x,y,w,h],i)=>
                  <rect key={i} x={`${x}%`} y={`${y}%`} width={`${w}%`} height={`${h}%`} fill="#f0f4ee" rx="2" />
                )}
                {/* Park */}
                <rect x="57%" y="55%" width="18%" height="16%" fill="#b8dba8" rx="6" />
                <text x="66%" y="64%" textAnchor="middle" fill="#5a8a4a" fontSize="9" fontWeight="600">Park</text>
                {/* Minor streets */}
                {[20, 38, 56, 74].map(y => <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#c8d4c0" strokeWidth="1.5" />)}
                {[20, 40, 60, 80].map(x => <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#c8d4c0" strokeWidth="1.5" />)}
                {/* Main roads */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#b0bcaa" strokeWidth="4" />
                <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#b0bcaa" strokeWidth="4" />
                {/* Road center lines */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fff" strokeWidth="1" strokeDasharray="12 8" />
                <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#fff" strokeWidth="1" strokeDasharray="12 8" />
              </svg>

              {/* Map label */}
              <div className="absolute top-3 left-3 bg-white bg-opacity-85 rounded-lg px-2 py-1 z-10">
                <p className="text-xs font-semibold text-gray-600">Berlin · Berliner Energienetz</p>
              </div>

              {/* Location Pins */}
              {filtered.map(a => (
                <button
                  key={a.id}
                  onClick={e => { e.stopPropagation(); setSelectedPin(selectedPin?.id === a.id ? null : a); }}
                  className="absolute z-20 transition-transform duration-100 active:scale-110 focus:outline-none"
                  style={{ left: `${a.mapX}%`, top: `${a.mapY}%`, transform: 'translate(-50%, -100%)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white"
                    style={{
                      backgroundColor: a.color,
                      boxShadow: selectedPin?.id === a.id ? `0 0 0 3px ${a.color}55, 0 4px 12px ${a.color}66` : '0 3px 8px rgba(0,0,0,0.25)',
                    }}
                  >
                    {a.kuerzel}
                  </div>
                  {/* Pin tail */}
                  <div
                    className="mx-auto"
                    style={{
                      width: 0, height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: `8px solid ${a.color}`,
                      marginTop: -1,
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Popup card */}
            {selectedPin && (
              <Card className="mt-3 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: selectedPin.color }}
                  >
                    {selectedPin.kuerzel}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{selectedPin.name}</p>
                    <p className="text-xs text-gray-400">{selectedPin.distanz} km entfernt · {selectedPin.gruen}% grün</p>
                  </div>
                  <button onClick={() => setSelectedPin(null)} className="text-gray-300 text-base leading-none px-1">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-gray-400">Verfügbare kWh</p>
                    <p className="text-sm font-bold text-gray-700">{selectedPin.kwh} kWh</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-gray-400">Preis pro kWh</p>
                    <p className="text-sm font-bold text-blue-500">{selectedPin.preis.toFixed(2)} €</p>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold active:bg-green-600 transition-colors">
                  Kaufen
                </button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Bottom Navigation ─── */
const navItems = [
  { id: 'home',       label: 'Home',       icon: '⚡' },
  { id: 'dashboard',  label: 'Dashboard',  icon: '📊' },
  { id: 'marktplatz', label: 'Marktplatz', icon: '🛒' },
  { id: 'verwaltung', label: 'Verwaltung', icon: '🔧' },
  { id: 'prologki',   label: 'Prolog KI',  icon: '🧠' },
  { id: 'profil',     label: 'Profil',     icon: '👤' },
];

function BottomNav({ active, onSelect }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 px-2 pt-2 pb-6 z-50"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
    >
      <div className="flex justify-around">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${active === item.id ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className={`text-[10px] font-medium ${active === item.id ? 'text-blue-500' : 'text-gray-400'}`}>{item.label}</span>
            {active === item.id && <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ─── Home Screen ─── */
function HomeScreen({ onNavigate, verkaufAktiv }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">{greeting},</p>
        <p className="text-2xl font-bold mt-0.5">Alex B. 👋</p>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70">Aktueller Saldo</p>
            <p className="text-3xl font-bold mt-1">43,20 €</p>
          </div>
          <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">Berliner Energienetz</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('dashboard')} className="active:scale-95 transition-transform text-left">
          <Card className="flex flex-col items-center gap-2 py-5">
            <span className="text-3xl">📊</span>
            <span className="text-sm font-semibold text-gray-700">Kosten</span>
            <span className="text-xs text-gray-400">89,79 € diesen Monat</span>
          </Card>
        </button>
        <button onClick={() => onNavigate('verwaltung')} className="active:scale-95 transition-transform text-left">
          <Card className="flex flex-col items-center gap-2 py-5">
            <span className="text-3xl">🔧</span>
            <span className="text-sm font-semibold text-gray-700">Verwaltung</span>
            <span className={`text-xs ${verkaufAktiv ? 'text-green-500' : 'text-gray-400'}`}>
              {verkaufAktiv ? 'Verkauf aktiv' : 'Verkauf inaktiv'}
            </span>
          </Card>
        </button>
        <button onClick={() => onNavigate('prologki')} className="active:scale-95 transition-transform col-span-2 text-left w-full">
          <Card className="flex items-center gap-4 py-4">
            <span className="text-3xl">🧠</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">Prolog KI</p>
              <p className="text-xs text-gray-400">Biometrische Energieanalyse</p>
            </div>
            <span className="ml-auto text-gray-300 text-lg">›</span>
          </Card>
        </button>
      </div>
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">Letzte Transaktionen</p>
        {[
          { art: 'Verkauft', menge: '4,2 kWh', betrag: '+0,76 €', farbe: 'text-green-600', bg: 'bg-green-100', zeit: 'Heute, 13:42' },
          { art: 'Gekauft', menge: '2,8 kWh', betrag: '-0,50 €', farbe: 'text-red-500', bg: 'bg-red-100', zeit: 'Gestern, 18:15' },
          { art: 'Verkauft', menge: '6,1 kWh', betrag: '+1,10 €', farbe: 'text-green-600', bg: 'bg-green-100', zeit: '22. Mai, 11:30' },
        ].map((t, i) => (
          <div key={i} className={`flex items-center justify-between py-2.5 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full ${t.bg} flex items-center justify-center text-sm`}>
                {t.art === 'Verkauft' ? '⬆' : '⬇'}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-700">{t.art}</p>
                <p className="text-xs text-gray-400">{t.zeit}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${t.farbe}`}>{t.betrag}</p>
              <p className="text-xs text-gray-400">{t.menge}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ─── App Root ─── */
const screenTitles = {
  home:         'SocialEnergy ⚡',
  dashboard:    'Kosten',
  marktplatz:   'Marktplatz',
  verwaltung:   'Verwaltung',
  vorhersage:   'KI-Vorhersage',
  prologki:     'Prolog KI',
  profil:       'Profil',
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [verkaufAktiv, setVerkaufAktiv] = useState(true);
  const [produktion, setProduktion] = useState(8.6);
  const [verbrauch, setVerbrauch] = useState(2.4);

  const renderScreen = () => {
    switch (screen) {
      case 'home':         return <HomeScreen onNavigate={setScreen} verkaufAktiv={verkaufAktiv} />;
      case 'dashboard':    return <DashboardScreen />;
      case 'marktplatz':   return <MarktplatzScreen />;
      case 'verwaltung':   return <VerwaltungScreen verkaufAktiv={verkaufAktiv} setVerkaufAktiv={setVerkaufAktiv} produktion={produktion} verbrauch={verbrauch} />;
      case 'vorhersage':   return <VorhersageScreen solar={produktion} setSolar={setProduktion} verbrauch={verbrauch} setVerbrauch={setVerbrauch} />;
      case 'prologki':     return <PrologKIScreen verkaufAktiv={verkaufAktiv} />;
      case 'profil':       return <ProfilScreen />;
      default:             return <HomeScreen onNavigate={setScreen} verkaufAktiv={verkaufAktiv} />;
    }
  };

  const navActive = screen === 'vorhersage' ? 'verwaltung' : screen;

  return (
    <div className="min-h-screen bg-gray-200 flex items-start justify-center">
      <div className="relative w-full max-w-[390px] min-h-screen flex flex-col" style={{ background: '#F5F7FA' }}>
        {/* iOS status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-xs font-semibold text-gray-600">9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600">●●●●</span>
            <span className="text-xs font-semibold text-gray-600">100%</span>
          </div>
        </div>

        {/* Header */}
        <header className="px-5 py-3 flex items-center gap-2">
          {screen !== 'home' && (
            <button onClick={() => setScreen('home')} className="text-blue-500 font-medium text-lg leading-none mr-1">‹</button>
          )}
          <h1 className={`font-bold flex-1 ${screen === 'home' ? 'text-xl text-blue-500' : 'text-lg text-gray-900'}`}>
            {screenTitles[screen]}
          </h1>
          {screen === 'home' && (
            <button onClick={() => setScreen('profil')} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">A</button>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pb-28 overflow-y-auto">
          {renderScreen()}
        </main>

        <BottomNav active={navActive} onSelect={setScreen} />
      </div>
    </div>
  );
}
