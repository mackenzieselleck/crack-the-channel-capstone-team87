'use client';

//code adapted from Anthropic's Claude response (Sonnet 5)
//prompt: frontend spike for a bb84 walkthrough with an evesdropper functionality where user can choose to be Alice, Bob or Eve and the remaining roles are conducted as NPCs
import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, RotateCcw, Shuffle, Eye, EyeOff, Check, X } from 'lucide-react';
import { MOOD } from '@/lib/spike/mood';

const N = 6;

const COLORS = {
  bg: '#0B1220',
  panel: '#121A2B',
  panelBorder: '#233049',
  text: '#E7ECF5',
  textMuted: '#8B95AC',
  alice: '#FFD459',
  aliceDim: '#D4AB31',
  bob: '#947BE0',
  bobDim: '#7352C7',
  rect: '#7FF5D6',
  diag: '#FFD459',
  eve: '#7FF5D6',
  eveDim: '#31AD8D',
  ok: '#4ADE80',
  err: '#F87171',
} as const;


const FONTS = {
  head: "var(--font-body), sans-serif",
  body: "var(--font-body), sans-serif",
  mono: "var(--font-body), monospace",
} as const;

//type definitions
type Basis = 'rect' | 'diag';
type Role = 'alice' | 'bob' | 'eve';
type Bit = 0 | 1;

interface AliceChoice {
  bit: Bit;
  basis: Basis;
}

//simulates measuring photon in wrong basis
interface Photon {
  //what Bob reads if eve is off and Bob doesn't match Alice
  rand1: Bit;
  //what Eve reads if her basis doesn't match Alices
  rand2: Bit;
  //what Bob reads if Eve is on and Bob doesn't match Eve
  rand3: Bit;
}

//computed per photon result
interface DerivedPhoton {
  //alice's choice
  aliceBit: Bit | null;
  aliceBasis: Basis | null;
  //bob's choice
  bobBit: Bit | null;
  bobBasis: Basis | null;
  //eve's choice
  eveBit: Bit | null;
  eveBasis: Basis | null;
  //result
  matched: boolean;
  errored: boolean;
}

//statistics used in mascot guide
interface NarrativeStats {
  keptCount: number;
  errorCount: number;
  qber: number;
}
//used for mascot guide
interface Narrative {
  title: string;
  body: string;
}
//sends current narrative to mascot
export interface Bb84NarrationEvent extends Narrative {
  mood: number;
  step: number;
  role: Role | null;
}
//sends event to mascot
interface Bb84WalkthroughProps {
  onNarrate?: (event: Bb84NarrationEvent) => void;
}

function rnd(): Bit {
  //coin flip for bit
  return Math.random() < 0.5 ? 0 : 1;
}
function rndBasis(): Basis {
  //coin flip for basis
  return Math.random() < 0.5 ? 'rect' : 'diag';
}
//generates 3 random bits as 3 outcomes for every bit sent
function generatePhotons(n: number): Photon[] {
  const photons: Photon[] = [];
  for (let i = 0; i < n; i++) {
    photons.push({ rand1: rnd(), rand2: rnd(), rand3: rnd() });
  }
  return photons;
}
//generates alice's basis choices and bits if not chosen by the user as their role
function randomAlice(n: number): AliceChoice[] {
  const choices: AliceChoice[] = [];
  for (let i = 0; i < n; i++) {
    //returns random bits and basises
    choices.push({ bit: rnd(), basis: rndBasis() });
  }
  return choices;
}
//creates an array of random basis choices
function randomBasisArr(n: number): Basis[] {
  const bases: Basis[] = [];
  for (let i = 0; i < n; i++) {
    bases.push(rndBasis());
  }
  return bases;
}

//creates an array of empy choice's in case Alice is chosen by the user as role
//this is so the user can input their own choices
function makeEmptyAliceChoices(n: number): (AliceChoice | null)[] {
  const result: (AliceChoice | null)[] = [];
  for (let i = 0; i < n; i++) {
    result.push(null);
  }
  return result;
}
//creates an array of empty basic choices
function makeEmptyBasisChoices(n: number): (Basis | null)[] {
  const result: (Basis | null)[] = [];
  for (let i = 0; i < n; i++) {
    result.push(null);
  }
  return result;
}
//eve basis guessing results
function eveBitOf(photon: Photon, aliceBit: Bit, aliceBasis: Basis, eveBasis: Basis): Bit {
  //if eve guesses correctly alice's bit is returned
  if (eveBasis === aliceBasis) {
    return aliceBit;
  }
  //if she guesses incorrectly the randomised bit is returned
  return photon.rand2;
}

