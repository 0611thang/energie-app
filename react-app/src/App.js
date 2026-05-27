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
function VerwaltungScreen({ verkaufAktiv, setVerkaufAktiv }) {
  const [preis, setPreis] = useState(0.18);

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
function VorhersageScreen() {
  const [solar, setSolar] = useState(18);
  const [verbrauch, setVerbrauch] = useState(12);
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

/* ─── Screen 4: Einstellungen ─── */
function EinstellungenScreen() {
  const [sprache, setSprache] = useState('Deutsch');
  const [darkMode, setDarkMode] = useState(false);
  const [benachrichtigungen, setBenachrichtigungen] = useState(true);
  const [pausiert, setPausiert] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex flex-col gap-4 pb-4">
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

/* ─── Screen 5: Profil ─── */
function ProfilScreen() {
  const [ziel, setZiel] = useState('Kaufen');

  return (
    <div className="flex flex-col gap-4 pb-4">
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
    </div>
  );
}

/* ─── Screen 6: Prolog KI ─── */
const empfehlungMap = {
  weiterlernen: { label: 'Weiterlernen', badge: 'text-green-600 bg-green-100',  icon: '📚' },
  atempause:    { label: 'Atempause',    badge: 'text-sky-600 bg-sky-100',      icon: '🌬️' },
  selbstcheck:  { label: 'Selbstcheck',  badge: 'text-amber-600 bg-amber-100',  icon: '🔍' },
  beobachten:   { label: 'Beobachten',   badge: 'text-orange-600 bg-orange-100', icon: '👁️' },
};
const zustandMap = {
  reguliert: { label: 'Reguliert', badge: 'text-green-600 bg-green-100' },
  erholt:    { label: 'Erholt',    badge: 'text-blue-600 bg-blue-100' },
  belastet:  { label: 'Belastet',  badge: 'text-red-600 bg-red-100' },
};
const getEmpf = k => empfehlungMap[k] || { label: k, badge: 'text-gray-600 bg-gray-100', icon: '💡' };
const getZust = k => zustandMap[k]    || { label: k, badge: 'text-gray-600 bg-gray-100' };

function PrologKIScreen({ verkaufAktiv }) {
  const [hf, setHf] = useState(52);
  const [hrv, setHrv] = useState(86);
  const [af, setAf] = useState(14.1);
  const [analyse, setAnalyse] = useState(null);
  const [empfehlungen, setEmpfehlungen] = useState(null);
  const [analyseLoading, setAnalyseLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function runAnalyse(hfVal, hrvVal, afVal) {
    setAnalyseLoading(true);
    fetch(`https://www.neuro-agile.de/prolog/learning/api/analyse?person=demo&hf=${hfVal}&hrv=${hrvVal}&af=${afVal}`)
      .then(r => r.json())
      .then(data => { setAnalyse(data); setAnalyseLoading(false); })
      .catch(() => { setFetchError('Analyse konnte nicht geladen werden.'); setAnalyseLoading(false); });
  }

  React.useEffect(() => {
    fetch('https://www.neuro-agile.de/prolog/learning/api/empfehlungen')
      .then(r => r.json())
      .then(data => { setEmpfehlungen(data.results || []); setListLoading(false); })
      .catch(() => { setFetchError('Verbindung fehlgeschlagen.'); setListLoading(false); });
    runAnalyse(52, 86, 14.1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4 pb-4">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[340px] p-3 bg-gray-800 text-white text-xs rounded-xl shadow-lg text-center">
          {toast}
        </div>
      )}
      {fetchError && (
        <div className="p-3 bg-red-50 rounded-xl text-xs text-red-600">{fetchError}</div>
      )}

      {/* Automatisch anwenden */}
      <Card>
        <button
          onClick={() => {
            if (!verkaufAktiv) {
              showToast('Aktiviere Verkauf in der Verwaltung um automatisch anzuwenden');
            }
          }}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
            verkaufAktiv
              ? 'bg-green-500 text-white active:bg-green-600'
              : 'bg-gray-200 text-gray-400 cursor-default'
          }`}
        >
          Automatisch anwenden
        </button>
      </Card>

      {/* Messwerte */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">Messwerte eingeben</p>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">Herzfrequenz (HF)</span>
              <span className="text-xs font-bold text-rose-500">{hf} bpm</span>
            </div>
            <input type="range" min={30} max={120} step={1} value={hf}
              onChange={e => setHf(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-rose-400" />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-gray-400">30</span>
              <span className="text-[10px] text-gray-400">120</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">Herzratenvariabilität (HRV)</span>
              <span className="text-xs font-bold text-purple-500">{hrv} ms</span>
            </div>
            <input type="range" min={20} max={150} step={1} value={hrv}
              onChange={e => setHrv(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-purple-400" />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-gray-400">20</span>
              <span className="text-[10px] text-gray-400">150</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">Atemfrequenz (AF)</span>
              <span className="text-xs font-bold text-teal-500">{af.toFixed(1)} /min</span>
            </div>
            <input type="range" min={8} max={30} step={0.1} value={af}
              onChange={e => setAf(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full accent-teal-400" />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-gray-400">8</span>
              <span className="text-[10px] text-gray-400">30</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => runAnalyse(hf, hrv, af)}
          disabled={analyseLoading}
          className="mt-4 w-full py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm active:bg-blue-600 transition-colors disabled:opacity-60"
        >
          {analyseLoading ? 'Analysiere…' : 'Analysieren'}
        </button>
      </Card>

      {/* Analyse-Ergebnis */}
      {analyse && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-3">Meine Analyse</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{getEmpf(analyse.empfehlung).icon}</span>
            <div className="flex flex-col gap-1.5">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full w-fit ${getEmpf(analyse.empfehlung).badge}`}>
                {getEmpf(analyse.empfehlung).label}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full w-fit ${getZust(analyse.zustand).badge}`}>
                Zustand: {getZust(analyse.zustand).label}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">
            {analyse.erklaerung}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Herzfreq.', value: `${analyse.messung.herzfrequenz} bpm`, color: 'text-rose-500' },
              { label: 'HRV',       value: `${analyse.messung.hrv} ms`,           color: 'text-purple-500' },
              { label: 'Atemfreq.', value: `${analyse.messung.atemfrequenz} /min`, color: 'text-teal-500' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-[10px] text-gray-400">{m.label}</p>
                <p className={`text-xs font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alle Empfehlungen */}
      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-3">Alle Empfehlungen</p>
        {listLoading ? (
          <p className="text-xs text-gray-400 text-center py-4">Lade Empfehlungen…</p>
        ) : empfehlungen && empfehlungen.length > 0 ? (
          <div className="flex flex-col">
            {empfehlungen.map((e, i) => {
              const cfg = getEmpf(e.empfehlung);
              return (
                <div key={i} className={`flex items-center justify-between py-2.5 ${i < empfehlungen.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cfg.icon}</span>
                    <span className="text-sm font-medium text-gray-700 capitalize">{e.person}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4">Keine Daten verfügbar</p>
        )}
      </Card>

      {/* Info */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🧠</span>
          <p className="text-sm font-semibold text-gray-700">Was ist Prolog KI?</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Die Prolog KI analysiert biometrische Messwerte – Herzfrequenz, Herzratenvariabilität und
          Atemfrequenz – und gibt personalisierte Energieempfehlungen. Die Analyse hilft dabei,
          den optimalen Lern- und Energiezustand zu erkennen.
        </p>
      </Card>
    </div>
  );
}

/* ─── Bottom Navigation ─── */
const navItems = [
  { id: 'home', label: 'Home', icon: '⚡' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'verwaltung', label: 'Verwaltung', icon: '🔧' },
  { id: 'prologki', label: 'Prolog KI', icon: '🧠' },
  { id: 'profil', label: 'Profil', icon: '👤' },
  { id: 'einstellungen', label: 'Einstellungen', icon: '⚙️' },
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
function HomeScreen({ onNavigate }) {
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
            <span className="text-xs text-green-500">Verkauf aktiv</span>
          </Card>
        </button>
        <button onClick={() => onNavigate('vorhersage')} className="active:scale-95 transition-transform col-span-2 text-left w-full">
          <Card className="flex items-center gap-4 py-4">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">KI-Vorhersage</p>
              <p className="text-xs text-gray-400">Überschuss morgen: hoch</p>
            </div>
            <span className="ml-auto text-gray-300 text-lg">›</span>
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
  home: 'SocialEnergy ⚡',
  dashboard: 'Kosten',
  verwaltung: 'Verwaltung',
  vorhersage: 'KI-Vorhersage',
  prologki: 'Prolog KI',
  profil: 'Profil',
  einstellungen: 'Einstellungen',
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [verkaufAktiv, setVerkaufAktiv] = useState(true);

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen onNavigate={setScreen} />;
      case 'dashboard': return <DashboardScreen />;
      case 'verwaltung': return <VerwaltungScreen verkaufAktiv={verkaufAktiv} setVerkaufAktiv={setVerkaufAktiv} />;
      case 'vorhersage': return <VorhersageScreen />;
      case 'prologki': return <PrologKIScreen verkaufAktiv={verkaufAktiv} />;
      case 'profil': return <ProfilScreen />;
      case 'einstellungen': return <EinstellungenScreen />;
      default: return <HomeScreen onNavigate={setScreen} />;
    }
  };

  const navActive = screen === 'vorhersage' ? 'verwaltung' : screen === 'prologki' ? 'prologki' : screen;

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
