// src/App.jsx
import React, { useState, useEffect } from "react";
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

// FIREBASE
import { db } from "./firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

/* =============================
   STORAGE KEYS
============================= */
const STORAGE = {
    GROUPS: "gameon_groups",
    FIXTURES: "gameon_fixtures",
    RESULTS: "gameon_results",
    LANG: "gameon_lang",
};

/* =============================
   DEFAULT DATA (NOW EMPTY)
============================= */
const INITIAL_GROUPS = {
    A: [],
    B: [],
    C: [],
};

const INITIAL_FIXTURES = [
    { id: "f1", match: "Team Alpha vs Team Bravo", date: "2025-10-15", time: "18:00" },
    { id: "f2", match: "Team Eagle vs Team Hawk", date: "2025-10-16", time: "19:30" },
];

const INITIAL_RESULTS = [
    { id: "r1", home: "Team Alpha", away: "Team Bravo", homeScore: 2, awayScore: 1 },
    { id: "r2", home: "Team Inferno", away: "Team Lava", homeScore: 1, awayScore: 1 },
];

/* =============================
   LANGUAGES (EN / IT)
============================= */
const L = {
    en: {
        nav: { home: "Home", groups: "Groups", fixture: "Fixture", results: "Results", admin: "Admin" },
        home: { title: "⚽ Football Tournament ⚽", desc: "Join the tournament and fight for glory!", cta: "View Groups" },
        groups: { title: "Group Standings" },
        fixture: { title: "Fixture" },
        results: { title: "Match Results" },
        admin: {
            title: "Admin Panel",
            passWrong: "Wrong password!",
            login: "Log In",
            addFixture: "Add Fixture",
            addResult: "Add Result",
            teams: "Teams (Add / Edit / Delete)",
            fixtures: "Edit Fixtures",
            results: "Edit Results",
            delete: "Delete",
            addTeam: "Add Team",
            teamName: "Team Name",
            group: "Group",
            add: "Add",
            clearAll: "Clear All Groups",
            cleared: "All groups cleared.",
        },
        footerHome: "Home",
    },
    it: {
        nav: { home: "Home", groups: "Gruppi", fixture: "Calendario", results: "Risultati", admin: "Admin" },
        home: { title: "⚽ Torneo di Calcio ⚽", desc: "Partecipa al torneo e combatti per la gloria!", cta: "Vedi Gruppi" },
        groups: { title: "Classifiche Gruppi" },
        fixture: { title: "Calendario" },
        results: { title: "Risultati Partite" },
        admin: {
            title: "Pannello Admin",
            passWrong: "Password errata!",
            login: "Accedi",
            addFixture: "Aggiungi Partita",
            addResult: "Aggiungi Risultato",
            teams: "Squadre (Aggiungi / Modifica / Elimina)",
            fixtures: "Modifica Calendario",
            results: "Modifica Risultati",
            delete: "Elimina",
            addTeam: "Aggiungi Squadra",
            teamName: "Nome Squadra",
            group: "Gruppo",
            add: "Aggiungi",
            clearAll: "Cancella Tutti i Gruppi",
            cleared: "Tutti i gruppi cancellati.",
        },
        footerHome: "Home",
    },
};

/* =============================
   HELPERS (Lang)
============================= */
function getInitialLang() {
    try {
        const v = localStorage.getItem(STORAGE.LANG);
        return v || "en";
    } catch {
        return "en";
    }
}
function saveLangLocal(lang) {
    try {
        localStorage.setItem(STORAGE.LANG, lang);
    } catch { }
}

/* =============================
   Firestore LOAD
============================= */
async function loadFirestoreArray(key, fallback) {
    try {
        const snap = await getDocs(collection(db, key));
        if (snap.empty) return fallback;
        const arr = [];
        snap.forEach((d) => arr.push(d.data()));
        return arr;
    } catch (e) {
        console.error("Firestore load error:", e);
        return fallback;
    }
}

