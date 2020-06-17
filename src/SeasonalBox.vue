<template>
	<div class="detail">
		<slot></slot>
		<div class="sb-item" v-for="product in products">
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
					<input min="1" type="number" class="quantity" name="quantity" id="quantity" :value="product.quantity"/>
					<div class="replace-remove">
						<a href="#" class="btn-replace btn btn-primary">Replace</a>
						<a href="#" class="btn-remove btn btn-border">Remove</a>
					</div>
				</div>
			</div>
		</div>
		<a href="#" class="btn btn-primary replace-selected-items">Replace Selected items</a>
	</div>
</template>
<script>
	export default {
		components: {
		},
		props: {
			price: {
				type: Number,
				default: 0.00,
			}
		},
		data() {
			return {
				products : this.$parent.products
			}
		}
	}
</script>