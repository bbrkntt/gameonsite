import React, { useMemo, useState, useEffect } from "react";
import {
    Flame,
    Trophy,
    Users,
    ChevronRight,
    Calendar,
    Edit,
    Megaphone,
    Lock,
    Plus,
    Trash2,
    Home,
} from "lucide-react";
import { HashRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

/* =============================
   Local Storage Keys
============================= */
const STORAGE_KEYS = {
    TEAMS: "gameon_teams",
    FIXTURES: "gameon_fixtures",
    RESULTS: "gameon_results",
    ANNOUNCEMENTS: "gameon_announcements",
    LANG: "gameon_lang",
};

/* =============================
   Default Data
============================= */
const INITIAL_TEAMS = [
    { id: "t1", name: "Team Alpha", logo: "🦁", played: 3, win: 2, draw: 1, loss: 0, points: 7 },
    { id: "t2", name: "Team Omega", logo: "🌀", played: 3, win: 2, draw: 0, loss: 1, points: 6 },
    { id: "t3", name: "Team Blaze", logo: "🔥", played: 3, win: 1, draw: 2, loss: 0, points: 5 },
];
const INITIAL_FIXTURE = [
    { id: "f1", match: "Team Alpha vs Team Blaze", date: "2025-10-15", time: "18:00" },
    { id: "f2", match: "Team Omega vs Team Orion", date: "2025-10-16", time: "19:30" },
];
const INITIAL_RESULTS = [
    { id: "r1", home: "Team Alpha", away: "Team Omega", homeScore: 2, awayScore: 1, homeLogo: "🦁", awayLogo: "🌀" },
];

/* =============================
   Translations
============================= */
const translations = {
    tr: {
        title: "⚽ Futbol Turnuvası ⚽",
        join: "KATIL",
        matches: "MAÇLAR",
        fixture: "FİKSTÜR",
        teams: "TAKIMLAR",
        announcements: "DUYURULAR",
        admin: "Admin",
        registerTeam: "Takım Kaydı",
        success: "✅ Kayıt başarılı! Takımınız eklendi.",
        points: "Puan Durumu",
        matchResults: "Maçlar",
        adminPanel: "Admin Paneli",
        homeDesc: "Takımını kaydet, turnuvaya katıl ve liderlik için mücadele et!",
        home: "Ana Sayfa",
        addTeam: "Yeni Takım Ekle",
        editPoints: "Takım Puanları",
        addFixture: "Yeni Fikstür Ekle",
        editFixture: "Fikstürü Düzenle",
        addResult: "Yeni Maç Sonucu Ekle",
        editResult: "Maç Sonuçlarını Düzenle",
        announcementsTitle: "Duyurular",
        wrongPass: "Yanlış şifre!",
        noAnnouncements: "Henüz duyuru yok.",
    },
    en: {
        title: "⚽ Football Tournament ⚽",
        join: "JOIN",
        matches: "MATCHES",
        fixture: "FIXTURES",
        teams: "TEAMS",
        announcements: "ANNOUNCEMENTS",
        admin: "Admin",
        registerTeam: "Team Registration",
        success: "✅ Registration successful!",
        points: "Leaderboard",
        matchResults: "Matches",
        adminPanel: "Admin Panel",
        homeDesc: "Register your team, join the tournament and fight for the top!",
        home: "Home",
        addTeam: "Add New Team",
        editPoints: "Team Points",
        addFixture: "Add Fixture",
        editFixture: "Edit Fixtures",
        addResult: "Add Match Result",
        editResult: "Edit Results",
        announcementsTitle: "Announcements",
        wrongPass: "Wrong password!",
        noAnnouncements: "No announcements yet.",
    },
    it: {
        title: "⚽ Torneo di Calcio ⚽",
        join: "ISCRIVITI",
        matches: "PARTITE",
        fixture: "CALENDARIO",
        teams: "SQUADRE",
        announcements: "ANNUNCI",
        admin: "Admin",
        registerTeam: "Registrazione Squadra",
        success: "✅ Registrazione completata!",
        points: "Classifica",
        matchResults: "Partite",
        adminPanel: "Pannello Admin",
        homeDesc: "Registra la tua squadra, partecipa e lotta per la vetta!",
        home: "Home",
        addTeam: "Aggiungi Squadra",
        editPoints: "Punti Squadra",
        addFixture: "Aggiungi Calendario",
        editFixture: "Modifica Calendario",
        addResult: "Aggiungi Risultato",
        editResult: "Modifica Risultati",
        announcementsTitle: "Annunci",
        wrongPass: "Password errata!",
        noAnnouncements: "Nessun annuncio ancora.",
    },
};

/* =============================
   Main App
============================= */
export default function GameOnApp() {
    const [teams, setTeams] = useState(() => loadData(STORAGE_KEYS.TEAMS, INITIAL_TEAMS));
    const [fixtures, setFixtures] = useState(() => loadData(STORAGE_KEYS.FIXTURES, INITIAL_FIXTURE));
    const [results, setResults] = useState(() => loadData(STORAGE_KEYS.RESULTS, INITIAL_RESULTS));
    const [announcements, setAnnouncements] = useState(() => loadData(STORAGE_KEYS.ANNOUNCEMENTS, []));
    const [isAdmin, setIsAdmin] = useState(false);
    const [lang, setLang] = useState(() => loadData(STORAGE_KEYS.LANG, "tr"));

    const t = translations[lang];

    // persist
    useEffect(() => saveData(STORAGE_KEYS.TEAMS, teams), [teams]);
    useEffect(() => saveData(STORAGE_KEYS.FIXTURES, fixtures), [fixtures]);
    useEffect(() => saveData(STORAGE_KEYS.RESULTS, results), [results]);
    useEffect(() => saveData(STORAGE_KEYS.ANNOUNCEMENTS, announcements), [announcements]);
    useEffect(() => saveData(STORAGE_KEYS.LANG, lang), [lang]);

    // helpers for adds
    const addFixture = (match, date, time) =>
        setFixtures((prev) => [...prev, { id: `f-${Date.now()}`, match, date, time }]);
    const addMatchResult = (home, away, hs, as) =>
        setResults((prev) => [
            ...prev,
            { id: `r-${Date.now()}`, home, away, homeScore: Number(hs), awayScore: Number(as), homeLogo: "⚽", awayLogo: "⚽" },
        ]);

    return (
        <HashRouter>
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-900 text-white relative">
                <Header t={t} />
                <Routes>
                    <Route path="/" element={<HomePage teams={teams} t={t} />} />
                    <Route path="/join" element={<JoinPage onCreateTeam={(team) => setTeams((prev) => [team, ...prev])} t={t} />} />
                    <Route path="/matches" element={<MatchesPage results={results} t={t} />} />
                    <Route path="/fixture" element={<FixturePage fixtures={fixtures} t={t} />} />
                    <Route path="/teams" element={<TeamsPage teams={teams} t={t} />} />
                    <Route path="/announcements" element={<AnnouncementsPage announcements={announcements} t={t} />} />
                    <Route
                        path="/admin"
                        element={
                            <AdminPage
                                teams={teams}
                                fixtures={fixtures}
                                results={results}
                                announcements={announcements}
                                setTeams={setTeams}
                                setFixtures={setFixtures}
                                setResults={setResults}
                                setAnnouncements={setAnnouncements}
                                addFixture={addFixture}
                                addMatchResult={addMatchResult}
                                isAdmin={isAdmin}
                                setIsAdmin={setIsAdmin}
                                t={t}
                            />
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Footer />
                <LangSelector lang={lang} setLang={setLang} />
                <HomeButton t={t} />
            </div>
        </HashRouter>
    );
}

/* =============================
   Utils
============================= */
function loadData(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
}
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch { }
}

/* =============================
   Layout
============================= */
function Header({ t }) {
    return (
        <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/5">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
                <div className="flex items-center gap-2 font-semibold tracking-wide">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 ring-1 ring-orange-400/40">⚡</span>
                    <span className="text-lg">GAMEON</span>
                </div>
                <nav className="ml-auto hidden md:flex items-center gap-6 text-sm text-white/80">
                    <Link to="/join">{t.join}</Link>
                    <Link to="/matches">{t.matches}</Link>
                    <Link to="/fixture">{t.fixture}</Link>
                    <Link to="/teams">{t.teams}</Link>
                    <Link to="/announcements">{t.announcements}</Link>
                    <Link to="/admin">{t.admin}</Link>
                </nav>
            </div>
        </header>
    );
}
function Footer() {
    return (
        <footer className="border-t border-white/5 mt-10 text-center py-4 text-white/50 text-sm">
            © {new Date().getFullYear()} GAMEON
        </footer>
    );
}
function LangSelector({ lang, setLang }) {
    return (
        <div className="fixed bottom-4 right-4 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm flex gap-2">
            <button onClick={() => setLang("tr")} className={lang === "tr" ? "text-orange-400 font-semibold" : "text-white/70"}>🇹🇷 TR</button>
            <button onClick={() => setLang("en")} className={lang === "en" ? "text-orange-400 font-semibold" : "text-white/70"}>🇬🇧 EN</button>
            <button onClick={() => setLang("it")} className={lang === "it" ? "text-orange-400 font-semibold" : "text-white/70"}>🇮🇹 IT</button>
        </div>
    );
}
function HomeButton({ t }) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate("/")}
            className="fixed bottom-4 left-4 bg-orange-500 hover:bg-orange-400 text-black px-3 py-2 rounded-full flex items-center gap-1 shadow-lg"
        >
            <Home size={16} /> {t.home}
        </button>
    );
}

