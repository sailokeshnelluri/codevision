import { create } from 'zustand'

export const useExecutionStore = create((set, get) => ({
  code: '',
  language: 'python',
  steps: [],
  currentStep: -1,
  status: 'idle', // idle | running | done | error
  output: '',
  errorMsg: '',
  isPlaying: false,
  playSpeed: 800,
  projectId: null,
  projectName: 'Untitled Project',

  setCode:     (code)     => set({ code }),
  setLanguage: (language) => set({ language }),
  setStatus:   (status)   => set({ status }),
  setSteps:    (steps)    => set({ steps, currentStep: -1 }),
  setOutput:   (output)   => set({ output }),
  setErrorMsg: (errorMsg) => set({ errorMsg }),
  setIsPlaying:(v)        => set({ isPlaying: v }),
  setPlaySpeed:(v)        => set({ playSpeed: v }),
  setProjectName: (name)  => set({ projectName: name }),

  goToStep: (idx) => {
    const { steps } = get()
    if (idx < 0 || idx >= steps.length) return
    set({ currentStep: idx })
  },

  nextStep: () => {
    const { currentStep, steps } = get()
    if (currentStep < steps.length - 1) set({ currentStep: currentStep + 1 })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },

  reset: () => set({
    steps: [],
    currentStep: -1,
    status: 'idle',
    output: '',
    errorMsg: '',
    isPlaying: false,
  }),
}))
