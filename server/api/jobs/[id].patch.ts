import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  if (!id) {
    return { status: 'error', message: 'Missing id' }
  }

  const updateData: any = {}

  if (body.application_status) {
    updateData.application_status = body.application_status
  }

  if (body.date_last_contact) {
    updateData.date_last_contact = body.date_last_contact
  }

  if (Object.keys(updateData).length === 0) {
    return { status: 'error', message: 'No valid fields to update' }
  }

  const { error } = await supabase
    .from('job_applications')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { status: 'error', message: error.message }
  }

  return { status: 'ok' }
})