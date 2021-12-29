<script context='module'>
  import { setupI18n } from './services/i18n'
  setupI18n()
</script>

<script>
	import Navigator from './Components/Navigator.svelte'
	import VisitorParForm from './Components/VisitorParForm.svelte';
	import VisitorProForm from './Components/VisitorProForm.svelte';
	import { _ } from './services/i18n'

	let formSelected
</script>

<Navigator/>
<main>
	<h2>{$_('landpage.welcome')}</h2>
	<button on:click={() => formSelected = 'Prof'} class:selected={formSelected === 'Prof'}>{$_('landpage.buttonProf')}</button>
	<button on:click={() => formSelected = 'Part'} class:selected={formSelected === 'Part'}>{$_('landpage.buttonPart')}</button>
	{#if formSelected === 'Prof'}
		<VisitorProForm/>
		{:else if formSelected === 'Part'}
		<VisitorParForm/>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: none;
		margin: 0 auto;
	}
/* 
	@media (min-width: 640px) {
		main {
		}
	} */
</style>