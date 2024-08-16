import {FC, useState, useMemo} from 'react'
import {useInitData, useLaunchParams} from '@telegram-apps/sdk-react'
import {motion} from 'framer-motion'

type Platform =
  | 'android'
  | 'android_x'
  | 'ios'
  | 'macos'
  | 'tdesktop'
  | 'unigram'
  | 'unknown'
  | 'web'
  | 'weba'
  | string

const IntroPage: FC = () => {
  const initData = useInitData()
  const lp = useLaunchParams()
  const [currentSection, setCurrentSection] = useState(0) // Include an additional section for completion
  const [formData, setFormData] = useState({walletAddress: ''})

  const userName = useMemo(() => {
    if (!initData?.user) return 'User'
    const {firstName, lastName} = initData.user
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User'
  }, [initData])

  const platform = lp.platform as Platform
  const appLink =
    platform === 'ios'
      ? 'https://apps.apple.com/ro/app/xportal/id1519405832'
      : platform === 'android'
      ? 'https://play.google.com/store/apps/details?id=com.elrond.maiar.wallet&hl=ro'
      : '#'

  const handleNext = () => {
    setCurrentSection((prevSection) => prevSection + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setFormData((prevData) => ({...prevData, [name]: value}))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    localStorage.setItem('walletAddress', formData.walletAddress)
    localStorage.setItem('hasVisited', 'true')
    handleNext() // Proceed to the final confirmation section
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
              Download Xportal
            </motion.h2>
            <p className="text-gray-700 mb-4">
              Get the Xportal app from the link below:
            </p>
            <a
              href={appLink}
              className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
            >
              Download App
            </a>
            <button
              className="px-4 py-2 ml-10 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              onClick={handleNext}
            >
              Next
            </button>
          </>
        )}

        {currentSection === 3 && (
          <>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{y: -20, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              transition={{duration: 0.5, delay: 0.3}}
            >
              Enter Your Wallet Address
            </motion.h2>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center"
            >
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                placeholder="Wallet Address"
                className="px-4 py-2 border rounded-lg w-full mb-4"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800"
              >
                Submit
              </button>
            </form>
          </>
        )}

        {currentSection === 4 && (
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
    </div>
  )
}

export default IntroPage
