
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Using useState inside the hook, which is correct
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Initial check
    checkMobile()
    
    // Add event listener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', checkMobile)
      return () => mql.removeEventListener('change', checkMobile)
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}
