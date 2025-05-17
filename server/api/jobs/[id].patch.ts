import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  if (!id || !body.application_status) {
    return { status: 'error', message: 'Missing id or status' }
  }

  const { error } = await supabase
    .from('job_applications')
    .update({ application_status: body.application_status })
    .eq('id', id)

  if (error) {
    return { status: 'error', message: error.message }
  }

  return { status: 'ok' }
})