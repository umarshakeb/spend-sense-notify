
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    
    const huggingFaceKey = Deno.env.get('HUGGINGFACE_API_KEY')
    console.log('HuggingFace API Key available:', !!huggingFaceKey)
    
    const prompt = `You are an expert SMS transaction parser for Indian and international banking systems. 

Parse the following SMS messages and extract ONLY actual bank transactions (money sent or received). Ignore promotional messages, offers, schemes, and advertisements.

Valid transaction patterns:
- "Sent Rs.X From BANK A/C *1234 TO RECEIVER On DD-MM"
- "Amt Sent Rs.X From BANK A/C *1234 TO RECEIVER On DD-MM"
- "Received Rs.X in BANK A/C *1234 from SENDER on DD-MM"
- "Rs.X debited from BANK A/C *1234"
- "Rs.X credited to BANK A/C *1234"

For each valid transaction, extract:
- amount (number)
- type ("expense" or "income")
- description (brief description)
- category (Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Transfer, Miscellaneous)
- date (in YYYY-MM-DD format, use current year if not specified)

Return a JSON array of transactions. If no valid transactions found, return empty array.

SMS Messages:
${messages.map((msg: any, idx: number) => `${idx + 1}. ${msg.body}`).join('\n')}

Respond with only valid JSON, no explanations.`

    let transactions = []

    if (huggingFaceKey) {
      // Try Hugging Face API with text generation endpoint
      try {
        console.log('Attempting Hugging Face API call...')
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingFaceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.1,
              return_full_text: false
            }
          })
        })

        console.log('Hugging Face response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Hugging Face response:', JSON.stringify(data, null, 2))
          
          try {
            // Try to parse the generated text as JSON
            let generatedText = ''
            if (Array.isArray(data) && data[0]?.generated_text) {
              generatedText = data[0].generated_text
            } else if (data.generated_text) {
              generatedText = data.generated_text
            }
            
            // Extract JSON from the response
            const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              transactions = JSON.parse(jsonMatch[0])
            }
          } catch (parseError) {
            console.error('Failed to parse Hugging Face response as JSON:', parseError)
            console.log('Raw response:', data)
          }
        } else {
          const errorText = await response.text()
          console.error('Hugging Face API error:', response.status, errorText)
        }
      } catch (error) {
        console.error('Hugging Face API request failed:', error)
      }
    } else {
      console.log('No Hugging Face API key found')
    }

    // Fallback to local parsing if API fails or no API key
    if (transactions.length === 0) {
      console.log('Using fallback local parsing...')
      transactions = parseMessagesLocally(messages)
    }

    console.log('Final transactions count:', transactions.length)
    return new Response(
      JSON.stringify({ transactions, subscriptions: [] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function parseMessagesLocally(messages: any[]) {
  const transactions = []
  const currentYear = new Date().getFullYear()

  for (const message of messages) {
    const body = message.body?.toLowerCase() || ''
    
    // Enhanced patterns for Indian bank transactions
    const sentPatterns = [
      /(?:amt\s+)?sent\s+rs\.?\s*(\d+(?:\.\d{2})?)/i,
      /rs\.?\s*(\d+(?:\.\d{2})?)\s+debited/i,
      /paid\s+rs\.?\s*(\d+(?:\.\d{2})?)/i
    ]
    
    const receivedPatterns = [
      /received\s+rs\.?\s*(\d+(?:\.\d{2})?)/i,
      /rs\.?\s*(\d+(?:\.\d{2})?)\s+credited/i,
      /deposit\s+rs\.?\s*(\d+(?:\.\d{2})?)/i
    ]

    // Check for sent transactions
    for (const pattern of sentPatterns) {
      const match = body.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        if (amount > 0) {
          // Extract recipient/description
          let description = "Transaction"
          const toMatch = body.match(/to\s+([^0-9\s]+(?:\s+[^0-9\s]+)*)/i)
          if (toMatch) {
            description = `Transfer to ${toMatch[1].trim().substring(0, 30)}`
          }

          transactions.push({
            amount: amount,
            type: "expense",
            description: description,
            category: "Transfer",
            date: `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
          })
          break
        }
      }
    }

    // Check for received transactions
    for (const pattern of receivedPatterns) {
      const match = body.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        if (amount > 0) {
          // Extract sender/description
          let description = "Received amount"
          const fromMatch = body.match(/from\s+([^0-9\s]+(?:\s+[^0-9\s]+)*)/i)
          if (fromMatch) {
            description = `Received from ${fromMatch[1].trim().substring(0, 30)}`
          }

          transactions.push({
            amount: amount,
            type: "income",
            description: description,
            category: "Transfer",
            date: `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
          })
          break
        }
      }
    }
  }

  return transactions
}
