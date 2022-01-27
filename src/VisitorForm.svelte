<script>
  // import VisitorParForm from './Components/VisitorParForm.svelte'
	import VisitorProForm from './Components/VisitorProForm.svelte'

  import { _ } from './services/i18n'

  // let formSelected
</script>
<VisitorProForm/>
<!-- <h2>{$_('visitor.landpage.welcome')}</h2>
<button on:click={() => formSelected = 'Prof'} class:selected={formSelected === 'Prof'}>{$_('visitor.landpage.buttonProf')}</button>
<button on:click={() => formSelected = 'Part'} class:selected={formSelected === 'Part'}>{$_('visitor.landpage.buttonPart')}</button>
{#if formSelected === 'Prof'}
	<VisitorProForm/>
{:else if formSelected === 'Part'}
	<VisitorParForm/>
{/if} -->