<template>
  <div>
    <h1>404 - Page Not Found</h1>
    <p>La página que buscas no existe.</p>
    <p><NuxtLink to="/">Volver al inicio</NuxtLink></p>
  </div>
</template>

<script setup>
if (process.client) {
  setTimeout(() => {
    navigateTo('/')
  }, 2000)
}
</script>

<style scoped>
div {
  padding: 2rem;
  text-align: center;
}
h1 {
  color: beige;
}
a {
  color: beige;
}
</style>
