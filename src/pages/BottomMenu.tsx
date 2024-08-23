import {HStack, Button, Icon, Text} from '@chakra-ui/react'
import {FaHome, FaExchangeAlt, FaClipboardList} from 'react-icons/fa'
import {Link, useLocation} from 'react-router-dom'

const BottomMenu = () => {
  const location = useLocation()

  return (
    <HStack
      position="fixed"
      bottom="0"
      width="100%"
      bg="white"
      p={2}
      justify="space-around"
      fontSize="sm"
      borderTopRadius="lg"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.2)"
      zIndex="1000"
    >
      <Button
        as={Link}
        to="/"
        variant="ghost"
        flexDirection="column"
        bg={location.pathname === '/' ? 'teal.100' : 'transparent'}
        color={location.pathname === '/' ? 'teal' : 'gray.600'}
        _hover={{}}
      >
        <Icon as={FaHome} w={5} h={5} />
        <Text fontSize="xs">Home</Text>
      </Button>

      <Button
        as={Link}
        to="/swaps"
        variant="ghost"
        flexDirection="column"
        bg={location.pathname === '/swaps' ? 'teal.100' : 'transparent'}
        color={location.pathname === '/swaps' ? 'teal' : 'gray.600'}
      >
        <Icon as={FaExchangeAlt} w={5} h={5} />
        <Text fontSize="xs">Swaps</Text>
      </Button>

      <Button
        as={Link}
        to="/quests"
        variant="ghost"
        flexDirection="column"
        bg={location.pathname === '/quests' ? 'teal.100' : 'transparent'}
        color={location.pathname === '/quests' ? 'teal' : 'gray.600'}
      >
        <Icon as={FaClipboardList} w={5} h={5} />
        <Text fontSize="xs">Quests</Text>
      </Button>
    </HStack>
  )
}

export default BottomMenu
