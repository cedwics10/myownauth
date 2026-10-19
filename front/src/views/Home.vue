<template>
  <section class="hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">SECURITY PROTOCOL // 01</p>
      <h1>Le centre de contrôle de la <span>Batcave</span>.</h1>
      <p class="hero-lede">
        Arsenal, rapports de mission et surveillance de Gotham : tous les systèmes du justicier réunis au même
        endroit.
      </p>
      <div class="hero-actions">
        <RouterLink class="button button-primary" to="/bat-computer">Ouvrir le Bat-Computer</RouterLink>
        <RouterLink class="button button-quiet" to="/arsenal">Voir l’arsenal <span aria-hidden="true">↗</span></RouterLink>
      </div>
    </div>
    <aside class="signal-panel" aria-label="État du système">
      <span class="panel-label">LIVE MONITOR</span>
      <div class="signal-ring"><span>ON</span></div>
      <strong>CANAL OUVERT</strong>
      <p>Bat-Computer // tous les systèmes opérationnels</p>
    </aside>
  </section>

  <section class="feature-strip" aria-label="Fonctionnalités">
    <article><span>01</span><h2>Surveillance</h2><p>Gardez un œil sur Gotham.</p></article>
    <article><span>02</span><h2>Rapports</h2><p>Consignez chaque mission.</p></article>
    <article><span>03</span><h2>Arsenal</h2><p>Consultez les gadgets disponibles.</p></article>
  </section>
</template>
