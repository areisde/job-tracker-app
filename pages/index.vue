<script setup>
    const text = ref("")
    const loading = ref(false)
    const success = ref(false)
    const error = ref("")

    const submitJob = async () => {
    if (!text.value.trim()) {
        error.value = "Please paste a job description."
        return
    }

    loading.value = true
    success.value = false
    error.value = ""

    try {
        const res = await $fetch("/api/add-job", {
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
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Submit a Job Description</h1>
    <form @submit.prevent="submitJob">
      <textarea
        v-model="text"
        rows="10"
        class="w-full border p-2 rounded"
        placeholder="Paste job description here..."
      ></textarea>
      <button
        type="submit"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        :disabled="loading"
      >
        {{ loading ? "Submitting..." : "Submit" }}
      </button>
    </form>
    <p v-if="success" class="text-green-600 mt-4">✅ Job saved successfully!</p>
    <p v-if="error" class="text-red-600 mt-4">❌ {{ error }}</p>
  </div>
</template>

