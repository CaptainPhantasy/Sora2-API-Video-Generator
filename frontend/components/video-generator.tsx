'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { VideoIcon, Sparkles, AlertCircle, CheckCircle2, Loader2, Download, Play, Sun, Moon } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface VideoJob {
  id: string
  status: string
  video_url?: string
  error?: string
}

type Theme = 'warm' | 'dark'

export function VideoGenerator() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('warm')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('sora-2')
  const [duration, setDuration] = useState('8')
  const [resolution, setResolution] = useState('1280x720')
  const [quality, setQuality] = useState('standard')
  const [style, setStyle] = useState('auto')
  const [fps, setFps] = useState('24')

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<{ type: 'info' | 'error' | 'success'; message: string } | null>(null)
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('sora-theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sora-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'warm' ? 'dark' : 'warm')
  }

  const calculateCost = () => {
    const seconds = parseInt(duration)
    const isPro = model === 'sora-2-pro'

    if (isPro) {
      const costPerSecond = 0.25
      return (seconds * costPerSecond).toFixed(2)
    } else {
      const costPerSecond = 0.08
      return (seconds * costPerSecond).toFixed(2)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    let attempts = 0
    const maxAttempts = 120 // 10 minutes at 5 second intervals

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/video/status/${jobId}`)
        const data = await response.json()

        setCurrentJob(data)

        if (data.status === 'completed') {
          const downloadUrl = `${API_BASE_URL}/api/video/download/${jobId}`
          setVideoUrl(downloadUrl)
          setStatus({ type: 'success', message: 'Video generated successfully!' })
          setProgress(100)
          setLoading(false)
          return
        } else if (data.status === 'failed' || data.status === 'error') {
          setStatus({ type: 'error', message: data.error || 'Video generation failed' })
          setLoading(false)
          return
        } else if (data.status === 'processing' || data.status === 'queued') {
          const progressPercent = Math.min((attempts / maxAttempts) * 95, 95)
          setProgress(progressPercent)

          attempts++
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000)
          } else {
            setStatus({ type: 'error', message: 'Timeout: Video generation took too long' })
            setLoading(false)
          }
        }
      } catch (error) {
        setStatus({ type: 'error', message: 'Failed to check video status' })
        setLoading(false)
      }
    }

    poll()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setStatus({ type: 'error', message: 'Please enter a video prompt' })
      return
    }

    setLoading(true)
    setProgress(5)
    setVideoUrl(null)
    setCurrentJob(null)
    setStatus({ type: 'info', message: 'Creating video generation job...' })

    try {
      const response = await fetch(`${API_BASE_URL}/api/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: prompt.trim(),
          seconds: duration,
          size: resolution,
          quality,
          style,
          fps: parseInt(fps)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video generation job')
      }

      setStatus({ type: 'info', message: 'Video generation started. This may take several minutes...' })
      setProgress(10)
      pollJobStatus(data.id)

    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate video'
      })
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!videoUrl || !currentJob) return

    try {
      setStatus({ type: 'info', message: 'Downloading video...' })

      const response = await fetch(videoUrl)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sora-video-${currentJob.id.substring(6, 16)}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus({ type: 'success', message: 'Video downloaded successfully!' })
    } catch (error) {
      setStatus({ type: 'error', message: 'Download failed. Please try again.' })
    }
  }

  // Theme-specific classes
  const bgClass = theme === 'warm'
    ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'
    : 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950'

  const textClass = theme === 'warm' ? 'text-gray-900' : 'text-gray-100'
  const subtextClass = theme === 'warm' ? 'text-gray-600' : 'text-gray-300'
  const iconColor = theme === 'warm' ? 'text-orange-600' : 'text-blue-400'
  const accentGradient = theme === 'warm'
    ? 'from-orange-600 to-amber-600'
    : 'from-blue-400 to-indigo-400'
  const cardBg = theme === 'warm' ? 'bg-white' : 'bg-slate-900'
  const borderColor = theme === 'warm' ? 'border-gray-200' : 'border-slate-700'
  const hoverBg = theme === 'warm' ? 'hover:bg-orange-50' : 'hover:bg-slate-800'
  const costBg = theme === 'warm' ? 'bg-orange-50' : 'bg-blue-950/30'
  const costText = theme === 'warm' ? 'text-orange-600' : 'text-blue-400'

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 relative">
            <VideoIcon className={`w-10 h-10 md:w-12 md:h-12 ${iconColor}`} />
            <h1 className={`text-3xl md:text-5xl font-bold bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent`}>
              Sora 2 Video Generator
            </h1>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`absolute right-0 top-0 p-2 rounded-full border ${borderColor} ${cardBg} ${hoverBg} transition-all`}
              aria-label="Toggle theme"
            >
              {theme === 'warm' ? (
                <Moon className={`w-5 h-5 ${iconColor}`} />
              ) : (
                <Sun className={`w-5 h-5 ${iconColor}`} />
              )}
            </button>
          </div>
          <p className={`${subtextClass} text-sm md:text-lg max-w-2xl mx-auto`}>
            Create stunning AI-generated videos with OpenAI's Sora 2. Enter your prompt and customize the settings below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Generation Form */}
          <Card className={`shadow-lg ${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${textClass}`}>
                <Sparkles className={`w-5 h-5 ${iconColor}`} />
                Video Settings
              </CardTitle>
              <CardDescription className={subtextClass}>Configure your AI video generation parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className={`text-base font-semibold ${textClass}`}>Video Prompt *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A serene lake at sunset with mountains in the background..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={`min-h-[120px] resize-none ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}`}
                    disabled={loading}
                  />
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label className={`text-base font-semibold ${textClass}`}>Model</Label>
                  <RadioGroup value={model} onValueChange={setModel} disabled={loading}>
                    <div className={`flex items-center space-x-2 p-3 border ${borderColor} rounded-lg ${hoverBg} cursor-pointer transition-colors`}>
                      <RadioGroupItem value="sora-2" id="sora-2" />
                      <Label htmlFor="sora-2" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold ${textClass}`}>Sora 2</p>
                            <p className={`text-xs ${subtextClass}`}>Faster, cost-effective</p>
                          </div>
                          <Badge variant="secondary" className={theme === 'dark' ? 'bg-slate-700' : ''}>$0.08/sec</Badge>
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-3 border ${borderColor} rounded-lg ${hoverBg} cursor-pointer transition-colors`}>
                      <RadioGroupItem value="sora-2-pro" id="sora-2-pro" />
                      <Label htmlFor="sora-2-pro" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold ${textClass}`}>Sora 2 Pro</p>
                            <p className={`text-xs ${subtextClass}`}>Premium quality</p>
                          </div>
                          <Badge variant="secondary" className={theme === 'dark' ? 'bg-slate-700' : ''}>$0.25/sec</Badge>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className={`text-base font-semibold ${textClass}`}>Duration</Label>
                  <Select value={duration} onValueChange={setDuration} disabled={loading}>
                    <SelectTrigger className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                      <SelectItem value="4">4 seconds</SelectItem>
                      <SelectItem value="8">8 seconds</SelectItem>
                      <SelectItem value="12">12 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                  <Label htmlFor="resolution" className={`text-base font-semibold ${textClass}`}>Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution} disabled={loading}>
                    <SelectTrigger className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                      <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                      <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                      <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality & Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality" className={`text-base font-semibold ${textClass}`}>Quality</Label>
                    <Select value={quality} onValueChange={setQuality} disabled={loading}>
                      <SelectTrigger className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fps" className={`text-base font-semibold ${textClass}`}>FPS</Label>
                    <Select value={fps} onValueChange={setFps} disabled={loading}>
                      <SelectTrigger className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''}>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cost Estimate */}
                <div className={`p-4 ${costBg} rounded-lg border ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${textClass}`}>Estimated Cost:</span>
                    <span className={`text-2xl font-bold ${costText}`}>${calculateCost()}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className={`w-full h-12 text-lg font-semibold ${theme === 'warm' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Video
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview/Results */}
          <Card className={`shadow-lg ${cardBg} ${borderColor} border`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${textClass}`}>
                <Play className={`w-5 h-5 ${iconColor}`} />
                Video Preview
              </CardTitle>
              <CardDescription className={subtextClass}>Your generated video will appear here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Messages */}
              {status && (
                <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className={theme === 'dark' ? 'bg-slate-800 border-slate-600' : ''}>
                  {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
                  {status.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {status.type === 'info' && <Loader2 className="h-4 w-4 animate-spin" />}
                  <AlertDescription className={theme === 'dark' ? 'text-gray-200' : ''}>{status.message}</AlertDescription>
                </Alert>
              )}

              {/* Progress Bar */}
              {loading && (
                <div className="space-y-2">
                  <div className={`flex justify-between text-sm ${subtextClass}`}>
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Video Player */}
              {videoUrl && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className={`w-full h-12 text-lg font-semibold ${theme === 'warm' ? 'border-orange-600 text-orange-600 hover:bg-orange-50' : 'border-blue-400 text-blue-400 hover:bg-slate-800'}`}
                    variant="outline"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Video
                  </Button>

                  {currentJob && (
                    <div className={`p-3 ${theme === 'warm' ? 'bg-gray-50' : 'bg-slate-800'} rounded-lg text-sm space-y-1`}>
                      <p className={subtextClass}>
                        <span className="font-semibold">Job ID:</span> {currentJob.id}
                      </p>
                      <p className={subtextClass}>
                        <span className="font-semibold">Status:</span> {currentJob.status}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!loading && !videoUrl && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <VideoIcon className={`w-16 h-16 mb-4 ${theme === 'warm' ? 'text-gray-300' : 'text-gray-700'}`} />
                  <p className={subtextClass}>
                    Fill in the form and click "Generate Video" to create your AI-powered video.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
