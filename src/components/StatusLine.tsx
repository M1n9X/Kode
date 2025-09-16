import React, { useEffect, useState } from 'react'
import { Box, Text } from 'ink'
import { getModelManager } from '../utils/model'
import { getTheme } from '../utils/theme'

type Props = {
  safeMode?: boolean
  permissionMode?: string
}

export function StatusLine({ safeMode, permissionMode }: Props) {
  const theme = getTheme()
  const [time, setTime] = useState<string>('')
  const [modelName, setModelName] = useState<string>('')
  const [tick, setTick] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
      try {
        const mm = getModelManager()
        setModelName(mm.getModelName('main') || 'main')
      } catch {}
      setTick(t => (t + 1) % 4)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const spinner = ['⠁', '⠂', '⠄', '⠂'][tick]
  const modeText = permissionMode || 'default'
  const safe = safeMode ? 'SAFE' : 'YOLO'

  return (
    <Box
      borderStyle="single"
      borderColor={theme.secondaryBorder}
      paddingX={1}
      width="100%"
      justifyContent="space-between"
    >
      <Text color={theme.secondaryText}>
        {spinner} {time} · mode {modeText} · {safe}
      </Text>
      <Text color={theme.secondaryText}>model {modelName}</Text>
    </Box>
  )
}

export default StatusLine