async function loadFirestoreGroups(fallback) {
    try {
        const snap = await getDocs(collection(db, STORAGE.GROUPS));
        if (snap.empty) return fallback;
        const out = { A: [], B: [], C: [] };
        snap.forEach((d) => {
            const td = d.data();
            const g = td.group || "A";
            if (!out[g]) out[g] = [];
            out[g].push({ ...td });
        });
        return out;
    } catch (e) {
        console.error("Firestore load error:", e);
        return fallback;
    }
}

/* =============================
   Firestore SAVE (Replace sync)
============================= */
async function saveFirestoreGroupsReplacing(groupsObj) {
    try {
        // hedef id set’i
        const wantIds = new Set();
        for (const [gid, list] of Object.entries(groupsObj || {})) {
            for (const t of (Array.isArray(list) ? list : [])) {
                if (t?.id) wantIds.add(t.id);
            }
        }
        // fazlalıkları sil
        const snap = await getDocs(collection(db, STORAGE.GROUPS));
        const deletes = [];
        snap.forEach((d) => {
            if (!wantIds.has(d.id)) deletes.push(deleteDoc(doc(db, STORAGE.GROUPS, d.id)));
        });
        await Promise.all(deletes);
        // istenenleri yaz
        const writes = [];
        for (const [gid, list] of Object.entries(groupsObj || {})) {
            for (const t of (Array.isArray(list) ? list : [])) {
                const payload = { ...t, group: gid };
                writes.push(setDoc(doc(db, STORAGE.GROUPS, t.id), payload, { merge: false }));
            }
        }
        await Promise.all(writes);
    } catch (e) {
        console.error("Firestore save groups error:", e);
    }
}

async function saveFirestoreArray(key, dataArray) {
    try {
        // küçük dataset için basit yöntem: sil & baştan yaz
        const snap = await getDocs(collection(db, key));
        const dels = [];
        snap.forEach((d) => dels.push(deleteDoc(doc(db, key, d.id))));
        await Promise.all(dels);

        const writes = [];
        for (const item of (Array.isArray(dataArray) ? dataArray : [])) {
            const id = item.id || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            writes.push(setDoc(doc(db, key, id), { ...item, id }, { merge: false }));
        }
        await Promise.all(writes);
    } catch (e) {
        console.error("Firestore save array error:", e);
    }
}

/* =============================
   Error Boundary
============================= */
function ErrorBoundary({ children }) {
    const [err, setErr] = React.useState(null);
    useEffect(() => {
        const onError = (event) => setErr(event.reason || event.error || event.message || "Unknown error");
        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onError);
        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onError);
        };
    }, []);
    if (err) {
        return (
            <div className="p-6 max-w-2xl mx-auto text-red-300">
                <h2 className="text-xl font-semibold mb-2">Something went wrong on this page.</h2>
                <pre className="text-sm whitespace-pre-wrap bg-white/5 p-3 rounded-lg border border-white/10">
                    {String(err)}
                </pre>
                <Link to="/" className="inline-block mt-4 px-4 py-2 rounded-lg bg-orange-500 text-black">Back to Home</Link>
            </div>
        );
    }
    return children;
}

