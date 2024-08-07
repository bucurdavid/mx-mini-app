import {Mnemonic} from '@multiversx/sdk-wallet/out'
import {Button} from '@telegram-apps/telegram-ui'
import {FC, useState} from 'react'
import {ClipLoader} from 'react-spinners'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {Fade} from 'react-awesome-reveal'

export const GenerateWallet: FC = () => {
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
      const mnemonic = Mnemonic.generate()
      const words = mnemonic.getWords()

      console.log(words)
      setWords(words)
      setLoading(false)
      setVisible(true)
    }, 2000) // Simulate async operation
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Hello world!</h1>
      <Button className="my-4" onClick={generateWallet}>
        {loading ? <ClipLoader size={20} /> : 'Generate Wallet'}
      </Button>
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
        </Fade>
      )}
    </div>
  )
}
