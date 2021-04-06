<template>
	<div class="detail">
		<vue-progress-bar></vue-progress-bar>
		<div class="items" v-if="items.length">
			<div class="sb-item" v-for="product in productList" v-bind:class="{ removed: isRemoved(product)}">
				<div class="row">
					<div class="col-md-2 col-sm-6 col-5">
						<ul class="feature-icon">
							<li v-for="tag in product.tags">
								<img :src="tag"/>
							</li>
						</ul>
						<div class="image">
							<img :src="product.image" :alt="product.title">
						</div>
					</div>
					<div class="col-md-6  col-sm-6 col-7">
						<h3>{{product.title}}</h3>
					</div>
					<div class="col-md-4  col-sm-12 col-12">
						<div class="nice-number">
							<button type="button">-</button>
							<input disabled="disabled" min="1" type="input" class="quantity" name="quantity" readonly :value="product.qty"/>
							<button type="button">+</button>
						</div>
						<div class="replace-remove" v-if="customizable">
							<!-- <a v-if="isAddBackable(product)" href="#" class="btn-replace btn btn-primary" @click="onaAddBack(product,$event)">Add back</a> -->
							<!-- <a v-if="isRemoved(product)" href="#" class="btn-remove btn btn-border" @click="onRemoved" disabled>Removed</a>
							<a v-else href="#" class="btn-remove btn btn-border" @click="removeItem(product,$event)">Replace</a> -->
							<a v-if="isRemoved(product)" href="#" class="btn-remove btn btn-border" @click="removeItemBack(product,$event)">Deselect</a>
							<a v-else href="#" class="btn-remove btn btn-border" @click="removeItem(product,$event)">Select</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="replace-selected-wrapper">
			<button type="button" v-if="customizable" :disabled="!isReplaceable" class="btn btn-primary replace-selected-items" @click="openPopup">Replace Selected items</button>
			<a v-if="status_type === 'add'" href="#" class="btn btn-secondary replace-selected-items" @click="onAddToCart">Add box to cart</a>
			<a v-else href="#" class="btn btn-secondary replace-selected-items" @click="onAddToCart">Update box</a>
		</div>
		<div v-if="modal">
			<SeasonalBoxModal
			:collections="collections"
			:products="productList"
			:placeholder-url="placeholderUrl"
			:removed="removed"
			:price="price"
			:open="modal"
			@closeModal="closePopup"
			@add-item="addNewItem"
			/>
			<!-- @on-add-back-product="addItemBackToList" -->
		</div>
	</div>
