<template>
	<section class="meal-products-lists meal-product-modal">
		<div class="meal-product-be">
			<span class="checkbox-relative">
				<input 
					type="checkbox"
					:true-value="1"
					:false-value="0"
					v-model="checkbox"
					@change="selected"
				/>
			</span>
			<div class="product-box-cont">
				<label 
					class="qty-product" 
	        for="qty"
				>
					{{qty}}x
				</label>
				<div class="image-buttons">
					<div class="meal-list-img">
						<img v-if="product.image" :src="baseUrl + product.image" alt="no img" />
						<img v-if="!product.image" :src="baseUrl + defaultImg" alt="no img" />
					</div>
					<div class="meal-image-wrap">
						<button 
							class="product-delete"
							type="button" 
							@click="minus"
						>-</button>
						<input 
							type="number" 
							class="product-input-qty" 
							v-model="qty" 
							disabled="" 
							min="1" 
						/>
						<button 
							type="button" 
							class="product-add" 
							@click="add"
						>+</button>
					</div>
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
				qty: 1,
			}
		},
		mounted() {
			const index = _.findIndex(this.products, {id: this.product.id })
		
			if(index != -1) {
				this.checkbox = 1
				this.qty = this.products[index].qty
			}

			// listen to chosen ingrident event
			this.$events.listen('removeFromSearchList', (product) => {
				if(product.id === this.product.id) {
					this.checkbox = 0
				}
			})

			this.$events.listen('minusChosenIngrident', (product) => {
				if(product.id === this.product.id) {
					this.qty -= 1
				}
			})

			this.$events.listen('addChosenIngrident', (product) => {
				if(product.id === this.product.id) {
					this.qty += 1
				}
			})
		},
		methods: {
			minus() {
				if(this.qty <= 0) {
					return
				}

				this.qty--
				this.qtyUpdate()
			},
			add() {
				if(this.qty >= 99) {
					return
				}

				this.qty++
				this.qtyUpdate()
			},
			selected() {
				if(this.checkbox === 1) {
					this.product.qty = this.qty
					this.$emit('addProduct', this.product)
				} else {
					this.$emit('removeProduct', this.product)
				}
			},
			qtyUpdate() {
				if(this.checkbox === 1) {
					this.$emit('qtyChange', this.product, this.qty)
				}
			}
		}
	}
</script>
