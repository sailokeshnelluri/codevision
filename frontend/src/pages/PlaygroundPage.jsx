import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Editor from '@monaco-editor/react'
import { codeAPI, projectsAPI } from '../services/api'
import { useExecutionStore } from '../hooks/useExecutionStore'
import Navbar from '../components/Navbar'
import VariablePanel from '../components/VariablePanel'
import StackPanel from '../components/StackPanel'
import TracePanel from '../components/TracePanel'
import AIPanel from '../components/AIPanel'
import PictorialPanel from '../components/PictorialPanel'
import OutputPanel from '../components/OutputPanel'

const LANGUAGES = [
  { id: 'python',     label: 'Python',     icon: '🐍', monaco: 'python'     },
  { id: 'javascript', label: 'JavaScript', icon: '🟨', monaco: 'javascript' },
  { id: 'c',          label: 'C',          icon: '⚙️', monaco: 'c'          },
  { id: 'cpp',        label: 'C++',        icon: '🔷', monaco: 'cpp'        },
  { id: 'java',       label: 'Java',       icon: '☕', monaco: 'java'       },
]

const DEFAULTS = {
  python: `# CodeVision — Python Demo
x = 10
y = 5
result = x + y

numbers = [1, 2, 3, 4, 5]
total = 0

for num in numbers:
    total = total + num

print("Sum:", total)
print("Result:", result)`,

  javascript: `// CodeVision — JavaScript Demo
let x = 10;
let y = 5;
let result = x + y;

let numbers = [1, 2, 3, 4, 5];
let total = 0;

for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
}

console.log("Sum:", total);`,

  c: `// CodeVision — C Demo
#include <stdio.h>

int main() {
    int x = 10;
    int y = 5;
    int result = x + y;

    int numbers[] = {1, 2, 3, 4, 5};
    int total = 0;

    for (int i = 0; i < 5; i++) {
        total += numbers[i];
    }

    printf("Sum: %d\\n", total);
    return 0;
}`,

  cpp: `// CodeVision — C++ Demo
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int x = 10, y = 5;
    int result = x + y;

    vector<int> numbers = {1, 2, 3, 4, 5};
    int total = 0;

    for (int num : numbers) {
        total += num;
    }

    cout << "Sum: " << total << endl;
    return 0;
}`,

  java: `// CodeVision — Java Demo
public class Main {
    public static void main(String[] args) {
        int x = 10;
        int y = 5;
        int result = x + y;

        int[] numbers = {1, 2, 3, 4, 5};
        int total = 0;

        for (int num : numbers) {
            total += num;
        }

        System.out.println("Sum: " + total);
    }
}`,
}

export default function PlaygroundPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const decorationsRef = useRef([])
  const playTimerRef = useRef(null)

  const {
    code, language, steps, currentStep, status, output, errorMsg,
    isPlaying, playSpeed,
    setCode, setLanguage, setSteps, setStatus, setOutput, setErrorMsg,
    setIsPlaying, setPlaySpeed, goToStep, nextStep, prevStep, reset,
    projectName, setProjectName,
  } = useExecutionStore()

  const [saving, setSaving] = useState(false)
  const [projectId, setProjectId] = useState(id || null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('variables') // variables | stack | trace | output

  // Load project if editing existing
  useEffect(() => {
    if (id) {
      projectsAPI.get(id).then(r => {
        const p = r.data
        setCode(p.code)
        setLanguage(p.language)
        setProjectName(p.name)
        if (p.execution_trace) setSteps(p.execution_trace)
      }).catch(() => toast.error('Project not found'))
    } else {
      if (!code) setCode(DEFAULTS[language] || '')
    }
  }, [id])

  // Sync default code when language changes (only if no custom code)
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(DEFAULTS[lang] || '')
    reset()
    setAiExplanation('')
  }

  // Monaco editor decoration for active line