</template>
<style scoped="scss">
.detail .nice-number {
	background-color: #b7b7b7;
}
</style>
<script>
	import SeasonalBoxModal from './seasonalbox/SeasonalBoxModal.vue'
	import lodash from 'lodash';
	import axios from 'axios'

	export default {
		components: {
			SeasonalBoxModal
		},
		props: {
			price: {
				type: Number,
				default: 0.00,
			},
			title: {
				type: String,
				default: '',
			},
			id: {
				type: Number,
				default: 0,
			},
			variantId: {
				type: Number,
				default: 0
			},
			customizable: {
				default: true,
			}
		},
		data() {
			console.log(this.$route)
			return {
				items : this.$parent.products,
				collections: this.$parent.collections,
				placeholderUrl: this.$parent.placeholder_url,
				status_type: this.$parent.status_type,
				newProducts: [],
				removed: [],
				// originalProducts: [],
				// removedList:[],
				modal: false,
				isCompleted: true,
				cartIcon:'',
				subscriptionType: 1,
			}
		},
		computed: {
			isReplaceable: function(){
				return (this.removed.length > 0)
			},
			productList: function()
			{
				console.log(this.newProducts)
				return _.concat(this.items,this.newProducts);
			},
			totalBoxValue: function()
			{
				let products = _.differenceBy(this.productList, this.removed, 'id');
				return _.sumBy(products, p => p.price * p.qty);
			},
			totalBoxPercentage: function()
			{
				return ( ( this.totalBoxValue * 100 * 100)/ this.price ).toFixed(2); 
			}
		},
		mounted()
		{
			this.cartIcon = document.getElementsByClassName('cart-count-info');
			$('.seasonal-box-detail input[name="subscription-type"]').change( this.onChangeSubscriptionType)    
			$('.seasonal-box-detail #sb-add-to-cart').click( this.onAddToCart)    
		},
		beforeDestroy(){
			$('.seasonal-box-detail input[name="subscription-type"]').change(this.onChangeSubscriptionType)    
			$('.seasonal-box-detail #sb-add-to-cart').click( this.onAddToCart);
		},
		methods: {
			onChangeSubscriptionType: function(e){
				this.subscriptionType = e.target.value;
			},
			onAddToCart: function(e){
				e.preventDefault();

				// console.log(this.newProducts.length !== 0);
				// console.log(this.removed.length !== 0);
				// console.log(_.isEqual(_.sortBy(this.items), _.sortBy(this.$parent.products)));

				if(this.totalBoxPercentage < 90 || this.totalBoxPercentage > 100 ){
					if(!_.isEqual(_.sortBy(this.items), _.sortBy(this.$parent.products)) || this.newProducts.length !== 0 || this.removed.length !== 0 ) {

						//jquery
						$.toaster({
							message : 'Your box value must be minimum of 90% and should not exceed 100%. Please review your seasonal box.',
							title : '',
							priority : 'danger'
						});
						return false;
					} 	
				}

				let ingredients = [];
				

				_.forEach(this.productList, (product)=>{
					if(!_.find(this.removed,{'id':product.id}))
						ingredients.push(product);
				});

				let properties = {
					included: ingredients,
					serving: 1,
					price: (this.price / 100).toFixed(2),
					shipping_interval_frequency: this.subscriptionType,
					product_type: 'seasonal_box',
					customized: 1,

				};

				// let data = {
				// 	'quantity': 1,
				// 	'id': this.variantId,
				// 	'properties': properties
				// };

				// let formdata = this.toFormData(data);

				// console.log(formdata)
				// console.log(this.$parent.type);

				if(this.$parent.status_type == 'add') {

					let data = {
						'quantity': 1,
						'id': this.variantId,
						'properties': properties
					};
					let formdata = this.toFormData(data);

					axios.post('/cart/add.js',formdata)
					.then((res) => {
						$.toaster({ 
							message : 'Product added to cart successfully.',
							title : '',
							priority : 'success' ,
							fadeAway: 4000 
						});

						Shopify.getCart(e=>{
							//jquery
							// console.log(e)
							$('.cart-count-info').text(e.items.length);
							// $('.cart-count-info').text(e.item_count);
						});
					}).catch((err)=>{
						this.$toasted.error('Something went wrong. Please try again.');
					});

				} else {
					console.log(this.$parent.line)
					let data = {
						'quantity': 1,
						'line': this.$parent.line+1,
						'properties': properties
					};

					// axios.get('/cart.js')
					// .then((res) => {
					// 	console.log(res)
					// }).catch((err)=>{
					// 	console.log(err)
					// 	this.$toasted.error('Something went wrong. Please try again.');
					// });

					let formdata = this.toData(data);
					axios.post('/cart/change.js',formdata)
					.then((res) => {
						$.toaster({ 
							message : 'Product added to cart successfully.',
							title : '',
							priority : 'success' ,
							fadeAway: 4000 
						});

						Shopify.getCart(e=>{
							//jquery
							// console.log(e)
							$('.cart-count-info').text(e.items.length);
							// $('.cart-count-info').text(e.item_count);
						});
					}).catch((err)=>{
						console.log(err)
						this.$toasted.error('Something went wrong. Please try again.');
					});

				}

				

				// axios.post('/cart/add.js',formdata)
				// .then((res) => {
				// 	$.toaster({ 
				// 		message : 'Product added to cart successfully.',
				// 		title : '',
				// 		priority : 'success' ,
				// 		fadeAway: 4000 
				// 	});

				// 	Shopify.getCart(e=>{
				// 		//jquery
				// 		// console.log(e)
				// 		$('.cart-count-info').text(e.items.length);
				// 		// $('.cart-count-info').text(e.item_count);
				// 	});
				// }).catch((err)=>{
				// 	this.$toasted.error('Something went wrong. Please try again.');
				// });

			},
			addNewItem: function(products){
				console.log(products,'productsproducts')
				_.forEach(products, (product)=>{
					let index = _.findIndex(this.items, { 'id': product.id });
					let newItemIndex = _.findIndex(this.newProducts, { 'id': product.id });
					let removedIndex = _.findIndex(this.removed, { 'id': product.id });

					//Completely new item added to box
					if(index === -1 && newItemIndex === -1){
						this.newProducts.push(product);
					}
					
					//Item already exist in the box but again added from the popup
					else if(removedIndex === -1 && newItemIndex === -1 && index !== -1){
						this.items[index].qty = product.qty + this.items[index].qty;
					} 
					
					else if(removedIndex === -1 && newItemIndex !== -1 && index === -1){
						this.items[index].qty = product.qty + this.newProducts[index].qty;
					} 
					
					//Has in the existing item list 
					else if(index !== -1){
						// this.removed = _.filter(this.removed,  p => p.id !== product.id);
						this.items[index].qty = product.qty;
					}

					//Has in the new products list
					else if(newItemIndex !== -1){
						// this.removed = _.filter(this.removed,  p => p.id !== product.id);
						this.newProducts[newItemIndex].qty = product.qty;
					}

					if(index !== -1 || newItemIndex !== -1){
						this.removed = _.filter(this.removed,  p => p.id !== product.id);
					}
				});

				//jquery
				$('input[type="number"]').niceNumber();
			},
			onaAddBack: function(product,e)
			{
				e.preventDefault();
				if(-1 !== _.findIndex(this.removed, { 'id': product.id }))
					this.removed = _.filter(this.removed, p => p.id !== product.id);
			},
			removeItemBack: function(product,e)
			{
				e.preventDefault();
				if(-1 !== _.findIndex(this.removed, { 'id': product.id }))
					this.removed = _.filter(this.removed, p => p.id !== product.id);
			},
			removeItem: function(p,e)
			{
				e.preventDefault();
				if(-1 === _.findIndex(this.removed, { 'id': p.id })){
					this.removed.push(_.cloneDeep(p));
					console.log(_.cloneDeep(p))
					console.log(this.removed)
				}
			},
			openPopup: function(e)
			{
				e.preventDefault();
				this.modal = true;
				document.body.classList.add('modal-open');
			},
			closePopup: function(data)
			{
				if(data) {
					// console.log(data)
					this.items = this.items.filter(array => this.removed.some(val => val.id !== array.id));
					this.removed = [];
					// console.log(this.productList , this.removed)
				}
				this.modal = false;
				document.body.classList.remove('modal-open');				
			},
			onRemoved: function(e)
			{
				e.preventDefault();
			},
			isRemoved: function(p)
			{
				return _.findIndex(this.removed, { 'id': p.id }) !== -1;
			},
			toFormData(obj, form, namespace) {
				let fd = form || new FormData();
				let formKey;

				for(let property in obj) {
					if(obj.hasOwnProperty(property) && obj[property]) {
						if (namespace) {
							formKey = namespace + '[' + property + ']';
							// console.log(formKey)
						} else {
							formKey = property;
						}
						if (obj[property] instanceof Date) {
							fd.append(formKey, obj[property].toISOString());
						} else if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
							this.toFormData(obj[property], fd, formKey);
						} else {
							fd.append(formKey, obj[property]);
						}
					}
				}

				return fd;
			},
			toData(obj) {
				// let formKey;
				var result = {};

				for(let i in obj.properties.included) {
					result[i] = obj.properties.included[i];
				}

				obj.properties.included = result;

				return obj;
			},
		}
	}
</script>