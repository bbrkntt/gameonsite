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

// Firestore
import { db } from "./firebase";
import {
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";

/* =============================
   STORAGE KEYS
============================= */
const STORAGE = {
    GROUPS: "gameon_groups",     // collection: teams (each doc has {group: 'A'|'B'|'C', ...})
    FIXTURES: "gameon_fixtures", // collection: fixtures
    RESULTS: "gameon_results",   // collection: results
};

/* =============================
   DEFAULT DATA
============================= */
const INITIAL_GROUPS = { A: [], B: [], C: [] };
const INITIAL_FIXTURES = [];
const INITIAL_RESULTS = [];

/* =============================
   LANGUAGES (EN / IT)
============================= */
const L = {
    en: {
        nav: { home: "Home", join: "Join", groups: "Groups", fixture: "Fixture", results: "Results", admin: "Admin" },
        home: { title: "⚽ Football Tournament ⚽", desc: "Join the tournament and fight for glory!", cta: "Join Now" },
        join: { title: "Team Registration", name: "Team Name", email: "Email", submit: "Register", success: "✅ Registration successful!" },
        groups: { title: "Group Standings" },
        fixture: { title: "Fixture" },
        results: { title: "Match Results" },
        admin: {
            title: "Admin Panel",
            passWrong: "Wrong password!",
            login: "Log In",
            addFixture: "Add Fixture",
            addResult: "Add Result",
            teams: "Teams (Add / Delete)",
            fixtures: "Edit Fixtures",
            results: "Edit Results",
            delete: "Delete",
            addTeam: "Add Team",
            teamName: "Team Name",
            teamEmail: "Email (optional)",
            group: "Group",
            save: "Save",
        },
        footerHome: "Home",
    },
    it: {
        nav: { home: "Home", join: "Iscriviti", groups: "Gruppi", fixture: "Calendario", results: "Risultati", admin: "Admin" },
        home: { title: "⚽ Torneo di Calcio ⚽", desc: "Partecipa al torneo e combatti per la gloria!", cta: "Iscriviti ora" },
        join: { title: "Registrazione Squadra", name: "Nome Squadra", email: "Email", submit: "Registrati", success: "✅ Registrazione avvenuta con successo!" },
        groups: { title: "Classifiche Gruppi" },
        fixture: { title: "Calendario" },
        results: { title: "Risultati Partite" },
        admin: {
            title: "Pannello Admin",
            passWrong: "Password errata!",
            login: "Accedi",
            addFixture: "Aggiungi Partita",
            addResult: "Aggiungi Risultato",
            teams: "Squadre (Aggiungi / Elimina)",
            fixtures: "Modifica Calendario",
            results: "Modifica Risultati",
            delete: "Elimina",
            addTeam: "Aggiungi Squadra",
            teamName: "Nome Squadra",
            teamEmail: "Email (opzionale)",
            group: "Gruppo",
            save: "Salva",
        },
        footerHome: "Home",
    },
};

/* =============================
   FIRESTORE HELPERS
============================= */
async function loadData(key, fallback) {
    try {
        const colRef = collection(db, key);
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) return fallback;

        if (key === STORAGE.GROUPS) {
            const groups = { A: [], B: [], C: [] };
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const g = data.group || "A";
                if (groups[g]) groups[g].push(data);
            });
            return groups;
        } else {
            return snapshot.docs.map((d) => d.data());
        }
    } catch (err) {
        console.error("Firestore load error:", err);
        return fallback;
    }
}

async function saveDoc(key, obj) {
    // upsert single document by id
    await setDoc(doc(db, key, obj.id), obj);
}

async function deleteById(key, id) {
    await deleteDoc(doc(db, key, id));
}

/* =============================
   APP
============================= */
export default function App() {
    const [lang, setLang] = useState("en");
    const [groups, setGroups] = useState(INITIAL_GROUPS);
    const [fixtures, setFixtures] = useState(INITIAL_FIXTURES);
    const [results, setResults] = useState(INITIAL_RESULTS);
    const [isAdmin, setIsAdmin] = useState(false);

    // İlk yüklemede Firestore'dan çek
    useEffect(() => {
        (async () => {
            setGroups(await loadData(STORAGE.GROUPS, INITIAL_GROUPS));
            setFixtures(await loadData(STORAGE.FIXTURES, INITIAL_FIXTURES));
            setResults(await loadData(STORAGE.RESULTS, INITIAL_RESULTS));
        })();
    }, []);

    return (
        <HashRouter>
            <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
                <Header lang={lang} setLang={setLang} />
                <Routes>
                    <Route path="/" element={<HomePage lang={lang} />} />
                    <Route path="/join" element={<JoinPage lang={lang} groups={groups} setGroups={setGroups} />} />
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
                <Footer lang={lang} />
            </div>
        </HashRouter>
    );
}

