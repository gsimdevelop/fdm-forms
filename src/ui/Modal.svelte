<script>
  import { createEventDispatcher, tick } from 'svelte'
  const eventDispatcher = createEventDispatcher()

  const dispatcherAccept = () => eventDispatcher('accept')
  const dispatcherCancel = () => eventDispatcher('cancel')
  export let display = false
  export let title = '', cancelText = 'Cancel', acceptText = 'Accept'
  export let focusAccept = false
  let buttonAcceptEl
  $: {
    if(display && focusAccept)
      tick().then(() => buttonAcceptEl.focus())
  }
</script>

<div class="modal" class:displayBlock={display}>
  <header>{title}</header>
  <main><slot></slot></main>
  <footer>
    {#if cancelText !== false}
    <button class="btn-s" on:click={dispatcherCancel}>{cancelText}</button>
    {/if}
    {#if acceptText !== false}
    <button class="btn-s" on:click={dispatcherAccept} bind:this={buttonAcceptEl}>{acceptText}</button>
    {/if}
  </footer>
</div>