useEffect(() => {
  const editor = editorRef.current
  if (!editor || currentStep < 0 || !steps[currentStep]) return
  const step = steps[currentStep]
  if (!step.line) return

  try {
    // Highlight the active line
    const newDecos = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new window.monaco.Range(step.line, 1, step.line, 999),
        options: {
          isWholeLine: true,
          inlineClassName: 'active-line-inline',
          className: 'active-line-highlight',
          linesDecorationsClassName: 'active-line-glyph',
        }
      }
    ])
    decorationsRef.current = newDecos

    // Scroll editor to the active line
    editor.revealLineInCenter(step.line)
  } catch(e) {
    console.log('Decoration error:', e)
  }
}, [currentStep, steps])

  // Autoplay
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        const { currentStep: cs, steps: ss } = useExecutionStore.getState()
        if (cs >= ss.length - 1) {
          setIsPlaying(false)
          clearInterval(playTimerRef.current)
        } else {
          nextStep()
        }
      }, playSpeed)
    }
    return () => clearInterval(playTimerRef.current)
  }, [isPlaying, playSpeed])

  // AI explanation whenever step changes
  useEffect(() => {
    if (currentStep < 0 || !steps[currentStep]) return
    const step = steps[currentStep]
    setAiExplanation(step.explanation || '')
  }, [currentStep])

  const handleRun = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    reset()
    setAiExplanation('')
    setStatus('running')
    try {
      const res = await codeAPI.visualize(code, language)
      setSteps(res.data.steps || [])
      setOutput(res.data.output || '')
      if (res.data.error) setErrorMsg(res.data.error)
      setStatus('done')
      toast.success(`${res.data.steps?.length || 0} execution steps generated`)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.detail || 'Execution failed')
      toast.error('Execution failed')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: projectName,
        code,
        language,
        execution_trace: steps,
      }
      if (projectId) {
        await projectsAPI.update(projectId, payload)
        toast.success('Saved!')
      } else {
        const res = await projectsAPI.create(payload)
        setProjectId(res.data.id)
        navigate(`/playground/${res.data.id}`, { replace: true })
        toast.success('Project saved!')
      }
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleExplain = async () => {
    if (!code.trim()) return
    setAiLoading(true)
    try {
      const step = steps[currentStep]
      const res = await codeAPI.explain(code, language, step?.line, step?.code)
      setAiExplanation(res.data.explanation)
    } catch {
      toast.error('AI explain failed')
    } finally {
      setAiLoading(false)
    }
  }

  const statusColors = {
    idle:    'text-slate-500',
    running: 'text-yellow-400 animate-pulse',
    done:    'text-emerald-400',
    error:   'text-red-400',
  }

  const statusLabel = {
    idle: '● Idle', running: '● Running…', done: '● Done', error: '● Error'
  }

  const langObj = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]

  return (
    <div className="h-screen flex flex-col bg-dark-950 overflow-hidden">
      {/* TOP BAR */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-dark-800 border-b border-white/5 flex-shrink-0">
        <Navbar compact />

        {/* Project name */}
        <input
          className="bg-transparent text-slate-300 text-sm font-medium focus:outline-none focus:text-white border-b border-transparent focus:border-slate-600 px-1 w-48"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
        />

        {/* Lang switcher */}
        <div className="flex gap-1 ml-2">
          {LANGUAGES.map(l => (
            <button key={l.id}
              onClick={() => handleLanguageChange(l.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                language === l.id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <span className={`text-xs font-semibold ${statusColors[status]}`}>{statusLabel[status]}</span>

        <button onClick={handleSave} disabled={saving} className="btn-secondary text-xs py-1.5 px-3">
          {saving ? 'Saving…' : '💾 Save'}
        </button>

        <button
          onClick={handleRun}
          disabled={status === 'running'}
          className="btn-primary text-sm py-1.5 px-5">
          {status === 'running' ? '⏳ Running…' : '▶ Run'}
        </button>
      </div>

      {/* MAIN SPLIT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Editor */}
        <div className="w-1/2 flex flex-col border-r border-white/5">
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/50 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-slate-500 font-mono ml-2">
              {projectName.toLowerCase().replace(/\s/g, '_')}.{langObj.id === 'cpp' ? 'cpp' : langObj.id === 'javascript' ? 'js' : langObj.id}
            </span>
          </div>

          <div className="flex-1">
            <Editor
              language={langObj.monaco}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              onMount={editor => {
                editorRef.current = editor
                editor.updateOptions({
                  fontSize: 14,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  lineHeight: 22,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  glyphMargin: true,
                })
              }}
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                glyphMargin: true,
              }}
            />
          </div>

          {/* Output area */}
          <OutputPanel output={output} error={errorMsg} />
        </div>

        {/* RIGHT: Visualization panels */}
        <div className="w-1/2 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-white/5 bg-dark-900/30">
            {[
              { id: 'variables', label: '📦 Variables' },
	      { id: 'pictorial', label: '🎬 Visual'    },
              { id: 'stack',     label: '📚 Stack'     },
              { id: 'trace',     label: '⚡ Trace'     },
              { id: 'ai',        label: '🤖 AI'        },
            ].map(t => (
              <button key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
                  activeTab === t.id
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'variables' && (
              <VariablePanel
                steps={steps}
                currentStep={currentStep}
              />
            )}
            {activeTab === 'stack' && (
              <StackPanel steps={steps} currentStep={currentStep} />
            )}
            {activeTab === 'trace' && (
              <TracePanel
                steps={steps}
                currentStep={currentStep}
                onStepClick={goToStep}
              />
            )}
	    {activeTab === 'pictorial' && (
              <PictorialPanel
                steps={steps}
                currentStep={currentStep}
              />
            )}
            {activeTab === 'ai' && (
              <AIPanel
                explanation={aiExplanation}
                loading={aiLoading}
                step={steps[currentStep]}
                onExplain={handleExplain}
              />
            )}
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2 px-4 py-3 bg-dark-900/50 border-t border-white/5 flex-shrink-0">
            <button onClick={() => goToStep(0)} disabled={!steps.length}
              className="btn-secondary text-xs py-1.5 px-3">⏮</button>
            <button onClick={() => { setIsPlaying(false); prevStep() }} disabled={currentStep <= 0}
              className="btn-secondary text-xs py-1.5 px-3">◀ Prev</button>
            <button
              onClick={() => {
                if (isPlaying) { setIsPlaying(false) }
                else {
                  if (currentStep === steps.length - 1) goToStep(0)
                  setIsPlaying(true)
                }
              }}
              disabled={!steps.length}
              className="btn-primary text-xs py-1.5 px-4">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={() => { setIsPlaying(false); nextStep() }} disabled={currentStep >= steps.length - 1}
              className="btn-secondary text-xs py-1.5 px-3">Next ▶</button>
            <button onClick={() => goToStep(steps.length - 1)} disabled={!steps.length}
              className="btn-secondary text-xs py-1.5 px-3">⏭</button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500">Speed</span>
              <input type="range" min="150" max="2000" step="50"
                value={playSpeed} onChange={e => setPlaySpeed(Number(e.target.value))}
                className="w-20 accent-cyan-400" />
              <span className="text-xs text-slate-500 w-16 text-right">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
