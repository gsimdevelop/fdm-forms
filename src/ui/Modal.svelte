<script>
  import { createEventDispatcher } from 'svelte'
  const eventDispatcher = createEventDispatcher()

  const dispatcherAccept = () => eventDispatcher('accept')
  const dispatcherCancel = () => eventDispatcher('cancel')
  export let display = false
  export let title = '', cancelText = 'Cancel', acceptText = 'Accept'
</script>

<div class="modal" class:displayBlock={display}>
  <header>{title}</header>
  <main><slot></slot></main>
  <footer>
    <button class="btn-s" on:click={dispatcherCancel}>{cancelText}</button>
    <button class="btn-s" on:click={dispatcherAccept}>{acceptText}</button>
  </footer>
</div>