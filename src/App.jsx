// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Flame,
    Calendar,
    Edit,
    Lock,
    Plus,
    Trash2,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import logo from "./assets/logo.png";

// Firestore
import { db } from "./firebase";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

/* =============================
   LOCAL STORAGE (sadece dil için)
============================= */
const STORAGE = { LANG: "gameon_lang" };

/* =============================
   DİL METİNLERİ (EN/IT)
============================= */
const L = {
    en: {
        nav: {
            home: "Home",
            join: "Join",
            groups: "Groups",
            fixture: "Fixture",
            results: "Results",
            admin: "Admin",
        },
        home: {
            title: "⚽ Football Tournament ⚽",
            desc: "Join the tournament and fight for glory!",
            cta: "Join Now",
        },
        join: {
            title: "Team Registration",
            name: "Team Name",
            email: "Email",
            submit: "Register",
            success: "✅ Registration successful!",
        },
        groups: { title: "Group Standings" },
        fixture: { title: "Fixture" },
        results: { title: "Match Results" },
        admin: {
            title: "Admin Panel",
            passWrong: "Wrong password!",
            login: "Log In",
            addFixture: "Add Fixture",
            addResult: "Add Result",
            teams: "Teams (Edit / Delete)",
            fixtures: "Edit Fixtures",
            results: "Edit Results",
            delete: "Delete",
        },
        footerHome: "Home",
    },
    it: {
        nav: {
            home: "Home",
            join: "Iscriviti",
            groups: "Gruppi",
            fixture: "Calendario",
            results: "Risultati",
            admin: "Admin",
        },
        home: {
            title: "⚽ Torneo di Calcio ⚽",
            desc: "Partecipa al torneo e combatti per la gloria!",
            cta: "Iscriviti ora",
        },
        join: {
            title: "Registrazione Squadra",
            name: "Nome Squadra",
            email: "Email",
            submit: "Registrati",
            success: "✅ Registrazione avvenuta con successo!",
        },
        groups: { title: "Classifiche Gruppi" },
        fixture: { title: "Calendario" },
        results: { title: "Risultati Partite" },
        admin: {
            title: "Pannello Admin",
            passWrong: "Password errata!",
            login: "Accedi",
            addFixture: "Aggiungi Partita",
            addResult: "Aggiungi Risultato",
            teams: "Squadre (Modifica / Elimina)",
            fixtures: "Modifica Calendario",
            results: "Modifica Risultati",
            delete: "Elimina",
        },
        footerHome: "Home",
    },
};

/* =============================
   Firestore CRUD — tek yerde
============================= */
// Takım ekle (rastgele grup)
async function addTeam({ name, email }) {
    const letters = ["A", "B", "C"];
    const group = letters[Math.floor(Math.random() * letters.length)];
    await addDoc(collection(db, "teams"), {
        name: String(name || "").trim(),
        email: String(email || "").trim(),
        group,
        logo: "⚽",
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        points: 0,
        createdAt: Date.now(),
    });
}
async function removeTeam(teamId) {
    await deleteDoc(doc(db, "teams", teamId));
}
async function updateTeamPoints(teamId, points) {
    await updateDoc(doc(db, "teams", teamId), { points: Number(points) || 0 });
}

// Fikstür
async function addFixtureFS(newFixture) {
    await addDoc(collection(db, "fixtures"), {
        match: newFixture.match || "",
        date: newFixture.date || "",
        time: newFixture.time || "",
        createdAt: Date.now(),
    });
}
async function updateFixtureFS(id, patch) {
    await updateDoc(doc(db, "fixtures", id), patch);
}
async function removeFixtureFS(id) {
    await deleteDoc(doc(db, "fixtures", id));
}

// Sonuçlar
async function addResultFS(newResult) {
    await addDoc(collection(db, "results"), {
        home: newResult.home || "",
        away: newResult.away || "",
        homeScore: Number(newResult.hs || 0),
        awayScore: Number(newResult.as || 0),
        createdAt: Date.now(),
    });
}
async function updateResultFS(id, patch) {
    await updateDoc(doc(db, "results", id), patch);
}
async function removeResultFS(id) {
    await deleteDoc(doc(db, "results", id));
}