/* =============================
   Pages
============================= */
function HomePage({ teams, t }) {
    const leaderboard = useMemo(() => [...teams].sort((a, b) => b.points - a.points), [teams]);
    return (
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
            <h1 className="text-5xl font-extrabold mb-4">{t.title}</h1>
            <p className="text-white/70 mb-8">{t.homeDesc}</p>
            <Link to="/join" className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition inline-flex items-center gap-2">
                {t.join} <ChevronRight className="h-4 w-4" />
            </Link>
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 justify-center">
                    <Trophy className="text-orange-400" /> {t.points}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-separate border-spacing-y-2">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="text-left p-2">Takım</th>
                                <th>O</th>
                                <th>G</th>
                                <th>B</th>
                                <th>M</th>
                                <th>P</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((tm) => (
                                <tr key={tm.id} className="bg-white/5">
                                    <td className="flex items-center gap-2 p-2"><span>{tm.logo}</span>{tm.name}</td>
                                    <td className="text-center">{tm.played}</td>
                                    <td className="text-center">{tm.win}</td>
                                    <td className="text-center">{tm.draw}</td>
                                    <td className="text-center">{tm.loss}</td>
                                    <td className="text-center font-semibold">{tm.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function JoinPage({ onCreateTeam, t }) {
    const [teamName, setTeamName] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTeam = {
            id: `team-${Date.now()}`,
            name: teamName,
            email,
            played: 0,
            win: 0,
            draw: 0,
            loss: 0,
            points: 0,
            logo: "⚽",
        };
        onCreateTeam?.(newTeam);
        setSuccess(true);
        setTeamName("");
        setEmail("");
    };

    return (
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
            <h2 className="text-3xl font-bold mb-6">{t.registerTeam}</h2>
            {success && <p className="text-green-400 mb-4">{t.success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full px-3 py-2 rounded-lg bg-white/10 focus:outline-none" placeholder="Takım Adı" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                <input type="email" className="w-full px-3 py-2 rounded-lg bg-white/10 focus:outline-none" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition" type="submit">
                    {t.join}
                </button>
            </form>
        </div>
    );
}

function MatchesPage({ results, t }) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Flame className="text-orange-400" /> {t.matchResults}</h2>
            <div className="grid md:grid-cols-2 gap-4">
                {results.map((m) => (
                    <div key={m.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex justify-between">
                        <div className="flex gap-2 items-center"><span>{m.homeLogo}</span>{m.home}</div>
                        <div className="font-bold">{m.homeScore} - {m.awayScore}</div>
                        <div className="flex gap-2 items-center">{m.away}{m.awayLogo}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FixturePage({ fixtures, t }) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Calendar className="text-orange-400" /> {t.fixture}</h2>
            <div className="grid md:grid-cols-2 gap-4">
                {fixtures.map((f) => (
                    <div key={f.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                        <div className="font-semibold mb-2">{f.match}</div>
                        <div className="text-sm text-white/70">📅 {f.date} | 🕓 {f.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamsPage({ teams, t }) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Users className="text-orange-400" /> {t.teams}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((tm) => (
                    <div key={tm.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex items-center gap-3">
                        <span className="text-2xl">{tm.logo}</span>
                        <div>
                            <div className="font-semibold">{tm.name}</div>
                            <div className="text-xs text-white/60">O:{tm.played} G:{tm.win} P:{tm.points}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnnouncementsPage({ announcements, t }) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Megaphone className="text-orange-400" /> {t.announcementsTitle}</h2>
            {announcements.length === 0 ? (
                <p className="text-white/60">{t.noAnnouncements}</p>
            ) : (
                <div className="space-y-3">
                    {announcements.map((a) => (
                        <div key={a.id} className="bg-white/5 p-3 rounded-lg border border-white/10">{a.text}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AdminPage({
    teams,
    fixtures,
    results,
    announcements,
    setTeams,
    setFixtures,
    setResults,
    setAnnouncements,
    addFixture,
    addMatchResult,
    isAdmin,
    setIsAdmin,
    t,
}) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [newTeam, setNewTeam] = useState("");
    const [newFixture, setNewFixture] = useState({ match: "", date: "", time: "" });
    const [newMatch, setNewMatch] = useState({ home: "", away: "", hs: 0, as: 0 });
    const [announceText, setAnnounceText] = useState("");

    // auth
    if (!isAdmin) {
        const adminPass = "torinospor69";
        return (
            <div className="mx-auto max-w-sm px-4 py-20 text-center">
                <h2 className="text-3xl font-bold mb-4 flex justify-center items-center gap-2"><Lock className="text-orange-400" /> Admin</h2>
                <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 px-3 py-2 rounded-lg bg-white/10 focus:outline-none" />
                <button onClick={() => { if (password === adminPass) setIsAdmin(true); else setError(t.wrongPass); }} className="bg-orange-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-orange-400 transition">Giriş Yap</button>
                {error && <p className="text-red-400 mt-3">{error}</p>}
            </div>
        );
    }

    // team ops
    const addTeam = () =>
        setTeams((prev) => [...prev, { id: `t-${Date.now()}`, name: newTeam.trim(), logo: "⚽", played: 0, win: 0, draw: 0, loss: 0, points: 0 }]);
    const removeTeam = (id) => setTeams((prev) => prev.filter((t) => t.id !== id));
    const updatePoints = (id, p) => setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, points: Number(p) } : t)));

    // fixture ops
    const updateFixture = (id, d, tm) => setFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, date: d, time: tm } : f)));

    // result ops
    const updateResult = (id, hs, as) =>
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, homeScore: Number(hs), awayScore: Number(as) } : r)));

    // announcement ops
    const addAnnouncement = () => {
        if (!announceText.trim()) return;
        setAnnouncements((prev) => [{ id: Date.now(), text: announceText.trim() }, ...prev]);
        setAnnounceText("");
    };
    const removeAnnouncement = (id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Edit className="text-orange-400" /> {t.adminPanel}</h2>

            {/* Team Add / Remove */}
            <section className="mb-10">
                <h3 className="font-semibold mb-2">{t.addTeam}</h3>
                <div className="flex gap-2 mb-3">
                    <input value={newTeam} onChange={(e) => setNewTeam(e.target.value)} placeholder="Takım Adı" className="flex-1 bg-zinc-800 rounded-lg px-3 py-1" />
                    <button onClick={() => { if (newTeam.trim()) { addTeam(); setNewTeam(""); } }} className="bg-orange-500 hover:bg-orange-400 px-4 py-1 rounded-lg">
                        <Plus />
                    </button>
                </div>
                {teams.map((tm) => (
                    <div key={tm.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg mb-2">
                        <span className="truncate">{tm.name}</span>
                        <button className="text-red-400 hover:text-red-500" onClick={() => removeTeam(tm.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </section>

            {/* Points Edit */}
            <section className="mb-10">
                <h3 className="font-semibold mb-2">{t.editPoints}</h3>
                {teams.map((tm) => (
                    <div key={tm.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg mb-2">
                        <span>{tm.name}</span>
                        <input type="number" className="w-20 text-center bg-zinc-800 rounded-lg" value={tm.points} onChange={(e) => updatePoints(tm.id, e.target.value)} />
                    </div>
                ))}
            </section>

            {/* Add Fixture */}
            <section className="mb-10">
                <h3 className="font-semibold mb-2">{t.addFixture}</h3>
                <div className="flex gap-2 mb-3">
                    <input value={newFixture.match} onChange={(e) => setNewFixture({ ...newFixture, match: e.target.value })} placeholder="Maç (Takım A vs Takım B)" className="flex-1 bg-zinc-800 rounded-lg px-3 py-1" />
                    <input type="date" value={newFixture.date} onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })} className="bg-zinc-800 rounded-lg px-3 py-1" />
                    <input type="time" value={newFixture.time} onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })} className="bg-zinc-800 rounded-lg px-3 py-1" />
                    <button onClick={() => { if (newFixture.match.trim()) { addFixture(newFixture.match, newFixture.date, newFixture.time); setNewFixture({ match: "", date: "", time: "" }); } }} className="bg-orange-500 hover:bg-orange-400 px-4 py-1 rounded-lg">
                        <Plus />
                    </button>
                </div>

                <h4 className="font-semibold mb-2">{t.editFixture}</h4>
                {fixtures.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 justify-between bg-white/5 p-2 rounded-lg mb-2">
                        <span className="text-sm flex-1 truncate">{f.match}</span>
                        <input type="date" className="bg-zinc-800 rounded-lg px-2 py-1" value={f.date} onChange={(e) => updateFixture(f.id, e.target.value, f.time)} />
                        <input type="time" className="bg-zinc-800 rounded-lg px-2 py-1" value={f.time} onChange={(e) => updateFixture(f.id, f.date, e.target.value)} />
                    </div>
                ))}
            </section>

            {/* Add Result */}
            <section className="mb-10">
                <h3 className="font-semibold mb-2">{t.addResult}</h3>
                <div className="flex gap-2 mb-3">
                    <input value={newMatch.home} onChange={(e) => setNewMatch({ ...newMatch, home: e.target.value })} placeholder="Ev Sahibi" className="bg-zinc-800 rounded-lg px-3 py-1" />
                    <input value={newMatch.away} onChange={(e) => setNewMatch({ ...newMatch, away: e.target.value })} placeholder="Deplasman" className="bg-zinc-800 rounded-lg px-3 py-1" />
                    <input type="number" value={newMatch.hs} onChange={(e) => setNewMatch({ ...newMatch, hs: e.target.value })} className="w-16 bg-zinc-800 rounded-lg text-center" />
                    <input type="number" value={newMatch.as} onChange={(e) => setNewMatch({ ...newMatch, as: e.target.value })} className="w-16 bg-zinc-800 rounded-lg text-center" />
                    <button onClick={() => { if (newMatch.home.trim() && newMatch.away.trim()) { addMatchResult(newMatch.home, newMatch.away, Number(newMatch.hs), Number(newMatch.as)); setNewMatch({ home: "", away: "", hs: 0, as: 0 }); } }} className="bg-orange-500 hover:bg-orange-400 px-4 py-1 rounded-lg">
                        <Plus />
                    </button>
                </div>

                <h4 className="font-semibold mb-2">{t.editResult}</h4>
                {results.map((r) => (
                    <div key={r.id} className="grid grid-cols-5 items-center gap-2 bg-white/5 p-2 rounded-lg mb-2">
                        <span className="truncate">{r.home}</span>
                        <input type="number" className="bg-zinc-800 rounded-lg px-2 py-1 text-center" value={r.homeScore} onChange={(e) => updateResult(r.id, Number(e.target.value), r.awayScore)} />
                        <span className="text-center">-</span>
                        <input type="number" className="bg-zinc-800 rounded-lg px-2 py-1 text-center" value={r.awayScore} onChange={(e) => updateResult(r.id, r.homeScore, Number(e.target.value))} />
                        <span className="truncate text-right">{r.away}</span>
                    </div>
                ))}
            </section>

            {/* Announcements */}
            <section className="mb-10">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Megaphone /> {t.announcementsTitle}</h3>
                <div className="flex gap-2">
                    <input value={announceText} onChange={(e) => setAnnounceText(e.target.value)} placeholder="Yeni duyuru..." className="flex-1 bg-zinc-800 rounded-lg text-white px-3 py-2" />
                    <button className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-4 py-2 rounded-lg" onClick={addAnnouncement}>
                        {/** uses + icon could be added; text is fine */}
                        {t.addResult.split(" ")[0] /* just 'Yeni'/'Add'/'Aggiungi' look ok */}
                    </button>
                </div>
                <div className="space-y-2 mt-3">
                    {announcements.length === 0 && <p className="text-white/60">{t.noAnnouncements}</p>}
                    {announcements.map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                            <span className="mr-2">{a.text}</span>
                            <button className="text-sm px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20" onClick={() => removeAnnouncement(a.id)}>
                                Sil
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function NotFoundPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <h2 className="text-3xl font-bold mb-3">Sayfa Bulunamadı</h2>
            <p className="text-white/70 mb-6">Aradığın sayfa yok veya taşındı.</p>
            <Link to="/" className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition inline-flex items-center gap-2">
                Ana Sayfa
            </Link>
        </div>
    );
}
