import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, Home, RotateCcw, Play, Pause, Eye, Lightbulb, Plus, Minus, Trophy, Shuffle, Maximize2, Upload, Trash2 } from 'lucide-react'
import './styles.css'
import { bibleEmojiQuestions, bibleNonsense, bingoWords, bodyTalk, chosungQuestions, games, missions, photoQuestions, relayWords, sentenceQuestions } from './data/gameData'

const readPath = () => window.location.pathname.split('/').filter(Boolean).pop() || 'home'
const navigate = (id) => { window.history.pushState(null, '', id === 'home' ? '/' : `/${id}`); window.dispatchEvent(new Event('popstate')) }
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]
const fmt = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 10)).padStart(2, '0')}`

function Shell({ title, icon, children }) {
  return <main className="app">
    <header className="topbar">
      <button className="navBtn" onClick={() => navigate('home')}><ArrowLeft size={26}/> 홈</button>
      <div className="screenTitle"><span>{icon}</span>{title}</div>
      <button className="brandBtn" onClick={() => document.documentElement.requestFullscreen?.()}><Maximize2 size={20}/> UMGONG PLAY</button>
    </header>
    {children}
  </main>
}

function HomePage() {
  const tags = [...new Set(games.map(g => g.tag))]
  const [tag, setTag] = useState('전체')
  const list = tag === '전체' ? games : games.filter(g => g.tag === tag)
  return <Shell title="움공플레이" icon="🏠">
    <section className="hero">
      <div className="heroText">
        <p className="eyebrow">움직이는교회 레크리에이션 스테이지</p>
        <h1>설명 앱이 아니라<br/><span>바로 진행하는 게임 무대</span></h1>
        <p>큰 글씨, 큰 버튼, 힌트 공개, 정답 공개, 팀 점수판, 라운드 진행을 중심으로 다시 구성했습니다.</p>
      </div>
      <div className="heroPanel"><b>진행 순서</b><span>게임 선택</span><span>문제 공개</span><span>힌트·정답 연출</span><span>점수 기록</span></div>
    </section>
    <div className="filterRow"><button className={tag==='전체'?'selected':''} onClick={()=>setTag('전체')}>전체</button>{tags.map(t=><button className={tag===t?'selected':''} onClick={()=>setTag(t)} key={t}>{t}</button>)}</div>
    <section className="gameGrid">{list.map(g => <button className="gameCard" onClick={() => navigate(g.id)} key={g.id}>
      <span className="gameTag">{g.tag}</span><div className="gameIcon">{g.icon}</div><h2>{g.name}</h2><p>{g.desc}</p><strong>시작하기</strong>
    </button>)}</section>
  </Shell>
}

function ScoreBoard({ step = 10 }) {
  const [scores, setScores] = useState([0, 0, 0, 0])
  const add = (idx, v) => setScores(s => s.map((x, i) => i === idx ? Math.max(0, x + v) : x))
  return <aside className="scoreBoard"><h3><Trophy/> 팀 점수판</h3>{scores.map((s, i) => <div className="teamLine" key={i}>
    <span>{i + 1}팀</span><button onClick={() => add(i, -step)}><Minus size={18}/></button><b>{s}</b><button onClick={() => add(i, step)}><Plus size={18}/></button>
  </div>)}<button className="ghost full" onClick={()=>setScores([0,0,0,0])}>점수 초기화</button></aside>
}

function StageLayout({ children, score = true }) { return <section className={score ? 'stageLayout' : 'stageLayout one'}><div>{children}</div>{score && <ScoreBoard/>}</section> }
function StageCard({ children, className = '' }) { return <div className={`stageCard ${className}`}>{children}</div> }
function HintAnswerControls({ item, hintCount, setHintCount, showAnswer, setShowAnswer, onNext }) { return <div className="controlRow">
  <button onClick={() => setHintCount(Math.min((item.hints || []).length, hintCount + 1))}><Lightbulb/> 힌트</button>
  <button onClick={() => setShowAnswer(true)}><Eye/> 정답</button>
  <button className="primary" onClick={onNext}><Play/> 다음 문제</button>
</div> }
function Hints({ item, hintCount }) { return <div className="hintList">{(item.hints || []).slice(0, hintCount).map((h, i) => <div key={h} className="hint"><b>힌트 {i + 1}</b>{h}</div>)}</div> }

function StopwatchGame() {
  const [running, setRunning] = useState(false), [elapsed, setElapsed] = useState(0), [target, setTarget] = useState(10000), [records, setRecords] = useState([])
  const last = useRef(Date.now())
  useEffect(() => { if (!running) return; last.current = Date.now(); const id = setInterval(() => { const now = Date.now(); setElapsed(e => e + now - last.current); last.current = now }, 21); return () => clearInterval(id) }, [running])
  const stop = () => { setRunning(false); setRecords(r => [{ time: elapsed, diff: Math.abs(elapsed - target) }, ...r].slice(0, 6)) }
  return <Shell title="스톱워치" icon="⏱️"><StageLayout>
    <StageCard className="center"><p className="eyebrow">목표 시간 맞히기</p><div className="timeBig">{fmt(elapsed)}</div><div className="presetRow"><button onClick={()=>setTarget(5000)}>5초</button><button onClick={()=>setTarget(10000)}>10초</button><button onClick={()=>setTarget(30000)}>30초</button><span>목표: {fmt(target)}</span></div><div className="controlRow"><button className="primary" onClick={() => running ? stop() : setRunning(true)}>{running ? <Pause/> : <Play/>}{running ? '멈추기' : '시작'}</button><button onClick={() => { setRunning(false); setElapsed(0) }}><RotateCcw/> 초기화</button></div></StageCard>
    <StageCard><h3>기록</h3>{records.map((r,i)=><div className="record" key={i}><b>{fmt(r.time)}</b><span>차이 {fmt(r.diff)}</span></div>)}</StageCard>
  </StageLayout></Shell>
}

function TimerGame() {
  const [sec, setSec] = useState(60), [running, setRunning] = useState(false)
  useEffect(() => { if (!running || sec <= 0) return; const id = setTimeout(() => setSec(s => s - 1), 1000); return () => clearTimeout(id) }, [running, sec])
  return <Shell title="타이머" icon="⏳"><StageLayout>
    <StageCard className={sec===0?'center alarm':'center'}><p className="eyebrow">제한시간 카운트다운</p><div className="countBig">{String(Math.floor(sec/60)).padStart(2,'0')}:{String(sec%60).padStart(2,'0')}</div>{sec===0 && <div className="answerPop">시간 종료!</div>}<div className="presetRow"><button onClick={()=>setSec(30)}>30초</button><button onClick={()=>setSec(60)}>1분</button><button onClick={()=>setSec(180)}>3분</button><button onClick={()=>setSec(300)}>5분</button></div><div className="controlRow"><button className="primary" onClick={()=>setRunning(!running)}>{running?'정지':'시작'}</button><button onClick={()=>{setRunning(false);setSec(60)}}>초기화</button></div></StageCard>
  </StageLayout></Shell>
}

function RandomPickGame() {
  const [text, setText] = useState('대표기도\n간식정리\n오늘의 MVP\n찬양 한 소절\n마무리 정리'), [pick, setPick] = useState(''), [spinning, setSpinning] = useState(false)
  const items = text.split('\n').map(x => x.trim()).filter(Boolean)
  const draw = () => { if (!items.length) return; setSpinning(true); let n = 0; const id = setInterval(() => { setPick(sample(items)); n++; if (n > 18) { clearInterval(id); setSpinning(false) } }, 80) }
  return <Shell title="랜덤 뽑기" icon="🎁"><StageLayout>
    <StageCard><h3>후보 입력</h3><textarea className="bigInput" value={text} onChange={e=>setText(e.target.value)} /><button className="primary full" onClick={draw}><Shuffle/> 뽑기 시작</button></StageCard>
    <StageCard className="center"><p className="eyebrow">결과</p><div className={spinning?'pickResult spinning':'pickResult'}>{pick || '버튼을 누르면 결과가 나옵니다'}</div></StageCard>
  </StageLayout></Shell>
}

function DiceGame() {
  const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅']; const yuts = ['도','개','걸','윷','모']
  const [face,setFace]=useState('🎲'), [yut,setYut]=useState('윷을 던져보세요'), [history,setHistory]=useState([]), [roll,setRoll]=useState(false)
  const go = () => { setRoll(true); let n=0; const id=setInterval(()=>{const f=sample(diceFaces), y=sample(yuts); setFace(f); setYut(y); n++; if(n>14){clearInterval(id); setRoll(false); setHistory(h=>[{f,y},...h].slice(0,8))}},70)}
  return <Shell title="주사위 / 윷놀이" icon="🎲"><StageLayout>
    <StageCard className="center"><div className={roll?'dice rolling':'dice'}>{face}</div><div className="answerPop">{yut}</div><button className="primary hugeBtn" onClick={go}>굴리기</button></StageCard>
    <StageCard><h3>결과 기록</h3>{history.map((h,i)=><div className="record" key={i}><b>{h.f}</b><span>{h.y}</span></div>)}</StageCard>
  </StageLayout></Shell>
}

function BingoGame() {
  const [picked,setPicked]=useState([]); const left = bingoWords.filter(w=>!picked.includes(w)); const current = picked[picked.length-1]
  return <Shell title="빙고 게임" icon="🧩"><StageLayout>
    <StageCard className="center"><p className="eyebrow">진행자 단어 뽑기</p><div className="pickResult">{current || '단어 뽑기'}</div><div className="controlRow"><button className="primary" onClick={()=>left.length && setPicked(p=>[...p,sample(left)])}>다음 단어</button><button onClick={()=>setPicked([])}>처음부터</button></div></StageCard>
    <StageCard><h3>전체 단어판</h3><div className="miniGrid">{bingoWords.map(w=><span className={picked.includes(w)?'done':''} key={w}>{w}</span>)}</div></StageCard>
  </StageLayout></Shell>
}

function WordRelayGame() {
  const [idx,setIdx]=useState(0), [turn,setTurn]=useState(0), [sec,setSec]=useState(10), [run,setRun]=useState(false)
  useEffect(()=>{ if(!run||sec<=0)return; const id=setTimeout(()=>setSec(s=>s-1),1000); return()=>clearTimeout(id)},[run,sec])
  const next=()=>{setIdx((idx+1)%relayWords.length);setTurn((turn+1)%4);setSec(10);setRun(false)}
  return <Shell title="단어 릴레이" icon="🔤"><StageLayout>
    <StageCard className="center"><p className="eyebrow">현재 차례: {turn+1}팀</p><div className="relayWord">{relayWords[idx]}</div><p>마지막 글자로 이어 말하세요.</p><div className="countSmall">{sec}</div><div className="controlRow"><button onClick={()=>setRun(!run)}>{run?'정지':'시작'}</button><button className="primary" onClick={next}>성공 · 다음</button></div></StageCard>
  </StageLayout></Shell>
}

function SentenceMatchGame() {
  const [i,setI]=useState(0), [hint,setHint]=useState(0), [ans,setAns]=useState(false); const q=sentenceQuestions[i]
  return <Shell title="문장 매칭" icon="📖"><StageLayout><StageCard className="center"><p className="eyebrow">{q.ref}</p><div className="verseBig">“{q.front} …”</div><Hints item={q} hintCount={hint}/>{ans && <div className="answerPop">{q.back}</div>}<HintAnswerControls item={q} hintCount={hint} setHintCount={setHint} showAnswer={ans} setShowAnswer={setAns} onNext={()=>{setI((i+1)%sentenceQuestions.length);setHint(0);setAns(false)}}/></StageCard></StageLayout></Shell>
}

function ChosungGame() {
  const cats = ['전체', ...new Set(chosungQuestions.map(q=>q.cat))]; const [cat,setCat]=useState('전체'), [i,setI]=useState(0), [hint,setHint]=useState(0), [ans,setAns]=useState(false)
  const list = cat==='전체'?chosungQuestions:chosungQuestions.filter(q=>q.cat===cat); const q=list[i%list.length]
  return <Shell title="초성 게임" icon="🔠"><StageLayout><StageCard className="center"><div className="tabRow">{cats.map(c=><button className={cat===c?'selected':''} onClick={()=>{setCat(c);setI(0);setHint(0);setAns(false)}} key={c}>{c}</button>)}</div><p className="eyebrow">{q.cat}</p><div className="chosungBig">{q.q}</div><Hints item={q} hintCount={hint}/>{ans && <div className="answerPop">정답: {q.a}</div>}<HintAnswerControls item={q} hintCount={hint} setHintCount={setHint} showAnswer={ans} setShowAnswer={setAns} onNext={()=>{setI(i+1);setHint(0);setAns(false)}}/></StageCard></StageLayout></Shell>
}

function PhotoGuessGame() {
  const [custom,setCustom]=useState(()=>JSON.parse(localStorage.getItem('umgongPhotos')||'[]'))
  const [i,setI]=useState(0), [step,setStep]=useState(1), [show,setShow]=useState(false), [mode,setMode]=useState('zoom')
  const list = [...custom, ...photoQuestions]; const q=list[i%list.length]
  const save = (items) => { setCustom(items); localStorage.setItem('umgongPhotos', JSON.stringify(items)) }
  const onFile = e => { const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ const answer=prompt('정답을 입력하세요','정답'); save([{ title:'사용자 사진', answer:answer||'정답', image:reader.result, hints:['사진 일부를 자세히 보세요','색과 모양을 관찰하세요','전체 모습을 떠올려보세요'] }, ...custom]); setI(0); setStep(1); setShow(false) }; reader.readAsDataURL(file) }
  const pct = [12,18,25,34,46,60,78,100][step-1]
  return <Shell title="사진 맞추기" icon="📷"><StageLayout><StageCard className="center"><div className="topActions"><label className="uploadBtn"><Upload/> 사진 추가<input type="file" accept="image/*" onChange={onFile}/></label><button onClick={()=>setMode(mode==='zoom'?'mosaic':'zoom')}>모드: {mode==='zoom'?'확대':'모자이크'}</button>{custom.length>0&&<button onClick={()=>save([])}><Trash2/> 사용자 사진 삭제</button>}</div><p className="eyebrow">{q.title} · 공개 단계 {step}/8</p><div className={mode==='zoom'?'photoStage zoomMode':'photoStage mosaicMode'} style={{'--pct':`${pct}%`, '--blur':`${Math.max(0, 12-step*1.5)}px`}}><img src={q.image} alt="문제 사진"/></div><div className="sliderRow"><button onClick={()=>setStep(Math.max(1,step-1))}>이전 단계</button><input type="range" min="1" max="8" value={step} onChange={e=>setStep(Number(e.target.value))}/><button className="primary" onClick={()=>setStep(Math.min(8,step+1))}>다음 단계</button></div><Hints item={q} hintCount={Math.max(0, step-5)}/>{show&&<div className="answerPop">정답: {q.answer}</div>}<div className="controlRow"><button onClick={()=>setShow(true)}><Eye/> 정답 보기</button><button className="primary" onClick={()=>{setI(i+1);setStep(1);setShow(false)}}>다음 사진</button></div></StageCard></StageLayout></Shell>
}

function BibleEmojiGame() {
  const [i,setI]=useState(0), [hint,setHint]=useState(0), [ans,setAns]=useState(false); const q=bibleEmojiQuestions[i%bibleEmojiQuestions.length]
  return <Shell title="내가 누구게?" icon="🕵️"><StageLayout><StageCard className="center"><p className="eyebrow">그림 힌트 성경 추리</p><div className="emojiPuzzle">{q.q.map((x,n)=><span key={n}>{x}</span>)}</div><Hints item={q} hintCount={hint}/>{ans&&<div className="answerPop">정답: {q.a}</div>}<HintAnswerControls item={q} hintCount={hint} setHintCount={setHint} showAnswer={ans} setShowAnswer={setAns} onNext={()=>{setI(i+1);setHint(0);setAns(false)}}/></StageCard></StageLayout></Shell>
}

function BibleNonsenseGame() {
  const [i,setI]=useState(0), [hint,setHint]=useState(false), [ans,setAns]=useState(false); const q=bibleNonsense[i%bibleNonsense.length]
  return <Shell title="성경 넌센스 배틀" icon="😂"><StageLayout><StageCard className="center"><p className="eyebrow">빠른 정답 모드</p><div className="quizBig">{q.q}</div>{hint&&<div className="hint"><b>힌트</b>{q.hint}</div>}{ans&&<div className="answerPop">정답: {q.a}</div>}<div className="controlRow"><button onClick={()=>setHint(true)}>힌트</button><button onClick={()=>setAns(true)}>정답</button><button className="primary" onClick={()=>{setI(i+1);setHint(false);setAns(false)}}>다음 문제</button></div></StageCard></StageLayout></Shell>
}

function BodyTalkGame() {
  const cats=Object.keys(bodyTalk); const [cat,setCat]=useState(cats[0]), [card,setCard]=useState(''), [sec,setSec]=useState(60), [run,setRun]=useState(false), [pass,setPass]=useState(5)
  useEffect(()=>{ if(!run||sec<=0)return; const id=setTimeout(()=>setSec(s=>s-1),1000); return()=>clearTimeout(id)},[run,sec])
  return <Shell title="몸으로 말해요" icon="🙆"><StageLayout><StageCard className="center"><div className="tabRow">{cats.map(c=><button className={cat===c?'selected':''} onClick={()=>{setCat(c);setCard('')}} key={c}>{c}</button>)}</div><p className="eyebrow">말없이 몸짓으로만 설명하세요</p><div className="countSmall">{sec}</div><div className="pickResult">{card || '문제 뽑기'}</div><div className="controlRow"><button onClick={()=>{setCard(sample(bodyTalk[cat]));setSec(60)}}>문제 뽑기</button><button onClick={()=>setRun(!run)}>{run?'정지':'시작'}</button><button disabled={pass<=0} onClick={()=>{setPass(pass-1);setCard(sample(bodyTalk[cat]))}}>패스 {pass}</button><button className="primary" onClick={()=>setCard(sample(bodyTalk[cat]))}>맞힘 · 다음</button></div></StageCard></StageLayout></Shell>
}

function LadderGame() {
  const [names,setNames]=useState('임성원\n김희정\n1팀\n2팀'), [results,setResults]=useState('대표기도\n간식정리\n청소\n오늘의 MVP'), [pairs,setPairs]=useState([])
  const run=()=>{const n=names.split('\n').map(x=>x.trim()).filter(Boolean); const r=results.split('\n').map(x=>x.trim()).filter(Boolean).sort(()=>Math.random()-.5); setPairs(n.map((name,i)=>({name,result:r[i%r.length]})))}
  return <Shell title="사다리타기" icon="🪜"><StageLayout><StageCard><h3>참가자</h3><textarea className="bigInput" value={names} onChange={e=>setNames(e.target.value)}/><h3>결과</h3><textarea className="bigInput small" value={results} onChange={e=>setResults(e.target.value)}/><button className="primary full" onClick={run}>사다리 결과 보기</button></StageCard><StageCard><div className="ladderLines">{pairs.map((p,i)=><div className="ladderPair" key={p.name}><b>{p.name}</b><span className="path">━━━━╋━━━━</span><strong>{p.result}</strong></div>)}</div></StageCard></StageLayout></Shell>
}

function SpinWheelGame() {
  const [items,setItems]=useState('대표기도\n찬양\n간식\n청소\n선물\n벌칙'), [pick,setPick]=useState(''), [spin,setSpin]=useState(false); const arr=items.split('\n').map(x=>x.trim()).filter(Boolean)
  const go=()=>{if(!arr.length)return; setSpin(true); let n=0; const id=setInterval(()=>{setPick(sample(arr));n++; if(n>25){clearInterval(id);setSpin(false)}},70)}
  return <Shell title="스핀 돌리기" icon="🎡"><StageLayout><StageCard><textarea className="bigInput" value={items} onChange={e=>setItems(e.target.value)}/><button className="primary full" onClick={go}>룰렛 돌리기</button></StageCard><StageCard className="center"><div className={spin?'wheel spin':'wheel'}>{pick||'?'}</div></StageCard></StageLayout></Shell>
}

function MissionBoxGame() {
  const [opened,setOpened]=useState(false), [mission,setMission]=useState('')
  return <Shell title="미션 박스" icon="📦"><StageLayout><StageCard className="center"><p className="eyebrow">랜덤 미션 카드</p><button className={opened?'box open':'box'} onClick={()=>{setMission(sample(missions));setOpened(true)}}>{opened?'🎉':'📦'}</button>{opened&&<div className="answerPop">{mission}</div>}<button onClick={()=>setOpened(false)}>다시 닫기</button></StageCard></StageLayout></Shell>
}

function App() {
  const [path,setPath]=useState(readPath()); useEffect(()=>{const f=()=>setPath(readPath()); window.addEventListener('popstate',f); return()=>window.removeEventListener('popstate',f)},[])
  const pages = { home:<HomePage/>, stopwatch:<StopwatchGame/>, timer:<TimerGame/>, 'random-pick':<RandomPickGame/>, dice:<DiceGame/>, bingo:<BingoGame/>, 'word-relay':<WordRelayGame/>, 'sentence-match':<SentenceMatchGame/>, chosung:<ChosungGame/>, 'photo-guess':<PhotoGuessGame/>, 'bible-emoji':<BibleEmojiGame/>, 'bible-nonsense':<BibleNonsenseGame/>, 'body-talk':<BodyTalkGame/>, ladder:<LadderGame/>, 'spin-wheel':<SpinWheelGame/>, 'mission-box':<MissionBoxGame/> }
  return pages[path] || <HomePage/>
}

createRoot(document.getElementById('root')).render(<App />)
