import React, {useState, useEffect, useMemo, FC} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {useInitData, useLaunchParams} from '@telegram-apps/sdk-react'

const Dashboard: FC = () => {
  const initData = useInitData()
  const lp = useLaunchParams()
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [storedWalletAddress, setStoredWalletAddress] = useState<string>('')

  // Retrieve wallet address from localStorage when component mounts
  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress') || ''
    setStoredWalletAddress(walletAddress)
  }, [])

  const userName = useMemo(() => {
    if (!initData?.user) return 'User'
    const {firstName, lastName} = initData.user
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User'
  }, [initData])

  // Set start and end time on initial mount
  useEffect(() => {
    const storedStartTime = localStorage.getItem('startTime')
    const storedEndTime = localStorage.getItem('endTime')

    if (storedStartTime && storedEndTime) {
      setStartTime(new Date(parseInt(storedStartTime, 10)))
      setEndTime(new Date(parseInt(storedEndTime, 10)))
    } else {
      const now = new Date()
      const newEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now

      localStorage.setItem('startTime', now.getTime().toString())
      localStorage.setItem('endTime', newEndTime.getTime().toString())

      setStartTime(now)
      setEndTime(newEndTime)
    }
  }, [])

  // Update time remaining based on endTime
  useEffect(() => {
    if (!endTime) return

    const updateRemainingTime = () => {
      const now = new Date()
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - now.getTime()) / 1000)
      )
      setTimeRemaining(remaining)
    }

    updateRemainingTime()

    const intervalId = setInterval(updateRemainingTime, 1000)

    return () => clearInterval(intervalId)
  }, [endTime])

  const getElapsedPercentage = () => {
    if (!startTime || !endTime) return 0
    const totalDuration = endTime.getTime() - startTime.getTime()
    const now = new Date().getTime()
    const elapsedDuration = now - startTime.getTime()
    const percentage = Math.min(100, (elapsedDuration / totalDuration) * 100)
    return percentage
  }

  const calculateRewards = () => {
    if (!startTime || !endTime) return 0
    const elapsedHours = Math.min(
      2,
      (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60)
    )
    return Math.floor(elapsedHours * 1000)
  }

  const handleClaim = () => {
    if (storedWalletAddress) {
      // Implement airdrop logic here
      console.log(`Airdropping tokens to ${storedWalletAddress}`)

      // Reset the times after claiming
      const now = new Date()
      const newEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now

      localStorage.setItem('startTime', now.getTime().toString())
      localStorage.setItem('endTime', newEndTime.getTime().toString())
      setStartTime(now)
      setEndTime(newEndTime)
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return `Good morning, ${userName}`
    if (hour < 18) return `Good afternoon, ${userName}`
    return `Good evening, ${userName}`
  }

  // Format time remaining
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return {hours, minutes, seconds: remainingSeconds}
  }

  const {hours, minutes, seconds} = formatTime(timeRemaining)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-4">{greeting()}</h1>

      <div className="text-3xl mb-6">
        <div className="flex space-x-1">
          <div className="text-2xl font-bold">
            {String(hours).padStart(2, '0')}
          </div>
          <span className="text-2xl font-bold">:</span>
          <div className="text-2xl font-bold">
            {String(minutes).padStart(2, '0')}
          </div>
          <span className="text-2xl font-bold">:</span>
          <div className="text-2xl font-bold">
            {String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mb-6 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-1000"
          style={{width: `${getElapsedPercentage()}%`}}
        />
      </div>

      <div className="text-lg mb-6">Tokens to claim: {calculateRewards()}</div>

      <button
        onClick={handleClaim}
        disabled={getElapsedPercentage() < 100}
        className={`px-6 py-3 rounded-full text-white font-semibold transition-colors duration-300 ${
          getElapsedPercentage() < 100
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-black hover:bg-gray-800'
        }`}
      >
        Claim
      </button>
    </div>
  )
}

export default Dashboard
