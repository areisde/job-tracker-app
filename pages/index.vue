<script setup>
    const text = ref("")
    const loading = ref(false)
    const success = ref(false)
    const error = ref("")

    const jobs = ref([])
    const fetchJobs = async () => {
      const res = await $fetch('/api/jobs/get')
      if (res.status === 'ok') {
        jobs.value = res.data
      }
    }

    const updateStatus = async (id, status) => {
      await $fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        body: { application_status: status }
      })
    }

    onMounted(fetchJobs)

    const submitJob = async () => {
    if (!text.value.trim()) {
        error.value = "Please paste a job description."
        return
    }

    loading.value = true
    success.value = false
    error.value = ""

    try {
        const res = await $fetch("/api/jobs/add", {
        method: "POST",
        body: { text: text.value }
        })

        if (res.status === "ok") {
        success.value = true
        text.value = ""
        } else {
        error.value = res.message || "Something went wrong"
        }
    } catch (e) {
        error.value = e.message || "Server error"
    } finally {
        loading.value = false
    }
    }
</script>

<template>
  <UContainer class="h-screen p-0!">

    <UCard 
        class="relative bg-transparent w-1/2 h-full ring-0 shadow-none *:border-0 inline-block aling-top"
        :ui="{
            body: ' pt-0!'
        }"
    >
      <template #header>
        <h1 class="text-2xl text-text">Submit Job</h1>
      </template>

      <form @submit.prevent="submitJob" class="">
        <UTextarea
          v-model="text"
          placeholder="Paste job description here..."
          :disabled="loading"
          :rows="20"
          class="w-full *:bg-transparent *:ring-gray-500 *:text-text *:placeholder-gray-500 *:h-full"
        />

        <UButton type="submit" :loading="loading" block class="text-text absolute bottom-4 left-4 w-[calc(100%-2rem)]">
          {{ loading ? "Submitting..." : "Submit" }}
        </UButton>
      </form>
    </UCard>
    <UCard 
        class="relative bg-transparent w-1/2 ring-0 shadow-none *:border-0 inline-block align-top h-screen"
        :ui="{
            body: ' pt-0!'
        }"
    >
        <template #header>
            <h1 class="text-2xl text-text">Applications</h1>
        </template>
        <div class="h-[calc(100vh_-_5.5rem)] overflow-y-auto w-full">
            <div v-for="job in jobs" :key="job.id" class="relative flex justify-between items-center py-4 border-b border-gray-200">
                <div class="text-text w-3/4 inline-block">
                    <p>{{ job.title }}</p>
                    <p class="text-gray-500 text-sm">{{ job.company }}</p>
                    <p class="text-gray-500 text-sm">{{ job.location }}</p>
                </div>
                
                <USelect
                v-model="job.application_status"
                :items="[
                    { label: 'In Review', value: 'In Review' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Refused', value: 'Refused' },
                    { label: 'Accepted', value: 'Accepted' }
                ]"
                @change="status => updateStatus(job.id, job.application_status)"
                class="absolute top-4 right-0 w-1/4 inline-block align-top bg-transparent *ring-gray-500 *text-text *placeholder-gray-500"
                />
                
            </div>
        </div>
    </UCard>
  </UContainer>
</template>
