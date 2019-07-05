<template>
	<div v-if="showModal">
		<transition name="modal">
			<div class="modal-mask">
				<div class="modal-wrapper">
					<div class="modal-dialog modal-sm modal-dialog-centered" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title" id="exampleModalLabel">Copy plan to another day</h5>
								<button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('closeModal')">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								<span class="m-form__help">Select the day you want to copy the recipes and ingridents for this meal to.</span>
								<span class="m-form__help"><strong>Note: Copying will override the meals already entered.</strong></span>
								<br />
								<label for="recipient-name" class="form-control-label">Days:</label>
								<select class="form-control m-input m-input--square" v-model="days">
									<option value="1">Day 1</option>
									<option value="2">Day 2</option>
									<option value="3">Day 3</option>
									<option value="4">Day 4</option>
									<option value="5">Day 5</option>
									<option value="6">Day 6</option>
									<option value="7">Day 7</option>
								</select>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-primary" @click="submitCopyDay">Copy</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>
<script>
	export default {
		name: 'CopyMealPlan',
		props: {
			copy: {type: Object},
			day: {type: Number},
			showModal: { type: Boolean},
		},
		data(){
			return {
				days : 1,
			}
		},
		methods: {
			submitCopyDay(){
				this.$emit('selected', this.copy, this.days);
			}
		}
	}
</script>
<style scoped>
.modal-mask {
	position: fixed;
	z-index: 9998;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, .5);
	display: table;
	transition: opacity .3s ease;
}

.modal-wrapper {
	display: table-cell;
	vertical-align: middle;
}

.form-control-feedback {
	font-size: 14px !important;
}
.modal-header .close {
	margin-top: -20px;
}
</style>