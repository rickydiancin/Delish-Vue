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
						<input disabled="disabled" min="1" type="number" class="quantity" name="quantity" readonly :value="product.qty"/>
						<div class="replace-remove">
							<!-- <a v-if="isAddBackable(product)" href="#" class="btn-replace btn btn-primary" @click="onaAddBack(product,$event)">Add back</a> -->
							<a v-if="isRemoved(product)" href="#" class="btn-remove btn btn-border" @click="onRemoved" disabled>Removed</a>
							<a v-else href="#" class="btn-remove btn btn-border" @click="removeItem(product,$event)">Replace</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<button type="button" :disabled="!isReplaceable" class="btn btn-primary replace-selected-items" @click="openPopup">Replace Selected items</button>
		<a href="#" class="btn btn-secondary replace-selected-items" @click="onAddToCart">Add box to cart</a>
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
			}
		},
		data() {
			return {
				items : this.$parent.products,
				collections: this.$parent.collections,
				placeholderUrl: this.$parent.placeholder_url,
				newProducts: [],
				originalProducts: [],
				removed: [],
				removedList:[],
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
				return _.concat(this.items,this.newProducts);
			}
		},
		mounted()
		{
			this.cartIcon = document.getElementsByClassName('cart-count-info');
			$('.subscription-type input[name="subscription-type"]').change( this.onChangeSubscriptionType)    
		},
		beforeDestroy(){
			$('.subscription-type input[name="subscription-type"]').change(this.onChangeSubscriptionType)    
		},
		methods: {
			onChangeSubscriptionType: function(e){
				this.subscriptionType = e.target.value;
			},
			onAddToCart: function(e){
				e.preventDefault();
				
				let ingredients = [];
				
				_.forEach(this.items, (product)=>{
					if(!_.find(this.removed,{'id':product.id}))
						ingredients.push(product);
				});

				let properties = {
					included: ingredients,
					serving: 1,
					price: (this.price / 100).toFixed(2),
					shipping_interval_frequency: this.subscriptionType,
					// shipping_interval_unit_type: '',
					// type: 'type',
					product_type: 'seasonal_box',
					customized: 1,

				};

				let data = {
					'quantity': 1,
					'id': this.variantId,
					'properties': properties
				};
				console.log(data);

				// formdata.append('quantity',1);
				// formdata.append('id',this.id);
				// formdata.append('properties', properties);

				let formdata = this.toFormData(data);

				this.$Progress.start();
				axios.post('/cart/add.js',formdata)
				.then((res) => {
					Shopify.getCart(e=>{
						this.cartIcon.innerHTML = '(' + e.item_count + ')'.toString();
					});
					this.$Progress.finish()
				}).catch((err)=>{
					this.$toasted.error('Something went wrong. Please try again.');
					this.$Progress.fail()
				});

				// formdata.append('price',this.price);
				// formdata.append('properties',);

				// properties["ingredients"] = ingredients;
				// properties["price"] = (this.price / 100).toFixed(2);
				// properties["serving"] = 1;//i/(100*properties["price"]);



				// data: {
				// 	quantity: r,
				// 	id: n,
				// 	properties: {
				// 		'included': p["ingredients"],
				// 		'serving' : p["serving"],
				// 		'price' : p["price"],
				// 		'shipping_interval_frequency': p["shipping_interval_frequency"],
				// 		'shipping_interval_unit_type' : p["shipping_interval_unit_type"],
				// 		'subscription_id' : p["subscription_id"],
				// 		'type' : p["type"],
				// 		'product_type' :(p['type'] == "Recipe") ? "recipe" : "recipe_box",
				// 		'customized': p["customized"]
				// 	}
				// },



				// var selected = [];
				// var properties = [];
				// var ingredients = [];
				// $("input[name='products-included']:checked").each(function(){
				// 	selected.push($(this).val());
				// });

				// selected.forEach(function(product) {
				// 	var included = product.split(',');
				// 	ingredients.push({
				// 		handle:included[0],
				// 		qty:included[1],
				// 		price:included[2],
				// 		title:included[3]
				// 	});
				// });
				// properties["ingredients"]=ingredients;
/*
				properties["price"] = $("#price").val();
				cart = $("#add-to-cart-form input[name=id]").val()
				var i = $("#add-to-cart-form input[name=quantity]").val();
				i = parseInt(i);
				if (!i) {
					i = 1
				}

				properties["serving"] = i/(100*properties["price"]);

				var subsc = $(".subscription-type .nice-select .selected").attr("data-value");
              // console.log(subsc);

              var status = $("#substitutedStatus").val();
              if(status == 1) {
              	properties["customized"] = true; 
              } else {
              	properties["customized"] = false;
              }
              // recurring data
              if (subsc !== 1) {
              	properties["shipping_interval_frequency"] = subsc;
              	properties["shipping_interval_unit_type"] = $("#rc_shipping_interval_unit_type").val();
              	properties["subscription_id"] = $("#rc_subscription_id").val();
              }
              var o = $("#product-featured-image").val();
              console.log(cart, i, o,properties);
              mt._ajaxaddtocartbox(cart, i, o,properties);
              */
          },
          addNewItem: function(products){
          	_.forEach(products, (product)=>{
          		let index = _.findIndex(this.items, { 'id': product.id });
          		let i = _.findIndex(this.newProducts, { 'id': product.id });

          		if(index === -1 && i === -1){
          			this.newProducts.push(product);
          		}

          		if(index !== -1){
          			this.removed = _.filter(this.removed,  p => p.id !== product.id);
          			this.items[index] = product;
          		}

          		if(i !== -1){
          			this.removed = _.filter(this.removed,  p => p.id !== product.id);
          			this.newProducts[i] = product;
          		}

          	});

				// _.forEach(this.removed, (product)=>{
				// 	if( !_.find(products, { 'id': product.id }) ){						
				// 		let i = _.findIndex(this.newProducts, { 'id': product.id });
				// 		if(i === -1 ) {
				// 			this.removedList.push(product);
				// 		} else{
				// 			this.removedList[i] = product;
				// 		}
				// 	}
				// });
			},
			onaAddBack: function(product,e)
			{
				e.preventDefault();
				if(-1 !== _.findIndex(this.removed, { 'id': product.id }))
					this.removed = _.filter(this.removed, p => p.id !== product.id);
			},
			removeItem: function(p,e)
			{
				e.preventDefault();
				if(-1 === _.findIndex(this.removed, { 'id': p.id }))
					this.removed.push(_.cloneDeep(p));
					// this.removedList.push(_.cloneDeep(p));
				},
				openPopup: function(e)
				{
					e.preventDefault();
					this.modal = true;
					document.body.classList.add('modal-open');
				},
				closePopup: function()
				{
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
				isCompletelyRemoved: function(p)
				{
					return _.findIndex(this.removedList, { 'id': p.id }) !== -1;
				},
				isAddBackable: function(p)
				{
					return _.find(this.removed, { 'id': p.id }) && !_.find(this.removedList, { 'id': p.id });

				},
				toFormData(obj, form, namespace) {
					let fd = form || new FormData();
					let formKey;

					for(let property in obj) {
						if(obj.hasOwnProperty(property) && obj[property]) {
							if (namespace) {
								formKey = namespace + '[' + property + ']';
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
			}
		}
	</script>