//bob basis guessing results
function bobBitOf(
  photon: Photon,
  aliceBit: Bit,
  aliceBasis: Basis,
  bobBasis: Basis,
  eveIsActive: boolean,
  eveBasis: Basis | null
): Bit {
  //if eve is inactive
  if (!eveIsActive) {
    //if bob guesses correctly alice's bit is returned
    if (bobBasis === aliceBasis) {
      return aliceBit;
    }
    //if he guesses incorrectly the randomised bit is returned
    return photon.rand1;
  }
 
  //if eve is active
  //error handling if eve's basis choice is null the randomised bit is returned
  if (eveBasis === null) {
    return photon.rand3;
  }
 
  //if bob's guess matches eve's forwarded bit the forwarded bit is returned
  const bitEveForwarded = eveBitOf(photon, aliceBit, aliceBasis, eveBasis);
  if (bobBasis === eveBasis) {
    return bitEveForwarded;
  }
  //if the guess doesn't match the randomised bit is returned
  return photon.rand3;
}
//bb84 exchange steps, used for narration
const STEPS = ['Generate', 'Send', 'Measure', 'Compare', 'Sift key'];

//narration used for mascot guide
function narrativeFor(
  step: number,
  role: Role | null,
  eveActive: boolean,
  stats: NarrativeStats
): Narrative {
  if (step === 0) {
    if (role === 'alice')
      return {
        title: "So, you've chosen Alice! We need to encode each photon",
        body: 'For every photon, a basis is chosen to encode each bit. A basis can be either rectagonal or diagonal. Choose one of the four options on each tile. Neither Bob or Eve will know what you choose.',
      };
    return {
      title: 'Alice is encoding each photon',
      body: "Alice will pick a basis for every photon. You won't be able to see any of her choices.",
    };
  }
  if (step === 1) {
    if (role === 'eve')
      return {
        title: "You've picked Eve! Time to intercept some photons",
        body: "Pick a basis to measure each photon as it passes through you. The photons will be resent to Bob using whatever you measured. Neither Alice or Bob will know you are listening. But, be careful, guessing the wrong basis disturbs the photon. This disturbance could give you away.",
      };
    return {
        title: 'Alice sends the photons',
        body: "Each photon is travelling towards Bob. Someone could be listening in right now, measuring and resending every photon. But you can't be sure yet. If someone does, they could disturb it. This disturbance allows you to notice when someone is listening.",
    };
  }
  if (step === 2) {
    if (role === 'bob')
      return {
        title: "So, you're Bob! Pick a basis for each photon",
        body: "You have no idea which basis Alice used. The best you can do is guess. Choose straight or diagonal for every tile below. If you guess right, you'll read the bit correctly. If you guess wrong, it's a coin flip.",
      };
    return {
      title: 'Bob is measuring',
      body: "Bob has no idea which basis Alice used. So he is guessing picking at random for every photon.",
    };
  }
  if (step === 3) {
    return {
      title: "Let's compare!",
      body: `Alice and Bob publicly read out which basis they have used for each photon. Now every choice becomes visible.${
        eveActive ? " Eve's choices are revealed too." : ''
      }`,
    };
  }
  return {
    title: 'The matching bits become the key',
    body: `Every photon where the bases don't match are thrown away leaving only the matching photons. This creates a sifted key.${
      eveActive
        ? `Because Eve is active, ${stats.errorCount} of the ${stats.keptCount} matched basis bits don't actually match between Alice and Bob. This is a ${stats.qber}% error rate. This mismatch is he disturbance that allows them to notice someone was listening.`
        : ''
    }`,
  };
}

//selects moods for mascot
function moodFor(step: number, eveActive: boolean, stats: NarrativeStats, role: Role): number {
  if(step <= 1 && role === 'eve') return MOOD.sneaky;
  if (step <= 2) return MOOD.neutral;
  if (step === 3) return MOOD.neutral;
  if (eveActive) return stats.errorCount > 0 ? MOOD.sad : MOOD.happy;
  return MOOD.happy;
}
//chooses angle depending on bit and basis
function angleForBitAndBasis(bit: Bit, basis: Basis): number {
  if (basis === 'rect') {
    if (bit === 0) {
      return 90;
    }
    return 0;
  }
  if (bit === 0) {
    return 45;
  }
  return 135;
}

interface PhotonGlyphProps {
  bit: Bit | null;
  basis: Basis | null;
  known: boolean;
  size?: number;
  ring?: string;
  onClick?: () => void;
}

 
function PhotonGlyph({ bit, basis, known, size = 40, ring, onClick }: PhotonGlyphProps) {
  const color = basis === 'rect' ? COLORS.rect : COLORS.diag;
  const angle = basis !== null && bit !== null ? angleForBitAndBasis(bit, basis) : 0;
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: `1.5px solid ${known ? color : COLORS.panelBorder}`,
        background: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {known ? (
        <div
          style={{
            width: size * 0.55,
            height: 3,
            background: color,
            borderRadius: 2,
            transform: `rotate(${angle}deg)`,
          }}
        />
      ) : (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: COLORS.textMuted,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}

interface BasisPickerProps {
  onPick: (basis: Basis) => void;
  size?: number;
}

function BasisPicker({ onPick, size = 40 }: BasisPickerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: `1.5px dashed ${COLORS.panelBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => onPick('rect')}
        title="Straight basis"
        aria-label="Choose straight basis"
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: COLORS.rect,
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      />
      <button
        onClick={() => onPick('diag')}
        title="Diagonal basis"
        aria-label="Choose diagonal basis"
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: COLORS.diag,
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      />
    </div>
  );
}

