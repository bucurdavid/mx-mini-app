import {Mnemonic} from '@multiversx/sdk-wallet/out'
import {Button} from '@telegram-apps/telegram-ui'
import {FC, useState} from 'react'
import {ClipLoader} from 'react-spinners'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {Fade} from 'react-awesome-reveal'
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

        // Generate the user address from the secret key
        const userAddress = userSecret.generatePublicKey().toAddress().bech32()

        setWords(words)
        setLoading(false)
        setVisible(true)

        // Call the callback with the mnemonic and the user address
        onWalletGenerated(words, userAddress)
      } catch (error) {
        console.error('Error generating wallet:', error)
        setLoading(false) // Stop loading if an error occurs
      }
    }, 2000)
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Button
        hidden={words.length > 0}
        className="my-4 bg-black text-white hover:bg-gray-800"
        onClick={generateWallet}
      >
        {loading ? <ClipLoader size={20} color="white" /> : 'Generate'}
      </Button>
      {visible && (
        <Fade cascade damping={0.2}>
          <div className="relative flex flex-col items-center">
            {/* Mnemonic Words Box */}
            <div
              className={`relative p-6 text-center text-lg bg-gray-100 rounded-lg shadow-lg transition-opacity duration-300 ${
                showWords ? 'blur-none text-black' : 'blur-sm text-gray-500'
              }`}
              onClick={() => setShowWords(!showWords)} // Toggle visibility on text click
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minWidth: '300px',
              }}
            >
              {words.join(' ')}
            </div>

            {/* Eye Icon - Positioned Over the Text */}
            {!showWords && (
              <FaEye
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 text-2xl cursor-pointer transition-transform hover:scale-110 z-20"
                onClick={(e) => {
                  e.stopPropagation() // Prevent the text box click event from firing
                  setShowWords(!showWords) // Toggle visibility
                }}
              />
            )}

            {/* Copy Icon in Top Right Corner */}
            <CopyToClipboard text={words.join(' ')} onCopy={handleCopy}>
              <div className="absolute top-2 right-2 cursor-pointer text-gray-600 hover:text-black transform transition-transform hover:scale-110">
                {copied ? (
                  <FaCheck className="text-green-500 animate-bounce" />
                ) : (
                  <FaCopy />
                )}
              </div>
            </CopyToClipboard>
          </div>
        </Fade>
      )}
    </div>
  )
}
