<template>
	<div class="detail">
		<div class="items" v-if="items.length">
			<div class="sb-item" v-for="product in items" v-bind:class="{ removed: isRemoved(product)}">
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
						<span>{{product.quantity}}</span>
						<!-- <input disabled="disabled" min="1" type="number" class="quantity" name="quantity" readonly :value="product.quantity"/> -->
						<div class="replace-remove">
							<!-- <a href="#" class="btn-replace btn btn-primary" @click="replaceItem(product,$event)">Replace</a> -->
							<a href="#" class="btn-remove btn btn-border" @click="removeItem(product,$event)">Replace</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="items" v-if="newProducts.length">
			<div class="sb-item" v-for="product in newProducts" v-bind:class="{ removed: isRemoved(product)}">
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
						<span>{{product.quantity}}</span>
						<!-- <input disabled="disabled" min="1" type="number" class="quantity" name="quantity" readonly :value="product.quantity"/> -->
						<div class="replace-remove">
							<!-- <a href="#" class="btn-replace btn btn-primary" @click="replaceItem(product,$event)">Replace</a> -->
							<a href="#" class="btn-remove btn btn-border" @click="removeItem(product,$event)">Replace</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<button type="button" :disabled="!isReplaceable" class="btn btn-primary replace-selected-items" @click="openPopup">Replace Selected items</button>
		<div v-if="modal">
			<SeasonalBoxModal
			:collections="collections"
			:products="_.concat(items, newProducts)"
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
	
	export default {
		components: {
			SeasonalBoxModal
		},
		props: {
			price: {
				type: Number,
				default: 0.00,
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
				modal: false,
			}
		},
		computed: {
			isReplaceable: function(){
				return (this.removed.length > 0)
			}
		},
		methods: {
			addNewItem: function(products){
				_.forEach(products, (product)=>{
					let index = _.findIndex(this.items, { 'id': product.id });
					if(index !== -1){
						if(this.items[index].quantity !== product.quantity){
							// this.removed = _.remove(this.removed, {'id': product.id});
							this.removed = _.filter(this.removed, p => p.id !== product.id);
							this.items[index] = product;
						}
					}else{
						this.newProducts.push(product);
					}
				});
				// this.newProducts = products;
			},
			// addItemBackToList: function(product)
			// {
			// 	product = _.cloneDeep(product);
			// 	let item = _.find(this.removed, { 'id': product.id });
			// 	let originalItem = _.find(this.items, { 'id': product.id });
			// 	let newItem = _.find(this.newProducts, { 'id': product.id });
			// 	// if(!_.find(this.originalProducts,{'id':product.id}))
			// 	// 	this.originalProducts.push(originalItem);

			// 	if(product.quantity >= originalItem.quantity) {
			// 		this.removed = _.filter(this.removed, p => p.id !== product.id);
			// 	} else {
			// 		let i = _.findIndex(this.removed, { 'id': product.id });
			// 		this.removed[i].quantity = originalItem.quantity - product.quantity;
			// 		this.newProducts.push(product);
			// 	}
			// 	let index = _.findIndex(this.items, { 'id': product.id });
			// 	this.items[index] = product;
			// },
			removeItem: function(product,e)
			{
				e.preventDefault();
				console.log(_.findIndex(this.removed, { 'id': product.id }));
				if(-1 === _.findIndex(this.removed, { 'id': product.id }))
					this.removed.push(_.cloneDeep(product));
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
			isRemoved: function(item)
			{
				return _.findIndex(this.removed, { 'id': item.id }) !== -1;
				// return _.includes(this.removed, item);
			}
		}
	}
</script>