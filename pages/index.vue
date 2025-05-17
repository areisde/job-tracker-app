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
        fetchJobs()
        } else if (res.status === "error") {
        } else {
        error.value = res.message || "Something went wrong"
        }
    } catch (e) {
        error.value = e.message || "Server error"
    } finally {
        loading.value = false
    }
    }

    const selectedCompanies = ref([])
    const selectedCategories = ref([])
    const selectedIndustries = ref([])
    const selectedStatuses = ref([])

    const filteredJobs = computed(() => {
      return jobs.value.filter(job => {
        const companyMatch = selectedCompanies.value.length === 0 || selectedCompanies.value.includes(job.company)
        const categoryMatch = selectedCategories.value.length === 0 || selectedCategories.value.includes(job.role_category)
        const industryMatch = selectedIndustries.value.length === 0 || selectedIndustries.value.includes(job.industry)
        const statusMatch = selectedStatuses.value.length === 0 || selectedStatuses.value.includes(job.application_status)
        return companyMatch && categoryMatch && industryMatch && statusMatch
      })
    })

    const uniqueCompanies = computed(() => [...new Set(jobs.value.map(j => j.company))])
    const uniqueCategories = computed(() => [...new Set(jobs.value.map(j => j.role_category))])
    const uniqueIndustries = computed(() => [...new Set(jobs.value.map(j => j.industry))])
    const uniqueStatuses = computed(() => [...new Set(jobs.value.map(j => j.application_status))])
</script>

<template>
  <UContainer class="h-screen p-0!">

    <UCard 
        class="relative bg-transparent w-1/3 h-full ring-0 shadow-none *:border-0 inline-block aling-top"
        :ui="{
            body: ' pt-0!'
        }"
    >
      <template #header>
        <h1 class="text-2xl text-text uppercase">Submit Job</h1>
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
        class="relative bg-transparent w-2/3 ring-0 shadow-none *:border-0 inline-block align-top h-screen"
        :ui="{
            body: ' pt-0! pr-0!'
        }"
    >
        <template #header>
            <h1 class="text-2xl text-text uppercase">Applications</h1>
            <div class="flex flex-wrap gap-x-4 mt-4 w-fit">
              <USelectMenu
                v-model="selectedCompanies"
                :items="uniqueCompanies"
                multiple
                placeholder="Company"
                class="w-fit bg-transparent ring-gray-500 text-text placeholder-gray-500"
              />
              <USelectMenu
                v-model="selectedCategories"
                :items="uniqueCategories"
                multiple
                placeholder="Role category"
                class="w-fit bg-transparent ring-gray-500 text-text placeholder-gray-500"
              />
              <USelectMenu
                v-model="selectedIndustries"
                :items="uniqueIndustries"
                multiple
                placeholder="Industry"
                class="w-fit bg-transparent ring-gray-500 text-text placeholder-gray-500"
              />
              <USelectMenu
                v-model="selectedStatuses"
                :items="uniqueStatuses"
                multiple
                placeholder="Application status"
                class="w-fit bg-transparent ring-gray-500 text-text placeholder-gray-500"
              />
            </div>
        </template>
        <div class="h-[calc(100vh_-8.5rem)] overflow-y-auto w-full pr-4">
            
            <div v-for="job in filteredJobs" :key="job.id" class="relative flex justify-between items-center py-4 border-b border-gray-200">
                <div class="text-text w-3/4 inline-block">
                    <p>{{ job.title }}</p>
                    <p class="text-gray-500 text-sm">{{ job.company }}</p>
                    <div class="text-gray-500 text-sm mt-2"><LucideMapPin :size="15" class="inline-block align-middle mr-1" /><p class="inline-block align-middle">{{ job.location }}</p></div>
                </div>
                
                <div>
                  <USelect
                    v-model="job.application_status"
                    :items="[
                      { label: 'In Review', value: 'In Review' },
                      { label: 'In Progress', value: 'In Progress' },
                      { label: 'Refused', value: 'Refused' },
                      { label: 'Accepted', value: 'Accepted' }
                    ]"
                    @change="status => updateStatus(job.id, job.application_status)"
                    :class="[
                      'absolute top-4 right-0 w-1/4 inline-block align-top bg-transparent ring-gray-500 text-text placeholder-gray-500',
                      job.application_status === 'Accepted' && 'text-green-500',
                      job.application_status === 'Refused' && 'text-red-500',
                      job.application_status === 'In Review' && 'text-orange-400',
                      job.application_status === 'In Progress' && 'text-lime-500'
                    ]"
                  />
                </div>
                
            </div>
        </div>
    </UCard>
  </UContainer>
</template>
