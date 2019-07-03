<template>
	<div class="modal-open">
		<div class="modal fade in" tabindex="-1" role="dialog" :style="open == true ? 'display: block;' : ''">
		  <div class="modal-dialog modal-lg" role="document">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')"><span aria-hidden="true">&times;</span></button>
		        <h4 class="modal-title">
		        	<button type="button" @click="group = 1">Recipe</button>
		        	<button type="button" @click="group = 2">Product</button>
		        	<button type="button">Confirm</button>
		        </h4>
		      </div>
		      <div class="modal-body">
		      	<div v-if="group === 1">
		      		<h4>Recipes</h4>
		      		<Recipe :products="this.recipes" />
		      	</div>
		      	<div v-if="group === 2">
		      		<h4>Products</h4>
		      	</div>
		      </div>
		    </div>
		  </div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import Recipe from './RecipeModal.vue';

	export default {
		components: {
			Recipe,
		},
		props: ['open', 'products'],
		data() {
			return {
				group: 1,
				recipes: [],
			}
		},
		mounted() {
			_.each(this.products, (p) => {
				if(p.type == 'product') {
					this.recipes.push(p);					
				}
			});
			
			console.log(this.recipes);
		},
	}
</script>