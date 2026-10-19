import type { Component } from 'vue'

/**
 * Menu de la Batcave : SEUL endroit à modifier pour ajouter une page.
 *
 * 1. Créez la vue dans `src/views/MaPage.vue`.
 * 2. Ajoutez une entrée dans la section voulue ci-dessous.
 *
 * Le router, la barre latérale et les raccourcis du tableau de bord sont
 * générés automatiquement à partir de cette liste.
 * Une entrée sans `component` apparaît dans le menu comme « bientôt ».
 */

export type MenuItem = {
  path: string
  label: string
  /** Code court affiché devant le libellé (ex. « 02 »). */
  code: string
  /** Courte description utilisée par les raccourcis du tableau de bord. */
  hint?: string
  component?: () => Promise<Component>
}

export type MenuSection = {
  title: string
  items: MenuItem[]
  /** Section masquée de la barre latérale (les routes restent accessibles). */
  hidden?: boolean
  /** Affiche la section comme une entrée dépliable avec ses pages en sous-menu. */
  submenu?: boolean
}

export const menu: MenuSection[] = [
  {
    title: 'Batcave',
    items: [{ path: '/', label: 'Accueil', code: '00', component: () => import('./views/Home.vue') }],
  },
  {
    title: 'TP',
    submenu: true,
    items: [
      {
        path: '/tp1',
        label: 'TP1',
        code: 'T1',
        hint: 'Basic Auth : initialisation.',
        component: () => import('./views/Tp1.vue'),
      },
      { path: '/tp2', label: 'TP2', code: 'T2' },
      { path: '/tp3', label: 'TP3', code: 'T3' },
      { path: '/tp4', label: 'TP4', code: 'T4' },
      {
        path: '/arsenal',
        label: 'Arsenal',
        code: 'AR',
        hint: 'Gadgets disponibles.',
        component: () => import('./views/Arsenal.vue'),
      },
    ],
  },
  {
    title: 'Bat-Computer',
    hidden: true,
    items: [
      {
        path: '/bat-computer',
        label: 'Tableau de bord',
        code: 'BC',
        hint: 'État du système et modules.',
        component: () => import('./views/BatComputer.vue'),
      },
      {
        path: '/reports',
        label: 'Rapports de mission',
        code: 'RP',
        hint: 'Consigner et relire les rapports.',
        component: () => import('./views/Reports.vue'),
      },
      { path: '/gotham', label: 'Carte de Gotham', code: 'GM', hint: 'Surveillance de la ville.' },
      { path: '/rogues', label: 'Dossiers criminels', code: 'DC', hint: 'Fiches des ennemis connus.' },
    ],
  },
]

export type ResolvedMenuItem = MenuItem & { available: boolean }

export const menuItems: ResolvedMenuItem[] = menu.flatMap((section) =>
  section.items.map((item) => ({ ...item, available: Boolean(item.component) })),
)
