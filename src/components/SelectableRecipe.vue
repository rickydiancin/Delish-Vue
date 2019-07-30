<template>
	<section class="meal-products-lists list-w-tag meal-product-modal">
		<div class="meal-product-be">
			<span class="checkbox-relative">
				<input 
					type="checkbox"
					:true-value="1"
					:false-value="0"
					v-model="checkbox"
					@change="onProductCheckboxSelect"
				/>
			</span>
	    <div class="product-box-cont">
	      <label
	      	class="qty-product" 
	      	for="qty"
	      >{{product.serving}}x</label>
	      <div class="image-buttons">
		      <div class="meal-list-img">
		      	<img v-if="product.image" :src="baseUrl + product.image" alt="no img"/>
		        <img v-if="!product.image" :src="baseUrl + defaultImg" alt="no img" />
		      </div>
		     	<ul class="meal-recipe-tags">
		     		<!-- <li v-for="category in product.categories">{{category}}</li> -->
		     		<li>DP</li>
		     		<li>LC</li>
		     	</ul>
		    </div>
	    </div>
	    <span class="product-box-title">{{product.title}}</span>
		</div>
	</section>
</template>

<script>
	export default {
		props: {
			product: {
				type: Object,
			},
			products: {
				type: Array,
			},
		},
		data() {
			return {
				baseUrl: window.middleware_base_url,
				defaultImg: '/images/placeholder-200x200.png',
				checkbox: 0,
			}
		},
		mounted() {
			this.product.new = true

			// Check if the product is within the chosen ingrident list, if yes checkbox = true
			const index = _.findIndex(this.products, {id: this.product.id})

			if(index != -1) {
				this.checkbox = 1
			}

			// listen to chosen ingrident event
			this.$events.listen('removeFromSearchList', (product) => {
				if(product.id === this.product.id) {
					this.checkbox = 0
				}
			})
		},
		methods: {
			onProductCheckboxSelect() {
				if(this.checkbox === 1) {
					this.product.qty = 1
					this.$emit('addProduct', this.product)
				} else {
					this.$emit('removeProduct', this.product)
				}
			}
		}
	}
</script>
