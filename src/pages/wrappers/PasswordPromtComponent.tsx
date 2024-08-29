import {useState} from 'react'
import PasswordPrompt from './PasswordPromt'

export const usePasswordPrompt = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [onComplete, setOnComplete] = useState<(password: string) => void>(
    () => {}
  )
  const [description, setDescription] = useState<string>('Enter your password') // Default description

  const requestPassword = (
    callback: (password: string) => void,
    desc: string
  ) => {
    setOnComplete(() => callback)
    setDescription(desc)
    setIsVisible(true)
  }

  const handleComplete = (password: string) => {
    onComplete(password)
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const PasswordPromptComponent = isVisible ? (
    <PasswordPrompt
      onComplete={handleComplete}
      onClose={handleClose}
      description={description} // Pass the description to the PasswordPrompt component
    />
  ) : null

  return {requestPassword, PasswordPromptComponent}
}
