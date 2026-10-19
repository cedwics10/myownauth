<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { menu } from './menu'

const route = useRoute()
const menuOpen = ref(false)

watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ open: menuOpen }">
      <div class="sidebar-head">
        <RouterLink class="brand" to="/">
          <span class="brand-mark">B</span>
          <span>BATCAVE<br /><small>WAYNE SYSTEMS</small></span>
        </RouterLink>
        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="main-menu"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? 'Fermer' : 'Menu' }}
        </button>
      </div>

      <nav id="main-menu" class="menu" aria-label="Navigation principale">
        <div v-for="section in menu" :key="section.title" class="menu-section">
          <p class="menu-title">{{ section.title }}</p>
          <ul>
            <li v-for="item in section.items" :key="item.path">
              <RouterLink v-if="item.component" class="menu-link" :to="item.path">
                <span class="menu-code">{{ item.code }}</span>{{ item.label }}
              </RouterLink>
              <span v-else class="menu-link is-soon" aria-disabled="true">
                <span class="menu-code">{{ item.code }}</span>{{ item.label }}
                <em>bientôt</em>
              </span>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-status">
        <span class="status-dot">SYSTÈME EN LIGNE</span>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>
