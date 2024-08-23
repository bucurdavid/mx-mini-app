import {FC, useState, useMemo} from 'react'
import {useInitData} from '@telegram-apps/sdk-react'
import {motion} from 'framer-motion'
import {Encryptor} from '@multiversx/sdk-wallet/out/crypto'
import {GenerateWallet} from './MultiversX/GenerateWalletPage'

const IntroPage: FC = () => {
  const initData = useInitData()
  const [currentSection, setCurrentSection] = useState(0)
  const [disclaimerVisible, setDisclaimerVisible] = useState(false)
  const [formData, setFormData] = useState({
    walletAddress: '',
    mnemonic: [] as string[],
  })

  const userName = useMemo(() => {
    if (!initData?.user) return 'User'
    const {firstName, lastName} = initData.user
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User'
  }, [initData])

  const handleNext = () => {
    if (currentSection === 2) {
      // Show disclaimer modal
      setDisclaimerVisible(true)
    } else {
      setCurrentSection((prevSection) => prevSection + 1)
    }
  }

  const handleDisclaimerAcknowledge = () => {
    const encryptedWords = Encryptor.encrypt(
      Buffer.from(formData.mnemonic.join(' ')),
      import.meta.env.VITE_ENCRYPT_PASSWORD || ''
    )
    localStorage.setItem('mnemonicWords', JSON.stringify(encryptedWords))
    localStorage.setItem('walletAddress', formData.walletAddress)
    localStorage.setItem('hasVisited', 'true')
    setDisclaimerVisible(false)
    setCurrentSection((prevSection) => prevSection + 1)
  }

  const handleWalletGenerated = (mnemonic: string[], walletAddress: string) => {
    setFormData({mnemonic, walletAddress})
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <motion.div
        className="text-center p-6 bg-white rounded-lg shadow-lg max-w-lg w-full"
        initial={{opacity: 0, scale: 0.8}}
        animate={{opacity: 1, scale: 1}}
        transition={{duration: 0.5}}
      >
        {currentSection === 0 && (
          <>
            <motion.h1
              className="text-3xl font-extrabold text-gray-900 mb-4"
              initial={{y: -20, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              transition={{duration: 0.5, delay: 0.3}}
            >
              Welcome, {userName}!
            </motion.h1>
            <p className="text-gray-700 mb-4">
              We’re glad to have you here. Let’s get started!
            </p>
            <button
              className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              onClick={handleNext}
            >
              Get Started
            </button>
          </>
        )}

        {currentSection === 1 && (
          <>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{y: -20, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              transition={{duration: 0.5, delay: 0.3}}
            >
              Mini App
            </motion.h2>
            <p className="text-gray-700 mb-4">
              Welcome to MINI app - the next generation Telegram mini app.
              Create an account to use crypto and earn $MINI.
            </p>
            <button
              className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              onClick={handleNext}
            >
              Next
            </button>
          </>
        )}

        {currentSection === 2 && (
          <>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{y: -20, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              transition={{duration: 0.5, delay: 0.3}}
            >
              Generate Your Wallet
            </motion.h2>
            <p className="text-gray-700 mb-4">
              Generate a new wallet and secure your mnemonic phrase.
            </p>
            <GenerateWallet onWalletGenerated={handleWalletGenerated} />
            <button
              className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              onClick={handleNext}
              hidden={!formData.mnemonic.length}
            >
              Next
            </button>
          </>
        )}

        {currentSection === 3 && (
          <motion.div
            initial={{y: -20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5}}
          >
            <h2 className="text-3xl font-bold text-gray-900">
              You are all set!
            </h2>
            <p className="text-gray-700 mt-4 mb-8">
              Thank you for setting up your account. You can now use all the
              features available.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              onClick={() => (window.location.href = '/')}
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </motion.div>

      {disclaimerVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Important Reminder
            </h2>
            <p className="text-gray-700 mb-4">
              Please ensure you have securely copied your mnemonic phrase and
              stored it in a safe place. This phrase is crucial for accessing
              your wallet. We are not responsible for any loss of funds due to
              mismanagement of your mnemonic phrase.
            </p>
            <button
              className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              onClick={handleDisclaimerAcknowledge}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntroPage
