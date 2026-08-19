import confetti from 'canvas-confetti'

// Star celebration for task completion
export function triggerTaskStarConfetti(x = 0.5, y = 0.5, reducedMotion = false) {
  if (reducedMotion) return

  confetti({
    particleCount: 15,
    spread: 50,
    startVelocity: 25,
    origin: { x, y },
    colors: ['#FFB800', '#2196F3', '#FF5A4E', '#32B94B'],
    shapes: ['star', 'circle'],
    ticks: 80,
    gravity: 1.2,
    scalar: 0.9,
    disableForReducedMotion: true,
  })
}

// Full celebratory fanfare confetti for 100% Semester Goal badge award
export function triggerGoalUnlockConfetti(reducedMotion = false) {
  if (reducedMotion) return

  const end = Date.now() + 1.2 * 1000

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFB800', '#2196F3', '#32B94B', '#FF5A4E', '#7C4DFF'],
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFB800', '#2196F3', '#32B94B', '#FF5A4E', '#7C4DFF'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}
