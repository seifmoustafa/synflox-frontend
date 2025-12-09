'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Shield } from 'lucide-react'
import { useSettings } from '@shared/providers/settings-provider'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  animation?: 'none' | 'spin' | 'pulse' | 'bounce' | 'fancy'
  clickable?: boolean
}

export function Logo({ className, showText = true, size = 'md', animation = 'none', clickable = true }: LogoProps) {
  const settings = useSettings()

  if (!settings.showLogo) {
    return null
  }

  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5', 
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
    '2xl': 'h-16 w-16',
    '3xl': 'h-24 w-24',
    '4xl': 'h-32 w-32',
    '5xl': 'h-40 w-40',
    '6xl': 'h-48 w-48'
  }

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg', 
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
    '4xl': 'text-5xl',
    '5xl': 'text-6xl',
    '6xl': 'text-7xl'
  }

  const animationClasses = {
    none: '',
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    fancy: 'animate-pulse hover:animate-bounce transition-all duration-300',
  }

  const renderIcon = () => {
    const iconClass = cn(
      sizeClasses[size],
      animationClasses[animation],
      'transition-all duration-200'
    )

    switch (settings.logoType) {
      case 'sparkles':
        return <Sparkles className={iconClass} />
      case 'shield':
        return <Shield className={iconClass} />
      case 'image':
        return (
          <div className={cn(sizeClasses[size], 'relative overflow-hidden rounded-full')}>
            <Image
              src={'/app-logo.png'}
              alt="Logo"
              fill
              className={cn('object-cover', animationClasses[animation])}
              onError={(e) => {
                // Fallback to sparkles icon if image fails to load
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )
      case 'custom':
        return null
      default:
        return <Sparkles className={iconClass} />
    }
  }

  const content = (
    <>
      {renderIcon()}
      {showText && settings.logoType === 'custom' && (
        <span className={cn('font-semibold', textSizeClasses[size])}>
          {settings.logoText}
        </span>
      )}
    </>
  )

  if (!clickable) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {content}
      </div>
    )
  }

  return (
    <Link href="/" className={cn('flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200', className)}>
      {content}
    </Link>
  )
}
