'use client'

import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from './ThemeToggle'

export function Topbar() {
  const { isSignedIn } = useAuth()

  return (
    <header className="topbar">
      <a href="/" className="wordmark">
        <div className="wordmark-glyph">
          <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 22 L3 5 L16 20 L16 7" />
            <g className="plane-body">
              <path d="M23 4 L16 22 L13.5 14.5 L6 12 Z" fill="currentColor" stroke="none" opacity="0.15"/>
              <path d="M23 4 L16 22 L13.5 14.5 L6 12 Z"/>
              <path d="M23 4 L13.5 14.5"/>
            </g>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 500, fontSize: '15px', letterSpacing: '-0.02em', textTransform: 'lowercase' }}>
          nexa
        </span>
      </a>

      <nav className="topnav">
        <a href="#">Tailor</a>
        <a href="#">History</a>
        <a href="#">Help</a>
      </nav>

      <div className="topbar-right">
        <ThemeToggle />
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <SignInButton>
              <button className="btn btn-ghost">Log in</button>
            </SignInButton>
            <SignUpButton>
              <button className="btn btn-primary">Sign up</button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  )
}
