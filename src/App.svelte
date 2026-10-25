<script>
  import MapView from "./lib/MapView.svelte";
</script>

<header>
  <h1>Local Infrastructure Explorer</h1>
  <p>Population and housing growth by local authority</p>
</header>

<main>
  <MapView />
</main>

<style>
  header {
    padding: 1rem 1.5rem;
    border-bottom: 5px solid #1d70b8;
  }

  header p {
    margin: 0.25rem 0 0;
  }

  main {
    height: calc(100vh - 6.5rem);
  }
</style>
