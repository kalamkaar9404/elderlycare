'use client';

/**
 * MedicalNER
 * ───────────
 * Sends patient notes to the BioBERT NER service and renders the text
 * with medical entities highlighted inline.
 *
 * Features:
 * - Colour-coded entity highlighting (per entity type)
 * - Hover tooltip showing entity label + confidence score
 * - Filter chips to show/hide entity types
 * - Copy-to-clipboard of annotated text
 * - MedGemma "Analyze Note" panel (SOAP / Red Flags / Nutrition / Summary)
 * - Service-offline graceful degradation
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Brain, Loader2, Copy, Check, AlertCircle,
  FlaskConical, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';

// ── Types (mirror the Python Pydantic models) ─────────────────────────────────
interface Entity {
  text:   string;
  label:  string;
  score:  number;
  start:  number;
  end:    number;
  color:  string;
}

interface NERResult {
  entities:     Entity[];
  entity_count: number;
  unique_types: string[];
  latency_ms:   number;
  model:        string;
  service:      string;
}

interface MedGemmaResult {
  response:   string;
  model:      string;
  backend:    string;
  latency_ms: number;
}

// ── Entity label → friendly display name ─────────────────────────────────────
const LABEL_NAMES: Record<string, string> = {
  DISEASE:                         'Disease',
  CHEMICAL:                        'Chemical',
  DRUG:                            'Drug',
  GENE_OR_GENE_PRODUCT:            'Gene/Protein',
  GENE:                            'Gene',
  PROTEIN:                         'Protein',
  ORGANISM:                        'Organism',
  CELL_LINE:                       'Cell Line',
  CELL_TYPE:                       'Cell Type',
  TISSUE:                          'Tissue',
  ORGAN:                           'Organ',
  CANCER:                          'Cancer',
  AMINO_ACID:                      'Amino Acid',
  DOSAGE_FORM:                     'Dosage',
  PATHOLOGICAL_FORMATION:          'Pathology',
  MULTI_TISSUE_STRUCTURE:          'Structure',
  DEVELOPING_ANATOMICAL_STRUCTURE: 'Dev. Structure',
  IMMATERIAL_ANATOMICAL_ENTITY:    'Immaterial',
};

// ── Segment the text into highlighted + plain spans ───────────────────────────
function buildSegments(text: string, entities: Entity[], hiddenTypes: Set<string>) {
  const visible = entities.filter((e) => !hiddenTypes.has(e.label));
  // Sort by start, remove overlaps
  const sorted: Entity[] = [];
  let last = 0;
  for (const e of [...visible].sort((a, b) => a.start - b.start)) {
    if (e.start >= last) {
      sorted.push(e);
      last = e.end;
    }
  }

  const segments: Array<{ type: 'text' | 'entity'; content: string; entity?: Entity }> = [];
  let cursor = 0;
  for (const e of sorted) {
    if (e.start > cursor) {
      segments.push({ type: 'text', content: text.slice(cursor, e.start) });
    }
    segments.push({ type: 'entity', content: text.slice(e.start, e.end), entity: e });
    cursor = e.end;
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', content: text.slice(cursor) });
  }
  return segments;
}

// ── Tooltip state ─────────────────────────────────────────────────────────────
function EntitySpan({ entity, content }: { entity: Entity; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <mark
        className="rounded px-0.5 py-0.5 cursor-help font-semibold"
        style={{
          background:  `${entity.color}28`,
          color:        entity.color,
          borderBottom: `2px solid ${entity.color}`,
        }}
      >
        {content}
      </mark>
      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute bottom-full left-0 mb-1.5 z-50 pointer-events-none"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-white text-xs font-medium whitespace-nowrap shadow-xl"
              style={{ background: entity.color }}
            >
              <span className="font-bold">{LABEL_NAMES[entity.label] ?? entity.label}</span>
              <span className="opacity-75 ml-1.5">{(entity.score * 100).toFixed(0)}% conf.</span>
            </div>
            {/* Arrow */}
            <div className="w-2 h-2 rotate-45 ml-3 -mt-1 rounded-sm"
              style={{ background: entity.color }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// ── Sample patient notes for demo ─────────────────────────────────────────────
const SAMPLE_NOTES = [
  `Patient presents with gestational diabetes mellitus at 28 weeks gestation. HbA1c 7.2%, fasting glucose 126 mg/dL. Currently on Metformin 500mg twice daily. Iron-deficiency anaemia noted (Hb 9.8 g/dL). Folate supplementation initiated. Blood pressure 138/88 mmHg — monitor for pre-eclampsia. Recommend low-glycaemic diet rich in spinach, lentils, and whole grains.`,
  `Chronic kidney disease Stage 3, hypertension. Creatinine 1.8 mg/dL, eGFR 42. On Amlodipine 10mg and Losartan 50mg. Anaemia of chronic disease — EPO therapy under consideration. Restrict dietary potassium and phosphorus. Avoid NSAIDs. Protein intake to be limited to 0.8 g/kg/day.`,
];

// ── Main component ────────────────────────────────────────────────────────────
export function MedicalNER() {
  const [note, setNote]                   = useState(SAMPLE_NOTES[0]);
  const [nerResult, setNerResult]         = useState<NERResult | null>(null);
  const [gemmaResult, setGemmaResult]     = useState<MedGemmaResult | null>(null);
  const [loadingNer, setLoadingNer]       = useState(false);
  const [loadingGemma, setLoadingGemma]   = useState(false);
  const [nerError, setNerError]           = useState<string | null>(null);
  const [gemmaError, setGemmaError]       = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes]     = useState<Set<string>>(new Set());
  const [analysisType, setAnalysisType]   = useState<'soap'|'flags'|'nutrition'|'summary'>('summary');
  const [gemmaOpen, setGemmaOpen]         = useState(false);
  const [copied, setCopied]               = useState(false);

  // ── Run BioBERT NER ─────────────────────────────────────────────────────────
  const runNER = useCallback(async () => {
    if (!note.trim()) return;
    setLoadingNer(true);
    setNerError(null);
    setNerResult(null);

    try {
      const res  = await fetch('/api/ai/biobert', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'ner', text: note, min_confidence: 0.65 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setNerResult(data);
    } catch (e: unknown) {
      setNerError(e instanceof Error ? e.message : 'NER failed');
    } finally {
      setLoadingNer(false);
    }
  }, [note]);

  // ── Run MedGemma analysis ───────────────────────────────────────────────────
  const runGemma = useCallback(async () => {
    if (!note.trim()) return;
    setLoadingGemma(true);
    setGemmaError(null);
    setGemmaResult(null);
    setGemmaOpen(true);

    try {
      const res  = await fetch('/api/ai/medgemma', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'analyze', patient_note: note, analysis_type: analysisType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setGemmaResult(data);
    } catch (e: unknown) {
      setGemmaError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoadingGemma(false);
    }
  }, [note, analysisType]);

  // ── Copy handler ────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Toggle hidden entity type ───────────────────────────────────────────────
  const toggleType = (label: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const segments = nerResult
    ? buildSegments(note, nerResult.entities, hiddenTypes)
    : null;

  return (
    <Card className="glass-silk rounded-2xl border-white/30 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6B8E6F22,#20B2AA22)' }}>
            <Brain className="h-4.5 w-4.5 text-[#20B2AA]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Clinical NLP Analysis</p>
            <p className="text-xs text-muted-foreground">BioBERT NER + MedGemma insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI status badges */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#20B2AA]/10 text-[#20B2AA] border border-[#20B2AA]/25">
            BioBERT
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6B8E6F]/10 text-[#6B8E6F] border border-[#6B8E6F]/25">
            MedGemma
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* ── Sample note selector ────────────────────────────────── */}
        <div className="flex gap-2">
          {SAMPLE_NOTES.map((s, i) => (
            <button
              key={i}
              onClick={() => { setNote(s); setNerResult(null); setGemmaResult(null); }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                note === s
                  ? 'bg-[#6B8E6F] text-white'
                  : 'bg-slate-100 text-muted-foreground hover:bg-slate-200'
              }`}
            >
              Sample {i + 1}
            </button>
          ))}
        </div>

        {/* ── Editable patient note textarea ──────────────────────── */}
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => { setNote(e.target.value); setNerResult(null); setGemmaResult(null); }}
            placeholder="Paste or type a patient note..."
            rows={5}
            className="w-full rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm
                       p-3 text-sm text-foreground resize-none outline-none
                       focus:border-[#20B2AA]/40 focus:ring-1 focus:ring-[#20B2AA]/20
                       transition-all"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Copy note"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-[#20B2AA]" />
              : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </button>
        </div>

        {/* ── Action buttons ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Run NER */}
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#20B2AA,#6B8E6F)' }}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={runNER}
            disabled={loadingNer || !note.trim()}
          >
            {loadingNer
              ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing…</>
              : <><FlaskConical className="h-4 w-4" />Run NER</>
            }
          </motion.button>

          {/* MedGemma analysis type + button */}
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as typeof analysisType)}
            className="text-xs px-2.5 py-2 rounded-xl border border-white/30 bg-white/60
                       backdrop-blur-sm text-foreground outline-none
                       focus:border-[#6B8E6F]/40 transition-all"
          >
            <option value="summary">Summary</option>
            <option value="soap">SOAP Format</option>
            <option value="flags">Red Flags</option>
            <option value="nutrition">Nutrition Rx</option>
          </select>

          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#6B8E6F,#E8B4A0)' }}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={runGemma}
            disabled={loadingGemma || !note.trim()}
          >
            {loadingGemma
              ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing…</>
              : <><Sparkles className="h-4 w-4" />MedGemma</>
            }
          </motion.button>
        </div>

        {/* ── NER entity filter chips ──────────────────────────────── */}
        <AnimatePresence>
          {nerResult && nerResult.unique_types.length > 0 && (
            <motion.div
              key="chips"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Detected entities — click to toggle
              </p>
              <div className="flex flex-wrap gap-1.5">
                {nerResult.unique_types.map((type) => {
                  const isHidden = hiddenTypes.has(type);
                  const count = nerResult.entities.filter((e) => e.label === type).length;
                  const color = nerResult.entities.find((e) => e.label === type)?.color ?? '#888';
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                      style={{
                        background:   isHidden ? 'transparent' : `${color}18`,
                        color:        isHidden ? '#aaa' : color,
                        borderColor:  isHidden ? '#ddd' : `${color}50`,
                        textDecoration: isHidden ? 'line-through' : 'none',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isHidden ? '#ccc' : color }} />
                      {LABEL_NAMES[type] ?? type} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>{nerResult.entity_count} entities found</span>
                <span>{nerResult.unique_types.length} types</span>
                <span>{nerResult.latency_ms}ms</span>
                <span className="text-[10px] opacity-60">{nerResult.model}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Highlighted text output ──────────────────────────────── */}
        <AnimatePresence>
          {segments && (
            <motion.div
              key="highlighted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30
                         text-sm leading-relaxed text-foreground"
            >
              {segments.map((seg, i) =>
                seg.type === 'text'
                  ? <span key={i}>{seg.content}</span>
                  : <EntitySpan key={i} entity={seg.entity!} content={seg.content} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NER error ────────────────────────────────────────────── */}
        {nerError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#DC2626]/8 border border-[#DC2626]/20 text-xs text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">BioBERT NER unavailable</p>
              <p className="opacity-80 mt-0.5">{nerError}</p>
            </div>
          </div>
        )}

        {/* ── MedGemma analysis panel ──────────────────────────────── */}
        <AnimatePresence>
          {(gemmaOpen || gemmaResult || gemmaError) && (
            <motion.div
              key="gemma"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-xl border border-[#6B8E6F]/25 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-3 bg-[#6B8E6F]/8 hover:bg-[#6B8E6F]/12 transition-colors"
                onClick={() => setGemmaOpen(!gemmaOpen)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#6B8E6F]" />
                  <span className="text-sm font-semibold text-[#6B8E6F]">
                    MedGemma — {analysisType.toUpperCase()}
                    {gemmaResult && <span className="text-xs font-normal ml-2 opacity-60">{gemmaResult.latency_ms}ms</span>}
                  </span>
                </div>
                {gemmaOpen
                  ? <ChevronUp className="h-4 w-4 text-[#6B8E6F]" />
                  : <ChevronDown className="h-4 w-4 text-[#6B8E6F]" />
                }
              </button>

              {gemmaOpen && (
                <div className="p-4 bg-white/50 text-sm leading-relaxed">
                  {loadingGemma && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-[#6B8E6F]" />
                      MedGemma is analysing the note…
                    </div>
                  )}
                  {gemmaError && (
                    <div className="flex items-start gap-2 text-[#DC2626] text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">MedGemma unavailable</p>
                        <p className="opacity-80">{gemmaError}</p>
                      </div>
                    </div>
                  )}
                  {gemmaResult && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="font-medium">{gemmaResult.model}</span>
                        <span>via {gemmaResult.backend}</span>
                      </p>
                      {/* Render response with newlines preserved */}
                      {gemmaResult.response.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('**') || line.match(/^[A-Z]/) ? 'font-semibold text-foreground mt-2' : 'text-muted-foreground'}>
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
