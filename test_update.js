import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
    const updatePayload = { leave_mode: 'full_day' }
    const { data, error } = await supabase
        .from('hostels')
        .update(updatePayload)
        .eq('id', '28c72f77-5903-4318-bde0-8e9712b4ebf0')
        .select()
    console.log(data, error)
}
test()
