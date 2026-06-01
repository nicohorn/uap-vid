'use client'
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from '@components/alert'
import { Button } from '@components/button'
import { useState } from 'react'

export default function Info({
  children,
  title,
  content,
  className,
  size = 'lg',
}: {
  children: React.ReactNode
  title?: string
  content: string | React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className={`cursor-help ${className}`}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </div>
      <Alert open={isOpen} onClose={setIsOpen} size={size}>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{content}</AlertDescription>
        <AlertActions>
          <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
        </AlertActions>
      </Alert>
    </>
  )
}
