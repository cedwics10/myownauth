<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { api, ApiError } from '../api'

type Gadget = { name: string; description?: string }

const gadgets = ref<Gadget[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    gadgets.value = (await api<{ gadgets: Gadget[] }>('/api/secrets')).gadgets
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Inventaire indisponible.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">INVENTAIRE</p>
    <h1>Arsenal.</h1>
  </section>

  <div class="section-heading">
    <h2>Gadgets autorisés</h2>
    <span>{{ gadgets.length }} élément{{ gadgets.length === 1 ? '' : 's' }}</span>
  </div>

  <p v-if="loading" class="empty-state" role="status">Chargement de l’inventaire…</p>
  <p v-else-if="error" class="dashboard-status" data-state="error" role="alert">{{ error }}</p>
  <div v-else-if="gadgets.length" class="gadget-grid">
    <article v-for="(gadget, index) in gadgets" :key="gadget.name" class="gadget-card">
      <span class="gadget-index">GADGET {{ String(index + 1).padStart(2, '0') }}</span>
      <span class="gadget-icon" aria-hidden="true">◆</span>
      <h3>{{ gadget.name }}</h3>
      <p>{{ gadget.description || 'Dispositif prêt à être déployé.' }}</p>
    </article>
  </div>
  <p v-else class="empty-state">Aucun gadget n’est affecté à votre arsenal.</p>
</template>
