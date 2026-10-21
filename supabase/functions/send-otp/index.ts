import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS so'rovlarini qabul qilish
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone_number, telegram_chat_id } = await req.json()

    if (!phone_number || !telegram_chat_id) {
      throw new Error("Telefon raqam va Telegram ID kiritilishi shart!");
    }

    // Supabase mijozini ichki muhit o'zgaruvchilari orqali yaratish
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. 6 xonali kod yaratish
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Supabase bazasiga saqlash
    const { error: dbError } = await supabaseAdmin
      .from('otp_codes')
      .insert([{ phone_number, telegram_chat_id, code: otpCode }])

    if (dbError) throw dbError;

    // 3. Telegramga yuborish
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const tgResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_chat_id,
        text: `Tizimga kirish uchun tasdiqlash kodingiz: <b>${otpCode}</b>\n\nKod 3 daqiqa davomida amal qiladi.`,
        parse_mode: 'HTML'
      })
    });

    if (!tgResponse.ok) {
        throw new Error("Telegram API xatoligi: Xabar yuborilmadi");
    }

    return new Response(JSON.stringify({ success: true, message: 'Kod yuborildi' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
