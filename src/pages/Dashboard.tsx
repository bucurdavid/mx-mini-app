import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  Text,
  useToast,
  Input,
  VStack,
  NumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
} from '@chakra-ui/react'
import {
  Account,
  BigUIntValue,
  ContractCallPayloadBuilder,
  ContractFunction,
  RelayedTransactionV2Builder,
  TokenIdentifierValue,
  Transaction,
} from '@multiversx/sdk-core/out'
import {ApiNetworkProvider} from '@multiversx/sdk-network-providers/out'
import {Mnemonic, UserSecretKey, UserSigner} from '@multiversx/sdk-wallet/out'
import {
  initHapticFeedback,
  initQRScanner,
  useInitData,
} from '@telegram-apps/sdk-react'
import QRCode from 'qrcode.react'
import {FC, useEffect, useMemo, useState} from 'react'
import {FaExternalLinkAlt} from 'react-icons/fa'
import multiversx from '../assets/6892.png'
import BottomMenu from './BottomMenu'
import {usePasswordPrompt} from './wrappers/PasswordPromtComponent'
import {Decryptor, EncryptedData} from '@multiversx/sdk-wallet/out/crypto'

// Define constants
const REWARDS_PER_HOUR = 1000
const END_TIME_IN_MINUTES = 0.26 // Set end time to 1 minute
const defaultTokenIdentifier = 'ORB-efc633'

const defaultToken: Token = [defaultTokenIdentifier, 0, 18]

type Token = [string, number, number]

