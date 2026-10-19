<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { menu } from './menu'

const visibleMenu = menu.filter((section) => !section.hidden)

const route = useRoute()
const menuOpen = ref(false)
const openSubmenus = ref(new Set(menu.filter((section) => section.submenu).map((section) => section.title)))

function toggleSubmenu(title: string) {
  if (!openSubmenus.value.delete(title)) openSubmenus.value.add(title)
}

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
        <div v-for="section in visibleMenu" :key="section.title" class="menu-section">
          <button
            v-if="section.submenu"
            class="menu-link submenu-toggle"
            type="button"
            :aria-expanded="openSubmenus.has(section.title)"
            @click="toggleSubmenu(section.title)"
          >
            {{ section.title }}
            <span class="submenu-chevron" aria-hidden="true">{{ openSubmenus.has(section.title) ? '▾' : '▸' }}</span>
          </button>
          <p v-else class="menu-title">{{ section.title }}</p>
          <ul v-show="!section.submenu || openSubmenus.has(section.title)" :class="{ submenu: section.submenu }">
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
