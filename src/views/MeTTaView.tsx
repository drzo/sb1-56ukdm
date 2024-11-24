import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MeTTaIntegration } from '@/hyperon/MeTTaIntegration'
import { ConnectionStatus } from '@/components/metta/ConnectionStatus'
import { ReasoningForm } from '@/components/metta/ReasoningForm'
import { ResultDisplay } from '@/components/metta/ResultDisplay'
import { Logger } from '@/cogutil/Logger'

const metta = new MeTTaIntegration()

export function MeTTaView() {
  const [result, setResult] = useState('')
  const [subject, setSubject] = useState('Human')
  const [category, setCategory] = useState('Mammal')
  const [property, setProperty] = useState('consciousness')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connect = async () => {
      try {
        await metta.connect()
        setIsConnected(true)
      } catch (error) {
        Logger.error('Failed to connect to MeTTa:', error)
      }
    }
    connect()
    
    return () => {
      metta.disconnect()
    }
  }, [])

  const runMeTTa = async () => {
    try {
      if (!isConnected) {
        setResult('Not connected to MeTTa service')
        return
      }

      metta.addTemplate(
        'reasoning',
        'If {subject} is a {category}, then it has {property}',
        ['subject', 'category', 'property']
      )
      
      const result = await metta.executeTemplate('reasoning', {
        subject,
        category,
        property
      })
      
      setResult(result)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MeTTa Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectionStatus isConnected={isConnected} />
        
        <ReasoningForm
          subject={subject}
          category={category}
          property={property}
          onSubjectChange={setSubject}
          onCategoryChange={setCategory}
          onPropertyChange={setProperty}
          onSubmit={runMeTTa}
          isConnected={isConnected}
        />

        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  )
}