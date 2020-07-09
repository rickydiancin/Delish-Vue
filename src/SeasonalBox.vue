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
						<input min="1" type="number" class="quantity" name="quantity" readonly :value="product.quantity"/>
						<div class="replace-remove">
							<!-- <a href="#" class="btn-replace btn btn-primary" @click="replaceItem(product,$event)">Replace</a> -->
							<a href="#" class="btn-remove btn btn-border" @click="removeItem(product,$event)">Replace</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="sb-item" v-else>
			<div class="row">
				<div class="col-12">
					<p>No products found</p>
				</div>
			</div>
		</div>
		<button type="button" :disabled="!isReplaceable" class="btn btn-primary replace-selected-items" @click="openPopup">Replace Selected items</button>
		<div v-if="modal">
			<SeasonalBoxModal
			:collections="collections"
			:products="items"
			:placeholder-url="placeholderUrl"
			:removed="removed"
			:price="price"
			:open="modal"
			@closeModal="closePopup"
			@add-item="addNewItem"
			/>
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
				replace: [],
				removed: [],
				modal: false,
			}
		},
		computed: {
			isReplaceable: function(){
				return (this.removed.length > 0 || this.replace.length > 0)
			}
		},
		methods: {
			addNewItem: function(product){
				console.log(product);
				this.items.push(product);
			},
			removeItem: function(product,e)
			{
				e.preventDefault();

				if(!_.includes(this.removed, product))
					this.removed.push(product);
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
				return _.includes(this.removed, item);
			}
		}
	}
</script>