import {useState, useEffect, useMemo, FC} from 'react'
import {useInitData} from '@telegram-apps/sdk-react'
import {UserSecretKey, UserSigner} from '@multiversx/sdk-wallet/out'
import {
  Account,
  BigUIntValue,
  ContractCallPayloadBuilder,
  ContractFunction,
  TokenIdentifierValue,
  Transaction,
} from '@multiversx/sdk-core/out'
import {ApiNetworkProvider} from '@multiversx/sdk-network-providers/out'
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'

// Define constants
const REWARDS_PER_HOUR = 1000
const END_TIME_IN_MINUTES = 5 // Set end time to 1 minute

const Dashboard: FC = () => {
  const initData = useInitData()
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [storedWalletAddress, setStoredWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState<number>(0)

  // Retrieve wallet address from localStorage when component mounts
  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress') || ''
    setStoredWalletAddress(walletAddress)

    if (walletAddress) {
      // Fetch the balance
      ;(async () => {
        try {
          const query = await fetch(
            `https://devnet-api.multiversx.com/accounts/${walletAddress}/tokens/MINI-9df1bd`
          )

          if (!query.ok) {
            throw new Error('Failed to fetch balance')
          }

          const data = await query.json()
          setBalance(data?.balance / 10 ** 18 || 0)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setBalance(0) // Set balance to 0 on error
        }
      })()
    }
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
      const newEndTime = new Date(
        now.getTime() + END_TIME_IN_MINUTES * 60 * 1000
      ) // Set end time based on the constant

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
      END_TIME_IN_MINUTES / 60,
      (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60)
    )
    return Math.floor(elapsedHours * REWARDS_PER_HOUR)
  }

  const handleClaim = async () => {
    if (storedWalletAddress) {
      const rewards = calculateRewards()
      const secret = UserSecretKey.fromString(import.meta.env.VITE_PRIVATE_KEY)
      const signer = new UserSigner(secret)

      const apiNetworkProvider = new ApiNetworkProvider(
        `https://devnet-api.multiversx.com`,
        {timeout: 10000}
      )

      const secretAccount = new Account(secret.generatePublicKey().toAddress())

      const secretOnNetwork = await apiNetworkProvider.getAccount(
        secret.generatePublicKey().toAddress()
      )

      secretAccount.update(secretOnNetwork)

      const data = new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction('ESDTTransfer'))
        .addArg(new TokenIdentifierValue('MINI-9df1bd'))
        .addArg(new BigUIntValue(rewards * 10 ** 18))
        .build()

      const sendTx = new Transaction({
        value: 0,
        data: data,
        receiver: storedWalletAddress,
        gasLimit: 20_000_000,
        sender: secret.generatePublicKey().toAddress(),
        chainID: 'D',
      })

      sendTx.setNonce(secretAccount.nonce)

      const serialized = sendTx.serializeForSigning()
      const signature = await signer.sign(serialized)
      sendTx.applySignature(signature)

      await apiNetworkProvider.sendTransaction(sendTx)

      toast.success(`Claimed rewards: ${rewards}`, {
        position: 'bottom-center',
        autoClose: 5000,
      })

      setBalance(balance + rewards)

      const now = new Date()
      const newEndTime = new Date(
        now.getTime() + END_TIME_IN_MINUTES * 60 * 1000
      ) // Reset end time based on the constant

      localStorage.setItem('startTime', now.getTime().toString())
      localStorage.setItem('endTime', newEndTime.getTime().toString())
      setStartTime(now)
      setEndTime(newEndTime)
    }
  }

  console.log('elapsed percentage: ', getElapsedPercentage())
  console.log('remaining time: ', timeRemaining)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return `Good morning, ${userName}`
    if (hour < 18) return `Good afternoon, ${userName}`
    return `Good evening, ${userName}`
  }

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
        disabled={timeRemaining != 0}
        className={`px-6 py-3 rounded-full text-white font-semibold transition-colors duration-300 ${
          timeRemaining != 0
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-black hover:bg-gray-800'
        }`}
      >
        Claim
      </button>
      <div>
        <h1 className="text-1xl font-bold mb-4 mt-20">
          Your balance is:{' '}
          {balance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 18,
          })}
          <a
            href={`https://devnet-explorer.multiversx.com/accounts/${storedWalletAddress}/tokens/MINI-9df1bd`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
          </a>
        </h1>

        <h1 className="text-1xl font-bold mb-4 text-center">
          Your address is: {storedWalletAddress.slice(0, 6)}...
          {storedWalletAddress.slice(-4)}
          <a
            href={`https://devnet-explorer.multiversx.com/accounts/${storedWalletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
          </a>
        </h1>

        <p className="text-1xl text-center">
          Token:{' '}
          <a
            className="font-bold"
            href="https://devnet-explorer.multiversx.com/tokens/MINI-9df1bd"
            target="_blank"
            rel="noopener noreferrer"
          >
            MINI-9df1bd
          </a>
        </p>
      </div>

      <button
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
        className="px-6 py-3 rounded-full text-white font-semibold bg-red-500 hover:bg-red-800 mt-4"
      >
        {' '}
        Reset
      </button>
    </div>
  )
}

export default Dashboard
