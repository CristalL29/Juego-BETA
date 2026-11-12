import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Compass,
  Crown,
  Heart,
  LockKeyhole,
  Map,
  Play,
  Settings2,
  Sparkles,
  Star,
  Sun,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";

const lessons = [
  { place: "Plaza del sol", word: "Hello!", translation: "Hola", npc: "Milo", avatar: "farmer", prompt: "¿Cómo saludas a alguien en inglés?", choices: ["Goodbye", "Hello", "Please"], answer: "Hello", line: "¡Al fin llegas, viajero! La plaza ha olvidado cómo saludar. ¿Nos ayudas?" },
  { place: "Mercado de bayas", word: "Apple", translation: "Manzana", npc: "Luna", avatar: "cook", prompt: "¿Cómo se dice “manzana” en inglés?", choices: ["Apple", "Bread", "Water"], answer: "Apple", line: "¡Qué bueno que viniste! Necesito recuperar el nombre de esta fruta roja." },
  { place: "Río tranquilo", word: "Water", translation: "Agua", npc: "Kai", avatar: "fisher", prompt: "¿Qué palabra significa “agua”?", choices: ["Fire", "Water", "Tree"], answer: "Water", line: "El río perdió su nombre. ¿Recuerdas cómo se dice agua en inglés?" },
  { place: "Bosque de luciérnagas", word: "Friend", translation: "Amigo/a", npc: "Pip", avatar: "elf", prompt: "¿Cómo llamas a un “amigo” en inglés?", choices: ["Family", "Friend", "Teacher"], answer: "Friend", line: "¡Hola, nuevo amigo! Ayúdame a recordar esta palabra tan especial." },
  { place: "Colina de las nubes", word: "Beautiful", translation: "Hermoso/a", npc: "Sol", avatar: "artist", prompt: "El cielo está “hermoso”. ¿Qué palabra usamos?", choices: ["Small", "Beautiful", "Happy"], answer: "Beautiful", line: "Mira esas nubes. Esta vista es hermosa, pero la niebla borró esa palabra." },
  { place: "Estación del tren", word: "Where", translation: "Dónde", npc: "Theo", avatar: "conductor", prompt: "¿Qué palabra usarías para preguntar “dónde”?", choices: ["When", "Who", "Where"], answer: "Where", line: "¡Pasajero a bordo! El letrero perdió una palabra muy útil para preguntar." },
  { place: "Jardín secreto", word: "Thank you", translation: "Gracias", npc: "Violet", avatar: "fairy", prompt: "¿Cómo dices “gracias” en inglés?", choices: ["Thank you", "Good morning", "Excuse me"], answer: "Thank you", line: "Las flores vuelven a crecer con palabras amables. ¿Me ayudas con esta?" },
  { place: "Torre de estrellas", word: "I am happy", translation: "Estoy feliz", npc: "Nova", avatar: "wizard", prompt: "Completa: “Estoy feliz” en inglés.", choices: ["I am happy", "I am hungry", "I am here"], answer: "I am happy", line: "Una estrella se apagó. Dime cómo contarías que estás feliz." },
  { place: "Puente arcoíris", word: "Can I help?", translation: "¿Puedo ayudar?", npc: "Robin", avatar: "hero", prompt: "¿Cómo ofreces ayuda en inglés?", choices: ["Can I help?", "Can I go?", "Can you see?"], answer: "Can I help?", line: "El puente se ilumina con buenas acciones. ¿Qué dirías para ofrecer ayuda?" },
  { place: "Castillo de Stellious", word: "We did it!", translation: "¡Lo logramos!", npc: "Rey Eli", avatar: "king", prompt: "¡Salvaste la aldea! ¿Cómo dices “lo logramos”?", choices: ["We did it!", "We are lost!", "We can wait!"], answer: "We did it!", line: "¡La última prueba, héroe! Juntemos las palabras para celebrar nuestra aventura." },
];

const avatars = [
  { id: "explorer", label: "Explorador" },
  { id: "elf", label: "Elfo" },
  { id: "wizard", label: "Mago" },
  { id: "artist", label: "Artista" },
  { id: "hero", label: "Héroe" },
  { id: "farmer", label: "Granjero" },
];
const spriteRows = [
  "  HHH   ",
  " HHHHH  ",
  " HHSSHH ",
  " HHSESH ",
  "  SSS   ",
  " TTTTT  ",
  " TTATT  ",
  "  TTT   ",
  "  B B   ",
];

