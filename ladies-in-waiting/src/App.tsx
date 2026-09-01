import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const LAS_MENINAS =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Las%20Meninas%20(1656),%20by%20Velazquez.jpg?width=1800";
const VICTORIA =
  "https://hrp.imgix.net/https%3A%2F%2Fhistoricroyalpalaces.picturepark.com%2FGo%2FtS5dpLPe%2FV%2F39847%2F28?auto=format&w=1800";
const MARIE =
  "https://cdn8.futura-sciences.com/a1280/images/marie-antoinette-enfants-detail.jpg";
const MARIA_THERESA =
  "https://www.meisterdrucke.be/kunstwerke/1260px/Friedrich_Heinrich_Fuger_-_Empress_Maria_Theresia_surrounded_by_her_children_in_widows_weeds_after_the_deat_-_%28MeisterDrucke-1582987%29.jpg";
const RUSSIA =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Empress%20Alexandra%20Feodorovna%20of%20Russia%20by%20N.Bodarevsky%20(1907,%20Hermitage).jpg?width=1400";

const heroLabels = [
  { name: "Infanta Margarita Teresa", role: "the royal person", x: 49, y: 60 },
  { name: "María Agustina Sarmiento", role: "menina · kneeling", x: 37, y: 68 },
  { name: "Isabel de Velasco", role: "menina · standing", x: 63, y: 61 },
  { name: "Marcela de Ulloa", role: "senior attendant", x: 69, y: 43 },
];

const day = [
  ["07:00", "The toilette", "Dress, jewels, wardrobe choices—and the ceremony of who may touch what."],
  ["09:00", "Chapel", "Escort, precedence and the queen’s public appearance as a moving institution."],
  ["11:00", "Audiences", "Visitors are introduced; messages and petitions cross the household threshold."],
  ["14:00", "Walk · ride · hunt", "Companionship and chaperonage create long intervals of unrecorded conversation."],
  ["17:00", "Correspondence", "Letters, dictation, family news and diplomatic intelligence enter the chamber."],
  ["20:00", "Supper · cards · music", "Relationship-building and observation under the guise of sociability."],
  ["23:00", "Bedchamber", "The ordinary day ends at the innermost level of access."],
];

const courts = {
  britain: {
    kicker: "The court that survived modernization",
    text: "Political importance declined gradually while ceremonial forms endured. Offices remained legible long after ministers, secretaries and professional staff had absorbed their former work.",
    color: "#8b2331",
    dates: "c. 1300 · Tudor formalization · 1839 crisis · 2022 reinvention",
    ranks: ["Mistress of the Robes", "Ladies of the Bedchamber", "Women of the Bedchamber", "Maids of Honour"],
    image: VICTORIA,
    caption: "Victoria’s accession council, 1837 · Sir George Hayter",
  },
  france: {
    kicker: "The court as choreography",
    text: "Versailles made precedence and proximity into an exact public grammar. The queen’s household turned dressing, dining and presentation into visible claims about rank.",
    color: "#254f88",
    dates: "15th c. · Versailles high court · 1792 rupture · 1870 final end",
    ranks: ["Surintendante (when filled)", "Première dame d’honneur", "Dame d’atours", "Dames du palais · Filles d’honneur"],
    image: MARIE,
    caption: "Marie Antoinette and her children, 1787 · Vigée Le Brun",
  },
  spain: {
    kicker: "The court as enclosure",
    text: "Habsburg etiquette produced an especially guarded and hierarchical female household. The menina was noble, supervised and placed—not a generic servant.",
    color: "#a36d18",
    dates: "late medieval roots · 1526 reorganization · 1700s reform · 1931 abolition",
    ranks: ["Camarera mayor de Palacio", "Dueñas de honor", "Damas de la reina", "Meninas"],
    image: LAS_MENINAS,
    caption: "Las Meninas, 1656 · Diego Velázquez",
  },
  austria: {
    kicker: "The aristocratic court preserved",
    text: "Vienna retained an unusually exclusive court society deep into the modern era. The women’s court mixed Spanish-Burgundian inheritance with a durable Habsburg order.",
    color: "#5f3b73",
    dates: "Spanish influence · 1619 settlement · 18th-c. apogee · 1918 end",
    ranks: ["Obersthofmeisterin", "Fräuleinhofmeisterin", "Kammerfräulein", "Hoffräulein"],
    image: MARIA_THERESA,
    caption: "Maria Theresa with her children · Friedrich Heinrich Füger",
  },
  russia: {
    kicker: "Western form, autocratic intimacy",
    text: "German titles and a formal rank system proliferated after Peter I. Yet the decisive distinction remained personal: a few women served; many more merely held honorific court rank.",
    color: "#6f1f56",
    dates: "Muscovite household · 1722 ranks · 1834 dress code · 1917 end",
    ranks: ["Ober-Hofmeisterin", "Hofmeisterin", "Statsdame", "Kammer-Fräulein · Freylina"],
    image: RUSSIA,
    caption: "Alexandra Feodorovna, 1907 · Nikolai Bodarevsky",
  },
} as const;

