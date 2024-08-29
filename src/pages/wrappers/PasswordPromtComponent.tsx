import {useToast} from '@chakra-ui/react'
import {useState, useCallback} from 'react'
import PasswordPrompt from './PasswordPromt'

export const usePasswordPrompt = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [onComplete, setOnComplete] = useState<
    (password: string) => Promise<boolean>
  >(() => async () => true)
  const [description, setDescription] = useState<string>('Enter your password')
  const [resetPasswordTrigger, setResetPasswordTrigger] = useState(false) // State to trigger reset
  const toast = useToast()

  const requestPassword = useCallback(
    (callback: (password: string) => Promise<boolean>, desc: string) => {
      setOnComplete(() => callback)
      setDescription(desc)
      setIsVisible(true)
      setResetPasswordTrigger(false) // Reset the trigger when the modal is shown
    },
    []
  )

  const handleComplete = useCallback(
    async (password: string) => {
      const success = await onComplete(password)
      if (success) {
        setIsVisible(false)
      } else {
        handleRetry()
      }
    },
    [onComplete]
  )

  const handleRetry = useCallback(() => {
    toast({
      title: 'Incorrect Password',
      description: 'Please try again.',
      status: 'error',
      duration: 2000,
      isClosable: true,
      position: 'bottom',
    })
    setResetPasswordTrigger(true) // Trigger password reset
  }, [toast])

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  const PasswordPromptComponent = isVisible && (
    <PasswordPrompt
      onComplete={handleComplete}
      onClose={handleClose}
      description={description}
      resetPasswordTrigger={resetPasswordTrigger} // Pass the reset trigger
    />
  )

  return {requestPassword, PasswordPromptComponent}
}
