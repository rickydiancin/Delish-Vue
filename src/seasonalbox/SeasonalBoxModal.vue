<template>
	<div class="seasonal-box-modal">
		<div class="popup-overlay"></div>
		<vue-progress-bar></vue-progress-bar>
		<div class="modal fade show" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="modallabel" aria-hidden="true" :style="open == true ? 'display: block;' : ''">
			<div class="modal-dialog modal-lg" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="modallabel">Replace your goods</h5>
						<div class="total">
							Your Box's Total: <span>${{ (price / 100).toFixed(2) }}</span>
						</div>
						<button type="button" class="btn-replace btn btn-primary" @click="completeBox">Complete box</button>
						<button type="button" class="close" @click="$emit('closeModal')">
							<span aria-hidden="true"></span>
						</button>
					</div>
					<div class="modal-body">
						<div class="value-bar">
							<strong>Seasonal Box value used</strong>
							<div class="bar">
								<div class="progress" style="height: 30px;" v-bind:class=" { 'progress-green-border' : true }" >
									<div class="progress-bar"
									v-bind:class="{ 
										'progress-bar-danger' : (totalBoxValue > 100),
										'progress-bar-success' : (totalBoxValue == 100),
									}"
									role="progressbar"
									aria-valuemin="0"
									aria-valuemax="100"
									v-bind:style="{ width: totalBoxValue + '%' }"
									></div>
								</div>
								<span>{{totalBoxValue}}% used</span>
							</div>
						</div>

						<form action="#" class="search-sort input-group search-bar navbar-form">
							<div class="row">
								<div class="col-md-3">
									<div class="search-top-container">
										<div class="searchbox">
											<div class="search">
												<input type="text" class="input-group-field input__field-2" placeholder="Search" v-model="search" @input="searchProduct">
												<span class="input-group-btn">
													<button type="submit" class="" value="Search"></button>
												</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-5">
									<p>Add or remove items from your box to complete your order.</p>
								</div>
								<div class="col-md-4 seasonal-sortby">
									<label for="sort-by"> Sort by: </label>
									<div class="sortby-outer">
										<v-select 
										id="sortby" 
										:reduce="sort => sort.value" 
										:searchable="false"
										label="name"
										v-model="sortby"
										:options="sortbyOptions" 
										@input="onChangeSort"></v-select>
									</div>
								</div>
							</div>
						</form>

						<div class="row">
							<div class="col-md-3">
								<div class="to-be-replaced">
									<h2>Items to be replaced</h2>
									<ul>
										<li v-for="product in removed">
											<product :data="product"></product>
										</li>
									</ul>
								</div>
							</div>
							<div class="col-md-9">
								<div class="replace-options">
									<h2>Replacement options</h2>
									<div class="row">
										<div class="col-sm-4" v-for="product in searchProducts.data">
											<product 
											:data="product" 
											:added="addedProducts" 
											@on-add-to-cart="addProductToSeasonalBox"
											@on-remove-item="removeProductFromBox"></product>
										</div>
									</div>
									<button type="button" class="btn btn-primary" v-if="hasLoadMore" @click="loadMoreProducts">Load More</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import axios from 'axios'
	import Product from './Product.vue'
	import vSelect from 'vue-select'
	import 'vue-select/dist/vue-select.css';

	export default {
		components: {
			'product' : Product,
			vSelect
		},
		props: {
			open: {
				type: Boolean,
				default: false,
			},
			products: {
				type: Array,
				default: [],
			},
			removed: {
				type: Array,
				default: [],
			},
			title: {
				type: String,
				default: '',
			},
			price: {
				type: Number,
				default: 0,
			},
			placeholderUrl: {
				type: String,
				default: 0,
			}
		},
		data() {
			return {
				search: '',
				sortby: 'atoz',
				searchProducts: {
					current_page: 1,
					data: [],
					last_page: 1,
				},
				addedProducts: [],
				sortbyOptions: [
				{
					value: 'price',
					name: 'Price',
				},
				{
					value: 'recent',
					name: 'Most recent',
				},
				{
					value: 'atoz',
					name: 'Alphabetical (A to Z)',
				},
				{
					value: 'ztoa',
					name: 'Alphabetical (Z to A)',
				},
				]
			}
		},
		mounted() {
			this.getProducts();
		},
		computed: {
			hasLoadMore: function(){
				return (this.searchProducts.data.length > 0 && this.searchProducts.current_page !== this.searchProducts.last_page);
			},
			totalBoxValue: function()
			{
				let products = _.union(this.addedProducts, _.differenceBy(this.products, this.removed, 'id'));
				let total = _.sumBy(products, p => p.price * p.quantity);

				return ( ( total * 100 * 100)/ this.price ).toFixed(2); 
			}
		},
		methods: {
			completeBox: function(e)
			{
				e.preventDefault();
				this.$emit('add-item',this.addedProducts);
			},
			removeProductFromBox: function(product)
			{
				product.quantity = 0;
				this.addedProducts = _.filter(this.addedProducts, p => p.id !== product.id);
			},
			addProductToSeasonalBox: function(product)
			{
				let index = _.findIndex(this.addedProducts, { 'id': product.id });
				if(index === -1){
					this.addedProducts.push(product);
				} else {
					this.addedProducts[index] = product;
				}
			},
			toggleBodyClass: function(addRemoveClass, className) {
				const el = document.body;
				if (addRemoveClass === 'addClass') {
					el.classList.add(className);
				} else {
					el.classList.remove(className);
				}
			},
			searchProduct: _.debounce(function (e) {
				this.getProducts();
			}, 300),
			getProducts: function()
			{
				this.$Progress.start()
				let params = {
					params: {
						keyword: this.search,
						sortby: this.sortby,
					}
				};

				axios.get(window.apiUrl + 'seasonal-box/search-product',params)
				.then((res) => {
					res.data.data = this.getFormatedProduct(res.data.data);
					this.searchProducts = res.data;
					this.$Progress.finish()

				}).catch((err)=>{
					this.$toasted.error('Something went wrong. Please try again.');
					this.$Progress.fail()
				});
			},
			getFormatedProduct(arr){
				let $this = this;
				return _.map(arr, function(item) {
					return { 
						id: item.product_id.replace('gid://shopify/Product/', ''),
						quantity: 0,
						price: item.price,
						image: item.fullImageUrl !== null ? item.fullImageUrl : $this.placeholderUrl,
						tags: [],
						title: item.title
					};
				});
			},
			onChangeSort: function(val)
			{
				this.$Progress.start()
				let params = {
					params: {
						keyword: this.search,
						sortby: val,
					}
				};


				axios.get(window.apiUrl + 'seasonal-box/search-product',params)
				.then((res) => {
					res.data.data = this.getFormatedProduct(res.data.data);
					this.searchProducts = res.data;
					this.$Progress.finish()
				}).catch((err)=>{
					this.$toasted.error('Something went wrong. Please try again.');
					this.$Progress.fail()
				});
			},
			loadMoreProducts: function()
			{
				this.$Progress.start()
				let params = {
					params: {
						keyword: this.search,
						page: ++this.searchProducts.current_page,
						sortby: this.sortby,
					}
				};

				axios.get(window.apiUrl + 'seasonal-box/search-product',params)
				.then((res) => {
					let item = this.getFormatedProduct(res.data.data);
					this.searchProducts.data = _.concat(this.searchProducts.data, item);
					this.$Progress.finish()
				}).catch((err)=>{
					this.$toasted.error('Something went wrong. Please try again.');
					this.$Progress.fail()
				});
			}
		}
	}
</script>