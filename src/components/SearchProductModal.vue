<!-- Popup modal to search for recipes and product -->
<template>
	<div class="modal-open">
		<div 
			class="modal fade in" 
			tabindex="-1" 
			role="dialog" 
			:style="open == true ? 'display: block;' : ''"
		>
		  <div class="modal-dialog modal-lg" role="document">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button 
		        	type="button" 
		        	class="close" 
		        	data-dismiss="modal" 
		        	aria-label="Close" 
		        	@click="$emit('closeModal')"
		        >
		        	<span aria-hidden="true">&times;</span>
		       	</button>
		        <h4 class="modal-title">
		        	<button type="button" @click="group = 1">Recipe</button>
		        	<button type="button" @click="group = 2">Product</button>
		        </h4>
		      </div>
		      <div class="modal-body">
		      	<div v-if="group === 1">
		      		<RecipeLists 
		      			:meal-plan-products="products" 
		      			@confirm="addRecipes"
		      		/>
		      	</div>
		      	<div v-if="group === 2">
		      		<FamilyProductLists 
								:meal-plan-products="products"
								@confirm="addFamilyProducts"
		      		/>
		      	</div>
		      </div>
		    </div>
		  </div>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import RecipeLists from './RecipeModal.vue';
	import FamilyProductLists from './FamilyProductModal.vue';

	export default {
		components: {
			RecipeLists,
			FamilyProductLists,
		},
		props: ['open', 'products'],
		data() {
			return {
				group: 1,
				recipes: [],
			}
		}, mounted() {
		},
		methods: {
			addFamilyProducts(products) {
        let selectedMealPlanProducts = _.clone(this.products)

        selectedMealPlanProducts = _.filter(selectedMealPlanProducts, (product) => {
          return product.type === 'recipe'
        })

        _.each(products, (product) => {
          selectedMealPlanProducts.push(product)
        })

        this.$emit('saveMeal', selectedMealPlanProducts)
      },
			addRecipes(products) {
        let selectedMealPlanProducts = _.clone(this.products)

        selectedMealPlanProducts = _.filter(selectedMealPlanProducts, (product) => {
          return product.type === 'product'
        })

        _.each(products, (product) => {
          selectedMealPlanProducts.push(product)
        })

        this.$emit('saveMeal', selectedMealPlanProducts)
      },
		}
	}
</script>