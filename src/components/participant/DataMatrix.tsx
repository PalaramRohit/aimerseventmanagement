'use client'

import { useEffect, useRef } from 'react'
import bwipjs from 'bwip-js'

interface DataMatrixProps {
  value: string;
}

export function DataMatrix({ value }: DataMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'datamatrix',
          text: value,
          scale: 4,
          backgroundcolor: 'ffffff',
        })
      } catch (e) {
        console.error('Data Matrix generation failed:', e)
      }
    }
  }, [value])

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-xl mx-auto w-fit">
      <canvas ref={canvasRef} />
    </div>
  )
}
