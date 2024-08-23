import {Mnemonic} from '@multiversx/sdk-wallet/out'
import {FC, useState} from 'react'
import {
  Box,
  Button,
  IconButton,
  Text,
  useToast,
  Fade,
  Center,
} from '@chakra-ui/react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {FaEye, FaCopy, FaCheck} from 'react-icons/fa'

interface GenerateWalletProps {
  onWalletGenerated: (mnemonic: string[], address: string) => void
}

export const GenerateWallet: FC<GenerateWalletProps> = ({
  onWalletGenerated,
}) => {
  const [words, setWords] = useState<Array<string>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showWords, setShowWords] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)
  const toast = useToast()

  function generateWallet() {
    setLoading(true)
    setShowWords(false)
    setCopied(false)
    setVisible(false)

    setTimeout(() => {
      try {
        const mnemonic = Mnemonic.generate()
        const words = mnemonic.getWords()

        const userSecret = mnemonic.deriveKey()

        const userAddress = userSecret.generatePublicKey().toAddress().bech32()

        setWords(words)
        setLoading(false)
        setVisible(true)

        onWalletGenerated(words, userAddress)
      } catch (error) {
        console.error('Error generating wallet:', error)
        setLoading(false)
        toast({
          title: 'Error',
          description: 'Failed to generate wallet. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }, 2000)
  }

  const handleCopy = () => {
    setCopied(true)
    toast({
      title: 'Copied',
      description: 'Mnemonic phrase copied to clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Center p={4}>
      <Box textAlign="center" color={'black'}>
        <Button
          isLoading={loading}
          loadingText="Generating"
          hidden={words.length > 0}
          colorScheme="teal"
          onClick={generateWallet}
        >
          Generate Wallet
        </Button>
        {visible && (
          <Fade in={visible}>
            <Box
              position="relative"
              mt={4}
              p={8}
              bg="gray.100"
              rounded="md"
              boxShadow="lg"
            >
              <Text
                pt={4}
                fontSize="lg"
                textAlign="center"
                overflow="hidden"
                style={{
                  filter: showWords ? 'none' : 'blur(4px)',
                }}
                cursor="pointer"
                onClick={() => setShowWords(!showWords)}
              >
                {words.join(' ')}
              </Text>
              {!showWords && (
                <Center position="absolute" inset={0}>
                  <IconButton
                    aria-label="Show mnemonic"
                    icon={<FaEye />}
                    onClick={() => setShowWords(true)}
                    variant="ghost"
                    fontSize="2xl"
                    colorScheme="gray"
                  />
                </Center>
              )}
              <CopyToClipboard text={words.join(' ')} onCopy={handleCopy}>
                <IconButton
                  aria-label="Copy mnemonic"
                  icon={copied ? <FaCheck /> : <FaCopy />}
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme={copied ? 'green' : 'teal'}
                />
              </CopyToClipboard>
            </Box>
          </Fade>
        )}
      </Box>
    </Center>
  )
}
