<template>
	<div>
		<div class="chosen-ingridents">
			<h5>Pre selected items</h5>
			<div class="meal-products-lists">
        <div class="meal-product-be" 
          v-for="(product, index) in products" 
          :key="index"
        >
          <div>
            <button 
              class="delete-product" 
              type="button" 
              @click="removeChosenProduct(product)"
            >
              x
            </button>
            <label 
              class="qty-product" 
              for="quantity"
            >
              {{product.serving}}x
            </label>
            <div class="image-buttons">
              <div class="meal-list-img">
                <img v-if="product.image" :src="product.image" alt="no img" />
                <img v-if="!product.image" :src="defaultImg" alt="no img" />
              </div>
            </div>
            <h5>{{ product.title }}</h5>
          </div>
        </div>
      </div>
		</div>


		<br />
		<br />

		<h3>Search Recipes</h3>
	</div>
</template>

<script>
	export default {
		props: ['products'],
		mounted() {
			// 
		}
	}
</script>