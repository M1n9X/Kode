import React from 'react'
import { Box, Text } from 'ink'

type OrderedListProps = {
  children: React.ReactNode
}

type OrderedListItemProps = {
  children: React.ReactNode
}

export function OrderedList({ children }: OrderedListProps): React.ReactNode {
  const items = React.Children.toArray(children)
  return (
    <Box flexDirection="column" gap={1}>
      {items.map((child, idx) => (
        <Box key={idx} flexDirection="row">
          <Text>{idx + 1}. </Text>
          <Box flexDirection="column">{child as React.ReactNode}</Box>
        </Box>
      ))}
    </Box>
  )
}

OrderedList.Item = function Item({ children }: OrderedListItemProps): React.ReactNode {
  return <>{children}</>
}

