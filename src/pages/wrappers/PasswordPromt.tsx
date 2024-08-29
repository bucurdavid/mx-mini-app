import React, {useState} from 'react'
import {
  Box,
  Button,
  Grid,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import {initHapticFeedback} from '@telegram-apps/sdk-react'

interface PasswordPromptProps {
  onComplete: (password: string) => void
  onClose: () => void
  description: string // Add a description prop for custom text
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({
  onComplete,
  onClose,
  description,
}) => {
  const [password, setPassword] = useState('')

  const hapticFeedback = initHapticFeedback()

  const handleNumberClick = (num: number) => {
    if (password.length < 4 || password.length < 6) {
      hapticFeedback.impactOccurred('soft')
      setPassword((prev) => prev + num)
    }
  }

  const handleBackspace = () => {
    hapticFeedback.impactOccurred('light')
    setPassword((prev) => prev.slice(0, -1))
  }

  const handleComplete = () => {
    hapticFeedback.notificationOccurred('success')
    if (password.length === 4 || password.length === 6) {
      onComplete(password)
      handleClose()
    }
  }

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader textAlign="center">{description}</ModalHeader>
        <ModalBody>
          <Box textAlign="center">
            <Text
              mb="6"
              fontSize="2xl"
              letterSpacing="wider"
              color="black"
              minHeight={10}
            >
              {'●'.repeat(password.length)}
            </Text>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              {[...Array(9)].map((_, i) => (
                <Button
                  key={i + 1}
                  onClick={() => handleNumberClick(i + 1)}
                  colorScheme="teal"
                  size="lg"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                gridColumn="span 2"
                onClick={() => handleNumberClick(0)}
                colorScheme="teal"
                size="lg"
              >
                0
              </Button>
              <Button onClick={handleBackspace} colorScheme="red" size="lg">
                ←
              </Button>
            </Grid>
          </Box>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme="teal" size="lg" onClick={handleComplete}>
            Enter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PasswordPrompt
