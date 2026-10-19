<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { api, ApiError } from '../api'

type Report = { id: number; content: string; createdAt: string }

const reports = ref<Report[]>([])
const content = ref('')
const status = ref('')
const statusType = ref<'success' | 'error' | ''>('')
const sending = ref(false)

function errorMessage(e: unknown) {
  return e instanceof ApiError ? e.message : 'Service indisponible.'
}

function formatDate(value: string) {
  return new Date(`${value.replace(' ', 'T')}Z`).toLocaleString('fr-FR')
}

onMounted(async () => {
  try {
    reports.value = (await api<{ reports: Report[] }>('/api/reports')).reports
  } catch (e) {
    status.value = errorMessage(e)
    statusType.value = 'error'
  }
})

async function send() {
  if (!content.value.trim()) return
  sending.value = true
  try {
    const { report } = await api<{ report: Report }>('/api/reports', {
      method: 'POST',
      body: { content: content.value },
    })
    reports.value.unshift(report)
    content.value = ''
    status.value = 'Rapport transmis.'
    statusType.value = 'success'
  } catch (e) {
    status.value = errorMessage(e)
    statusType.value = 'error'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">JOURNAL DE PATROUILLE</p>
    <h1>Rapports de mission.</h1>
  </section>

  <form class="panel-form report-form" @submit.prevent="send">
    <label for="report">Nouveau rapport</label>
    <textarea
      id="report"
      v-model="content"
      rows="4"
      maxlength="2000"
      required
      placeholder="Secteur, suspects, gadgets utilisés…"
    />
    <small>{{ content.length }}/2000</small>
    <button class="button button-primary" type="submit" :disabled="sending">
      {{ sending ? 'Transmission…' : 'Transmettre' }}
    </button>
    <p v-if="status" class="form-status" :data-state="statusType" role="status">{{ status }}</p>
  </form>

  <div class="section-heading">
    <h2>Historique</h2>
    <span>{{ reports.length }} rapport{{ reports.length === 1 ? '' : 's' }}</span>
  </div>
  <ol v-if="reports.length" class="report-list">
    <li v-for="report in reports" :key="report.id">
      <span class="gadget-index">#{{ report.id }} // {{ formatDate(report.createdAt) }}</span>
      <p>{{ report.content }}</p>
    </li>
  </ol>
  <p v-else class="empty-state">Aucun rapport pour l’instant.</p>
</template>
