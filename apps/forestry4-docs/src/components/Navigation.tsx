import React from 'react'
import {
  Box,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Container,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ChevronDownIcon } from '@chakra-ui/icons'

const Navigation: React.FC = () => {
  const location = useLocation()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const isActive = (path: string) => location.pathname === path

  const menuItems = {
    'Getting Started': [
      { label: 'Quick Start', path: '/' },
      { label: 'Why Forestry?', path: '/why' },
    ],
    'Essential Features': [
      { label: 'Store Basics', path: '/store' },
      { label: 'Actions & State', path: '/actions' },
      { label: 'React Integration', path: '/react' },
    ],
    'Power Tools': [
      { label: 'Validation System', path: '/validation' },
      { label: 'Schema Validation', path: '/schemas' },
      { label: 'Transaction System', path: '/transactions' },
      { label: 'RxJS Integration', path: '/rxjs' },
      { label: 'Advanced Patterns', path: '/advanced' },
    ],
    'Reference': [
      { label: 'API Reference', path: '/api' },
      { label: 'Examples', path: '/examples' },
    ],
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h="80px" alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <HStack spacing={2}>
              <Text fontSize="2xl" fontWeight="bold" color="forest.600">
                🌲
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Forestry 4
              </Text>
            </HStack>
          </Link>

          {/* Navigation Menu */}
          <HStack spacing={8}>
            {Object.entries(menuItems).map(([category, items]) => (
              <Menu key={category}>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<ChevronDownIcon />}
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                >
                  {category}
                </MenuButton>
                <MenuList>
                  {items.map((item) => (
                    <MenuItem
                      key={item.path}
                      as={RouterLink}
                      to={item.path}
                      bg={isActive(item.path) ? 'forest.50' : 'transparent'}
                      color={isActive(item.path) ? 'forest.600' : 'gray.700'}
                      fontWeight={isActive(item.path) ? 'semibold' : 'normal'}
                      _hover={{
                        bg: isActive(item.path) ? 'forest.100' : 'gray.50',
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            ))}

            {/* GitHub Link */}
            <Link
              href="https://github.com/bingomanatee/wonderlandlabs-monorepo"
              isExternal
              color="gray.600"
              _hover={{ color: 'gray.800' }}
            >
              GitHub
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navigation
