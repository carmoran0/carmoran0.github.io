export const useBats = () => {
  let batsData = []
  let bouncingArea = null
  let animationFrameId = null

  const initBats = () => {
    bouncingArea = document.getElementById('bats-bouncing-area')
    if (!bouncingArea) {
      console.error('Contenedor de murciélagos no encontrado')
      return
    }

    const bats = document.querySelectorAll('.bouncing-bat')
    
    bats.forEach((bat) => {
      const containerRect = bouncingArea.getBoundingClientRect()
      const batWidth = bat.offsetWidth || 80
      const batHeight = bat.offsetHeight || 80
      
      const startX = Math.random() * (containerRect.width - batWidth)
      const startY = Math.random() * (containerRect.height - batHeight)
      
      batsData.push({
        element: bat,
        x: startX,
        y: startY,
        speedX: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
        speedY: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
        width: batWidth,
        height: batHeight
      })
      
      bat.style.position = 'absolute'
      bat.style.left = startX + 'px'
      bat.style.top = startY + 'px'
    })
    
    animateBats()
  }

  const addNewBat = () => {
    if (!bouncingArea) return

    const newBat = document.createElement('img')
    newBat.src = '/legacy/images/ANI3DbatHover.gif'
    newBat.className = 'bouncing-bat'
    newBat.alt = 'Murciélago animado'

    bouncingArea.appendChild(newBat)

    const batWidth = newBat.offsetWidth || 80
    const batHeight = newBat.offsetHeight || 80

    const containerWidth = bouncingArea.offsetWidth
    const containerHeight = bouncingArea.offsetHeight

    const startX = Math.random() * (containerWidth - batWidth)
    const startY = Math.random() * (containerHeight - batHeight)

    const batData = {
      element: newBat,
      x: startX,
      y: startY,
      speedX: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
      speedY: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
      width: batWidth,
      height: batHeight
    }

    newBat.style.position = 'absolute'
    newBat.style.left = startX + 'px'
    newBat.style.top = startY + 'px'

    batsData.push(batData)
  }

  const animateBats = () => {
    if (!bouncingArea) return
    
    const containerWidth = bouncingArea.offsetWidth
    const containerHeight = bouncingArea.offsetHeight
    
    batsData.forEach(bat => {
      bat.x += bat.speedX
      bat.y += bat.speedY
      
      if (bat.x <= 0 || bat.x >= containerWidth - bat.width) {
        bat.speedX *= -1
        bat.x = Math.max(0, Math.min(bat.x, containerWidth - bat.width))
      }
      
      if (bat.y <= 0 || bat.y >= containerHeight - bat.height) {
        bat.speedY *= -1
        bat.y = Math.max(0, Math.min(bat.y, containerHeight - bat.height))
      }
      
      bat.element.style.left = bat.x + 'px'
      bat.element.style.top = bat.y + 'px'
    })
    
    animationFrameId = requestAnimationFrame(animateBats)
  }

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    batsData = []
    bouncingArea = null
  }

  return {
    initBats,
    addNewBat,
    cleanup
  }
}