/* =============================
   APP
============================= */
export default function App() {
    const [lang, setLang] = useState(getInitialLang());
    const [groups, setGroups] = useState(INITIAL_GROUPS);
    const [fixtures, setFixtures] = useState(INITIAL_FIXTURES);
    const [results, setResults] = useState(INITIAL_RESULTS);
    const [isAdmin, setIsAdmin] = useState(false);

    // İlk yükleme: Firestore’dan çek (boş fallback ile)
    useEffect(() => {
        async function fetchAll() {
            const empty = { A: [], B: [], C: [] };
            const [g, fxt, res] = await Promise.all([
                loadFirestoreGroups(empty),
                loadFirestoreArray(STORAGE.FIXTURES, INITIAL_FIXTURES),
                loadFirestoreArray(STORAGE.RESULTS, INITIAL_RESULTS),
            ]);
            setGroups(g);
            setFixtures(fxt);
            setResults(res);
        }
        fetchAll();
    }, []);

    // Dil local
    useEffect(() => {
        saveLangLocal(lang);
    }, [lang]);

    // Senkronlar (Replace)
    useEffect(() => {
        async function sync() { await saveFirestoreGroupsReplacing(groups); }
        sync();
    }, [groups]);

    useEffect(() => {
        async function sync() { await saveFirestoreArray(STORAGE.FIXTURES, fixtures); }
        sync();
    }, [fixtures]);

    useEffect(() => {
        async function sync() { await saveFirestoreArray(STORAGE.RESULTS, results); }
        sync();
    }, [results]);

    return (
        <HashRouter>
            <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
                <Header lang={lang} setLang={setLang} />
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<HomePage lang={lang} />} />
                        <Route path="/groups" element={<GroupsPage lang={lang} groups={groups} />} />
                        <Route path="/fixture" element={<FixturePage lang={lang} fixtures={fixtures} />} />
                        <Route path="/results" element={<ResultsPage lang={lang} results={results} />} />
                        <Route
                            path="/admin"
                            element={
                                <AdminPage
                                    lang={lang}
                                    isAdmin={isAdmin}
                                    setIsAdmin={setIsAdmin}
                                    groups={groups}
                                    setGroups={setGroups}
                                    fixtures={fixtures}
                                    setFixtures={setFixtures}
                                    results={results}
                                    setResults={setResults}
                                />
                            }
                        />
                    </Routes>
                </ErrorBoundary>
                <Footer lang={lang} />
            </div>
        </HashRouter>
    );
}

