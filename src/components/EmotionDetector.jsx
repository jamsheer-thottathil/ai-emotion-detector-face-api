import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

// Load all models from GitHub Pages
async function loadAllModels(url) {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(url),
    faceapi.nets.faceLandmark68Net.loadFromUri(url),
    faceapi.nets.faceExpressionNet.loadFromUri(url)
  ])
}

export default function EmotionDetector({ onModelsLoaded }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('Loading models.')
  const [topText, setTopText] = useState(null)
  const lastChangeRef = useRef(Date.now())

const funnyTexts = {
  happy: [
    "\u{1F604} You are happy, found some free coffee? \u{1F37A}\u{1F373}\u{1F36A}",
    "\u{1F604} You are happy, code passed all tests? \u{1F680}\u{2705}\u{1F4BB}",
    "\u{1F604} You are happy, bug fixed before deadline? \u{1F41B}\u{1F973}\u{1F3C6}",
    "\u{1F604} You are happy, got a surprise holiday? \u{1F3D6}\u{1F381}\u{1F31F}",
    "\u{1F604} You are happy, deployed without errors? \u{2728}\u{1F44D}\u{1F680}",
    "\u{1F604} You are happy, weekend is here? \u{1F3D6}\u{1F389}\u{1F60A}",
    "\u{1F604} You are happy, stars are shining just for you? \u{1F31F}\u{1F31F}\u{1F31F}",
    "\u{1F604} You are happy, launched your project successfully? \u{1F680}\u{1F44F}\u{1F973}",
    "\u{1F604} You are happy, someone shared cookies? \u{1F36A}\u{1F370}\u{1F36C}",
    "\u{1F604} You are happy, laptop battery lasted longer? \u{1F4BB}\u{1F50B}\u{1F44D}",
    "\u{1F604} You are happy, boss complimented your work? \u{1F64C}\u{1F60A}\u{1F44F}",
    "\u{1F604} You are happy, team achieved the milestone? \u{1F3C6}\u{1F973}\u{1F389}",
    "\u{1F604} You are happy, coffee machine finally working? \u{2615}\u{1F60A}\u{1F603}",
    "\u{1F604} You are happy, found your lost pen? \u{270F}\u{1F609}\u{1F60A}",
    "\u{1F604} You are happy, hotfix resolved in minutes? \u{1F525}\u{23F3}\u{1F44C}",
    "\u{1F604} You are happy, pull request got merged? \u{1F4E6}\u{1F44D}\u{1F973}",
    "\u{1F604} You are happy, everyone applauded your demo? \u{1F44F}\u{1F389}\u{1F60D}",
    "\u{1F604} You are happy, received a thank you email? \u{1F4E7}\u{1F609}\u{1F60A}",
    "\u{1F604} You are happy, project hit first release? \u{1F947}\u{1F680}\u{1F44C}",
    "\u{1F604} You are happy, spring vibes outside your window? \u{1F33C}\u{1F338}\u{1F31F}",
    "\u{1F604} You are happy, solved a months-old bug? \u{1F41B}\u{1F4A8}\u{1F973}",
    "\u{1F604} You are happy, salary credited early? \u{1F4B0}\u{1F60A}\u{1F609}",
    "\u{1F604} You are happy, your favorite song is playing? \u{1F3B5}\u{1F609}\u{1F604}",
    "\u{1F604} You are happy, teammate shared chocolates? \u{1F36B}\u{1F60D}\u{1F37F}",
    "\u{1F604} You are happy, surprise pizza for lunch? \u{1F355}\u{1F373}\u{1F60B}"
  ],
  sad: [
    "\u{1F622} Missed the coffee again? \u{2615}\u{1F622}\u{1F62D}",
    "\u{1F622} Server down on a Friday? \u{1F627}\u{1F622}\u{1F480}",
    "\u{1F622} Another rainy Monday? \u{1F327}\u{1F622}\u{1F614}",
    "\u{1F622} Build failed at 99%? \u{1F494}\u{1F622}\u{1F6AB}",
    "\u{1F622} Bug came back again? \u{1F41B}\u{1F622}\u{1F627}",
    "\u{1F622} Missed your lunch break? \u{1F37D}\u{1F622}\u{1F625}",
    "\u{1F622} Forgot to commit before leaving? \u{1F4DD}\u{1F622}\u{1F613}",
    "\u{1F622} Stayed up too late debugging? \u{1F4BB}\u{1F622}\u{1F62A}",
    "\u{1F622} Browser crashed with 50 tabs open? \u{1F4F0}\u{1F622}\u{1F62B}",
    "\u{1F622} Missed your favorite show? \u{1F3AC}\u{1F622}\u{1F61F}",
    "\u{1F622} Laptop battery died mid-work? \u{1F4BB}\u{1F622}\u{1F627}",
    "\u{1F622} Internet dropped during a call? \u{1F4F6}\u{1F622}\u{1F615}",
    "\u{1F622} Salary delayed again? \u{1F4B0}\u{1F622}\u{1F622}",
    "\u{1F622} Missed the bus by 1 minute? \u{1F68C}\u{1F622}\u{1F622}",
    "\u{1F622} Got stuck in traffic for hours? \u{1F697}\u{1F622}\u{1F614}",
    "\u{1F622} Coffee machine broken again? \u{2615}\u{1F622}\u{1F61E}",
    "\u{1F622} Favorite show got cancelled? \u{1F3AC}\u{1F622}\u{1F625}",
    "\u{1F622} Keyboard broke mid-type? \u{2328}\u{1F622}\u{1F62D}",
    "\u{1F622} Printer jammed again? \u{1F5A8}\u{1F622}\u{1F622}",
    "\u{1F622} Email bounced back? \u{1F4E7}\u{1F622}\u{1F625}",
    "\u{1F622} Forgot meeting link? \u{1F4BB}\u{1F622}\u{1F62D}",
    "\u{1F622} Lost WiFi signal? \u{1F4F6}\u{1F622}\u{1F615}",
    "\u{1F622} Lost your headphones? \u{1F3A7}\u{1F622}\u{1F622}",
    "\u{1F622} Coffee spill on laptop? \u{2615}\u{1F622}\u{1F627}",
    "\u{1F622} Missed deadline? \u{23F3}\u{1F622}\u{1F622}"
  ],
  angry: [
    "\u{1F621} Merge conflict on main branch? \u{1F621}\u{1F620}\u{1F4A5}",
    "\u{1F621} Someone pushed without testing? \u{1F621}\u{1F92C}\u{1F621}",
    "\u{1F621} Waiting for build to finish? \u{23F3}\u{1F621}\u{1F620}",
    "\u{1F621} IDE crashed again? \u{1F4A5}\u{1F621}\u{1F621}",
    "\u{1F621} WiFi went out during meeting? \u{1F4F6}\u{1F621}\u{1F624}",
    "\u{1F621} Someone broke the build? \u{1F4A2}\u{1F621}\u{1F621}",
    "\u{1F621} Legacy code is a mess? \u{1F479}\u{1F621}\u{1F624}",
    "\u{1F621} User said 'It just doesn’t work.'? \u{1F620}\u{1F621}\u{1F621}",
    "\u{1F621} Coffee spilled on keyboard? \u{2615}\u{1F621}\u{1F62C}",
    "\u{1F621} Colleague removed my branch? \u{1F62C}\u{1F621}\u{1F624}",
    "\u{1F621} Stack Overflow is down? \u{1F62D}\u{1F621}\u{1F622}",
    "\u{1F621} Meeting running too long? \u{1F624}\u{1F621}\u{1F62C}",
    "\u{1F621} Forgot password again? \u{1F615}\u{1F621}\u{1F62D}",
    "\u{1F621} Laptop overheated? \u{1F975}\u{1F621}\u{1F624}",
    "\u{1F621} Monitor flickered? \u{1F626}\u{1F621}\u{1F624}",
    "\u{1F621} Code reviewer rejected everything? \u{1F616}\u{1F621}\u{1F62C}",
    "\u{1F621} Keyboard keys sticking? \u{1F622}\u{1F621}\u{1F624}",
    "\u{1F621} Server crashed during demo? \u{1F635}\u{1F621}\u{1F624}",
    "\u{1F621} Build logs full of red errors? \u{1F621}\u{1F4A2}\u{1F621}",
    "\u{1F621} Backup didn’t work? \u{1F4A2}\u{1F621}\u{1F624}",
    "\u{1F621} Missed your commit window? \u{1F4DD}\u{1F621}\u{1F624}",
    "\u{1F621} Someone deleted shared file? \u{1F622}\u{1F621}\u{1F62C}",
    "\u{1F621} Printer jammed during report? \u{1F5A8}\u{1F621}\u{1F624}",
    "\u{1F621} Build server crashed? \u{1F4BB}\u{1F621}\u{1F62D}",
    "\u{1F621} Meeting room projector failed? \u{1F632}\u{1F621}\u{1F624}"
  ],
  // Similarly expand surprised, fearful, disgusted, neutral with 25+ items
  surprised: [
    "\u{1F632} You are surprised, code worked first try! \u{1F973}\u{1F31F}\u{2728}",
    "\u{1F632} You are surprised, legacy code is well-documented! \u{1F31F}\u{1F60D}\u{1F60E}",
    "\u{1F632} You are surprised, meeting ended early! \u{1F389}\u{1F973}\u{1F604}",
    "\u{1F632} You are surprised, server is up! \u{1F4BB}\u{1F680}\u{1F60A}",
    "\u{1F632} You are surprised, got compliment from boss! \u{1F929}\u{1F604}\u{1F60D}",
    "\u{1F632} You are surprised, quick fix took 5 minutes! \u{23F3}\u{1F973}\u{1F680}",
    "\u{1F632} You are surprised, found a hidden Easter egg! \u{1F973}\u{1F381}\u{1F60D}",
    "\u{1F632} You are surprised, someone sent a meme! \u{1F923}\u{1F604}\u{1F60D}",
    "\u{1F632} You are surprised, package arrived early! \u{1F69A}\u{1F604}\u{1F60A}",
    "\u{1F632} You are surprised, found $20 on floor! \u{1F4B5}\u{1F973}\u{1F60D}",
    "\u{1F632} You are surprised, colleague brought donuts! \u{1F369}\u{1F60A}\u{1F604}",
    "\u{1F632} You are surprised, coffee machine works again! \u{2615}\u{1F60D}\u{1F604}",
    "\u{1F632} You are surprised, printer finally printed! \u{1F4BE}\u{1F973}\u{1F604}",
    "\u{1F632} You are surprised, team celebrated a small win! \u{1F389}\u{1F60A}\u{1F973}",
    "\u{1F632} You are surprised, email replied instantly! \u{1F4E7}\u{1F60D}\u{1F604}",
    "\u{1F632} You are surprised, solved a tough problem! \u{1F60E}\u{1F973}\u{1F604}",
    "\u{1F632} You are surprised, bug simpler than expected! \u{1F92F}\u{1F60D}\u{1F604}",
    "\u{1F632} You are surprised, discovered forgotten $5! \u{1F4B5}\u{1F973}\u{1F60A}",
    "\u{1F632} You are surprised, found hidden code comment! \u{1F913}\u{1F604}\u{1F60D}",
    "\u{1F632} You are surprised, team lunch surprise! \u{1F37D}\u{1F973}\u{1F604}",
    "\u{1F632} You are surprised, code review positive! \u{1F44D}\u{1F973}\u{1F604}",
    "\u{1F632} You are surprised, deployment succeeded! \u{1F680}\u{2728}\u{1F604}",
    "\u{1F632} You are surprised, CI/CD passed first try! \u{1F973}\u{2705}\u{1F60A}",
    "\u{1F632} You are surprised, server restarted successfully! \u{1F4BB}\u{1F60D}\u{1F973}",
    "\u{1F632} You are surprised, test suite green! \u{1F7E2}\u{1F973}\u{1F604}"
  ],
    fearful: [
   "\u{1F628} You are fearful, forgot to push changes? \u{1F622}\u{1F631}\u{1F627}",
  "\u{1F628} You are fearful, laptop battery low! \u{1F50B}\u{1F628}\u{1F62A}",
  "\u{1F628} You are fearful, meeting started without you! \u{1F4AC}\u{1F628}\u{1F61F}",
  "\u{1F628} You are fearful, test failed unexpectedly! \u{1F62D}\u{1F628}\u{1F625}",
  "\u{1F628} You are fearful, server crashed mid-deploy! \u{1F4BB}\u{1F628}\u{1F631}",
  "\u{1F628} You are fearful, code disappeared after crash! \u{1F4A5}\u{1F628}\u{1F622}",
  "\u{1F628} You are fearful, forgot meeting link! \u{1F4BB}\u{1F628}\u{1F615}",
  "\u{1F628} You are fearful, project deadline tomorrow! \u{23F3}\u{1F628}\u{1F627}",
  "\u{1F628} You are fearful, hotfix broke production! \u{1F525}\u{1F628}\u{1F62C}",
  "\u{1F628} You are fearful, laptop overheated! \u{1F975}\u{1F628}\u{1F62A}",
  "\u{1F628} You are fearful, branch got deleted! \u{1F4DD}\u{1F628}\u{1F631}",
  "\u{1F628} You are fearful, forgot to merge PR! \u{1F4E6}\u{1F628}\u{1F622}",
  "\u{1F628} You are fearful, server memory full! \u{1F4BD}\u{1F628}\u{1F627}",
  "\u{1F628} You are fearful, colleague crashed their system! \u{1F4BB}\u{1F628}\u{1F62D}",
  "\u{1F628} You are fearful, lost WiFi mid-presentation! \u{1F4F6}\u{1F628}\u{1F631}",
  "\u{1F628} You are fearful, test environment gone! \u{1F622}\u{1F628}\u{1F62C}",
  "\u{1F628} You are fearful, forgot backup? \u{1F4BE}\u{1F628}\u{1F622}",
  "\u{1F628} You are fearful, server CPU spiked! \u{1F4BB}\u{1F628}\u{1F631}",
  "\u{1F628} You are fearful, merge conflict nightmare! \u{1F621}\u{1F628}\u{1F627}",
  "\u{1F628} You are fearful, forgot environment variable! \u{1F622}\u{1F628}\u{1F615}",
  "\u{1F628} You are fearful, failed to compile! \u{1F4A5}\u{1F628}\u{1F62A}",
  "\u{1F628} You are fearful, accidental deletion! \u{1F4A2}\u{1F628}\u{1F62D}",
  "\u{1F628} You are fearful, production logs full! \u{1F4D1}\u{1F628}\u{1F631}",
  "\u{1F628} You are fearful, unexpected merge! \u{1F628}\u{1F622}\u{1F631}",
  "\u{1F628} You are fearful, forgotten credentials! \u{1F510}\u{1F628}\u{1F627}"
  ],
    disgusted: [
   "\u{1F92E} You are disgusted, legacy code smells bad! \u{1F4A9}\u{1F92E}\u{1F621}",
  "\u{1F92E} You are disgusted, commit message missing! \u{1F4DD}\u{1F92E}\u{1F62C}",
  "\u{1F92E} You are disgusted, server config messy! \u{1F4BB}\u{1F92E}\u{1F61F}",
  "\u{1F92E} You are disgusted, merge conflicts everywhere! \u{1F621}\u{1F92E}\u{1F624}",
  "\u{1F92E} You are disgusted, printer jammed again! \u{1F5A8}\u{1F92E}\u{1F62C}",
  "\u{1F92E} You are disgusted, bad indentation! \u{1F4DD}\u{1F92E}\u{1F622}",
  "\u{1F92E} You are disgusted, unnecessary console logs! \u{1F4A5}\u{1F92E}\u{1F631}",
  "\u{1F92E} You are disgusted, messy CSS styles! \u{1F3A8}\u{1F92E}\u{1F620}",
  "\u{1F92E} You are disgusted, test fails constantly! \u{1F92E}\u{1F622}\u{1F625}",
  "\u{1F92E} You are disgusted, unhandled exceptions! \u{1F622}\u{1F92E}\u{1F627}",
  "\u{1F92E} You are disgusted, typo in production! \u{1F92E}\u{1F62B}\u{1F614}",
  "\u{1F92E} You are disgusted, spilled coffee on desk! \u{2615}\u{1F92E}\u{1F62C}",
  "\u{1F92E} You are disgusted, messy database entries! \u{1F4C8}\u{1F92E}\u{1F622}",
  "\u{1F92E} You are disgusted, log files too long! \u{1F5D2}\u{1F92E}\u{1F624}",
  "\u{1F92E} You are disgusted, too many TODOs! \u{1F4DD}\u{1F92E}\u{1F62A}",
  "\u{1F92E} You are disgusted, hardcoded passwords! \u{1F510}\u{1F92E}\u{1F621}",
  "\u{1F92E} You are disgusted, redundant code! \u{1F4A5}\u{1F92E}\u{1F622}",
  "\u{1F92E} You are disgusted, duplicated functions! \u{1F92E}\u{1F622}\u{1F627}",
  "\u{1F92E} You are disgusted, inconsistent naming! \u{1F522}\u{1F92E}\u{1F624}",
  "\u{1F92E} You are disgusted, debug code in production! \u{1F4BB}\u{1F92E}\u{1F621}",
  "\u{1F92E} You are disgusted, wrong data type! \u{1F4C1}\u{1F92E}\u{1F622}",
  "\u{1F92E} You are disgusted, missed null check! \u{1F622}\u{1F92E}\u{1F62C}",
  "\u{1F92E} You are disgusted, messy imports! \u{1F4C0}\u{1F92E}\u{1F627}",
  "\u{1F92E} You are disgusted, confusing logic! \u{1F92E}\u{1F622}\u{1F625}",
  "\u{1F92E} You are disgusted, unoptimized queries! \u{1F4C8}\u{1F92E}\u{1F621}"
  ],
    neutral: [
   "\u{1F610} You are neutral, everything is running smoothly on the server. \u{1F4BB}\u{1F310}\u{1F4C8}",
  "\u{1F610} You are neutral, code compiles without errors. \u{1F4BB}\u{2705}\u{1F60A}",
  "\u{1F610} You are neutral, build completed in expected time. \u{1F4BB}\u{23F3}\u{1F4C6}",
  "\u{1F610} You are neutral, tests ran without failures. \u{1F52C}\u{2705}\u{1F610}",
  "\u{1F610} You are neutral, your commit pushed successfully. \u{1F4E6}\u{1F4DD}\u{1F60A}",
  "\u{1F610} You are neutral, the meeting stayed on schedule. \u{1F4AC}\u{1F4C5}\u{1F610}",
  "\u{1F610} You are neutral, the deployment went as planned. \u{1F680}\u{1F4BB}\u{1F4C4}",
  "\u{1F610} You are neutral, code review feedback is constructive. \u{1F4DD}\u{1F4AC}\u{1F60A}",
  "\u{1F610} You are neutral, all team members are available online. \u{1F465}\u{1F4AC}\u{1F4BB}",
  "\u{1F610} You are neutral, the IDE is responsive and stable. \u{1F4BB}\u{1F527}\u{1F60A}",
  "\u{1F610} You are neutral, your branch merged without conflicts. \u{1F4DD}\u{2705}\u{1F610}",
  "\u{1F610} You are neutral, the database queries returned expected results. \u{1F4C1}\u{1F4BB}\u{1F4C8}",
  "\u{1F610} You are neutral, logs show no critical errors. \u{1F5D2}\u{1F622}\u{1F610}",
  "\u{1F610} You are neutral, server response times are normal. \u{1F4BB}\u{23F3}\u{1F310}",
  "\u{1F610} You are neutral, your scripts executed successfully. \u{1F4BB}\u{1F52C}\u{2705}",
  "\u{1F610} You are neutral, system health checks passed. \u{1F4BB}\u{1F33F}\u{1F4C8}",
  "\u{1F610} You are neutral, notifications are all read. \u{1F514}\u{2705}\u{1F4E7}",
  "\u{1F610} You are neutral, the terminal shows expected outputs. \u{1F5C3}\u{1F4C1}\u{1F610}",
  "\u{1F610} You are neutral, your editor saved all changes. \u{1F4DD}\u{1F4BE}\u{1F610}",
  "\u{1F610} You are neutral, network connection is stable. \u{1F4F6}\u{1F4BB}\u{1F610}",
  "\u{1F610} You are neutral, your backups completed successfully. \u{1F4BE}\u{2705}\u{1F610}",
  "\u{1F610} You are neutral, pull requests are reviewed and approved. \u{1F4E6}\u{1F4AC}\u{1F60A}",
  "\u{1F610} You are neutral, CI/CD pipelines ran without interruptions. \u{1F680}\u{1F4BB}\u{1F60A}",
  "\u{1F610} You are neutral, team chat is organized and calm. \u{1F4AC}\u{1F4C1}\u{1F610}",
  "\u{1F610} You are neutral, deployment logs show normal activity. \u{1F4BB}\u{1F4C4}\u{1F60A}",
  "\u{1F610} You are neutral, your development environment is stable. \u{1F4BB}\u{1F527}\u{1F610}"
  ]
}


  useEffect(() => {
    let stream
    let raf = null
    let isMounted = true

    async function start() {
      try {
        setStatus('Loading models.')
        await loadAllModels(
          'https://jamsheer-thottathil.github.io/ai-emotion-detector-face-api/models'
        )
        onModelsLoaded?.()
        setStatus('Requesting camera.')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        })
        if (!isMounted) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setStatus('Detecting.')
          detectLoop()
        }
      } catch (err) {
        console.error(err)
        setStatus('Error: ' + err.message)
      }
    }

    async function detectLoop() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const { videoWidth, videoHeight } = video
      canvas.width = videoWidth
      canvas.height = videoHeight

      const displaySize = { width: videoWidth, height: videoHeight }
      const opts = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5
      })

      const detections = await faceapi
        .detectAllFaces(video, opts)
        .withFaceLandmarks()
        .withFaceExpressions()

      const resized = faceapi.resizeResults(detections, displaySize)
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      faceapi.draw.drawDetections(canvas, resized)
      faceapi.draw.drawFaceLandmarks(canvas, resized)

      if (resized.length > 0) {
        const exps = resized[0].expressions
        const [label] = Object.entries(exps).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )

        // Update text every 5 seconds
        if (Date.now() - lastChangeRef.current >= 5000) {
          const pool = funnyTexts[label] || funnyTexts['neutral']
          const randomText = pool[Math.floor(Math.random() * pool.length)]
          setTopText(randomText)
          lastChangeRef.current = Date.now()
        }
      }

      raf = requestAnimationFrame(detectLoop)
    }

    start()

    return () => {
      isMounted = false
      if (raf) cancelAnimationFrame(raf)
      if (videoRef.current) videoRef.current.pause()
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [onModelsLoaded])

  return (
    <div className="stage" style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ width: '100%', borderRadius: '12px' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <div
        className="badge"
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '18px'
        }}
      >
        {topText || status}
      </div>
    </div>
  )
}