const Dashboard: FC = () => {
  const toast = useToast()
  const initData = useInitData()
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [storedWalletAddress, setStoredWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState<number>(0)
  const [tokenList, setTokenList] = useState<Token[]>([defaultToken])
  const [selectedToken, setSelectedToken] = useState(defaultTokenIdentifier)

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  const openSendModal = () => setIsSendModalOpen(true)
  const closeSendModal = () => setIsSendModalOpen(false)

  const openReceiveModal = () => setIsReceiveModalOpen(true)
  const closeReceiveModal = () => setIsReceiveModalOpen(false)

  const openDepositModal = () => setIsDepositModalOpen(true)
  const closeDepositModal = () => setIsDepositModalOpen(false)

  const hapticFeedback = initHapticFeedback()

  const {requestPassword, PasswordPromptComponent} = usePasswordPrompt() // Use the hook

  const [recipientAddress, setRecipientAddress] = useState('')
  const [amountToSend, setAmountToSend] = useState(0)

  const handleSend = async () => {
    let userSecret
    let userSigner
    requestPassword(async (password) => {
      const mnemonicEncrypted = EncryptedData.fromJSON(
        JSON.parse(localStorage.getItem('mnemonicWords') || '')
      )
      try {
        try {
          const mnemonic = Mnemonic.fromString(
            Decryptor.decrypt(mnemonicEncrypted, password).toString()
          )
          userSecret = mnemonic.deriveKey()

          userSigner = new UserSigner(userSecret)
        } catch (e) {
          return false
        }

        closeSendModal()
        const apiNetworkProvider = new ApiNetworkProvider(
          `https://devnet-api.multiversx.com`,
          {timeout: 10000}
        )

        const userSecretAccount = new Account(
          userSecret.generatePublicKey().toAddress()
        )

        const userSecretOnNetwork = await apiNetworkProvider.getAccount(
          userSecret.generatePublicKey().toAddress()
        )

        userSecretAccount.update(userSecretOnNetwork)

        const tokenDecimals =
          tokenList.find((token) => token[0] === selectedToken)?.[2] || 18

        const data = new ContractCallPayloadBuilder()
          .setFunction(new ContractFunction('ESDTTransfer'))
          .addArg(new TokenIdentifierValue(selectedToken))
          .addArg(new BigUIntValue(amountToSend * 10 ** tokenDecimals))
          .build()

        const innerTx = new Transaction({
          value: 0,
          data: data,
          receiver: recipientAddress,
          gasLimit: 0,
          sender: userSecret.generatePublicKey().toAddress(),
          chainID: 'D',
        })

        innerTx.setNonce(userSecretAccount.nonce)

        const serialized = innerTx.serializeForSigning()
        const signature = await userSigner.sign(serialized)
        innerTx.applySignature(signature)

        const secret = UserSecretKey.fromString(
          import.meta.env.VITE_PRIVATE_KEY
        )
        const signer = new UserSigner(secret)

        const secretAccount = new Account(
          secret.generatePublicKey().toAddress()
        )

        const secretOnNetwork = await apiNetworkProvider.getAccount(
          secret.generatePublicKey().toAddress()
        )

        secretAccount.update(secretOnNetwork)

        const networkConfig = await apiNetworkProvider.getNetworkConfig()

        const relayedTx = new RelayedTransactionV2Builder()
          .setInnerTransaction(innerTx)
          .setInnerTransactionGasLimit(20_000_000)
          .setRelayerAddress(secret.generatePublicKey().toAddress())
          .setRelayerNonce(secretAccount.nonce)
          .setNetworkConfig(networkConfig)
          .build()

        const serializedRelayedTx = relayedTx.serializeForSigning()
        const signatureRelayedTx = await signer.sign(serializedRelayedTx)
        relayedTx.applySignature(signatureRelayedTx)

        await apiNetworkProvider.sendTransaction(relayedTx)

        toast({
          title: 'Success!',
          description: `Sent ${amountToSend} ${selectedToken} to ${recipientAddress.slice(
            0,
            3
          )}...${recipientAddress.slice(-3)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        })

        setBalance(balance - amountToSend)

        return true
      } catch (e) {
        return false
      }
    }, 'Enter your password')
  }

  // Retrieve wallet address from localStorage when component mounts
  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress') || ''
    setStoredWalletAddress(walletAddress)

    if (walletAddress) {
      (async () => {
        try {
          const query = await fetch(
            `https://devnet-api.multiversx.com/accounts/${walletAddress}/tokens`
          )

          if (!query.ok) {
            throw new Error('Failed to fetch balance')
          }

          const data = await query.json()

          let tokens: Token[] = data.map((token: any) => [
            token.identifier,
            token.balance / 10 ** 18 || 0,
            token.decimals,
          ])

          // If the API returns an empty list or doesn't include the default token, add the default token
          if (
            tokens.length === 0 ||
            !tokens.some(
              ([identifier]) => identifier === defaultTokenIdentifier
            )
          ) {
            tokens = [...tokens, [defaultTokenIdentifier, 0, 18]]
          }

          setTokenList(tokens)

          // Set the selected token if it's not already set
          const defaultToken = tokens.find(
            ([identifier]) => identifier === defaultTokenIdentifier
          )
          if (defaultToken) {
            setSelectedToken(defaultTokenIdentifier)
            setBalance(defaultToken[1])
          }
        } catch (error) {
          console.error('Error fetching balance:', error)
          // Ensure the default token is still shown even on error
          setTokenList([[defaultTokenIdentifier, 0, 18]])
          setSelectedToken(defaultTokenIdentifier)
          setBalance(0) // Set balance to 0 on error
        }
      })()
    }
  }, [])

  const handleTokenChange = (event: any) => {
    const token = event.target.value
    setSelectedToken(token)

    const selected = tokenList.find(([identifier]) => identifier === token)
    if (selected) {
      setBalance(Number(selected[1]))
    }
  }

  // const userName = useMemo(() => {
  //   if (!initData?.user) return 'User'
  //   const {firstName, lastName} = initData.user
  //   return `${firstName || ''} ${lastName || ''}`.trim() || 'User'
  // }, [initData])

  const tgUsername = useMemo(() => {
    if (!initData?.user) return 'User'
    const {username} = initData.user
    return username || 'User'
  }, [initData])

  // Set start and end time on initial mount
  useEffect(() => {
    const storedStartTime = localStorage.getItem('startTime')
    const storedEndTime = localStorage.getItem('endTime')

    if (storedStartTime && storedEndTime) {
      setStartTime(new Date(parseInt(storedStartTime, 10)))
      setEndTime(new Date(parseInt(storedEndTime, 10)))
    } else {
      const now = new Date()
      const newEndTime = new Date(
        now.getTime() + END_TIME_IN_MINUTES * 60 * 1000
      ) // Set end time based on the constant

      localStorage.setItem('startTime', now.getTime().toString())
      localStorage.setItem('endTime', newEndTime.getTime().toString())

      setStartTime(now)
      setEndTime(newEndTime)
    }
  }, [])

  // Update time remaining based on endTime
  useEffect(() => {
    if (!endTime) return

    const updateRemainingTime = () => {
      const now = new Date()
      const remaining = Math.max(
        0,
        Math.floor((endTime.getTime() - now.getTime()) / 1000)
      )
      setTimeRemaining(remaining)
    }

    updateRemainingTime()

    const intervalId = setInterval(updateRemainingTime, 1000)

    return () => clearInterval(intervalId)
  }, [endTime])

  const getElapsedPercentage = () => {
    if (!startTime || !endTime) return 0
    const totalDuration = endTime.getTime() - startTime.getTime()
    const now = new Date().getTime()
    const elapsedDuration = now - startTime.getTime()
    const percentage = Math.min(100, (elapsedDuration / totalDuration) * 100)
    return percentage
  }

  const calculateRewards = () => {
    if (!startTime || !endTime) return 0
    const elapsedHours = Math.min(
      END_TIME_IN_MINUTES / 60,
      (new Date().getTime() - startTime.getTime()) / (1000 * 60 * 60)
    )
    return Math.floor(elapsedHours * REWARDS_PER_HOUR)
  }

  const handleClaim = async () => {
    if (storedWalletAddress) {
      const rewards = calculateRewards()
      const secret = UserSecretKey.fromString(import.meta.env.VITE_PRIVATE_KEY)
      const signer = new UserSigner(secret)

      const apiNetworkProvider = new ApiNetworkProvider(
        `https://devnet-api.multiversx.com`,
        {timeout: 10000}
      )

      const secretAccount = new Account(secret.generatePublicKey().toAddress())

      const secretOnNetwork = await apiNetworkProvider.getAccount(
        secret.generatePublicKey().toAddress()
      )

      secretAccount.update(secretOnNetwork)

      const data = new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction('ESDTTransfer'))
        .addArg(new TokenIdentifierValue(defaultTokenIdentifier))
        .addArg(new BigUIntValue(rewards * 10 ** 18))
        .build()

      const sendTx = new Transaction({
        value: 0,
        data: data,
        receiver: storedWalletAddress,
        gasLimit: 20_000_000,
        sender: secret.generatePublicKey().toAddress(),
        chainID: 'D',
      })

      sendTx.setNonce(secretAccount.nonce)

      const serialized = sendTx.serializeForSigning()
      const signature = await signer.sign(serialized)
      sendTx.applySignature(signature)

      await apiNetworkProvider.sendTransaction(sendTx)

      toast({
        title: 'Success!',
        description: `Claimed rewards: ${rewards}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
      hapticFeedback.impactOccurred('soft')

      setBalance(balance + rewards)

      const now = new Date()
      const newEndTime = new Date(
        now.getTime() + END_TIME_IN_MINUTES * 60 * 1000
      ) // Reset end time based on the constant

      localStorage.setItem('startTime', now.getTime().toString())
      localStorage.setItem('endTime', newEndTime.getTime().toString())
      setStartTime(now)
      setEndTime(newEndTime)
    }
  }

  console.log('elapsed percentage: ', getElapsedPercentage())
  console.log('remaining time: ', timeRemaining)

  // const greeting = () => {
  //   const hour = new Date().getHours()
  //   if (hour < 12) return `Good morning, ${userName}`
  //   if (hour < 18) return `Good afternoon, ${userName}`
  //   return `Good evening, ${userName}`
  // }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return {hours, minutes, seconds: remainingSeconds}
  }

  const {hours, minutes, seconds} = formatTime(timeRemaining)

  const format = (val: any) => +val
  const parse = (val: any) => val.replace(/^\$/, '')

  return (
    <VStack
      spacing={5}
      align="center"
      justify="center"
      bg="white"
      color="black"
      p={6}
    >
      <HStack justifyContent="space-between" width="100%">
        <Box fontSize="sm" fontWeight="bold">
          <Text>username: {tgUsername}.tg</Text>
          <HStack>
            <Text>
              address: {storedWalletAddress.slice(0, 6)}...
              {storedWalletAddress.slice(-4)}
            </Text>
            <Link
              href={`https://devnet-explorer.multiversx.com/accounts/${storedWalletAddress}`}
              isExternal
              color="blue.600"
            >
              <FaExternalLinkAlt />
            </Link>
          </HStack>
        </Box>
        <Box>
          <HStack spacing={1}>
            <Text color="gray">MultiversX</Text>
            <img src={multiversx} alt="MultiversX logo" width={20} />
          </HStack>
        </Box>
      </HStack>
      {/* <Text fontSize="3xl" fontWeight="bold">
        {greeting()}
      </Text> */}

      <Box
        mt={4}
        p={4}
        borderRadius="lg"
        boxShadow="lg"
        borderWidth="1px"
        borderColor="gray.200"
        backgroundColor="gray.50"
        textAlign="left"
        position="relative"
        width="100%"
        pr="60px"
      >
        {/* Token List Dropdown in Top Right Corner */}
        <Select
          position="absolute"
          top={2}
          right={2}
          width="auto"
          bg="white"
          borderColor="gray.300"
          size="sm"
          onChange={handleTokenChange}
          value={selectedToken} // Controlled component
        >
          {tokenList.map(([identifier]) => (
            <option key={identifier} value={identifier}>
              {identifier}
            </option>
          ))}
        </Select>

        <Text fontSize="lg" fontWeight="bold" mt={2}>
          Total Balance
        </Text>
        <Text fontSize="2xl" color="green.500" fontWeight="bold" mt={2}>
          {balance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 18,
          })}
        </Text>
      </Box>

      <HStack spacing={4}>
        <Button colorScheme="teal" borderRadius="full" onClick={openSendModal}>
          Send
        </Button>
        <Button
          colorScheme="teal"
          borderRadius="full"
          onClick={openReceiveModal}
        >
          Receive
        </Button>
        <Button
          colorScheme="teal"
          borderRadius="full"
          onClick={openDepositModal}
        >
          Deposit
        </Button>
      </HStack>

      {/* Modals */}
      {/* Send Modal */}
      <Modal isOpen={isSendModalOpen} onClose={closeSendModal} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>Send</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Token: {selectedToken}</Text>
            <Text>Balance: {balance}</Text>
            <Input
              placeholder="Recipient Address"
              variant="filled"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              my={4}
            />
            <Button
              colorScheme="teal"
              my={4}
              onClick={async () => {
                try {
                  const qrScanner = initQRScanner()
                  const scannedContent =
                    (await qrScanner.open('Scan QR code')) || ''
                  console.log(scannedContent) // Log the scanned content for debugging
                  hapticFeedback.selectionChanged()
                  // Assuming the scanned content is the token you want to set
                  setRecipientAddress(scannedContent)
                } catch (error) {
                  hapticFeedback.notificationOccurred('error')
                  console.error('QR Scan failed', error)
                }
              }}
            >
              Scan QR Code
            </Button>
            <NumberInput
              onChange={(valueString) => setAmountToSend(parse(valueString))}
              value={format(amountToSend)}
              max={balance}
              defaultValue={0}
              precision={2}
              step={0.2}
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSend}>
              Send
            </Button>
            <Button onClick={closeSendModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
        {PasswordPromptComponent}
      </Modal>

      {/* Receive Modal */}
      <Modal isOpen={isReceiveModalOpen} onClose={closeReceiveModal} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>Receive</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="center">
              <QRCode value={storedWalletAddress} size={256} />
              <Text
                textAlign="center"
                wordBreak="break-all"
                onClick={() => {
                  navigator.clipboard.writeText(storedWalletAddress)
                  toast({
                    title: 'Address copied!',
                    description:
                      'Wallet address has been copied to your clipboard.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'bottom-right',
                  })
                }}
              >
                {storedWalletAddress}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeReceiveModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositModalOpen} onClose={closeDepositModal} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>Deposit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Deposit functionality here...</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeDepositModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Heading textAlign="left" width="100%">
        Minning
      </Heading>

      <HStack spacing={1} fontSize="2xl" fontWeight="bold">
        <Text>{String(hours).padStart(2, '0')}</Text>
        <Text>:</Text>
        <Text>{String(minutes).padStart(2, '0')}</Text>
        <Text>:</Text>
        <Text>{String(seconds).padStart(2, '0')}</Text>
      </HStack>

      <Progress
        value={getElapsedPercentage()}
        size="md"
        colorScheme="blackAlpha"
        width="full"
        borderRadius="md"
      />

      <Text fontSize="lg">Tokens to claim: {calculateRewards()}</Text>

      <Button
        onClick={handleClaim}
        isDisabled={timeRemaining !== 0}
        colorScheme={timeRemaining === 0 ? 'teal' : 'gray'}
        width="full"
      >
        Claim
      </Button>

      <Button
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
        colorScheme="red"
        mt={4}
      >
        Reset
      </Button>
      <BottomMenu />
    </VStack>
  )
}

export default Dashboard