function PixelSprite({ type, label, className = "" }) {
  return (
    <span
      className={`pixel-sprite sprite-${type} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      {spriteRows.flatMap((row, rowIndex) =>
        [...row].map((pixel, columnIndex) =>
          pixel === " " ? null : (
            <i
              key={`${rowIndex}-${columnIndex}`}
              className={`pixel-${pixel}`}
              style={{ gridRow: rowIndex + 1, gridColumn: columnIndex + 1 }}
            />
          ),
        ),
      )}
    </span>
  );
}

const savedProfile = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("stellious-profile") || "{}");
    return {
      name: typeof saved.name === "string" && saved.name.trim() ? saved.name : "Aventurero",
      avatar: avatars.some(({ id }) => id === saved.avatar) ? saved.avatar : avatars[0].id,
      completed: Array.isArray(saved.completed) ? saved.completed.filter((id) => Number.isInteger(id) && id >= 0 && id < lessons.length) : [],
    };
  } catch {
    return { name: "Aventurero", avatar: avatars[0].id, completed: [] };
  }
};

function App() {
  const [profile, setProfile] = useState(savedProfile);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [choice, setChoice] = useState(null);
  const [musicOn, setMusicOn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftAvatar, setDraftAvatar] = useState(profile.avatar);

  const completed = new Set(profile.completed);
  const unlocked = Math.min(lessons.length - 1, profile.completed.length);
  const xp = profile.completed.length * 20;

  useEffect(() => {
    localStorage.setItem("stellious-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!musicOn) return undefined;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return undefined;
    const context = new AudioContext();
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 392, 349.23];
    let noteIndex = 0;
    const playNote = () => {
      const start = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndex++ % notes.length];
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.035, start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.58);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.6);
    };
    playNote();
    const timer = window.setInterval(playNote, 650);
    return () => {
      window.clearInterval(timer);
      context.close();
    };
  }, [musicOn]);

  const openLesson = (level) => {
    if (level > unlocked && !completed.has(level)) return;
    setSelectedLevel(level);
    setChoice(null);
  };

  const saveProfile = () => {
    setProfile((current) => ({ ...current, name: draftName.trim() || "Aventurero", avatar: draftAvatar }));
    setProfileOpen(false);
  };

  const currentLesson = selectedLevel === null ? null : lessons[selectedLevel];
  const correct = choice === currentLesson?.answer;
  const finishLesson = () => {
    setProfile((current) => ({
      ...current,
      completed: current.completed.includes(selectedLevel) ? current.completed : [...current.completed, selectedLevel].sort((a, b) => a - b),
    }));
    if (selectedLevel < lessons.length - 1) {
      setSelectedLevel(selectedLevel + 1);
      setChoice(null);
    } else {
      setSelectedLevel(null);
      setChoice(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Stellious, inicio">
          <span className="brand-mark"><span /></span>
          <span><strong>stellious<span className="brand-dot">.</span></strong><small>LEARN ENGLISH BY PLAYING</small></span>
        </a>
        <nav className="main-nav" aria-label="Navegación principal">
          <a className="nav-active" href="#ruta"><Map size={17} /> Mi aventura</a>
          <a href="#historia"><BookOpen size={17} /> Historia</a>
        </nav>
        <div className="top-actions">
          <button className={`music-button ${musicOn ? "music-active" : ""}`} onClick={() => setMusicOn((on) => !on)} aria-label={musicOn ? "Apagar música" : "Encender música"}>
            {musicOn ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>Música {musicOn ? "on" : "off"}</span>
          </button>
          <button className="account-button" onClick={() => { setDraftName(profile.name); setDraftAvatar(profile.avatar); setProfileOpen(true); }}>
            <span className="account-avatar"><PixelSprite type={profile.avatar} /></span><span className="account-name">{profile.name}</span><ChevronDown size={15} />
          </button>
        </div>
      </header>

      <main id="inicio" className="page-layout">
        <aside className="sidebar">
          <div className="sidebar-title"><span>TU AVENTURA</span><button aria-label="Editar perfil" onClick={() => { setDraftName(profile.name); setDraftAvatar(profile.avatar); setProfileOpen(true); }}><Settings2 size={17} /></button></div>
          <div className="profile-card">
            <div className="profile-avatar"><PixelSprite type={profile.avatar} /><span className="online-dot" /></div>
            <div className="profile-copy"><strong>{profile.name}</strong><span>Aprendiz de inglés</span></div>
            <span className="rank-pill"><Sparkles size={12} /> {xp >= 100 ? "EXPLORADOR" : "NOVATO"}</span>
            <div className="profile-stats">
              <span><Zap size={15} fill="currentColor" /> {xp} XP</span>
              <span>{profile.completed.length}/{lessons.length} niveles</span>
            </div>
            <div className="xp-track"><span style={{ width: `${Math.min(100, (profile.completed.length / lessons.length) * 100)}%` }} /></div>
          </div>

          <div className="route-heading"><span>RUTA DE APRENDIZAJE</span><span>{String(profile.completed.length + 1).padStart(2, "0")} / 10</span></div>
          <div className="level-list" id="ruta">
            {lessons.map((lesson, index) => {
              const isComplete = completed.has(index);
              const isLocked = index > unlocked && !isComplete;
              return (
                <button key={lesson.place} className={`level-item ${isComplete ? "level-complete" : ""} ${!isLocked && !isComplete ? "level-current" : ""} ${isLocked ? "level-locked" : ""}`} onClick={() => openLesson(index)} disabled={isLocked} aria-label={`Nivel ${index + 1}: ${lesson.place}${isLocked ? ", bloqueado" : ""}`}>
                  <span className="level-marker">{isComplete ? <Check size={16} /> : isLocked ? <LockKeyhole size={13} /> : <span>{index + 1}</span>}</span>
                  <span className="level-copy"><strong>{lesson.place}</strong><small>{lesson.word} <i>·</i> Nivel {index + 1}</small></span>
                  {isComplete ? <Star className="level-star" size={15} fill="currentColor" /> : <ChevronRight className="level-chevron" size={16} />}
                </button>
              );
            })}
          </div>
          <div className="no-lives"><Heart size={16} /><span>¡Sin vidas! Aprende a tu ritmo.</span></div>
        </aside>

        <section className="adventure">
          <div className="scene-topline">
            <div className="breadcrumb"><span>STELLIOUS</span><ChevronRight size={14} /><strong>LA ALDEA</strong></div>
            <span className="season"><Sun className="season-sun" size={14} /> Día 1 <i>·</i> Primavera</span>
          </div>

          <div className="welcome-row">
            <div>
              <p className="eyebrow">TU HISTORIA COMIENZA AQUÍ</p>
              <h1>¡Hola, {profile.name}!</h1>
              <p className="welcome-subtitle">La aldea de Stellious te da la bienvenida.</p>
            </div>
            <div className="welcome-note"><span className="note-flower" /><span><strong>Tu primera aventura</strong><small>¿Listo para aprender?</small></span><Sparkles size={17} /></div>
          </div>

          <section className="village" aria-label="Ilustración de la aldea de Stellious">
            <div className="sky">
              <div className="sun-pixel" />
              <div className="cloud cloud-one" /><div className="cloud cloud-two" />
              <div className="bird bird-one" /><div className="bird bird-two" />
              <div className="mountain mountain-back" /><div className="mountain mountain-front" />
            </div>
            <div className="distant-hill" />
            <div className="forest forest-left" aria-hidden="true"><span /><span /><span /></div>
            <div className="forest forest-right" aria-hidden="true"><span /><span /><span /></div>
            <div className="village-houses">
              <div className="house house-left"><i /><b /><span /></div>
              <div className="house house-main"><i /><b /><span /></div>
              <div className="house house-right"><i /><b /><span /></div>
            </div>
            <div className="pathway" />
            <div className="flowers flower-left" aria-hidden="true"><span /><span /><span /></div><div className="flowers flower-right" aria-hidden="true"><span /><span /><span /></div>
            <div className="scene-title">STELLIOUS</div>
            <div className="scene-location"><Compass size={14} /> ALDEA DE STELLIOUS</div>
            <button className="villager villager-main" onClick={() => openLesson(unlocked)} aria-label={`Hablar con ${lessons[unlocked].npc}, personaje de la plaza`}><PixelSprite type={lessons[unlocked].avatar} /><small>¡Hola!</small><i /></button>
            <button className="villager villager-side" onClick={() => openLesson(unlocked)} aria-label="Explorar la aldea"><PixelSprite type={profile.avatar} /></button>
            <div className="map-controls">
              <button onClick={() => openLesson(Math.max(0, unlocked - 1))} aria-label="Zona anterior"><ArrowLeft size={17} /></button>
              <span>{String(unlocked + 1).padStart(2, "0")} / 10</span>
              <button onClick={() => openLesson(unlocked)} aria-label="Siguiente zona"><ArrowRight size={17} /></button>
            </div>
          </section>

          <section className="story-card" id="historia">
            <div className="story-icon"><BookOpen size={19} /></div>
            <div className="story-copy"><strong>UN NUEVO COMIENZO</strong><p>Una mañana, una extraña niebla cubrió Stellious y robó las palabras de sus habitantes. <b>¡Ayúdalos a recuperarlas aprendiendo inglés!</b></p></div>
            <a href="#ruta" className="story-link">Leer historia <ChevronRight size={16} /></a>
          </section>

          <section className="journey-heading">
            <div><p className="eyebrow">TU CAMINO</p><h2>Explora y aprende</h2></div>
            <span className="level-count"><Star size={15} /> 10 niveles</span>
          </section>
          <section className="next-card">
            <div className="next-emblem"><span className="pixel-sword" aria-hidden="true" /><Sparkles size={16} /></div>
            <div className="next-copy"><p>PRÓXIMA AVENTURA <i>· NIVEL {unlocked + 1}</i></p><strong>{lessons[unlocked].place}</strong><span>Practica “{lessons[unlocked].word}” con {lessons[unlocked].npc}</span></div>
            <button onClick={() => openLesson(unlocked)} className="play-button"><Play size={16} fill="currentColor" /> Jugar</button>
          </section>
          <footer className="footer-note"><Sparkles size={14} /> Un pasito a la vez. Vas muy bien, {profile.name}.</footer>
        </section>
      </main>

      {currentLesson && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedLevel(null); }}>
          <section className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
            <div className="modal-header">
              <div><span className="modal-level">NIVEL {selectedLevel + 1}</span><strong>{currentLesson.place}</strong></div>
              <button className="icon-button" aria-label="Cerrar nivel" onClick={() => setSelectedLevel(null)}><X size={19} /></button>
            </div>
            <div className="boss-intro">
              <div className="boss-avatar"><PixelSprite type={currentLesson.avatar} /><span /></div>
              <div className="boss-text"><span className="boss-label"><Crown size={13} /> EL GUARDIÁN DE {currentLesson.place.split(" ")[0].toUpperCase()}</span><strong>{currentLesson.npc} <small>· aldeano</small></strong><p>{currentLesson.line}</p></div>
            </div>
            <div className="question-card">
              <div className="question-meta"><span><AudioLines size={14} /> RETO DE INGLÉS · BÁSICO</span><b>RANGO {selectedLevel + 1} <span>·</span> 1 / 1</b></div>
              <h2 id="lesson-title">{currentLesson.prompt}</h2>
              <p className="question-hint">Elige la respuesta correcta para ayudar a {currentLesson.npc}.</p>
              <div className="answer-list">
                {currentLesson.choices.map((option, index) => {
                  const isSelected = choice === option;
                  return (
                    <button key={option} className={`answer-option ${isSelected ? (correct ? "answer-correct" : "answer-wrong") : ""}`} onClick={() => setChoice(option)} aria-pressed={isSelected}>
                      <span className="answer-key">{String.fromCharCode(65 + index)}</span><strong>{option}</strong>
                      {isSelected && <span className="answer-result">{correct ? <Check size={17} /> : <X size={16} />}</span>}
                    </button>
                  );
                })}
              </div>
              {choice && <div className={`answer-feedback ${correct ? "feedback-good" : "feedback-try"}`} role="status">{correct ? <><Sparkles size={16} /><span><strong>¡Muy bien!</strong> “{currentLesson.answer}” significa “{currentLesson.translation}”.</span></> : <><CircleHelp size={16} /><span><strong>¡Casi!</strong> Pista: {currentLesson.word} significa “{currentLesson.translation}”. Inténtalo otra vez.</span></>}</div>}
            </div>
            <div className="modal-footer">
              <span className="no-lives"><Heart size={15} /> No pierdes vidas: aprende a tu ritmo.</span>
              {correct ? <button className="continue-button" onClick={finishLesson}>{selectedLevel === lessons.length - 1 ? "Completar aventura" : "Continuar"} <ArrowRight size={16} /></button> : <span className="boss-easy"><Sparkles size={14} /> ¡Este desafío es fácil!</span>}
            </div>
          </section>
        </div>
      )}

      {profileOpen && (
        <div className="modal-backdrop profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="modal-header"><div><span className="modal-level">TU PERSONAJE</span><strong id="profile-title">Personaliza tu aventura</strong></div><button className="icon-button" aria-label="Cerrar perfil" onClick={() => setProfileOpen(false)}><X size={19} /></button></div>
            <label className="name-label" htmlFor="player-name">¿Cómo te llamas?</label>
            <input id="player-name" className="name-input" maxLength={18} value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveProfile(); }} placeholder="Tu nombre de aventurero" />
            <span className="avatar-label">Elige tu aspecto</span>
            <div className="avatar-picker">{avatars.map((avatar) => <button key={avatar.id} onClick={() => setDraftAvatar(avatar.id)} className={draftAvatar === avatar.id ? "avatar-choice avatar-selected" : "avatar-choice"} aria-label={`Elegir personaje: ${avatar.label}`} aria-pressed={draftAvatar === avatar.id}><PixelSprite type={avatar.id} /></button>)}</div>
            <button className="continue-button save-profile-button" onClick={saveProfile}>Guardar personaje <Check size={16} /></button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