const ALICE_COMBOS: AliceChoice[] = [
  { bit: 0, basis: 'rect' },
  { bit: 1, basis: 'rect' },
  { bit: 0, basis: 'diag' },
  { bit: 1, basis: 'diag' },
];

interface AliceChoicePickerProps {
  onPick: (bit: Bit, basis: Basis) => void;
  size?: number;
}

function AliceChoicePicker({ onPick, size = 40 }: AliceChoicePickerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: `1.5px dashed ${COLORS.panelBorder}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 2,
        padding: 3,
        flexShrink: 0,
      }}
    >
      {ALICE_COMBOS.map((c, idx) => {
        const color = c.basis === 'rect' ? COLORS.rect : COLORS.diag;
        const angle = c.basis === 'rect' ? (c.bit === 0 ? 90 : 0) : c.bit === 0 ? 45 : 135;
        return (
          <button
            key={idx}
            onClick={() => onPick(c.bit, c.basis)}
            title={`${c.basis === 'rect' ? 'Straight' : 'Diagonal'} basis, bit ${c.bit}`}
            aria-label={`Choose ${c.basis === 'rect' ? 'straight' : 'diagonal'} basis, bit ${c.bit}`}
            style={{
              background: 'transparent',
              border: `1px solid ${color}`,
              borderRadius: 3,
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 2,
                background: color,
                borderRadius: 1,
                transform: `rotate(${angle}deg)`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RowLabelProps {
  children: ReactNode;
  sub?: string;
}

function RowLabel({ children, sub }: RowLabelProps) {
  return (
    <div style={{ paddingRight: 12 }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
        {children}
      </div>
      {sub && (
        <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

const ROLE_INFO: Record<Role, { color: string; label: string; desc: string }> = {
  alice: {
    color: COLORS.alice,
    label: 'Alice',
    desc: 'Encode a message into photons.',
  },
  bob: {
    color: COLORS.bob,
    label: 'Bob',
    desc: "Receive and choose a basis to measure the photons Alice sends.",
  },
  eve: {
    color: COLORS.eve,
    label: 'Eve',
    desc: 'Tap the channel. Choose a basis to measure each photon and resend.',
  },
};

interface RoleCardProps {
  id: Role;
  onPick: (role: Role) => void;
}

function RoleCard({ id, onPick }: RoleCardProps) {
  const info = ROLE_INFO[id];
  return (
    <button
      onClick={() => onPick(id)}
      style={{
        textAlign: 'left',
        background: COLORS.panel,
        border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 12,
        padding: '16px 16px 18px',
        cursor: 'pointer',
        flex: '1 1 180px',
        minWidth: 180,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: info.color,
          color: COLORS.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONTS.head,
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        {info.label[0]}
      </div>
      <div style={{ fontFamily: FONTS.head, fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
        Play as {info.label}
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: COLORS.textMuted }}>{info.desc}</div>
    </button>
  );
}

//derives photon result
function computeDerivedPhoton(
  photon: Photon,
  aliceChoice: AliceChoice | null,
  bobBasis: Basis | null,
  eveBasis: Basis | null,
  eveIsActive: boolean
): DerivedPhoton {
  //Alice is user
  if (aliceChoice === null) {
    
    return {
      aliceBit: null,
      aliceBasis: null,
      bobBasis,
      eveBasis,
      eveBit: null,
      bobBit: null,
      matched: false,
      errored: false,
    };
  }
 
  const aliceBit = aliceChoice.bit;
  const aliceBasis = aliceChoice.basis;
 
  const basesMatch = bobBasis !== null && aliceBasis === bobBasis;
 
  //if eve is active, her choices go first before computing results
  const readyToComputeBob = !eveIsActive || eveBasis !== null;
 
//calculates bob's bit results
  let bobBit: Bit | null = null;
  if (bobBasis !== null && readyToComputeBob) {
    bobBit = bobBitOf(photon, aliceBit, aliceBasis, bobBasis, eveIsActive, eveBasis);
  }
 //calculates eve's bit results
  let eveBit: Bit | null = null;
  if (eveIsActive && eveBasis !== null) {
    eveBit = eveBitOf(photon, aliceBit, aliceBasis, eveBasis);
  }
 //calculates bit error
  const hasError = eveIsActive && basesMatch && bobBit !== null && bobBit !== aliceBit;
 
  return {
    aliceBit,
    aliceBasis,
    bobBasis,
    eveBasis,
    eveBit,
    bobBit,
    matched: basesMatch,
    errored: hasError,
  };
}

//ensures all choices are made
function isNextDisabled(
  step: number,
  role: Role,
  allAliceChosen: boolean,
  allEveChosen: boolean,
  allBobChosen: boolean
): boolean {
  if (step === STEPS.length - 1) {
    return true;
  }
  if (step === 0 && role === 'alice' && !allAliceChosen) {
    return true;
  }
  if (step === 1 && role === 'eve' && !allEveChosen) {
    return true;
  }
  if (step === 2 && role === 'bob' && !allBobChosen) {
    return true;
  }
  return false;
}

//runs entire walkthrough
export default function BB84Walkthrough({ onNarrate }: Bb84WalkthroughProps) {
  const [role, setRole] = useState<Role | null>(null);
  const [eveOn, setEveOn] = useState(false);
  const [photons, setPhotons] = useState<Photon[]>(() => generatePhotons(N));
  const [aliceChoices, setAliceChoices] = useState<(AliceChoice | null)[]>(() =>
    makeEmptyAliceChoices(N)
  );
  const [bobChoices, setBobChoices] = useState<(Basis | null)[]>(() => makeEmptyBasisChoices(N));
  const [eveChoices, setEveChoices] = useState<(Basis | null)[]>(() => makeEmptyBasisChoices(N));
  const [step, setStep] = useState(0);
 
  const eveActive = role === 'eve' || eveOn;
 
  function initRound(r: Role | null, eOn: boolean) {
    setPhotons(generatePhotons(N));
    setAliceChoices(r === 'alice' ? makeEmptyAliceChoices(N) : randomAlice(N));
    setBobChoices(r === 'bob' ? makeEmptyBasisChoices(N) : randomBasisArr(N));
    setEveChoices(r === 'eve' ? makeEmptyBasisChoices(N) : randomBasisArr(N));
    setStep(0);
  }
 
  function choosePlayerRole(r: Role) {
    setRole(r);
    initRound(r, eveOn);
  }

  function changeRole() {
    setRole(null);
    setEveOn(false);
    setStep(0);
  }

  function regenerate() {
    initRound(role, eveOn);
  }

  function restart() {
    if (role === 'alice') setAliceChoices(makeEmptyAliceChoices(N));
    if (role === 'bob') setBobChoices(makeEmptyBasisChoices(N));
    if (role === 'eve') setEveChoices(makeEmptyBasisChoices(N));
    setStep(0);
  }

  function toggleEve() {
    setEveOn((v) => {
      const next = !v;
      if (next) setEveChoices((arr) => (arr.every((x) => x !== null) ? arr : randomBasisArr(N)));
      return next;
    });
  }
 
  const derived = useMemo<DerivedPhoton[]>(() => {
    return photons.map((photon, i) =>
      computeDerivedPhoton(photon, aliceChoices[i], bobChoices[i], eveChoices[i], eveActive)
    );
  }, [photons, aliceChoices, bobChoices, eveChoices, eveActive]);
 
  const keptCount = derived.filter((p) => p.matched).length;
  const errorCount = derived.filter((p) => p.matched && p.errored).length;
  const qber = keptCount > 0 ? Math.round((errorCount / keptCount) * 100) : 0;
 
  const allAliceChosen = aliceChoices.every((c) => c !== null);
  const allBobChosen = bobChoices.every((b) => b !== null);
  const allEveChosen = eveChoices.every((b) => b !== null);
  const nextDisabled = role
    ? isNextDisabled(step, role, allAliceChosen, allEveChosen, allBobChosen)
    : true;
 
  function next() {
    if (nextDisabled) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function pickAlice(i: number, bit: Bit, basis: Basis) {
    setAliceChoices((arr) => arr.map((v, idx) => (idx === i ? { bit, basis } : v)));
  }
  function resetAlice(i: number) {
    setAliceChoices((arr) => arr.map((v, idx) => (idx === i ? null : v)));
  }
  function pickBob(i: number, basis: Basis) {
    setBobChoices((arr) => arr.map((v, idx) => (idx === i ? basis : v)));
  }
  function resetBob(i: number) {
    setBobChoices((arr) => arr.map((v, idx) => (idx === i ? null : v)));
  }
  function pickEve(i: number, basis: Basis) {
    setEveChoices((arr) => arr.map((v, idx) => (idx === i ? basis : v)));
  }
  function resetEve(i: number) {
    setEveChoices((arr) => arr.map((v, idx) => (idx === i ? null : v)));
  }
 
  function isAliceKnown(i: number): boolean {
    if (role === 'alice') {
      return aliceChoices[i] !== null;
    }
    return step >= 3;
  }
  function isBobKnown(i: number): boolean {
    if (role === 'bob') {
      return bobChoices[i] !== null;
    }
    return step >= 3;
  }
  function isEveKnown(i: number): boolean {
    if (role === 'eve') {
      return eveChoices[i] !== null;
    }
    return step >= 3;
  }
 
  function rowSub(thisRow: Role, ownLabel: string): string {
    if (role === thisRow) {
      return ownLabel;
    }
    if (step < 3) {
      return 'hidden until compare';
    }
    return 'revealed';
  }
 
  const gridCols = `160px repeat(${N}, 1fr)`;
 
  //sends to mascot on the role select screen and on every step/role/Eve.
  useEffect(() => {
    if (!onNarrate) return;
    if (role === null) {
      onNarrate({
        title: 'Choose a role to begin',
        body: "Pick Alice, Bob, or Eve.",
        mood: MOOD.neutral,
        step: -1,
        role: null,
      });
      return;
    }
    const stats: NarrativeStats = { keptCount, errorCount, qber };
    const narrative = narrativeFor(step, role, eveActive, stats);
    onNarrate({
      ...narrative,
      mood: moodFor(step, eveActive, stats, role),
      step,
      role,
    });
  }, [role, step, eveActive, keptCount, errorCount, qber]);
 
  if (!role) {
    return (
      <div
        style={{
          background: COLORS.bg,
          color: COLORS.text,
          fontFamily: FONTS.body,
          padding: '28px 24px',
          borderRadius: 16,
          maxWidth: 880,
          margin: '0 auto',
        }}
      >
        <div style={{ fontFamily: FONTS.head, fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          Crack the channel
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 22 }}>
          Choose a role to begin
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <RoleCard id="alice" onPick={choosePlayerRole} />
          <RoleCard id="bob" onPick={choosePlayerRole} />
          <RoleCard id="eve" onPick={choosePlayerRole} />
        </div>
      </div>
    );
  }
 
  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: FONTS.body,
        padding: '28px 24px',
        borderRadius: 16,
        maxWidth: 880,
        margin: '0 auto',
      }}
    >
      <style>{`
        @keyframes bb84reveal { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .bb84-reveal { animation: bb84reveal 0.35s ease-out; }
        .bb84-btn { font-family: ${FONTS.body}; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: none; }
      `}</style>
 
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: FONTS.head, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Crack the channel
          </div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
            Playing as{' '}
            <span style={{ color: ROLE_INFO[role].color, fontWeight: 600 }}>{ROLE_INFO[role].label}</span>
          </div>
        </div>
        <button
          onClick={changeRole}
          style={{
            background: 'transparent',
            border: `1px solid ${COLORS.panelBorder}`,
            color: COLORS.textMuted,
            borderRadius: 8,
            fontSize: 12,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          Change role
        </button>
      </div>
 
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  background: i <= step ? COLORS.rect : 'transparent',
                  color: i <= step ? '#04232B' : COLORS.textMuted,
                  border: `1.5px solid ${i <= step ? COLORS.rect : COLORS.panelBorder}`,
                }}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <div style={{ fontSize: 11, color: i <= step ? COLORS.text : COLORS.textMuted, whiteSpace: 'nowrap' }}>
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1.5,
                  background: i < step ? COLORS.rect : COLORS.panelBorder,
                  margin: '0 6px 18px',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
 
      <div style={{ display: 'flex', gap: 18, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: `Alice${role === 'alice' ? ' (you)' : ''}`, color: COLORS.alice },
          { label: `Bob${role === 'bob' ? ' (you)' : ''}`, color: COLORS.bob },
          { label: 'Straight basis', color: COLORS.rect },
          { label: 'Diagonal basis', color: COLORS.diag },
          ...(eveActive ? [{ label: `Eve${role === 'eve' ? ' (you)' : ''}`, color: COLORS.eve }] : []),
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.textMuted }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
 
      <div
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.panelBorder}`,
          borderRadius: 12,
          padding: '18px 16px',
          overflowX: 'auto',
          marginBottom: 8,
        }}
      >
        <div key={`grid-${step}`} className="bb84-reveal" style={{ display: 'grid', gridTemplateColumns: gridCols, rowGap: 14, minWidth: 560 }}>
          <RowLabel sub={rowSub('alice', step === 0 ? 'click to choose' : 'your bit + basis')}>Alice sends</RowLabel>
          {derived.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              {step === 0 && role === 'alice' && p.aliceBasis === null ? (
                <AliceChoicePicker onPick={(bit, basis) => pickAlice(i, bit, basis)} />
              ) : (
                <PhotonGlyph
                  bit={p.aliceBit}
                  basis={p.aliceBasis}
                  known={isAliceKnown(i)}
                  ring={COLORS.aliceDim}
                  onClick={role === 'alice' && step === 0 ? () => resetAlice(i) : undefined}
                />
              )}
            </div>
          ))}
 
          {eveActive && (
            <>
              <RowLabel sub={rowSub('eve', step === 1 ? 'click to choose' : 'your basis + reading')}>Eve</RowLabel>
              {derived.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                  {step === 1 && role === 'eve' && p.eveBasis === null ? (
                    <BasisPicker onPick={(b) => pickEve(i, b)} />
                  ) : (
                    <PhotonGlyph
                      bit={p.eveBit}
                      basis={p.eveBasis}
                      known={isEveKnown(i)}
                      ring={COLORS.eveDim}
                      onClick={role === 'eve' && step === 1 ? () => resetEve(i) : undefined}
                    />
                  )}
                </div>
              ))}
            </>
          )}
 
          <RowLabel sub={rowSub('bob', step === 2 ? 'click to choose' : 'your basis + reading')}>Bob receives</RowLabel>
          {derived.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              {step === 2 && role === 'bob' && p.bobBasis === null ? (
                <BasisPicker onPick={(b) => pickBob(i, b)} />
              ) : (
                <PhotonGlyph
                  bit={p.bobBit}
                  basis={p.bobBasis}
                  known={isBobKnown(i)}
                  ring={COLORS.bobDim}
                  onClick={role === 'bob' && step === 2 ? () => resetBob(i) : undefined}
                />
              )}
            </div>
          ))}
 
          {step >= 3 && (
            <>
              <RowLabel sub="same basis?">Bases match</RowLabel>
              {derived.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                  {p.matched ? <Check size={16} color={COLORS.ok} /> : <X size={16} color={COLORS.textMuted} />}
                </div>
              ))}
            </>
          )}
 
          {step >= 4 && (
            <>
              <RowLabel sub="the shared secret">Kept bit</RowLabel>
              {derived.map((p, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: 'center',
                    color: !p.matched ? COLORS.panelBorder : p.errored ? COLORS.err : COLORS.ok,
                  }}
                >
                  {p.matched ? p.bobBit : '–'}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
 
      {step === 0 && role === 'alice' && (
        <div style={{ fontSize: 12, color: allAliceChosen ? COLORS.ok : COLORS.textMuted, marginBottom: 14 }}>
          {allAliceChosen ? 'All photons encoded.' : `Choose a bit and basis for all ${N} photons to continue.`}
        </div>
      )}
      {step === 1 && role === 'eve' && (
        <div style={{ fontSize: 12, color: allEveChosen ? COLORS.ok : COLORS.textMuted, marginBottom: 14 }}>
          {allEveChosen ? 'All photons intercepted.' : `Choose a basis for all ${N} photons to continue.`}
        </div>
      )}
      {step === 2 && role === 'bob' && (
        <div style={{ fontSize: 12, color: allBobChosen ? COLORS.ok : COLORS.textMuted, marginBottom: 14 }}>
          {allBobChosen ? 'All photons measured.' : `Choose a basis for all ${N} photons to continue.`}
        </div>
      )}
 
      {step === 4 && (
        <div
          className="bb84-reveal"
          style={{
            display: 'flex',
            gap: 24,
            background: COLORS.panel,
            border: `1px solid ${COLORS.panelBorder}`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Sifted key length</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 600 }}>{keptCount} bits</div>
          </div>
          {eveActive && (
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>Error rate</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 600, color: qber > 0 ? COLORS.err : COLORS.ok }}>
                {qber}%
              </div>
            </div>
          )}
        </div>
      )}
 
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          className="bb84-btn"
          onClick={next}
          disabled={nextDisabled}
          style={{
            background: nextDisabled ? COLORS.panel : COLORS.rect,
            color: nextDisabled ? COLORS.textMuted : '#04232B',
            opacity: nextDisabled ? 0.5 : 1,
            cursor: nextDisabled ? 'default' : 'pointer',
          }}
        >
          Next step <ArrowRight size={14} />
        </button>
        <button className="bb84-btn" onClick={restart} style={{ background: 'transparent', color: COLORS.text, border: `1px solid ${COLORS.panelBorder}` }}>
          <RotateCcw size={14} /> Restart
        </button>
        <button className="bb84-btn" onClick={regenerate} style={{ background: 'transparent', color: COLORS.text, border: `1px solid ${COLORS.panelBorder}` }}>
          <Shuffle size={14} /> New photons
        </button>
        {role !== 'eve' && (
          <button
            className="bb84-btn"
            onClick={toggleEve}
            style={{
              background: 'transparent',
              color: eveOn ? COLORS.eve : COLORS.text,
              border: `1px solid ${eveOn ? COLORS.eve : COLORS.panelBorder}`,
              marginLeft: 'auto',
            }}
          >
            {eveOn ? <Eye size={14} /> : <EyeOff size={14} />}
            {eveOn ? 'Eve is listening' : 'Simulate an eavesdropper'}
          </button>
        )}
      </div>
    </div>
  );
}