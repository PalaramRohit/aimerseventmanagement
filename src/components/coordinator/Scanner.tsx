'use client'

import { useState, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { validateScan } from '@/app/(portal)/coordinator/events/[id]/actions'
import { Scan, CheckCircle2, AlertCircle, XCircle, UserCheck, Coffee, Utensils, UtensilsCrossed, ArrowLeft } from 'lucide-react'

type OperationType = 'attendance' | 'breakfast' | 'lunch' | 'dinner'

interface ScannerProps {
  eventId: string;
  operations: {
    attendance: boolean;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

export function Scanner({ eventId, operations }: ScannerProps) {
  const [operation, setOperation] = useState<OperationType | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    duplicate?: boolean;
    message: string;
    participantName?: string;
  } | null>(null)

  useEffect(() => {
    if (!isScanning) return;

    const scannerId = "reader"
    const html5Qrcode = new Html5Qrcode(scannerId)

    const onScanSuccess = async (decodedText: string) => {
      // Pause scanner while validating
      html5Qrcode.pause();
      
      try {
        const result = await validateScan(eventId, operation!, decodedText)
        setScanResult(result)
      } catch {
        setScanResult({ success: false, message: 'Network or validation error' })
      }
    }

    const onScanFailure = () => {
      // Ignored: mostly "no qr code found" every frame
    }

    const config = { fps: 10, qrbox: { width: 250, height: 250 } }

    html5Qrcode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      .catch((err) => {
        console.warn("Failed to start environment camera, falling back...", err);
        // Fallback to any camera available
        html5Qrcode.start({ facingMode: "user" }, config, onScanSuccess, onScanFailure)
          .catch(e => console.error("Camera failed entirely:", e))
      })

    return () => {
      if (html5Qrcode.isScanning) {
        html5Qrcode.stop().then(() => html5Qrcode.clear()).catch(console.error)
      } else {
        try { html5Qrcode.clear() } catch(e) {}
      }
    }
  }, [isScanning, eventId, operation])

  const handleStartScan = (op: OperationType) => {
    setOperation(op)
    setIsScanning(true)
    setScanResult(null)
  }

  const handleStopScan = () => {
    setIsScanning(false)
    setOperation(null)
    setScanResult(null)
  }

  const handleResumeScan = () => {
    setScanResult(null)
    setIsScanning(true)
  }

  const opConfig = {
    attendance: { icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    breakfast: { icon: Coffee, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    lunch: { icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    dinner: { icon: UtensilsCrossed, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  }

  if (isScanning && operation) {
    const OpIcon = opConfig[operation].icon;
    
    return (
      <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto py-4">
        <div className="flex items-center justify-between w-full mb-2">
          <button onClick={handleStopScan} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${opConfig[operation].bg} ${opConfig[operation].color} text-sm font-bold tracking-wide uppercase`}>
            <OpIcon size={14} />
            {operation}
          </div>
        </div>
        
        {scanResult ? (
          <div className={`p-8 rounded-2xl w-full text-center relative overflow-hidden ${
            scanResult.success 
              ? (scanResult.duplicate ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200') 
              : 'bg-rose-50 border-rose-200'
          } border-2 shadow-sm`}>
            
            {/* Status Icon */}
            <div className="flex justify-center mb-5">
              {scanResult.success ? (
                scanResult.duplicate ? (
                  <AlertCircle className="w-16 h-16 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                )
              ) : (
                <XCircle className="w-16 h-16 text-rose-500" />
              )}
            </div>

            {scanResult.success ? (
              <>
                <div className={`${scanResult.duplicate ? 'text-amber-800' : 'text-emerald-800'} font-bold text-2xl mb-2`}>
                  {scanResult.duplicate ? 'Already Scanned' : 'Access Granted'}
                </div>
                <div className="text-slate-600 font-medium text-sm mb-6">{scanResult.message}</div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Participant Name</div>
                  <div className="text-slate-900 font-extrabold text-xl">{scanResult.participantName}</div>
                </div>
              </>
            ) : (
              <>
                <div className="text-rose-800 font-bold text-2xl mb-2">
                  Invalid Scan
                </div>
                <div className="text-rose-600 mt-2 font-medium">{scanResult.message}</div>
              </>
            )}
            
            <div className="mt-8 flex gap-3 justify-center relative z-10">
              <button 
                onClick={handleResumeScan}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                  scanResult.success 
                    ? (scanResult.duplicate ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20')
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                }`}
              >
                Scan Next
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-900">
              {/* html5-qrcode injects its own UI here, we just wrap it */}
              <div id="reader" className="w-full h-full text-slate-800 [&_select]:p-2 [&_select]:rounded-md [&_button]:mt-4 [&_button]:px-4 [&_button]:py-2 [&_button]:bg-blue-600 [&_button]:text-white [&_button]:rounded-md [&_button]:font-medium [&_a]:hidden"></div>
              
              <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10">
                <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <Scan size={16} /> Position Data Matrix in frame
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
        <Scan size={28} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Select Operation</h2>
      <p className="text-slate-500 text-center mb-8 max-w-sm">Choose which operation you are currently verifying at this station.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {operations.attendance && (
          <button onClick={() => handleStartScan('attendance')} className="group p-5 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 rounded-2xl transition-all flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="block font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Attendance</span>
              <span className="block text-xs font-medium text-slate-400 mt-0.5">Check-in participant</span>
            </div>
          </button>
        )}
        {operations.breakfast && (
          <button onClick={() => handleStartScan('breakfast')} className="group p-5 bg-white border border-slate-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-900/5 rounded-2xl transition-all flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-600 transition-colors">
              <Coffee size={20} />
            </div>
            <div>
              <span className="block font-bold text-slate-800 group-hover:text-orange-700 transition-colors">Breakfast</span>
              <span className="block text-xs font-medium text-slate-400 mt-0.5">Verify meal access</span>
            </div>
          </button>
        )}
        {operations.lunch && (
          <button onClick={() => handleStartScan('lunch')} className="group p-5 bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-900/5 rounded-2xl transition-all flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 transition-colors">
              <Utensils size={20} />
            </div>
            <div>
              <span className="block font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Lunch</span>
              <span className="block text-xs font-medium text-slate-400 mt-0.5">Verify meal access</span>
            </div>
          </button>
        )}
        {operations.dinner && (
          <button onClick={() => handleStartScan('dinner')} className="group p-5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-900/5 rounded-2xl transition-all flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <span className="block font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Dinner</span>
              <span className="block text-xs font-medium text-slate-400 mt-0.5">Verify meal access</span>
            </div>
          </button>
        )}
        
        {!operations.attendance && !operations.breakfast && !operations.lunch && !operations.dinner && (
          <div className="col-span-1 sm:col-span-2 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-12 px-6">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="font-bold text-slate-700 mb-1">No Operations Active</div>
            <div className="text-sm text-slate-500">There are no scanning operations currently enabled for this event.</div>
          </div>
        )}
      </div>
    </div>
  )
}
