<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { api, ApiError } from '../api'
import { menuItems } from '../menu'

const gadgetCount = ref<number | null>(null)
const reportCount = ref<number | null>(null)
const error = ref('')

const shortcuts = menuItems.filter((item) => item.code !== '00' && item.path !== '/bat-computer')

onMounted(async () => {
  try {
    const [secrets, reports] = await Promise.all([
      api<{ gadgets: unknown[] }>('/api/secrets'),
      api<{ reports: unknown[] }>('/api/reports'),
    ])
    gadgetCount.value = secrets.gadgets.length
    reportCount.value = reports.reports.length
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Données indisponibles.'
  }
})
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">BAT-COMPUTER // PRIVATE</p>
    <h1>Bienvenue dans la <span>Batcave</span>.</h1>
    <p>Tous les systèmes sont opérationnels.</p>
  </section>

  <p v-if="error" class="dashboard-status" data-state="error" role="alert">{{ error }}</p>

  <section class="stat-row" aria-label="État du système">
    <article class="stat">
      <span class="panel-label">Gadgets</span>
      <strong>{{ gadgetCount ?? '—' }}</strong>
    </article>
    <article class="stat">
      <span class="panel-label">Rapports</span>
      <strong>{{ reportCount ?? '—' }}</strong>
    </article>
    <article class="stat">
      <span class="panel-label">Modules</span>
      <strong>{{ shortcuts.filter((s) => s.available).length }}/{{ shortcuts.length }}</strong>
    </article>
  </section>

  <section>
    <div class="section-heading">
      <div>
        <p class="eyebrow">MODULES</p>
        <h2>Systèmes</h2>
      </div>
    </div>
    <div class="module-grid">
      <template v-for="item in shortcuts" :key="item.path">
        <RouterLink v-if="item.available" class="module-card" :to="item.path">
          <span class="gadget-index">{{ item.code }}</span>
          <h3>{{ item.label }}</h3>
          <p>{{ item.hint }}</p>
        </RouterLink>
        <div v-else class="module-card is-soon" aria-disabled="true">
          <span class="gadget-index">{{ item.code }} // BIENTÔT</span>
          <h3>{{ item.label }}</h3>
          <p>{{ item.hint }}</p>
        </div>
      </template>
    </div>
  </section>
</template>