/* =============================
   APP (real-time snapshot’lar)
============================= */
export default function App() {
    // Dil (local)
    const [lang, setLang] = useState(() => {
        try {
            return localStorage.getItem(STORAGE.LANG) || "en";
        } catch {
            return "en";
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE.LANG, lang);
        } catch { }
    }, [lang]);

    // Firestore verileri
    const [teams, setTeams] = useState([]); // {id, name, email, group, ...}
    const [fixtures, setFixtures] = useState([]);
    const [results, setResults] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    // Gerçek zamanlı dinleme
    useEffect(() => {
        const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
            setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        const unsubFixtures = onSnapshot(collection(db, "fixtures"), (snap) => {
            setFixtures(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        const unsubResults = onSnapshot(collection(db, "results"), (snap) => {
            setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return () => {
            unsubTeams();
            unsubFixtures();
            unsubResults();
        };
    }, []);

    // UI’nin beklediği groups objesini türet
    const groups = useMemo(() => {
        const A = [],
            B = [],
            C = [];
        for (const t of teams) {
            const pack = {
                id: t.id,
                name: t.name,
                logo: t.logo ?? "⚽",
                played: t.played ?? 0,
                win: t.win ?? 0,
                draw: t.draw ?? 0,
                loss: t.loss ?? 0,
                points: t.points ?? 0,
            };
            if (t.group === "A") A.push(pack);
            else if (t.group === "B") B.push(pack);
            else if (t.group === "C") C.push(pack);
        }
        return { A, B, C };
    }, [teams]);

    return (
        <HashRouter>
            <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
                <Header lang={lang} setLang={setLang} />
                <Routes>
                    <Route path="/" element={<HomePage lang={lang} />} />
                    <Route path="/join" element={<JoinPage lang={lang} />} />
                    <Route path="/groups" element={<GroupsPage lang={lang} groups={groups} />} />
                    <Route
                        path="/fixture"
                        element={<FixturePage lang={lang} fixtures={fixtures} />}
                    />
                    <Route
                        path="/results"
                        element={<ResultsPage lang={lang} results={results} />}
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminPage
                                lang={lang}
                                isAdmin={isAdmin}
                                setIsAdmin={setIsAdmin}
                                groups={groups}
                                fixtures={fixtures}
                                results={results}
                                addTeam={addTeam}
                                removeTeam={removeTeam}
                                updateTeamPoints={updateTeamPoints}
                                addFixtureFS={addFixtureFS}
                                updateFixtureFS={updateFixtureFS}
                                removeFixtureFS={removeFixtureFS}
                                addResultFS={addResultFS}
                                updateResultFS={updateResultFS}
                                removeResultFS={removeResultFS}
                            />
                        }
                    />
                </Routes>
                <Footer lang={lang} />
            </div>
        </HashRouter>
    );
}

/* =============================
   HEADER
============================= */
function Header({ lang, setLang }) {
    const T = L[lang] ? L[lang].nav : L.en.nav;
    const [open, setOpen] = useState(false);

    const NavLink = ({ to, label }) => (
        <Link
            to={to}
            className="hover:text-orange-400 transition block"
            onClick={() => setOpen(false)}
        >
            {label}
        </Link>
    );

    return (
        <header className="sticky top-0 z-30 backdrop-blur bg-black/40 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 font-semibold tracking-wide">
                    <img src={logo} alt="logo" className="h-8 w-8 object-contain" />
                    <span className="text-lg bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                        GAMEON
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
                    <NavLink to="/" label={T.home} />
                    <NavLink to="/join" label={T.join} />
                    <NavLink to="/groups" label={T.groups} />
                    <NavLink to="/fixture" label={T.fixture} />
                    <NavLink to="/results" label={T.results} />
                    <NavLink to="/admin" label={T.admin} />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent border border-white/20 rounded-md px-2 py-1 text-xs"
                    >
                        <option value="en">EN</option>
                        <option value="it">IT</option>
                    </select>
                </nav>

                <button
                    className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    {open ? <X /> : <Menu />}
                </button>
            </div>

            {open && (
                <div className="md:hidden bg-black/90 text-center py-4 space-y-3 border-t border-white/10">
                    <div className="px-4 space-y-2">
                        <NavLink to="/" label={T.home} />
                        <NavLink to="/join" label={T.join} />
                        <NavLink to="/groups" label={T.groups} />
                        <NavLink to="/fixture" label={T.fixture} />
                        <NavLink to="/results" label={T.results} />
                        <NavLink to="/admin" label={T.admin} />
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="w-full bg-transparent border border-white/20 rounded-md px-2 py-2 text-sm"
                        >
                            <option value="en">EN</option>
                            <option value="it">IT</option>
                        </select>
                    </div>
                </div>
            )}
        </header>
    );
}

/* =============================
   FOOTER
============================= */
function Footer({ lang }) {
    const T = L[lang] ? L[lang] : L.en;
    return (
        <footer className="border-t border-white/5 mt-10">
            <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-white/60 flex items-center justify-between">
                <span>© {new Date().getFullYear()} GAMEON</span>
                <Link to="/" className="hover:text-orange-400 transition">
                    {T.footerHome}
                </Link>
            </div>
        </footer>
    );
}

/* =============================
   PAGES
============================= */
function HomePage({ lang }) {
    const T = L[lang] ? L[lang].home : L.en.home;
    return (
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
            <h1 className="text-5xl font-extrabold mb-4">{T.title}</h1>
            <p className="text-white/70 mb-8">{T.desc}</p>
            <Link
                to="/join"
                className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition inline-flex items-center gap-2"
            >
                {T.cta} <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

function JoinPage({ lang }) {
    const T = L[lang] ? L[lang].join : L.en.join;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const n = String(name || "").trim();
        const m = String(email || "").trim();
        if (!n || !m) return;
        await addTeam({ name: n, email: m });
        setName("");
        setEmail("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
    };

    return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
            <h2 className="text-3xl font-bold mb-6">{T.title}</h2>
            {success && <p className="text-green-400 mb-4">{T.success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full px-3 py-2 rounded-lg bg-white/10 focus:outline-none"
                    placeholder={T.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 focus:outline-none"
                    placeholder={T.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition"
                    type="submit"
                >
                    {T.submit}
                </button>
            </form>
        </div>
    );
}

function GroupsPage({ lang, groups }) {
    const T = L[lang] ? L[lang].groups : L.en.groups;
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl font-bold mb-8">{T.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(groups).map(([key, teams]) => (
                    <div key={key} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-semibold mb-3">Group {key}</h3>
                        <table className="w-full text-sm border-separate border-spacing-y-2">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="text-left p-1">Team</th>
                                    <th>P</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((t) => (
                                    <tr key={t.id} className="bg-white/5">
                                        <td className="flex items-center gap-2 p-1 text-left">
                                            <span>{t.logo}</span>
                                            {t.name}
                                        </td>
                                        <td className="text-center">{t.played}</td>
                                        <td className="text-center">{t.win}</td>
                                        <td className="text-center">{t.draw}</td>
                                        <td className="text-center">{t.loss}</td>
                                        <td className="text-center">{t.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FixturePage({ lang, fixtures }) {
    const T = L[lang] ? L[lang].fixture : L.en.fixture;
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-orange-400" /> {T.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {fixtures.map((f) => (
                    <div key={f.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                        <div className="font-semibold mb-2">{f.match}</div>
                        <div className="text-sm text-white/70">
                            📅 {f.date} | 🕓 {f.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResultsPage({ lang, results }) {
    const T = L[lang] ? L[lang].results : L.en.results;
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Flame className="text-orange-400" /> {T.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {results.map((m) => (
                    <div
                        key={m.id}
                        className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 flex justify-between"
                    >
                        <div className="flex gap-2 items-center">{m.home}</div>
                        <div className="font-bold">
                            {m.homeScore} - {m.awayScore}
                        </div>
                        <div className="flex gap-2 items-center">{m.away}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* =============================
   ADMIN
============================= */
function AdminPage({
    lang,
    isAdmin,
    setIsAdmin,
    groups,
    fixtures,
    results,
    addTeam,
    removeTeam,
    updateTeamPoints,
    addFixtureFS,
    updateFixtureFS,
    removeFixtureFS,
    addResultFS,
    updateResultFS,
    removeResultFS,
}) {
    const T = L[lang] ? L[lang].admin : L.en.admin;
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [newFixture, setNewFixture] = useState({ match: "", date: "", time: "" });
    const [newResult, setNewResult] = useState({ home: "", away: "", hs: "", as: "" });

    if (!isAdmin) {
        return (
            <div className="max-w-sm mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold mb-4 flex justify-center items-center gap-2">
                    <Lock className="text-orange-400" /> {T.title}
                </h2>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 px-3 py-2 rounded-lg bg-white/10 focus:outline-none"
                />
                <button
                    onClick={() => {
                        if (password === "torinospor69") setIsAdmin(true);
                        else setError(T.passWrong);
                    }}
                    className="bg-orange-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-orange-400 transition"
                >
                    {T.login}
                </button>
                {error && <p className="text-red-400 mt-3">{error}</p>}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Edit className="text-orange-400" /> {T.title}
            </h2>

            {/* Teams */}
            <section className="mb-10">
                <h3 className="font-semibold mb-3">{T.teams}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(groups).map(([gid, list]) => (
                        <div key={gid} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-lg font-semibold mb-3">Group {gid}</h4>
                            {list.length === 0 && (
                                <div className="text-white/60 text-sm">—</div>
                            )}
                            {list.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between bg-black/20 p-2 rounded-lg mb-2"
                                >
                                    <span className="truncate">{t.name}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-16 text-center bg-zinc-800 rounded-lg"
                                            value={t.points}
                                            onChange={(e) => updateTeamPoints(t.id, e.target.value)}
                                            title="Points"
                                        />
                                        <button
                                            className="text-red-400 hover:text-red-500"
                                            onClick={() => removeTeam(t.id)}
                                            title="Delete team"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* Fixtures */}
            <section className="mb-10">
                <h3 className="font-semibold mb-3">{T.addFixture}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    <input
                        value={newFixture.match}
                        onChange={(e) => setNewFixture({ ...newFixture, match: e.target.value })}
                        placeholder="Match (Team A vs Team B)"
                        className="flex-1 bg-zinc-800 rounded-lg px-3 py-2"
                    />
                    <input
                        type="date"
                        value={newFixture.date}
                        onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                        className="bg-zinc-800 rounded-lg px-3 py-2"
                    />
                    <input
                        type="time"
                        value={newFixture.time}
                        onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                        className="bg-zinc-800 rounded-lg px-3 py-2"
                    />
                    <button
                        onClick={() => {
                            if (newFixture.match) {
                                addFixtureFS(newFixture);
                                setNewFixture({ match: "", date: "", time: "" });
                            }
                        }}
                        className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg"
                    >
                        <Plus />
                    </button>
                </div>

                <h4 className="font-semibold mb-2">{L[lang].admin.fixtures}</h4>
                <div className="space-y-2">
                    {fixtures.map((f) => (
                        <div
                            key={f.id}
                            className="flex flex-wrap items-center gap-2 bg-white/5 p-3 rounded-lg"
                        >
                            <span className="flex-1 font-medium">{f.match}</span>
                            <input
                                type="date"
                                className="bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.date || ""}
                                onChange={(e) => updateFixtureFS(f.id, { date: e.target.value })}
                            />
                            <input
                                type="time"
                                className="bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.time || ""}
                                onChange={(e) => updateFixtureFS(f.id, { time: e.target.value })}
                            />
                            <button
                                className="text-red-400 hover:text-red-500"
                                onClick={() => removeFixtureFS(f.id)}
                                title={T.delete}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Results */}
            <section>
                <h3 className="font-semibold mb-3">{T.addResult}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    <input
                        value={newResult.home}
                        onChange={(e) => setNewResult({ ...newResult, home: e.target.value })}
                        placeholder="Home Team"
                        className="flex-1 bg-zinc-800 rounded-lg px-3 py-2"
                    />
                    <input
                        value={newResult.away}
                        onChange={(e) => setNewResult({ ...newResult, away: e.target.value })}
                        placeholder="Away Team"
                        className="flex-1 bg-zinc-800 rounded-lg px-3 py-2"
                    />
                    <input
                        type="number"
                        value={newResult.hs}
                        onChange={(e) => setNewResult({ ...newResult, hs: e.target.value })}
                        className="w-20 bg-zinc-800 rounded-lg px-2 py-2 text-center"
                        placeholder="H"
                    />
                    <input
                        type="number"
                        value={newResult.as}
                        onChange={(e) => setNewResult({ ...newResult, as: e.target.value })}
                        className="w-20 bg-zinc-800 rounded-lg px-2 py-2 text-center"
                        placeholder="A"
                    />
                    <button
                        onClick={() => {
                            if (newResult.home && newResult.away) {
                                addResultFS(newResult);
                                setNewResult({ home: "", away: "", hs: "", as: "" });
                            }
                        }}
                        className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg"
                    >
                        <Plus />
                    </button>
                </div>

                <h4 className="font-semibold mb-2">{L[lang].admin.results}</h4>
                <div className="space-y-2">
                    {results.map((r) => (
                        <div
                            key={r.id}
                            className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2 bg-white/5 p-3 rounded-lg"
                        >
                            <span className="truncate sm:col-span-2">
                                {r.home} vs {r.away}
                            </span>
                            <input
                                type="number"
                                className="bg-zinc-800 rounded-lg px-2 py-1 text-center"
                                value={r.homeScore ?? 0}
                                onChange={(e) => updateResultFS(r.id, { homeScore: Number(e.target.value) })}
                            />
                            <span className="text-center">-</span>
                            <input
                                type="number"
                                className="bg-zinc-800 rounded-lg px-2 py-1 text-center"
                                value={r.awayScore ?? 0}
                                onChange={(e) => updateResultFS(r.id, { awayScore: Number(e.target.value) })}
                            />
                            <button
                                className="text-red-400 hover:text-red-500 inline-flex items-center gap-1"
                                onClick={() => removeResultFS(r.id)}
                                title={T.delete}
                            >
                                <Trash2 size={18} /> {T.delete}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