const timeline = [
  { name: "England / Britain", color: "#8b2331", start: 1290, formal: 1485, end: 2022 },
  { name: "France", color: "#254f88", start: 1250, formal: 1450, end: 1870 },
  { name: "Spain", color: "#a36d18", start: 1300, formal: 1526, end: 1931 },
  { name: "Habsburg Austria", color: "#5f3b73", start: 1500, formal: 1619, end: 1918 },
  { name: "Imperial Russia", color: "#6f1f56", start: 1500, formal: 1722, end: 1917 },
];

const yearPct = (year: number) => `${((year - 1200) / (2022 - 1200)) * 100}%`;

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [heroStep, setHeroStep] = useState(0);
  const [chemise, setChemise] = useState<string | null>(null);
  const [activeCourt, setActiveCourt] = useState<keyof typeof courts>("spain");

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
      setHeroStep(Math.min(4, Math.floor(progress * 5)));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => {
      removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <main>
      <section className="hero-scroll" ref={heroRef} aria-label="Las Meninas introduction">
        <div className="hero-sticky">
          <img src={LAS_MENINAS} alt="Diego Velázquez’s Las Meninas, 1656" className="hero-painting" />
          <div className="hero-vignette" />
          <div className={`hero-title ${heroStep > 0 ? "depart" : ""}`}>
            <p className="eyebrow light">An anatomy of the royal household</p>
            <h1>Ladies-in-Waiting</h1>
            <p>The women who lived inside the radius of royal power.</p>
            <span className="scroll-cue">Scroll to enter the court ↓</span>
          </div>
          {heroLabels.map((label, i) => (
            <div
              key={label.name}
              className={`painting-label ${heroStep >= i + 1 ? "active" : ""}`}
              style={{ left: `${label.x}%`, top: `${label.y}%` }}
            >
              <i />
              <strong>{label.name}</strong>
              <span>{label.role}</span>
            </div>
          ))}
          <div className={`hero-payoff ${heroStep === 4 ? "active" : ""}`}>
            This is not simply a princess surrounded by servants.
            <strong>It is a picture of an institution.</strong>
          </div>
          <p className="art-credit">Diego Velázquez · Las Meninas · 1656 · Museo Nacional del Prado</p>
        </div>
      </section>

      <section className="access-section dark-section">
        <div className="section-head reveal">
          <p className="eyebrow">The geometry of access</p>
          <h2>Power had an address.</h2>
          <p>Early-modern government was partly organized by rooms, doors and bodies. Each threshold admitted fewer people.</p>
        </div>
        <div className="access-stage reveal">
          <div className="rings" aria-label="Nested spaces of court access">
            {[
              ["Realm", "Crowds"], ["Court", "Courtiers"], ["Royal household", "Office-holders"],
              ["Privy chamber", "The trusted"], ["Bedchamber", "Very few"], ["Royal person", "One"],
            ].map(([name, note], i) => (
              <div className={`ring ring-${i}`} key={name}>
                <span>{name}<small>{note}</small></span>
              </div>
            ))}
            <div className="lady-access"><b>Lady of the household</b><span>crosses the gates</span></div>
            {[0, 1, 2, 3, 4].map((i) => <i className={`petition p${i}`} key={i}>request</i>)}
          </div>
          <div className="power-chain">
            {["Proximity", "Access", "Information", "Patronage", "Power"].map((word, i) => (
              <div key={word}><b>{word}</b>{i < 4 && <span>↓</span>}</div>
            ))}
          </div>
        </div>
        <p className="section-note reveal">A court appointment created no automatic policy power. It created the conditions for power: repeated contact, private trust and the ability to carry a request across a guarded boundary.</p>
      </section>

      <section className="day-section">
        <div className="section-head reveal">
          <p className="eyebrow">One day inside</p>
          <h2>A day in the queen’s household</h2>
          <p>Politics was not a task scheduled between correspondence and supper. It was latent in the whole day.</p>
        </div>
        <div className="day-track">
          {day.map(([time, title, text], i) => (
            <article className="day-moment reveal" key={time}>
              <div className="clock"><span>{time}</span><i style={{ transform: `rotate(${i * 28 + 20}deg)` }} /></div>
              <div><p>{title}</p><h3>{text}</h3></div>
            </article>
          ))}
        </div>
        <div className="day-bands reveal" aria-label="Responsibilities spanning the day">
          <span style={{ width: "100%" }}>companionship</span>
          <span style={{ width: "88%" }}>protocol</span>
          <span style={{ width: "73%" }}>household management</span>
          <span style={{ width: "96%" }} className="politics">political access</span>
        </div>
        <aside className="distinction reveal"><b>Attendance was not ordinary domestic labor.</b> Noble women might ceremonially present a garment, supervise wardrobe staff, or pour water while lower-ranking paid servants did the physical preparation.</aside>
      </section>

      <section className="timeline-section dark-section">
        <div className="section-head reveal">
          <p className="eyebrow">One day becomes seven centuries</p>
          <h2>The long life of a court institution</h2>
        </div>
        <div className="master-timeline reveal">
          <div className="period-labels">
            <span style={{ left: yearPct(1200), width: `calc(${yearPct(1450)} - ${yearPct(1200)})` }}>Formation<br/><small>c. 1200–1450</small></span>
            <span className="high" style={{ left: yearPct(1450), width: `calc(${yearPct(1800)} - ${yearPct(1450)})` }}>Great age<br/><small>c. 1450–1800</small></span>
            <span style={{ left: yearPct(1800), width: `calc(${yearPct(1918)} - ${yearPct(1800)})` }}>Decline<br/><small>1800–1918</small></span>
            <span style={{ left: yearPct(1918), width: `calc(${yearPct(2022)} - ${yearPct(1918)})` }}>Survival<br/><small>1918–2022</small></span>
          </div>
          <div className="peak-band" style={{ left: yearPct(1550), width: `calc(${yearPct(1789)} - ${yearPct(1550)})` }}><span>European high period · 1550–1789</span></div>
          {timeline.map((lane) => (
            <div className="timeline-lane" key={lane.name}>
              <b>{lane.name}</b>
              <div className="lane-axis">
                <span className="presence" style={{ left: yearPct(lane.start), width: `calc(${yearPct(lane.end)} - ${yearPct(lane.start)})`, background: lane.color }} />
                <i className="formal" style={{ left: yearPct(lane.formal), borderColor: lane.color }}><em>{lane.formal}</em></i>
                <i className="end" style={{ left: yearPct(lane.end), background: lane.color }}><em>{lane.end}</em></i>
              </div>
            </div>
          ))}
          <div className="year-axis">{[1200, 1450, 1550, 1789, 1918, 2022].map(y => <span key={y} style={{ left: yearPct(y) }}>{y}</span>)}</div>
        </div>
        <div className="date-ribbon reveal">
          {[["1526","Habsburg-Spanish organization"],["1660s","Mature Versailles"],["1722","Russian regularization"],["1839","Bedchamber Crisis"],["1917–18","Russia and Austria end"],["2022","Queen’s Companions"]].map(([d,t]) => <div key={d}><b>{d}</b><span>{t}</span></div>)}
        </div>
      </section>

      <section className="courts-section">
        <div className="section-head reveal">
          <p className="eyebrow">Five variations on proximity</p>
          <h2>Compare the courts</h2>
          <p>The titles changed. The underlying bargain—rank exchanged for privileged attendance—did not.</p>
        </div>
        <div className="court-tabs reveal">
          <div className="court-tab-list" role="tablist" aria-label="Select a royal court">
            {(Object.keys(courts) as Array<keyof typeof courts>).map((key) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeCourt === key}
                className={activeCourt === key ? "active" : ""}
                onClick={() => setActiveCourt(key)}
                key={key}
              >
                {key === "britain" ? "Britain" : key[0].toUpperCase()+key.slice(1)}
              </button>
            ))}
          </div>
          {(() => {
            const court = courts[activeCourt];
            const key = activeCourt;
            return (
              <div className="court-panel" role="tabpanel" style={{ "--court": court.color } as CSSProperties}>
                <div className="court-copy">
                  <p className="court-kicker">{court.kicker}</p>
                  <h3>{key === "britain" ? "Britain" : key[0].toUpperCase()+key.slice(1)}</h3>
                  <p>{court.text}</p>
                  <span className="court-dates">{court.dates}</span>
                </div>
                <ol className="rank-ladder">
                  {court.ranks.map((rank, i) => <li key={rank}><i>{String(i+1).padStart(2,"0")}</i><span>{rank}</span></li>)}
                </ol>
                <figure className="court-image"><img src={court.image} alt={court.caption} /><figcaption>{court.caption}</figcaption></figure>
              </div>
            );
          })()}
        </div>
      </section>

      <section className="paintings-section dark-section">
        <div className="section-head reveal">
          <p className="eyebrow">Paintings as evidence</p>
          <h2>Read the court.</h2>
          <p>In a court image, distance is rarely empty. It is ranked.</p>
        </div>
        <div className="painting-reader reveal">
          <div className="reader-image">
            <img src={LAS_MENINAS} alt="Las Meninas with annotated court positions" />
            {heroLabels.map((label, i) => <button className={`hotspot hs-${i}`} key={label.name} aria-label={label.name}><span><b>{label.name}</b>{label.role}</span></button>)}
          </div>
          <div className="reader-key">
            <div><b>01</b><p><strong>Who approaches?</strong>The kneeling María Agustina crosses the last steps to the Infanta and offers a small red cup.</p></div>
            <div><b>02</b><p><strong>Who stands?</strong>Isabel de Velasco’s poised stance marks readiness and noble attendance, not manual servitude.</p></div>
            <div><b>03</b><p><strong>Who supervises?</strong>Marcela de Ulloa stands farther back, but seniority is not reducible to inches.</p></div>
            <div><b>04</b><p><strong>Who is absent yet present?</strong>The king and queen appear in the mirror. The room is organized around sovereign sight.</p></div>
          </div>
        </div>
        <div className="evidence-strip reveal">
          <figure><img src={VICTORIA} alt="Queen Victoria’s accession council"/><figcaption><b>Britain · 1837</b> Victoria kneels before the council; her female household forms a distinct witnessing group beyond the male officers.</figcaption></figure>
          <figure><img src={MARIE} alt="Marie Antoinette and her children"/><figcaption><b>France · 1787</b> The official portrait removes the household to construct maternal intimacy. Absence, too, can be staged.</figcaption></figure>
          <figure><img src={MARIA_THERESA} alt="Maria Theresa surrounded by her children"/><figcaption><b>Austria · c. 1776</b> Dynastic family occupies the picture’s center; attendants disappear beyond its official frame.</figcaption></figure>
        </div>
      </section>

      <section className="chemise-section">
        <div className="chemise-card reveal">
          <div className="chemise-copy">
            <p className="eyebrow">You decide the precedence</p>
            <h2>Who gets to hand the Queen her chemise?</h2>
            <p>At the queen’s morning dressing, the dame d’honneur is about to perform her ceremonial duty. A princess of the royal family enters. Who now has the right to present the garment?</p>
            <div className="choices">
              {[
                ["chamber","The première femme de chambre"],["honour","The dame d’honneur"],["princess","The princess of the royal family"]
              ].map(([id,label]) => <button key={id} onClick={() => setChemise(id)} aria-pressed={chemise===id}>{label}</button>)}
            </div>
          </div>
          <div className={`chemise-stage ${chemise ? "answered" : ""} ${chemise === "princess" ? "correct" : "incorrect"}`}>
            <div className="figure servant"><i/><span>Chamber staff<br/><small>prepare & supply</small></span></div>
            <div className="figure honour"><i/><span>Dame d’honneur<br/><small>ordinary ceremonial right</small></span></div>
            <div className="figure princess"><i/><span>Princess<br/><small>superseding rank</small></span></div>
            <div className="figure queen"><i/><span>The Queen</span></div>
            <div className="garment">chemise</div>
            {chemise && <div className="answer"><b>{chemise === "princess" ? "Correct." : "Not once the princess enters."}</b> The dame d’honneur cedes the privilege to a princess of the royal family. Rank reroutes the object.</div>}
          </div>
        </div>
        <blockquote className="reveal">Court etiquette looks ornamental until you realize that every gesture answers a political question: <strong>who is entitled to approach the sovereign?</strong></blockquote>
      </section>

      <section className="network-section dark-section">
        <div className="section-head reveal">
          <p className="eyebrow">Office chart → influence network</p>
          <h2>The title was only the visible layer.</h2>
        </div>
        <div className="network reveal" aria-label="Network of influence around a queen or empress">
          <svg viewBox="0 0 1000 620" aria-hidden="true">
            {[[500,310,230,130],[500,310,185,470],[500,310,500,70],[500,310,815,155],[500,310,825,450],[230,130,85,300],[185,470,55,535],[815,155,935,285],[825,450,950,535]].map((l,i)=><line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />)}
          </svg>
          <div className="node sovereign">Queen<br/>or Empress</div>
          <div className="node lady">lady-in-waiting</div><div className="node husband">husband</div><div className="node family">family</div>
          <div className="node minister">minister</div><div className="node ambassador">ambassador</div><div className="node petitioner">petitioner</div>
          <div className="node faction">political faction</div><div className="node intel">intelligence</div>
          {[0,1,2,3,4].map(i=><i className={`flow f${i}`} key={i}/>)}
        </div>
        <div className="influence-pairs reveal">
          <article><span>Britain · Queen Anne</span><h3>Sarah Churchill</h3><p>Friendship, household office, family interest and party politics converged. Her influence exceeded any clean description of “Mistress of the Robes.”</p></article>
          <article><span>Russia · Alexandra Feodorovna</span><h3>Anna Vyrubova</h3><p>She held no commanding bureaucratic office. Her power came from trusted private intimacy—and from the people and information that intimacy could introduce.</p></article>
        </div>
        <p className="central-line reveal">The scarce resource was not the title.<br/><strong>It was trusted, repeated, private access.</strong></p>
      </section>

      <section className="crisis-section">
        <div className="section-head reveal">
          <p className="eyebrow">London · May 1839</p>
          <h2>A government fails to form.</h2>
          <p className="shock">Partly because of the Queen’s ladies-in-waiting.</p>
        </div>
        <div className="crisis-sequence">
          <article className="reveal"><b>01</b><h3>Melbourne’s Whig ministry falters.</h3><p>The twenty-year-old Victoria asks Conservative leader Sir Robert Peel to form a government.</p></article>
          <article className="reveal"><b>02</b><h3>Peel asks for household changes.</h3><p>Senior ladies close to Victoria were wives or relatives of leading Whigs. He wanted visible proof that the Crown supported the incoming ministry.</p></article>
          <article className="reveal"><b>03</b><h3>Victoria refuses.</h3><p>She understands the women as intimate companions, not interchangeable political appointments, and calls their removal “repugnant to her feelings.”</p></article>
          <article className="reveal"><b>04</b><h3>Peel declines the commission.</h3><p>Melbourne returns. A constitutional monarchy has discovered that the private household is still not entirely private.</p></article>
        </div>
        <p className="source-line reveal">The exchange survives in the parliamentary record: Victoria’s letter and Peel’s reply were read into Hansard on 13 May 1839.</p>
      </section>

      <section className="decline-section dark-section">
        <div className="section-head reveal"><p className="eyebrow">The decomposition</p><h2>Where did the institution go?</h2><p>It did not simply fade. Its functions migrated.</p></div>
        <div className="decomposition reveal">
          <div className="early-officer"><span>Early-modern<br/><b>lady-in-waiting</b></span></div>
          <div className="function-list">
            {["companionship","wardrobe","correspondence","protocol","access control","household management","political intelligence","patronage"].map((f,i)=><div key={f} style={{"--i":i} as CSSProperties}>{f}</div>)}
          </div>
          <div className="migration-lines" aria-hidden="true">{Array.from({length:8}).map((_,i)=><i key={i}/>)}</div>
          <div className="modern-offices">
            {["private secretary","professional civil service","dresser / employee","protocol office","equerry","press office","party government","bureaucratic appointments"].map(x=><span key={x}>{x}</span>)}
          </div>
        </div>
        <div className="remains reveal"><span>What remains</span><b>companionship</b><i>+</i><b>ceremonial attendance</b></div>
        <p className="section-note reveal">As government became documentary, departmental and professional, the royal household lost its monopoly on access, information and administrative action.</p>
      </section>

      <section className="ending">
        <img src={LAS_MENINAS} alt="Las Meninas, returned to without annotations" />
        <div className="ending-shade"/>
        <div className="ending-copy reveal">
          <p>For centuries, European government was partly organized around a physical fact:</p>
          <h2>some people could approach the sovereign<br/>and others could not.</h2>
          <p>Ladies-in-waiting lived unusually close to the center.</p>
          <div className="final-chain">{["Medieval entourage","Renaissance court office","Early-modern access broker","Aristocratic companion","Modern ceremonial aide"].map((x,i)=><span key={x}>{x}{i<4&&<i>↓</i>}</span>)}</div>
        </div>
      </section>

      <footer>
        <div><p className="eyebrow">Selected sources</p><h2>Research notes & image record</h2></div>
        <ol>
          <li><a href="https://www.museodelprado.es/en/the-collection/art-work/las-meninas/9fdc7800-9ade-48b0-ab8b-edee94ea877f">Museo del Prado · Las Meninas collection record</a></li>
          <li><a href="https://en.chateauversailles.fr/discover/estate/palace/queen-apartments">Château de Versailles · The Queen’s Apartments</a></li>
          <li><a href="https://www.gutenberg.org/files/3891/3891-h/3891-h.htm">Jeanne-Louise-Henriette Campan · Memoirs of Marie Antoinette</a></li>
          <li><a href="https://hansard.parliament.uk/commons/1839-05-13/debates/90e47c4d-3c92-49c6-9b62-498d0d931328/CommonsChamber">UK Parliament · Commons debate, 13 May 1839</a></li>
          <li><a href="https://www.habsburger.net/en/chapter/empresss-side-women-court">The World of the Habsburgs · Women at Court</a></li>
          <li><a href="https://kaiserhof.geschichte.lmu.de/">LMU · Kaiser und Höfe courtier database</a></li>
          <li><a href="https://www.hrp.org.uk/kensington-palace/history-and-stories/queen-victoria/">Historic Royal Palaces · Queen Victoria</a></li>
          <li><a href="https://commons.wikimedia.org/wiki/File:Las_Meninas_(1656),_by_Velazquez.jpg">Wikimedia Commons · public-domain Las Meninas file record</a></li>
        </ol>
        <p className="method">Dates describe institutional phases rather than a single synchronized European system. Court hierarchies changed by reign; ladders shown here are representative of their mature forms. Artworks are identified in captions; public-domain files are served from Commons where available.</p>
      </footer>
    </main>
  );
}
