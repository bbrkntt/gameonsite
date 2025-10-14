import React, { useState, useEffect } from "react";
import {
    Edit, Lock, Plus, Trash2, Menu, X, Calendar, ChevronRight,
} from "lucide-react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import logo from "./assets/logo.png";

/* =============================
   STORAGE KEYS
============================= */
const STORAGE = {
    GROUPS: "gameon_groups",
    FIXTURES: "gameon_fixtures",
    LANG: "gameon_lang",
};

/* =============================
   DEFAULT DATA
============================= */
const INITIAL_GROUPS = {
    A: [
        { id: "A1", name: "Team Alpha", logo: "🦁", points: 7 },
        { id: "A2", name: "Team Bravo", logo: "🦊", points: 4 },
    ],
    B: [
        { id: "B1", name: "Team Eagle", logo: "🦅", points: 9 },
        { id: "B2", name: "Team Falcon", logo: "🦆", points: 6 },
    ],
    C: [
        { id: "C1", name: "Team Inferno", logo: "🔥", points: 7 },
        { id: "C2", name: "Team Jade", logo: "🐍", points: 5 },
    ],
};

const INITIAL_FIXTURES = [
    { id: "f1", match: "Team Alpha vs Team Bravo", date: "2025-10-20", time: "18:00" },
    { id: "f2", match: "Team Eagle vs Team Falcon", date: "2025-10-21", time: "19:30" },
];

/* =============================
   LANGUAGES
============================= */
const L = {
    en: {
        nav: { home: "Home", groups: "Groups", fixture: "Fixture", admin: "Admin" },
        home: {
            title: "⚽ Football Tournament ⚽",
            desc: "Join the competition and fight for the top!",
            join: "Join",
            formTitle: "Join the Tournament",
            name: "Team Name",
            email: "Email",
            register: "Register",
            success: "✅ Registered successfully!",
        },
        fixture: { title: "Fixture" },
        admin: {
            title: "Admin Panel",
            addTeam: "Add Team",
            delTeam: "Delete Team",
            addFixture: "Add Fixture",
            passWrong: "Wrong password!",
            login: "Login",
        },
    },
    it: {
        nav: { home: "Home", groups: "Gruppi", fixture: "Calendario", admin: "Admin" },
        home: {
            title: "⚽ Torneo di Calcio ⚽",
            desc: "Partecipa e lotta per la vetta!",
            join: "Partecipa",
            formTitle: "Iscriviti al Torneo",
            name: "Nome Squadra",
            email: "Email",
            register: "Registrati",
            success: "✅ Registrato con successo!",
        },
        fixture: { title: "Calendario" },
        admin: {
            title: "Pannello Admin",
            addTeam: "Aggiungi Squadra",
            delTeam: "Elimina Squadra",
            addFixture: "Aggiungi Partita",
            passWrong: "Password errata!",
            login: "Accedi",
        },
    },
};

/* =============================
   HELPERS
============================= */
function load(k, f) {
    try {
        const s = localStorage.getItem(k);
        return s ? JSON.parse(s) : f;
    } catch {
        return f;
    }
}
function save(k, v) {
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch { }
}

/* =============================
   MAIN APP
============================= */
export default function App() {
    const [lang, setLang] = useState(() => load(STORAGE.LANG, "en"));
    const [groups, setGroups] = useState(() => load(STORAGE.GROUPS, INITIAL_GROUPS));
    const [fixtures, setFixtures] = useState(() => load(STORAGE.FIXTURES, INITIAL_FIXTURES));
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => save(STORAGE.LANG, lang), [lang]);
    useEffect(() => save(STORAGE.GROUPS, groups), [groups]);
    useEffect(() => save(STORAGE.FIXTURES, fixtures), [fixtures]);

    const addRandomTeam = (team) => {
        const keys = Object.keys(groups);
        const randomGroup = keys[Math.floor(Math.random() * keys.length)];
        const newGroups = { ...groups };
        newGroups[randomGroup] = [...newGroups[randomGroup], team];
        setGroups(newGroups);
    };

    return (
        <HashRouter>
            <div className="min-h-screen bg-neutral-900 text-white">

                <Header lang={lang} setLang={setLang} />
                <Routes>
                    <Route path="/" element={<HomePage lang={lang} onJoin={addRandomTeam} />} />
                    <Route path="/groups" element={<GroupsPage lang={lang} groups={groups} />} />
                    <Route path="/fixture" element={<FixturePage lang={lang} fixtures={fixtures} />} />
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
                            />
                        }
                    />
                </Routes>
                <Footer />
            </div>
        </HashRouter>
    );
}

