
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise SMS transaction parser. Return only valid JSON arrays of transactions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    let transactions = []
    
    try {
      transactions = JSON.parse(data.choices[0].message.content)
    } catch (e) {
      console.error('Failed to parse LLM response:', data.choices[0].message.content)
      transactions = []
    }

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
