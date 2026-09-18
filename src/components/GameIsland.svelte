<script lang="ts">
import { createRng } from "@engine/index"

let seed = $state(42)
let rng = $derived(createRng(seed))
let firstValue = $derived(rng())

function randomize() {
  seed = Math.floor(Math.random() * 1000000)
}
</script>

<div class="game-island">
  <h2>Motor del juego</h2>
  <p>Seed: {seed}</p>
  <p>Primer valor PRNG: {firstValue.toFixed(6)}</p>
  <button onclick={randomize}>Nueva seed</button>
</div>

<style>
  .game-island {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 400px;
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #aaa;
    font-family: monospace;
    margin-bottom: 0.25rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #333;
    color: #ededed;
    border: 1px solid #555;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #444;
  }
</style>
