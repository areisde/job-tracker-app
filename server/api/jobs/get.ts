import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('id', { ascending: false }) // optional: newest first

  if (error) {
    console.error('Supabase error:', error)
    return { status: 'error', message: error.message }
  }

  return { status: 'ok', data }
})