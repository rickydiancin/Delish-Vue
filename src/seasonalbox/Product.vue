<template>
	<div class="card-hover product-items">
		<a href="#" class="item-wrapper">
			<div class="family-product-card general-card-bg ">
				<div class="product-icon-wrapper">
					<div class="special-icon" v-for="tag in data.tags">
						<img :src="tag"/>
					</div>
				</div>
				<div class="grid-view-item">
					<div class="product-wrapper">
						<div class="grid-view-item__image-wrapper product-card__image-wrapper js">
							<div> 
								<img :src="data.image" :alt="data.title">
							</div>
						</div>
						<div class="grid-view-item__link grid-view-item__image-container full-width-link">
							<h3 class="product-title">{{data.title}}</h3>
						</div>
					</div>
				</div>
			</div>
		</a>
		<div class="grid-add-to-cart">
			<form method="post" action="/cart/add" class="ajax-form" @submit="onSubmit">
				<div class="nice-number">
					<button type="button" @click="onDecrement">-</button>
					<input v-model="data.quantity" min="1" type="number" class="quantity" name="quantity">
					<button type="button" @click="onIncrement">+</button>
				</div>
				<input class="btn btn-transparent add-to-cart-btn" disabled name="add" type="submit" value="+ Added" v-if="isAddedToList">
				<input class="btn btn-transparent add-to-cart-btn" name="add" type="submit" value="+ Add" v-else>
				<button class="btn btn-transparent" @click="removeProduct" v-if="isAddedToList">Remove</button>
			</form> 
		</div>
	</div>
</template>
<script>
	export default {
		props: {
			added: {
				type: Array,
				default: () => []
			},
			data: {
				type: Object,
				default: {},
			},
		},
		data() {
			return {
				// product : this.data,
			}
		},
		computed: {
			isAddedToList: function() 
			{
				let index = _.findIndex(this.added, { 'id': this.data.id });
				if(index !== -1) {
					this.data.quantity = this.added[index].quantity;
					return true;
				}
				return false;
			}
		},
		methods: {
			onDecrement: function(e)
			{
				if(this.data.quantity > 1){	
					this.data.quantity = --this.data.quantity;
				}
			},
			onIncrement: function(e)
			{
				this.data.quantity = ++this.data.quantity;
			},
			removeProduct: function(e)
			{
				this.$emit('on-remove-item',this.data);
			},
			onSubmit: function(e)
			{
				e.preventDefault();
				this.$emit('on-add-to-cart', this.data)
				console.log(this.data);
			}
		}
	}
</script>