/* =============================
   HEADER
============================= */
function Header({ lang, setLang }) {
    const T = L[lang].nav;
    const [open, setOpen] = useState(false);
    const Nav = ({ to, label }) => (
        <Link to={to} className="hover:text-orange-400 transition" onClick={() => setOpen(false)}>
            {label}
        </Link>
    );

    return (
        <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 font-semibold">
                    <img src={logo} alt="logo" className="h-8 w-8" />
                    <span className="text-lg bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                        GAMEON
                    </span>
                </Link>
                <nav className="hidden md:flex gap-6 text-sm text-white/80">
                    <Nav to="/" label={T.home} />
                    <Nav to="/groups" label={T.groups} />
                    <Nav to="/fixture" label={T.fixture} />
                    <Nav to="/admin" label={T.admin} />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs"
                    >
                        <option value="en">EN</option>
                        <option value="it">IT</option>
                    </select>
                </nav>
                <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
                    {open ? <X /> : <Menu />}
                </button>
            </div>
            {open && (
                <div className="md:hidden bg-black/90 text-center py-4 space-y-3">
                    <Nav to="/" label={T.home} />
                    <Nav to="/groups" label={T.groups} />
                    <Nav to="/fixture" label={T.fixture} />
                    <Nav to="/admin" label={T.admin} />
                </div>
            )}
        </header>
    );
}

