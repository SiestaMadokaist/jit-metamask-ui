import { useEffect, useState } from "react";
import { MainApp } from "../lib/MainApp";

enum STEP { A, B, C, H };
interface StepState {
  step: STEP;
  tapeIndex: number;
  logs: string[];
}

interface INextStep {
  move: 'R' | 'L' | 'N';
  next: STEP;
  print: string;
}

const NextStep: Record<STEP, [INextStep, INextStep]> = {
  [STEP.A]: [
    { move: 'R', next: STEP.B, print: 'AB' },
    { move: 'L', next: STEP.C, print: 'AC' },
  ],
  [STEP.B]: [
    { move: 'L', next: STEP.A, print: 'BA' },
    { move: 'R', next: STEP.B, print: 'BB' },
  ],
  [STEP.C]: [
    { move: 'L', next: STEP.B, print: 'CB' },
    { move: 'N', next: STEP.H, print: 'CH' },
  ],
  [STEP.H]: [
    { move: 'N', next: STEP.H, print: '' },
    { move: 'N', next: STEP.H, print: '' },
  ],
}
const reducer = (tapes: string, step: StepState) => {
  const cell = (tapes.split('')[step.tapeIndex] ?? tapes[0]) === '1' ? 1 : 0;
  const next = NextStep[step.step][cell];
  return next;
}

export default function TuringMachine(): JSX.Element {
  const [step, setStep] = useState<StepState>({ step: STEP.A, tapeIndex: 8, logs: [] });
  const [paused, setPaused] = useState<boolean>(true);
  const [tape, setTape] = useState<string>('');
  useEffect(() => {
    (async () => {
      await new Promise((rs, rj) => { setTimeout(rs, 1000) });
      if (paused) { return; }
      if (step.step === STEP.H) { return; }
      const next = reducer(tape, step);
      const tapeIndex = next.move === 'R' ? step.tapeIndex + 1 : step.tapeIndex - 1;
      setStep({ step: next.next, logs: [...step.logs, next.print], tapeIndex });
    })();
  }, [step, paused, tape]);
  const bg = (s: STEP) => {
    if (s === step.step) { return 'lightblue'; }
    else { return 'lightgray'; }
  }
  return (<div>
    <div style={{ margin: '10px', padding: '5px', border: '1px black solid' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ backgroundColor: bg(STEP.A), width: '50px', padding: '10px', margin: '10px' }}>A</div>
        <div style={{ backgroundColor: bg(STEP.B), width: '50px', padding: '10px', margin: '10px' }}>B</div>
      </div>
      <div style={{ display: 'flex'}}>
        <div style={{ backgroundColor: bg(STEP.C), width: '50px', padding: '10px', margin: '10px' }}>C</div>
        <div style={{ backgroundColor: bg(STEP.H), width: '50px', padding: '10px', margin: '10px' }}>H</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ backgroundColor: 'yellow' }}>{tape.split('').splice(0, step.tapeIndex).join('-')}-</div>
        <div style={{ backgroundColor: 'orange', paddingLeft: '5px', paddingRight: '5px' }}>{tape.split('')[step.tapeIndex]}</div>
        <div style={{ backgroundColor: 'yellow' }}>-{tape.split('').splice(step.tapeIndex + 1).join('-')}</div>
      </div>
      <div>{step.logs.join('-')}</div>
      <input pattern="[01]+" onChange={(e) => setTape(e.target.value)}></input>
      <button onClick={() => setStep({ step: STEP.A, tapeIndex: 8, logs: [] })}>reset</button>
      <button onClick={() => setPaused(!paused)}>BEGIN</button>
    </div>
  </div>);
}
