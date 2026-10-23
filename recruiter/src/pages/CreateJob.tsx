import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { CreateJobRequest, ScoringWeights, TestCase } from '@/types';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, FileText, Code, Settings, Target, X } from 'lucide-react';

const DEFAULT_WEIGHTS: ScoringWeights = { codeQuality: 25, testPassRate: 35, problemSolving: 25, technicalExplanation: 15 };
const SUBMISSION_FORMATS = [
  { value: 'repo_url', label: 'GitHub Repository URL', desc: 'Candidate submits a public repo link' },
  { value: 'make_test', label: 'Make Test', desc: 'Candidate runs make test to verify' },
  { value: 'dockerfile', label: 'Dockerfile Entry Point', desc: 'Candidate provides a Dockerfile' },
] as const;

export default function CreateJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState<CreateJobRequest>({
    title: '',
    department: '',
    description: '',
    requiredSkills: [],
    codingProblem: '',
    submissionFormat: 'repo_url',
    submissionInstructions: '',
    testCases: [{ input: '', expectedOutput: '', hidden: false }],
    scoringWeights: { ...DEFAULT_WEIGHTS },
    minQualifyingScore: 70,
  });

  const steps = [
    { label: 'Basics', icon: FileText },
    { label: 'Problem', icon: Code },
    { label: 'Test Cases', icon: Settings },
    { label: 'Scoring', icon: Target },
  ];

  const update = <K extends keyof CreateJobRequest>(key: K, value: CreateJobRequest[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      update('requiredSkills', [...form.requiredSkills, s]);
    }
    setSkillInput('');
  };

  const removeSkill = (s: string) => {
    update('requiredSkills', form.requiredSkills.filter((x) => x !== s));
  };

  const updateTestCase = (i: number, key: keyof TestCase, value: string | boolean) => {
    const cases = [...form.testCases];
    cases[i] = { ...cases[i], [key]: value };
    update('testCases', cases);
  };

  const addTestCase = () => {
    update('testCases', [...form.testCases, { input: '', expectedOutput: '', hidden: true }]);
  };

  const removeTestCase = (i: number) => {
    update('testCases', form.testCases.filter((_, idx) => idx !== i));
  };

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    update('scoringWeights', { ...form.scoringWeights, [key]: value });
  };

  const canProceed = () => {
    if (step === 0) return form.title.trim() && form.department.trim() && form.description.trim();
    if (step === 1) return form.codingProblem.trim() && form.submissionInstructions.trim();
    if (step === 2) return form.testCases.length > 0 && form.testCases.every((tc) => tc.input.trim() && tc.expectedOutput.trim());
    if (step === 3) return form.minQualifyingScore > 0 && form.minQualifyingScore <= 100;
    return false;
  };

  const handlePublish = async (asDraft: boolean) => {
    setSaving(true);
    setError('');
    try {
      const job = await api.createJob(form);
      if (!asDraft) {
        await api.updateJobStatus(job.id, 'published');
      }
      navigate(`/jobs/${job.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Job</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Set up a blind screening pipeline</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-600 text-white'
                    : done
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  active ? 'bg-white/20' : done ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                {s.label}
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-2" />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="card p-6">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label">Job Title</label>
              <input className="input" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Senior Backend Engineer" />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div>
              <label className="label">Job Description</label>
              <textarea className="input min-h-[120px] resize-y" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for..." />
            </div>
            <div>
              <label className="label">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  className="input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill and press Enter"
                />
                <button onClick={addSkill} className="btn-secondary">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.requiredSkills.map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 pr-1.5">
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-1 hover:text-brand-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {form.requiredSkills.length === 0 && (
                  <p className="text-sm text-gray-400">No skills added yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="label">Coding Problem Statement</label>
              <textarea className="input min-h-[180px] resize-y font-mono text-sm" value={form.codingProblem} onChange={(e) => update('codingProblem', e.target.value)} placeholder="Describe the coding problem the candidate needs to solve..." />
            </div>
            <div>
              <label className="label">Submission Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBMISSION_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => update('submissionFormat', f.value)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      form.submissionFormat === f.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Submission Instructions (visible to candidates)</label>
              <textarea className="input min-h-[100px] resize-y" value={form.submissionInstructions} onChange={(e) => update('submissionInstructions', e.target.value)} placeholder="Instructions the candidate will see when submitting..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Hidden Test Cases</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">These are used to evaluate the candidate's solution. Candidates never see them.</p>
              </div>
              <button onClick={addTestCase} className="btn-secondary">
                <Plus className="w-4 h-4" /> Add case
              </button>
            </div>
            {form.testCases.map((tc, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Case {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.hidden}
                        onChange={(e) => updateTestCase(i, 'hidden', e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                      />
                      Hidden
                    </label>
                    {form.testCases.length > 1 && (
                      <button onClick={() => removeTestCase(i)} className="text-red-500 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label">Input</label>
                  <textarea className="input min-h-[60px] resize-y font-mono text-sm" value={tc.input} onChange={(e) => updateTestCase(i, 'input', e.target.value)} placeholder="Test input..." />
                </div>
                <div>
                  <label className="label">Expected Output</label>
                  <textarea className="input min-h-[60px] resize-y font-mono text-sm" value={tc.expectedOutput} onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)} placeholder="Expected output..." />
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Scoring Weights</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Adjust the importance of each scoring dimension. Total should ideally add up to 100.</p>
              <div className="space-y-4">
                {(Object.keys(form.scoringWeights) as Array<keyof ScoringWeights>).map((key) => {
                  const labels: Record<keyof ScoringWeights, string> = {
                    codeQuality: 'Code Quality',
                    testPassRate: 'Test Pass Rate',
                    problemSolving: 'Problem Solving',
                    technicalExplanation: 'Technical Explanation',
                  };
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels[key]}</label>
                        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 tabular-nums">{form.scoringWeights[key]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={form.scoringWeights[key]}
                        onChange={(e) => updateWeight(key, Number(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  <span className={`font-semibold tabular-nums ${Object.values(form.scoringWeights).reduce((a, b) => a + b, 0) === 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {Object.values(form.scoringWeights).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="label">Minimum Qualifying Score</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.minQualifyingScore}
                  onChange={(e) => update('minQualifyingScore', Number(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <div className="w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.minQualifyingScore}
                    onChange={(e) => update('minQualifyingScore', Number(e.target.value))}
                    className="input text-center font-semibold"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Candidates scoring below this threshold will be marked "Not qualified".
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="btn-primary">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => handlePublish(true)} disabled={saving} className="btn-secondary">
              Save as Draft
            </button>
            <button onClick={() => handlePublish(false)} disabled={saving || !canProceed()} className="btn-primary">
              {saving ? 'Creating...' : 'Publish Job'} <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