/* =============================
   HOMEPAGE + JOIN FORM
============================= */
function HomePage({ lang, onJoin }) {
    const T = L[lang].home;
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTeam = {
            id: `team-${Date.now()}`,
            name,
            email,
            logo: "⚽",
            points: 0,
        };
        onJoin(newTeam);
        setSuccess(true);
        setTimeout(() => setShowForm(false), 2000);
        setName("");
        setEmail("");
    };

    return (
        <div className="text-center px-4 py-20">
            <h1 className="text-5xl font-extrabold mb-4">{T.title}</h1>
            <p className="text-white/70 mb-8">{T.desc}</p>
            <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-orange-400 transition"
            >
                {T.join}
            </button>

            {showForm && (
                <div className="mt-8 bg-white/10 p-6 rounded-xl max-w-md mx-auto">
                    <h3 className="text-2xl font-bold mb-4">{T.formTitle}</h3>
                    {success ? (
                        <p className="text-green-400">{T.success}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder={T.name}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 focus:outline-none"
                            />
                            <input
                                type="email"
                                placeholder={T.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-orange-500 text-black px-6 py-2 rounded-lg hover:bg-orange-400 transition"
                            >
                                {T.register}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

/* =============================
   GROUPS PAGE
============================= */
function GroupsPage({ lang, groups }) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h2 className="text-4xl font-bold mb-8">{L[lang].nav.groups}</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(groups).map(([key, teams]) => (
                    <div key={key} className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-semibold mb-3">Group {key}</h3>
                        <table className="w-full text-sm border-separate border-spacing-y-2">
                            <thead className="bg-white/10">
                                <tr>
                                    <th>Team</th>
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
                                        <td>{t.points}</td>
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

/* =============================
   FIXTURE PAGE
============================= */
function FixturePage({ lang, fixtures }) {
    const T = L[lang].fixture;
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

/* =============================
   ADMIN PANEL
============================= */
function AdminPage({ lang, isAdmin, setIsAdmin, groups, setGroups, fixtures, setFixtures }) {
    const T = L[lang].admin;
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [newTeam, setNewTeam] = useState({ name: "", group: "A" });
    const [newFixture, setNewFixture] = useState({ match: "", date: "", time: "" });

    if (!isAdmin) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold mb-4">
                    <Lock className="inline text-orange-400" /> {T.title}
                </h2>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-3 py-2 rounded bg-white/10"
                />
                <button
                    onClick={() =>
                        password === "torinospor69" ? setIsAdmin(true) : setError(T.passWrong)
                    }
                    className="ml-2 bg-orange-500 px-4 py-2 rounded text-black font-semibold hover:bg-orange-400"
                >
                    {T.login}
                </button>
                {error && <p className="text-red-400 mt-3">{error}</p>}
            </div>
        );
    }

    const addTeam = () => {
        const newGroups = { ...groups };
        const g = newTeam.group;
        newGroups[g].push({
            id: `${g}-${Date.now()}`,
            name: newTeam.name,
            logo: "⚽",
            points: 0,
        });
        setGroups(newGroups);
        setNewTeam({ name: "", group: "A" });
    };

    const removeTeam = (gid, tid) => {
        const newG = { ...groups };
        newG[gid] = newG[gid].filter((t) => t.id !== tid);
        setGroups(newG);
    };

    const addFixture = () => {
        const newList = [...fixtures, { id: `f-${Date.now()}`, ...newFixture }];
        setFixtures(newList);
        setNewFixture({ match: "", date: "", time: "" });
    };

    const removeFixture = (fid) => {
        setFixtures((prev) => prev.filter((f) => f.id !== fid));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Edit className="text-orange-400" /> {T.title}
            </h2>

            {/* Takım Ekle */}
            <section className="mb-8">
                <h3 className="font-semibold mb-2">{T.addTeam}</h3>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Team Name"
                        className="flex-1 bg-zinc-800 rounded px-3 py-2"
                    />
                    <select
                        value={newTeam.group}
                        onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
                        className="bg-zinc-800 rounded px-3 py-2"
                    >
                        <option value="A">Group A</option>
                        <option value="B">Group B</option>
                        <option value="C">Group C</option>
                    </select>
                    <button
                        onClick={addTeam}
                        className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg inline-flex items-center justify-center"
                    >
                        <Plus />
                    </button>
                </div>
            </section>

            {/* Takım Sil */}
            <section className="mb-8">
                <h3 className="font-semibold mb-2">{T.delTeam}</h3>
                {Object.entries(groups).map(([gid, list]) => (
                    <div key={gid} className="bg-white/5 p-4 rounded-lg mb-3">
                        <h4 className="text-lg font-semibold mb-2">Group {gid}</h4>
                        {list.map((t) => (
                            <div
                                key={t.id}
                                className="flex justify-between items-center bg-black/20 p-2 rounded mb-2"
                            >
                                <span>{t.name}</span>
                                <button
                                    onClick={() => removeTeam(gid, t.id)}
                                    className="text-red-400 hover:text-red-500 flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
            </section>

            {/* Fikstür */}
            <section>
                <h3 className="font-semibold mb-2">{T.addFixture}</h3>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                        value={newFixture.match}
                        onChange={(e) => setNewFixture({ ...newFixture, match: e.target.value })}
                        placeholder="Match (Team A vs Team B)"
                        className="flex-1 bg-zinc-800 rounded px-3 py-2"
                    />
                    <input
                        type="date"
                        value={newFixture.date}
                        onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                        className="bg-zinc-800 rounded px-3 py-2"
                    />
                    <input
                        type="time"
                        value={newFixture.time}
                        onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                        className="bg-zinc-800 rounded px-3 py-2"
                    />
                    <button
                        onClick={addFixture}
                        className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg inline-flex items-center justify-center"
                    >
                        <Plus />
                    </button>
                </div>
                {fixtures.map((f) => (
                    <div
                        key={f.id}
                        className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-3 rounded-lg mb-2"
                    >
                        <span>
                            {f.match} — {f.date} {f.time}
                        </span>
                        <button
                            onClick={() => removeFixture(f.id)}
                            className="text-red-400 hover:text-red-500 flex items-center gap-1"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                ))}
            </section>
        </div>
    );
}

/* =============================
   FOOTER
============================= */
function Footer() {
    return (
        <footer className="border-t border-white/5 mt-10">
            <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-white/60 flex items-center justify-between">
                <span>© {new Date().getFullYear()} GAMEON</span>
                <Link to="/" className="hover:text-orange-400 transition">
                    Home
                </Link>
            </div>
        </footer>
    );
}
