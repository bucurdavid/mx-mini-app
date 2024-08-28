import {FC, useState, useMemo} from 'react'
import {initHapticFeedback, useInitData} from '@telegram-apps/sdk-react'
import {
  Box,
  Button,
  Heading,
  Text,
  SlideFade,
  useDisclosure,
  Slide,
} from '@chakra-ui/react'
import {Encryptor} from '@multiversx/sdk-wallet/out/crypto'
import {GenerateWallet} from './MultiversX/GenerateWalletPage'
import {useNavigate} from 'react-router-dom'
import {FaExclamationTriangle} from 'react-icons/fa'
import orbit from '../assets/orbit_logo.png'

const IntroPage: FC = () => {
  const initData = useInitData()
  const [currentSection, setCurrentSection] = useState(0)
  const {isOpen: disclaimerVisible, onOpen, onClose} = useDisclosure()
  const [formData, setFormData] = useState({
    walletAddress: '',
    mnemonic: [] as string[],
  })

  const hapticFeedback = initHapticFeedback()

  const userName = useMemo(() => {
    if (!initData?.user) return 'User'
    const {firstName, lastName} = initData.user
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User'
  }, [initData])

  const handleNext = () => {
    if (currentSection === 2) {
      hapticFeedback.notificationOccurred('warning')
      onOpen()
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
    onClose()
    setCurrentSection((prevSection) => prevSection + 1)
  }

  const handleWalletGenerated = (mnemonic: string[], walletAddress: string) => {
    setFormData({mnemonic, walletAddress})
  }

  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/', {replace: true}) // Navigate to the root of the app
  }

  return (
    <Box className="flex items-center justify-center h-screen bg-gray-100 p-4 overflow-hidden">
      <SlideFade in={true} offsetY="20px">
        <Box className="text-center p-6 bg-white rounded-lg shadow-lg max-w-lg w-full">
          {currentSection === 0 && (
            <>
              <Heading size="xl" mb={4} color="black">
                Welcome to
              </Heading>
              <Box p={10}>
                <img src={orbit} alt="Orbit logo" />
              </Box>
              <Text mb={4} color="black">
                We’re glad to have you here, {userName}. Let’s get started!
              </Text>
              <Button colorScheme="teal" onClick={handleNext}>
                Get Started
              </Button>
            </>
          )}

          {currentSection === 1 && (
            <>
              <Heading size="lg" mb={4} color="black">
                Orbit Wallet
              </Heading>
              <Text mb={4} color="black">
                The next generation telegram wallet of the MultiversX
                blockchain. Create an account to use crypto and earn <b>$ORB</b>
              </Text>
              <Button colorScheme="teal" onClick={handleNext}>
                Next
              </Button>
            </>
          )}

          {currentSection === 2 && (
            <>
              <Heading size="lg" mb={4} color="black">
                Generate Your Wallet
              </Heading>
              <Text mb={4} color="black">
                Generate a new wallet and secure your mnemonic phrase.
              </Text>
              <GenerateWallet onWalletGenerated={handleWalletGenerated} />
              <Button
                colorScheme="teal"
                onClick={handleNext}
                hidden={!formData.mnemonic.length}
              >
                Next
              </Button>
            </>
          )}

          {currentSection === 3 && (
            <Box>
              <Heading size="xl" mb={4} color="black">
                You are all set!
              </Heading>
              <Text mt={4} mb={8} color="black">
                Thank you for setting up your account. You can now use all the
                features available.
              </Text>
              <Button colorScheme="teal" onClick={handleGoHome}>
                Go to Dashboard
              </Button>
            </Box>
          )}
        </Box>
      </SlideFade>

      <Slide direction="bottom" in={disclaimerVisible}>
        <Box
          p={12}
          color="white"
          mt="4"
          bg="red.400"
          rounded="md"
          shadow="md"
          position="relative"
        >
          <Box position="absolute" top="2" left="2">
            <FaExclamationTriangle size={24} color="yellow" />
          </Box>
          <Text p={2}>
            Please ensure you have securely copied your mnemonic phrase and
            stored it in a safe place. This phrase is crucial for accessing your
            wallet. We are not responsible for any loss of funds due to
            mismanagement of your mnemonic phrase.
          </Text>
          <Button mt={4} size="sm" onClick={handleDisclaimerAcknowledge}>
            I Understand
          </Button>
        </Box>
      </Slide>
    </Box>
  )
}

export default IntroPage
