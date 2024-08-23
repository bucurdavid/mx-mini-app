import {FC} from 'react'

import BottomMenu from './BottomMenu'
import {VStack, Text} from '@chakra-ui/react'

const QuestPage: FC = () => {
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
      <Text>Quests</Text>
      <BottomMenu />
    </VStack>
  )
}

export default QuestPage