/* =============================
   HEADER
============================= */
function Header({ lang, setLang }) {
    const T = L[lang]?.nav || L.en.nav;
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
    const T = L[lang] || L.en;
    return (
        <footer className="border-t border-white/5 mt-10">
            <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-white/60 flex items-center justify-between">
                <span>© {new Date().getFullYear()} GAMEON</span>
                <Link to="/" className="hover:text-orange-400 transition">{T.footerHome}</Link>
            </div>
        </footer>
    );
}

/* =============================
   PAGES
============================= */
function HomePage({ lang }) {
    const T = L[lang]?.home || L.en.home;
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

function JoinPage({ lang, groups, setGroups }) {
    const T = L[lang]?.join || L.en.join;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email) return;

        const keys = Object.keys(groups); // ["A","B","C"]
        const rnd = keys[Math.floor(Math.random() * keys.length)];

        const newTeam = {
            id: `T-${Date.now()}`,
            name: name.trim(),
            logo: "⚽",
            group: rnd,
            played: 0,
            win: 0,
            draw: 0,
            loss: 0,
            points: 0,
            email,
        };

        // Firestore'a yaz (doc id sabit)
        await saveDoc(STORAGE.GROUPS, newTeam);

        // State'e ekle
        setGroups({ ...groups, [rnd]: [...groups[rnd], newTeam] });

        setName("");
        setEmail("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
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
    const T = L[lang]?.groups || L.en.groups;
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl font-bold mb-8">{T.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(groups).map(([gid, teams]) => (
                    <div key={gid} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-semibold mb-3">Group {gid}</h3>
                        {teams.length === 0 ? (
                            <p className="text-white/40">No teams yet</p>
                        ) : (
                            <table className="w-full text-sm border-separate border-spacing-y-2">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="text-left p-1">Team</th>
                                        <th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((t) => (
                                        <tr key={t.id} className="bg-white/5">
                                            <td className="text-left p-1">{t.name}</td>
                                            <td className="text-center">{t.played}</td>
                                            <td className="text-center">{t.win}</td>
                                            <td className="text-center">{t.draw}</td>
                                            <td className="text-center">{t.loss}</td>
                                            <td className="text-center">{t.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function FixturePage({ lang, fixtures }) {
    const T = L[lang]?.fixture || L.en.fixture;
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-orange-400" /> {T.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {fixtures.map((f) => (
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
    const T = L[lang]?.results || L.en.results;
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Flame className="text-orange-400" /> {T.title}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
                {results.map((m) => (
                    <div key={m.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 flex justify-between">
                        <div>{m.home}</div>
                        <div className="font-bold">{m.homeScore} - {m.awayScore}</div>
                        <div>{m.away}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* =============================
   ADMIN (Full CRUD)
============================= */
function AdminPage({ lang, isAdmin, setIsAdmin, groups, setGroups, fixtures, setFixtures, results, setResults }) {
    const T = L[lang]?.admin || L.en.admin;
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Add team
    const [tName, setTName] = useState("");
    const [tEmail, setTEmail] = useState("");
    const [tGroup, setTGroup] = useState("A");

    // Add fixture/result
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

    /* ----- Teams: add / delete ----- */
    const addTeam = async () => {
        const name = tName.trim();
        if (!name) return;
        const team = {
            id: `T-${Date.now()}`,
            name,
            email: tEmail.trim() || "",
            logo: "⚽",
            group: tGroup,
            played: 0, win: 0, draw: 0, loss: 0, points: 0,
        };
        await saveDoc(STORAGE.GROUPS, team);
        setGroups((prev) => ({ ...prev, [tGroup]: [...prev[tGroup], team] }));
        setTName(""); setTEmail("");
    };

    const removeTeam = async (gid, tid) => {
        await deleteById(STORAGE.GROUPS, tid);
        setGroups((prev) => ({ ...prev, [gid]: prev[gid].filter((t) => t.id !== tid) }));
    };

    /* ----- Fixtures: add / update / delete ----- */
    const addFixture = async () => {
        if (!newFixture.match) return;
        const f = { id: `f-${Date.now()}`, ...newFixture };
        await saveDoc(STORAGE.FIXTURES, f);
        setFixtures((p) => [...p, f]);
        setNewFixture({ match: "", date: "", time: "" });
    };

    const updateFixture = async (id, patch) => {
        setFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
        const updated = fixtures.find((f) => f.id === id);
        if (updated) await saveDoc(STORAGE.FIXTURES, { ...updated, ...patch });
    };

    const removeFixture = async (id) => {
        await deleteById(STORAGE.FIXTURES, id);
        setFixtures((prev) => prev.filter((f) => f.id !== id));
    };

    /* ----- Results: add / update / delete ----- */
    const addResult = async () => {
        if (!newResult.home || !newResult.away) return;
        const r = {
            id: `r-${Date.now()}`,
            home: newResult.home,
            away: newResult.away,
            homeScore: Number(newResult.hs || 0),
            awayScore: Number(newResult.as || 0),
        };
        await saveDoc(STORAGE.RESULTS, r);
        setResults((p) => [...p, r]);
        setNewResult({ home: "", away: "", hs: "", as: "" });
    };

    const updateResult = async (id, patch) => {
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
        const updated = results.find((r) => r.id === id);
        if (updated) await saveDoc(STORAGE.RESULTS, { ...updated, ...patch });
    };

    const removeResult = async (id) => {
        await deleteById(STORAGE.RESULTS, id);
        setResults((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Edit className="text-orange-400" /> {T.title}
            </h2>

            {/* TEAMS */}
            <section className="mb-10">
                <h3 className="font-semibold mb-3">{T.teams}</h3>

                {/* Add Team */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            value={tName}
                            onChange={(e) => setTName(e.target.value)}
                            placeholder={L[lang]?.admin.teamName || "Team Name"}
                            className="flex-1 bg-zinc-800 rounded-lg px-3 py-2"
                        />
                        <input
                            value={tEmail}
                            onChange={(e) => setTEmail(e.target.value)}
                            placeholder={L[lang]?.admin.teamEmail || "Email"}
                            className="flex-1 bg-zinc-800 rounded-lg px-3 py-2"
                        />
                        <select
                            value={tGroup}
                            onChange={(e) => setTGroup(e.target.value)}
                            className="bg-zinc-800 rounded-lg px-3 py-2"
                        >
                            <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                        </select>
                        <button onClick={addTeam} className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg inline-flex items-center justify-center">
                            <Plus />
                        </button>
                    </div>
                </div>

                {/* Lists */}
                <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(groups).map(([gid, list]) => (
                        <div key={gid} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-lg font-semibold mb-3">Group {gid}</h4>
                            {list.length === 0 && <p className="text-white/50">—</p>}
                            {list.map((t) => (
                                <div key={t.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg mb-2">
                                    <span className="truncate">{t.name}</span>
                                    <button
                                        className="text-red-400 hover:text-red-500"
                                        onClick={() => removeTeam(gid, t.id)}
                                        title="Delete team"
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
                <h3 className="font-semibold mb-3">{L[lang]?.admin.addFixture || "Add Fixture"}</h3>
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

                <h4 className="font-semibold mb-2">{L[lang]?.admin.fixtures || "Edit Fixtures"}</h4>
                <div className="space-y-2">
                    {fixtures.map((f) => (
                        <div key={f.id} className="flex flex-wrap items-center gap-2 bg-white/5 p-3 rounded-lg">
                            <input
                                className="flex-1 bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.match}
                                onChange={(e) => updateFixture(f.id, { match: e.target.value })}
                            />
                            <input
                                type="date"
                                className="bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.date || ""}
                                onChange={(e) => updateFixture(f.id, { date: e.target.value })}
                            />
                            <input
                                type="time"
                                className="bg-zinc-800 rounded-lg px-2 py-1"
                                value={f.time || ""}
                                onChange={(e) => updateFixture(f.id, { time: e.target.value })}
                            />
                            <button
                                className="text-red-400 hover:text-red-500"
                                onClick={() => removeFixture(f.id)}
                                title={L[lang]?.admin.delete || "Delete"}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {fixtures.length === 0 && <p className="text-white/50">—</p>}
                </div>
            </section>

            {/* RESULTS */}
            <section>
                <h3 className="font-semibold mb-3">{L[lang]?.admin.addResult || "Add Result"}</h3>
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

                <h4 className="font-semibold mb-2">{L[lang]?.admin.results || "Edit Results"}</h4>
                <div className="space-y-2">
                    {results.map((r) => (
                        <div key={r.id} className="grid grid-cols-1 sm:grid-cols-6 items-center gap-2 bg-white/5 p-3 rounded-lg">
                            <input
                                className="bg-zinc-800 rounded-lg px-2 py-1 sm:col-span-2"
                                value={`${r.home} vs ${r.away}`}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const [home, away] = val.split(" vs ");
                                    updateResult(r.id, { home: home ?? r.home, away: away ?? r.away });
                                }}
                            />
                            <input
                                type="number"
                                className="bg-zinc-800 rounded-lg px-2 py-1 text-center"
                                value={r.homeScore}
                                onChange={(e) => updateResult(r.id, { homeScore: Number(e.target.value) })}
                            />
                            <span className="text-center">-</span>
                            <input
                                type="number"
                                className="bg-zinc-800 rounded-lg px-2 py-1 text-center"
                                value={r.awayScore}
                                onChange={(e) => updateResult(r.id, { awayScore: Number(e.target.value) })}
                            />
                            <button
                                className="text-red-400 hover:text-red-500 inline-flex items-center gap-1"
                                onClick={() => removeResult(r.id)}
                                title={L[lang]?.admin.delete || "Delete"}
                            >
                                <Trash2 size={18} /> {L[lang]?.admin.delete || "Delete"}
                            </button>
                        </div>
                    ))}
                    {results.length === 0 && <p className="text-white/50">—</p>}
                </div>
            </section>
        </div>
    );
}