/* =============================
   HEADER
============================= */
function Header({ lang, setLang }) {
    const dict = L[lang] || L.en;
    const T = dict.nav;
    const [open, setOpen] = useState(false);

    const NavLink = ({ to, label }) => (
        <Link to={to} className="hover:text-orange-400 transition block" onClick={() => setOpen(false)}>
            {label}
        </Link>
    );

    return (
        <header className="sticky top-0 z-30 backdrop-blur bg-black/40 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 font-semibold tracking-wide">
                    <img src={logo} alt="logo" className="h-8 w-8 object-contain" />
                    <span className="text-lg bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">GAMEON</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
                    <NavLink to="/" label={T.home} />
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
    const dict = L[lang] || L.en;
    return (
        <footer className="border-t border-white/5 mt-10">
            <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-white/60 flex items-center justify-between">
                <span>© {new Date().getFullYear()} GAMEON</span>
                <Link to="/" className="hover:text-orange-400 transition">{dict.footerHome}</Link>
            </div>
        </footer>
    );
}

/* =============================
   PAGES
============================= */
function HomePage({ lang }) {
    const dict = L[lang] || L.en;
    const T = dict.home;
    return (
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
            <h1 className="text-5xl font-extrabold mb-4">{T.title}</h1>
            <p className="text-white/70 mb-8">{T.desc}</p>
            <Link
                to="/groups"
                className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition inline-flex items-center gap-2"
            >
                {T.cta} <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

function GroupsPage({ lang, groups }) {
    const dict = L[lang] || L.en;
    const T = dict.groups;
    const safe = groups && typeof groups === "object" ? groups : { A: [], B: [], C: [] };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl font-bold mb-8">{T.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(safe).map(([key, teams]) => (
                    <div key={key} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-semibold mb-3">Group {key}</h3>
                        <table className="w-full text-sm border-separate border-spacing-y-2">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="text-left p-1">Team</th>
                                    <th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(teams) ? teams : []).map((t) => (
                                    <tr key={t.id} className="bg-white/5">
                                        <td className="flex items-center gap-2 p-1 text-left">
                                            <span>{t.logo}</span>{t.name}
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
    const dict = L[lang] || L.en;
    const T = dict.fixture;
    const safeFixtures = Array.isArray(fixtures) ? fixtures : [];

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-orange-400" /> {T.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {safeFixtures.map((f) => (
                    <div key={f.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                        <div className="font-semibold mb-2">{f.match}</div>
                        <div className="text-sm text-white/70">📅 {f.date} | 🕓 {f.time}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResultsPage({ lang, results }) {
    const dict = L[lang] || L.en;
    const T = dict.results;
    const safeResults = Array.isArray(results) ? results : [];

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Flame className="text-orange-400" /> {T.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {safeResults.map((m) => (
                    <div key={m.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 flex justify-between">
                        <div className="flex gap-2 items-center">{m.home}</div>
                        <div className="font-bold">{m.homeScore} - {m.awayScore}</div>
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
function AdminPage({ lang, isAdmin, setIsAdmin, groups, setGroups, fixtures, setFixtures, results, setResults }) {
    const dict = L[lang] || L.en;
    const T = dict.admin;

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // NEW: Add Team form
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamGroup, setNewTeamGroup] = useState("A");

    const [newFixture, setNewFixture] = useState({ match: "", date: "", time: "" });
    const [newResult, setNewResult] = useState({ home: "", away: "", hs: "", as: "" });

    const safeGroupsObj = groups && typeof groups === "object" ? groups : { A: [], B: [], C: [] };
    const safeFixtures = Array.isArray(fixtures) ? fixtures : [];
    const safeResults = Array.isArray(results) ? results : [];

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

    // ADD TEAM (ADMIN ONLY)
    const addTeam = () => {
        const name = newTeamName.trim();
        const gid = newTeamGroup;
        if (!name || !gid) return;

        const id = `${gid}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}-${Date.now()}`;
        const team = {
            id,
            name,
            logo: "⚽",
            played: 0,
            win: 0,
            draw: 0,
            loss: 0,
            points: 0,
        };

        const updated = {
            ...safeGroupsObj,
            [gid]: [...(safeGroupsObj[gid] || []), team],
        };
        setGroups(updated);
        setNewTeamName("");
    };

    // REMOVE TEAM
    const removeTeam = (gid, tid) => {
        const updated = { ...safeGroupsObj };
        updated[gid] = (updated[gid] || []).filter((t) => t.id !== tid);
        setGroups(updated);
    };

    // CLEAR ALL GROUPS (also Firestore via effect)
    const clearAllGroups = async () => {
        const empty = { A: [], B: [], C: [] };
        setGroups(empty); // effect will write replace
        // güvenlik için direkt de çağırıyoruz:
        await saveFirestoreGroupsReplacing(empty);
        alert((L[lang] || L.en).admin.cleared);
    };

    // FIXTURES
    const addFixture = () => {
        if (!newFixture.match) return;
        setFixtures((prev) => [...(prev || []), { id: `f-${Date.now()}`, ...newFixture }]);
        setNewFixture({ match: "", date: "", time: "" });
    };
    const updateFixture = (id, patch) => {
        setFixtures((prev) => (prev || []).map((f) => (f.id === id ? { ...f, ...patch } : f)));
    };
    const removeFixture = (id) => setFixtures((prev) => (prev || []).filter((f) => f.id !== id));

    // RESULTS
    const addResult = () => {
        if (!newResult.home || !newResult.away) return;
        setResults((prev) => [
            ...(prev || []),
            {
                id: `r-${Date.now()}`,
                home: newResult.home,
                away: newResult.away,
                homeScore: Number(newResult.hs || 0),
                awayScore: Number(newResult.as || 0),
            },
        ]);
        setNewResult({ home: "", away: "", hs: "", as: "" });
    };
    const updateResult = (id, patch) => {
        setResults((prev) => (prev || []).map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };
    const removeResult = (id) => setResults((prev) => (prev || []).filter((r) => r.id !== id));

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Edit className="text-orange-400" /> {T.title}
            </h2>

            {/* TOP ACTIONS */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={clearAllGroups}
                    className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-lg text-black font-semibold"
                >
                    {T.clearAll}
                </button>
            </div>

            {/* ADD TEAM */}
            <section className="mb-10">
                <h3 className="font-semibold mb-3">{T.addTeam}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    <input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder={T.teamName}
                        className="flex-1 bg-zinc-800 rounded-lg px-3 py-2"
                    />
                    <select
                        value={newTeamGroup}
                        onChange={(e) => setNewTeamGroup(e.target.value)}
                        className="bg-zinc-800 rounded-lg px-3 py-2"
                    >
                        <option value="A">{T.group} A</option>
                        <option value="B">{T.group} B</option>
                        <option value="C">{T.group} C</option>
                    </select>
                    <button onClick={addTeam} className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                        <Plus size={18} /> {T.add}
                    </button>
                </div>

                <h4 className="font-semibold mb-3">{T.teams}</h4>
                <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(safeGroupsObj).map(([gid, list]) => (
                        <div key={gid} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-lg font-semibold mb-3">Group {gid}</h4>
                            {(Array.isArray(list) ? list : []).map((t) => (
                                <div key={t.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg mb-2">
                                    <span className="truncate">{t.name}</span>
                                    <button
                                        className="text-red-400 hover:text-red-500"
                                        onClick={() => removeTeam(gid, t.id)}
                                        title={T.delete}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* FIXTURES */}
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
                    <button onClick={addFixture} className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg">
                        <Plus />
                    </button>
                </div>

                <h4 className="font-semibold mb-2">{T.fixtures}</h4>
                <div className="space-y-2">
                    {safeFixtures.map((f) => (
                        <div key={f.id} className="flex flex-wrap items-center gap-2 bg-white/5 p-3 rounded-lg">
                            <span className="flex-1 font-medium">{f.match}</span>
                            <input
                                type="date"
                                className="bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.date}
                                onChange={(e) => setFixtures((prev) => (prev || []).map((x) => (x.id === f.id ? { ...x, date: e.target.value } : x)))}
                            />
                            <input
                                type="time"
                                className="bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.time}
                                onChange={(e) => setFixtures((prev) => (prev || []).map((x) => (x.id === f.id ? { ...x, time: e.target.value } : x)))}
                            />
                            <button
                                className="text-red-400 hover:text-red-500"
                                onClick={() => setFixtures((prev) => (prev || []).filter((x) => x.id !== f.id))}
                                title={T.delete}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* RESULTS */}
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
                    <button onClick={addResult} className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg">
                        <Plus />
                    </button>
                </div>

                <h4 className="font-semibold mb-2">{T.results}</h4>
                <div className="space-y-2">
                    {safeResults.map((r) => (
                        <div key={r.id} className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2 bg-white/5 p-3 rounded-lg">
                            <span className="truncate sm:col-span-2">{r.home} vs {r.away}</span>
                            <input
                                type="number"
                                className="bg-zinc-800 rounded-lg px-2 py-1 text-center"
                                value={r.homeScore}
                                onChange={(e) => setResults((prev) => (prev || []).map((x) => (x.id === r.id ? { ...x, homeScore: Number(e.target.value) } : x)))}
                            />
                            <span className="text-center">-</span>
                            <input
                                type="number"
                                className="bg-zinc-800 rounded-lg px-2 py-1 text-center"
                                value={r.awayScore}
                                onChange={(e) => setResults((prev) => (prev || []).map((x) => (x.id === r.id ? { ...x, awayScore: Number(e.target.value) } : x)))}
                            />
                            <button
                                className="text-red-400 hover:text-red-500 inline-flex items-center gap-1"
                                onClick={() => setResults((prev) => (prev || []).filter((x) => x.id !== r.id))}
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
