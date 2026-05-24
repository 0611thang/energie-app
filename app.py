import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

st.set_page_config(
    page_title="SocialEnergy",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── CSS ──────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
  /* global */
  html, body, [data-testid="stAppViewContainer"] { background: #FFFFFF; }
  [data-testid="stSidebar"] {
    background: #F4F8FD;
    border-right: 1px solid #DDE8F5;
  }
  /* logo */
  .se-logo {
    font-size: 22px; font-weight: 800; color: #4A90D9;
    letter-spacing: -0.5px; padding: 8px 0 16px 0;
  }
  /* metric card */
  .m-card {
    background: #fff; border-radius: 14px; padding: 18px 20px;
    box-shadow: 0 2px 10px rgba(74,144,217,.10);
    border-left: 4px solid #4A90D9; margin-bottom: 4px;
  }
  .m-label { font-size: 13px; color: #8899AA; margin-bottom: 6px; }
  .m-value { font-size: 28px; font-weight: 800; color: #27AE60; }
  .m-delta { font-size: 12px; color: #27AE60; margin-top: 4px; }
  /* section title */
  .sec-title {
    font-size: 18px; font-weight: 700; color: #1A2D45; margin: 16px 0 10px 0;
  }
  /* badge */
  .badge-on {
    background: #27AE60; color: #fff; font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px; letter-spacing: .4px;
  }
  /* device card */
  .dev-card {
    background: #F4F8FD; border: 1px solid #DDE8F5; border-radius: 12px;
    padding: 16px 18px; margin-top: 8px;
  }
  .dev-name { font-size: 15px; font-weight: 700; color: #1A2D45; }
  .dev-sub  { font-size: 12px; color: #8899AA; margin-top: 2px; }
  .dev-stat-val { font-size: 16px; font-weight: 800; }
  .dev-stat-lbl { font-size: 11px; color: #8899AA; }
  /* summary strip */
  .sum-strip {
    background: #EBF5FB; border-radius: 10px; padding: 14px 20px;
    display: flex; justify-content: space-around; margin-top: 8px;
  }
  .sum-val { font-size: 20px; font-weight: 800; }
  .sum-lbl { font-size: 12px; color: #8899AA; }
  /* settings card */
  .s-card {
    background: #F4F8FD; border-radius: 12px; padding: 18px 20px;
    margin-bottom: 14px; border: 1px solid #DDE8F5;
  }
  /* danger zone */
  .danger-box {
    background: #FEF0F0; border: 1px solid #F5B7B1; border-radius: 10px;
    padding: 14px 16px; margin-bottom: 14px;
  }
  .danger-text { color: #C0392B; font-size: 13px; }
  /* delete button override */
  div[data-testid="stButton"] button.delete-btn {
    background-color: #E74C3C !important;
    color: white !important;
    border: none !important;
  }
  /* price box */
  .price-box {
    background: #EBF5FB; border-radius: 8px; padding: 12px 16px; margin-top: 6px;
  }
  .price-val { font-size: 22px; font-weight: 800; color: #4A90D9; }
  .price-mkt { font-size: 12px; color: #8899AA; margin-top: 2px; }
  /* info box */
  .info-box {
    background: #EBF5FB; border-radius: 10px; padding: 14px 16px; margin-top: 12px;
  }
  .info-title { font-weight: 700; color: #4A90D9; margin-bottom: 6px; }
  .info-body  { font-size: 13px; color: #2C3E50; line-height: 1.7; }
  /* result box */
  .res-box { background: #F4F8FD; border-radius: 10px; padding: 18px 20px; margin-top: 8px; }
  .res-level { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .res-text  { font-size: 14px; color: #2C3E50; line-height: 1.6; }
  .res-earn  { font-size: 13px; color: #8899AA; border-top: 1px solid #DDE8F5;
               padding-top: 10px; margin-top: 10px; }
  .res-earn-val { font-size: 18px; font-weight: 800; color: #27AE60; }
  /* nav radio */
  [data-testid="stRadio"] > div { gap: 4px !important; }
  [data-testid="stRadio"] label {
    background: transparent; border-radius: 8px; padding: 8px 12px;
    font-size: 14px; cursor: pointer; transition: background .15s;
  }
  [data-testid="stRadio"] label:hover { background: #DDE8F5; }
  [data-testid="stRadio"] label[data-checked="true"] {
    background: #4A90D9 !important; color: #fff !important;
  }
</style>
""", unsafe_allow_html=True)

# ── Session state defaults ────────────────────────────────────────────────────
_defaults = {
    "verkauf_aktiv": True,
    "preis_kwh": 0.15,
    "sprache": "Deutsch",
    "dark_mode": False,
    "benachrichtigungen": True,
    "konto_pausiert": False,
    "konto_loeschen_confirm": False,
}
for k, v in _defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown('<div class="se-logo">⚡ SocialEnergy</div>', unsafe_allow_html=True)
    st.markdown("---")
    seite = st.radio(
        "Seite",
        ["📊  Dashboard", "⚙️  Verwaltung", "🔧  Einstellungen", "🤖  KI-Vorhersage"],
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.markdown(
        '<div style="font-size:11px;color:#AAB8C8;padding:6px 0;">v1.0 · © 2026 SocialEnergy</div>',
        unsafe_allow_html=True,
    )

# ── Data helpers ──────────────────────────────────────────────────────────────
def may_daily():
    dates = pd.date_range("2026-05-01", "2026-05-24")
    rng = np.random.default_rng(42)
    costs = rng.uniform(1.8, 4.8, len(dates))
    savings = rng.uniform(0.6, 2.2, len(dates))
    return pd.DataFrame({"Datum": dates, "Kosten": costs, "Ersparnisse": savings})

def week_data():
    days = pd.date_range("2026-05-18", "2026-05-24")
    rng = np.random.default_rng(21)
    costs = rng.uniform(1.5, 4.5, len(days))
    savings = rng.uniform(0.5, 2.0, len(days))
    return pd.DataFrame({"Datum": days, "Kosten": costs, "Ersparnisse": savings})

def hour_data():
    hours = pd.date_range("2026-05-24 00:00", "2026-05-24 23:00", freq="h")
    rng = np.random.default_rng(7)
    costs = rng.uniform(0.04, 0.28, len(hours))
    savings = costs * rng.uniform(0.3, 0.5, len(hours))
    return pd.DataFrame({"Zeit": hours, "Kosten": costs, "Ersparnisse": savings})

def year_data():
    months = pd.date_range("2026-01-01", "2026-05-01", freq="MS")
    rng = np.random.default_rng(3)
    costs = rng.uniform(28, 72, len(months))
    savings = costs * rng.uniform(0.28, 0.42, len(months))
    return pd.DataFrame({"Monat": months, "Kosten": costs, "Ersparnisse": savings})

def monthly_shared():
    return pd.DataFrame({
        "Monat": ["Jan", "Feb", "Mär", "Apr", "Mai"],
        "kWh": [45, 52, 68, 71, 85],
    })

CHART_LAYOUT = dict(
    plot_bgcolor="white", paper_bgcolor="white",
    font=dict(family="Inter, sans-serif", size=13),
    hovermode="x unified",
    xaxis=dict(showgrid=True, gridcolor="#F0F4F8", zeroline=False),
    yaxis=dict(showgrid=True, gridcolor="#F0F4F8", zeroline=False),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    margin=dict(l=10, r=10, t=34, b=10),
    height=390,
)

def area_chart(df, x_col, title):
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df[x_col], y=df["Kosten"],
        name="Kosten (€)",
        line=dict(color="#E74C3C", width=2.5),
        fill="tozeroy", fillcolor="rgba(231,76,60,.07)",
    ))
    fig.add_trace(go.Scatter(
        x=df[x_col], y=df["Ersparnisse"],
        name="Ersparnisse (€)",
        line=dict(color="#27AE60", width=2.5),
        fill="tozeroy", fillcolor="rgba(39,174,96,.07)",
    ))
    fig.update_layout(**CHART_LAYOUT, title=dict(text=title, font=dict(size=15, color="#1A2D45")))
    fig.update_yaxes(title_text="€")
    return fig

# ═══════════════════════════════════════════════════════════════════════════════
# 1 · DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
if "Dashboard" in seite:
    st.markdown("## 📊 Dashboard – Kosten & Ersparnisse")
    st.caption("Ihre persönliche Energieübersicht auf einen Blick")
    st.markdown("---")

    # Savings cards
    c1, c2, c3, c4 = st.columns(4)
    metrics = [
        ("💰 Heute", "1,42 €", "▲ 12 % vs. gestern"),
        ("📅 Diese Woche", "7,85 €", "▲ 8 % vs. Vorwoche"),
        ("🗓️ Diesen Monat", "28,60 €", "▲ 15 % vs. Vormonat"),
        ("📆 Dieses Jahr", "214,30 €", "▲ 23 % vs. Vorjahr"),
    ]
    for col, (lbl, val, delta) in zip([c1, c2, c3, c4], metrics):
        col.markdown(
            f'<div class="m-card">'
            f'<div class="m-label">{lbl}</div>'
            f'<div class="m-value">{val}</div>'
            f'<div class="m-delta">{delta}</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # Time-range toggle
    tz_left, tz_right = st.columns([4, 1])
    with tz_right:
        view = st.selectbox("Zeitraum", ["Tag", "Woche", "Monat", "Jahr"], index=2, label_visibility="collapsed")

    if view == "Tag":
        df = hour_data(); df.rename(columns={"Zeit": "x"}, inplace=True)
        fig = area_chart(df.rename(columns={"x": "Zeit", "Kosten": "Kosten", "Ersparnisse": "Ersparnisse"}),
                         "Zeit", f"Energiekosten – Tagesansicht (24. Mai 2026)")
    elif view == "Woche":
        df = week_data()
        fig = area_chart(df, "Datum", "Energiekosten – Wochenansicht (KW 21)")
    elif view == "Monat":
        df = may_daily()
        fig = area_chart(df, "Datum", "Energiekosten – Mai 2026")
    else:
        df = year_data()
        fig = area_chart(df, "Monat", "Energiekosten – Jahresansicht 2026")

    with tz_left:
        st.markdown(f'<div class="sec-title">Energiekosten – {view}sansicht</div>', unsafe_allow_html=True)
    st.plotly_chart(fig, use_container_width=True)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 · VERWALTUNG
# ═══════════════════════════════════════════════════════════════════════════════
elif "Verwaltung" in seite:
    st.markdown("## ⚙️ Verwaltung")
    st.caption("Energieverkauf steuern, Preis festlegen und Geräte verwalten")
    st.markdown("---")

    left, right = st.columns([1, 1.4])

    with left:
        st.markdown('<div class="sec-title">⚡ Verkaufseinstellungen</div>', unsafe_allow_html=True)

        verkauf = st.toggle("Verkauf aktiv", value=st.session_state.verkauf_aktiv)
        st.session_state.verkauf_aktiv = verkauf
        if verkauf:
            st.success("✅ Ihr Energieverkauf ist aktiv")
        else:
            st.warning("⏸️ Verkauf ist pausiert")

        st.markdown("---")
        st.markdown("**Preis pro kWh festlegen**")
        preis = st.slider(
            "Preis", 0.05, 0.50, st.session_state.preis_kwh, 0.01,
            format="%.2f €", label_visibility="collapsed",
        )
        st.session_state.preis_kwh = preis
        st.markdown(
            f'<div class="price-box">'
            f'<div class="price-val">{preis:.2f} € / kWh</div>'
            f'<div class="price-mkt">Marktpreis: 0,19 € / kWh</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

        st.markdown("---")
        st.markdown('<div class="sec-title">🔌 Gefundenes Gerät</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="dev-card">'
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;">'
            '<div>'
            '<div class="dev-name">☀️ Solaranlage V2</div>'
            '<div class="dev-sub">Modell: SunPower SPR-400 &nbsp;|&nbsp; ID: SP-2024-0047</div>'
            '</div>'
            '<span class="badge-on">● Aktiv</span>'
            '</div>'
            '<div style="display:flex;gap:28px;margin-top:14px;">'
            '<div><div class="dev-stat-val" style="color:#4A90D9;">3,8 kW</div><div class="dev-stat-lbl">Aktuelle Leistung</div></div>'
            '<div><div class="dev-stat-val" style="color:#27AE60;">18,4 kWh</div><div class="dev-stat-lbl">Heute erzeugt</div></div>'
            '<div><div class="dev-stat-val" style="color:#E67E22;">12,1 kWh</div><div class="dev-stat-lbl">Heute verkauft</div></div>'
            '</div>'
            '</div>',
            unsafe_allow_html=True,
        )

    with right:
        st.markdown('<div class="sec-title">📊 Geteilte Energie pro Monat</div>', unsafe_allow_html=True)

        df_m = monthly_shared()
        fig_bar = go.Figure(go.Bar(
            x=df_m["Monat"], y=df_m["kWh"],
            marker=dict(
                color=df_m["kWh"],
                colorscale=[[0, "#87CEEB"], [1, "#1A5276"]],
                showscale=False,
                line=dict(width=0),
            ),
            text=[f"{v} kWh" for v in df_m["kWh"]],
            textposition="outside",
            hovertemplate="%{x}: <b>%{y} kWh</b><extra></extra>",
        ))
        fig_bar.update_layout(
            plot_bgcolor="white", paper_bgcolor="white",
            xaxis=dict(showgrid=False),
            yaxis=dict(showgrid=True, gridcolor="#F0F4F8", title="kWh"),
            height=340, margin=dict(l=10, r=10, t=16, b=10),
            font=dict(family="Inter, sans-serif", size=13),
        )
        st.plotly_chart(fig_bar, use_container_width=True)

        total_kwh = int(df_m["kWh"].sum())
        total_eur = total_kwh * st.session_state.preis_kwh
        st.markdown(
            f'<div class="sum-strip">'
            f'<div style="text-align:center;"><div class="sum-val" style="color:#4A90D9;">{total_kwh} kWh</div><div class="sum-lbl">Gesamt geteilt</div></div>'
            f'<div style="text-align:center;"><div class="sum-val" style="color:#27AE60;">{total_eur:.2f} €</div><div class="sum-lbl">Gesamteinnahmen</div></div>'
            f'<div style="text-align:center;"><div class="sum-val" style="color:#E67E22;">5</div><div class="sum-lbl">Nachbarn beliefert</div></div>'
            f'</div>',
            unsafe_allow_html=True,
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 3 · EINSTELLUNGEN
# ═══════════════════════════════════════════════════════════════════════════════
elif "Einstellungen" in seite:
    st.markdown("## 🔧 Einstellungen")
    st.caption("App-Einstellungen und Kontoverwaltung")
    st.markdown("---")

    left, right = st.columns(2)

    with left:
        # Language
        st.markdown('<div class="sec-title">🌐 Sprache & Erscheinungsbild</div>', unsafe_allow_html=True)
        with st.container():
            st.markdown('<div class="s-card">', unsafe_allow_html=True)
            sprache = st.radio(
                "Sprache / Language",
                ["🇩🇪  Deutsch", "🇬🇧  Englisch"],
                index=0 if st.session_state.sprache == "Deutsch" else 1,
                horizontal=True,
            )
            st.session_state.sprache = "Deutsch" if "Deutsch" in sprache else "Englisch"
            st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Dark mode
        with st.container():
            st.markdown('<div class="s-card">', unsafe_allow_html=True)
            dm = st.toggle("🌙  Dark Mode", value=st.session_state.dark_mode)
            st.session_state.dark_mode = dm
            if dm:
                st.info("Dark Mode ist aktiviert – Neustart erforderlich für vollständige Wirkung.")
            st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Notifications
        st.markdown('<div class="sec-title">🔔 Benachrichtigungen</div>', unsafe_allow_html=True)
        with st.container():
            st.markdown('<div class="s-card">', unsafe_allow_html=True)
            bn = st.toggle("Push-Benachrichtigungen aktivieren", value=st.session_state.benachrichtigungen)
            st.session_state.benachrichtigungen = bn
            if bn:
                st.markdown(
                    '<div style="font-size:13px;color:#558BAA;margin-top:6px;line-height:2;">'
                    "✓ Neue Handelsanfragen<br>"
                    "✓ Tagesberichte<br>"
                    "✓ Preisänderungen<br>"
                    "✓ Gerätestatus"
                    "</div>",
                    unsafe_allow_html=True,
                )
            st.markdown("</div>", unsafe_allow_html=True)

    with right:
        st.markdown('<div class="sec-title">👤 Kontoverwaltung</div>', unsafe_allow_html=True)

        st.markdown(
            '<div class="s-card">'
            '<div style="font-size:15px;font-weight:700;color:#1A2D45;margin-bottom:10px;">Kontodetails</div>'
            '<div style="font-size:14px;color:#445566;line-height:2.1;">'
            "👤&nbsp; Max Mustermann<br>"
            "📧&nbsp; max.mustermann@example.de<br>"
            "📍&nbsp; Musterstraße 12, 10115 Berlin<br>"
            "📅&nbsp; Mitglied seit: Januar 2025"
            "</div></div>",
            unsafe_allow_html=True,
        )

        st.markdown("<br>", unsafe_allow_html=True)

        # Pause
        with st.container():
            st.markdown('<div class="s-card">', unsafe_allow_html=True)
            kp = st.toggle("⏸️  Konto pausieren", value=st.session_state.konto_pausiert)
            st.session_state.konto_pausiert = kp
            if kp:
                st.warning("⚠️ Ihr Konto ist pausiert. Alle Handelsaktivitäten sind gestoppt.")
            st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Danger zone
        st.markdown('<div class="sec-title" style="color:#C0392B;">⚠️ Gefahrenzone</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="danger-box">'
            '<div class="danger-text"><strong>Konto löschen</strong><br>'
            "Alle Daten werden unwiderruflich gelöscht. "
            "Diese Aktion kann nicht rückgängig gemacht werden."
            "</div></div>",
            unsafe_allow_html=True,
        )
        st.markdown("""
        <style>
        div[data-testid="stButton"]:has(button[kind="primary"].konto-del) button {
            background-color: #E74C3C !important; border-color: #E74C3C !important;
        }
        </style>
        """, unsafe_allow_html=True)
        if st.button("🗑️  Konto löschen", type="primary", use_container_width=True, key="del_btn"):
            st.error("⚠️ Diese Funktion ist in der Demo-Version deaktiviert.")


# ═══════════════════════════════════════════════════════════════════════════════
# 4 · KI-VORHERSAGE
# ═══════════════════════════════════════════════════════════════════════════════
elif "KI-Vorhersage" in seite:
    st.markdown("## 🤖 KI-Vorhersage – Energieüberschuss")
    st.caption("Prognose des verfügbaren Überschuss-Energieertrags für morgen")
    st.markdown("---")

    left, right = st.columns([1, 1.25])

    with left:
        st.markdown('<div class="sec-title">☀️ Heutige Eingabedaten</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="info-box"><div class="info-body">'
            "Das KI-Modell analysiert Ihre heutige Solarproduktion und den Verbrauch, "
            "um den Energieüberschuss für morgen vorherzusagen."
            "</div></div>",
            unsafe_allow_html=True,
        )
        st.markdown("<br>", unsafe_allow_html=True)

        solar = st.slider("☀️ Heutige Solarproduktion (kWh)", 0.0, 30.0, 18.5, 0.5)
        verbrauch = st.slider("🏠 Heutiger Verbrauch (kWh)", 0.0, 20.0, 8.2, 0.5)

        ueberschuss_heute = max(0.0, solar - verbrauch)
        st.markdown(
            f'<div style="background:#EAFAF1;border-radius:8px;padding:12px 16px;margin:12px 0;">'
            f'<span style="color:#1E8449;font-size:14px;">Aktueller Überschuss heute: '
            f'<strong>{ueberschuss_heute:.1f} kWh</strong></span></div>',
            unsafe_allow_html=True,
        )

        # Train linear regression on synthetic history
        rng = np.random.default_rng(42)
        X_hist = np.column_stack([rng.uniform(4, 28, 120), rng.uniform(3, 16, 120)])
        y_hist = np.maximum(0, X_hist[:, 0] - X_hist[:, 1] + rng.normal(0, 0.4, 120))
        model = LinearRegression().fit(X_hist, y_hist)

        # Tomorrow: slight weather variance
        X_pred = np.array([[solar * 0.93, verbrauch * 1.04]])
        vorhersage = float(max(0.0, model.predict(X_pred)[0]))

        st.markdown("---")
        st.markdown('<div class="sec-title">📋 Modell-Informationen</div>', unsafe_allow_html=True)
        st.markdown(
            '<div style="font-size:13px;color:#2C3E50;line-height:2.1;">'
            "🤖&nbsp; <strong>Algorithmus:</strong> Lineare Regression (scikit-learn)<br>"
            "📈&nbsp; <strong>Trainingsdaten:</strong> 120 historische Tage<br>"
            "🎯&nbsp; <strong>Merkmale:</strong> Solarproduktion, Verbrauch<br>"
            "📅&nbsp; <strong>Vorhersage für:</strong> Morgen, 25.05.2026<br>"
            "🌤️&nbsp; <strong>Wetterprognose:</strong> Teilweise bewölkt (–7 %)"
            "</div>",
            unsafe_allow_html=True,
        )

    with right:
        st.markdown('<div class="sec-title">🎯 Vorhersageergebnis</div>', unsafe_allow_html=True)

        # Gauge chart
        fig_g = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=vorhersage,
            delta={"reference": ueberschuss_heute, "relative": False,
                   "increasing": {"color": "#27AE60"}, "decreasing": {"color": "#E74C3C"}},
            number={"suffix": " kWh", "font": {"size": 40, "color": "#4A90D9"}},
            title={"text": "Überschuss morgen (kWh)", "font": {"size": 14, "color": "#1A2D45"}},
            gauge={
                "axis": {"range": [0, 25], "tickwidth": 1, "tickcolor": "#AAB8C8",
                         "nticks": 6},
                "bar": {"color": "#4A90D9", "thickness": 0.22},
                "bgcolor": "white",
                "borderwidth": 2,
                "bordercolor": "#DDE8F5",
                "steps": [
                    {"range": [0,  5], "color": "#FDEBD0"},
                    {"range": [5, 10], "color": "#D5EFD4"},
                    {"range": [10, 18], "color": "#C8E6F8"},
                    {"range": [18, 25], "color": "#A9D8F5"},
                ],
                "threshold": {
                    "line": {"color": "#27AE60", "width": 4},
                    "thickness": 0.8,
                    "value": vorhersage,
                },
            },
        ))
        fig_g.update_layout(
            paper_bgcolor="white",
            font=dict(family="Inter, sans-serif", size=13),
            height=300,
            margin=dict(l=30, r=30, t=36, b=10),
        )
        st.plotly_chart(fig_g, use_container_width=True)

        # Level & recommendation
        if vorhersage < 3:
            niveau, farbe = "Niedrig", "#E67E22"
            empfehlung = "Morgen wird wenig Überschuss erwartet. Planen Sie Ihren Verbrauch entsprechend."
        elif vorhersage < 8:
            niveau, farbe = "Mittel", "#F1C40F"
            empfehlung = "Moderater Überschuss erwartet. Gute Bedingungen für lokalen Energiehandel."
        elif vorhersage < 15:
            niveau, farbe = "Hoch", "#27AE60"
            empfehlung = "Guter Überschuss! Optimale Bedingungen für den Energieverkauf an Nachbarn."
        else:
            niveau, farbe = "Sehr hoch", "#4A90D9"
            empfehlung = "Ausgezeichneter Überschuss! Maximaler Energieverkauf an Nachbarn möglich."

        erloes = vorhersage * st.session_state.preis_kwh
        st.markdown(
            f'<div class="res-box">'
            f'<div class="res-level" style="color:{farbe};">Überschuss-Niveau: {niveau.upper()}</div>'
            f'<div class="res-text">{empfehlung}</div>'
            f'<div class="res-earn">Geschätzter Erlös bei {st.session_state.preis_kwh:.2f} €/kWh:&nbsp;'
            f'<span class="res-earn-val">{erloes:.2f} €</span></div>'
            f'</div>',
            unsafe_allow_html=True,
        )

        # Explanation
        st.markdown(
            '<div class="info-box" style="margin-top:14px;">'
            '<div class="info-title">ℹ️ Wie funktioniert die Vorhersage?</div>'
            '<div class="info-body">'
            "Das KI-Modell nutzt <strong>Lineare Regression</strong> auf Basis von 120 "
            "historischen Solardaten. Es berücksichtigt:<br>"
            "• Heutige Solarproduktion (kWh)<br>"
            "• Heutigen Energieverbrauch (kWh)<br>"
            "• Saisonale Wetterkorrektur (–7 %)<br><br>"
            "Die Vorhersage dient als Orientierungshilfe. Tatsächliche Werte können "
            "wetterbedingt abweichen."
            "</div></div>",
            unsafe_allow_html=True,
        )
