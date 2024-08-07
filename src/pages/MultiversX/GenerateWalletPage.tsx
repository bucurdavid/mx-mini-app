import {Mnemonic} from '@multiversx/sdk-wallet/out'
import {Button} from '@telegram-apps/telegram-ui'
import {FC, useState, useEffect} from 'react'
import {ClipLoader} from 'react-spinners'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {Fade} from 'react-awesome-reveal'
import {
  Decryptor,
  EncryptedData,
  Encryptor,
} from '@multiversx/sdk-wallet/out/crypto'
import {useHapticFeedback} from '@telegram-apps/sdk-react'

export const GenerateWallet: FC = () => {
  const {impactOccurred} = useHapticFeedback()

  const [words, setWords] = useState<Array<string>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showWords, setShowWords] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)
  const [stored, setStored] = useState<boolean>(false)

  useEffect(() => {
    const storedWords = localStorage.getItem('mnemonicWords')

    if (storedWords) {
      const parsedStoredWords = JSON.parse(storedWords)

      const decryptedBuffer: Buffer = Decryptor.decrypt(
        EncryptedData.fromJSON(parsedStoredWords),
        import.meta.env.VITE_ENCRYPT_PASSWORD || ''
      )

      const decryptedWords = decryptedBuffer.toString('utf-8')
      setWords(decryptedWords.split(' '))
      setVisible(true)
      setStored(true)
    }
  }, [])

  function generateWallet() {
    impactOccurred('soft')
    setLoading(true)
    setShowWords(false)
    setCopied(false)
    setVisible(false)

    setTimeout(() => {
      const mnemonic = Mnemonic.generate()
      const words = mnemonic.getWords()

      setWords(words)
      setLoading(false)
      setVisible(true)
    }, 2000) // Simulate async operation
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const storeToLocalStorage = () => {
    const encryptedWords = Encryptor.encrypt(
      Buffer.from(words.join(' ')),
      import.meta.env.VITE_ENCRYPT_PASSWORD || ''
    )
    localStorage.setItem('mnemonicWords', JSON.stringify(encryptedWords))
    setStored(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Hello world!</h1>
      {!stored && (
        <Button className="my-4" onClick={generateWallet}>
          {loading ? <ClipLoader size={20} /> : 'Generate Wallet'}
        </Button>
      )}
      {visible && (
        <Fade cascade damping={0.2}>
          <div
            className={`my-4 p-2 text-center text-lg ${
              showWords ? '' : 'blur'
            }`}
            style={{filter: showWords ? 'none' : 'blur(5px)'}}
          >
            {words.join(' ')}
          </div>
          <Button
            mode="gray"
            className="my-2"
            onClick={() => setShowWords(!showWords)}
          >
            {showWords ? 'Hide Words' : 'Show Words'}
          </Button>
          <CopyToClipboard text={words.join(' ')} onCopy={handleCopy}>
            <Button sizes="s" mode="gray" className="my-2">
              {copied ? 'Copied!' : 'Copy Words'}
            </Button>
          </CopyToClipboard>
          {!stored && (
            <Button mode="gray" className="my-2" onClick={storeToLocalStorage}>
              Save
            </Button>
          )}
        </Fade>
      )}
    </div>
  )
}
