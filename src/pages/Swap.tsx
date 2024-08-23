import {FC} from 'react'
import {Text, VStack} from '@chakra-ui/react'
import BottomMenu from './BottomMenu'

const SwapPage: FC = () => {
  return (
    <VStack
      spacing={6}
      align="center"
      justify="center"
      minH="100vh"
      bg="white"
      color="black"
      p={6}
    >
      <Text>Swaps</Text>
      <BottomMenu />
    </VStack>
  )
}

export default SwapPage
