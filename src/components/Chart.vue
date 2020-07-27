<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: ['range'],
  mounted () {
    const dataset = [this.range.cal, this.range.fat, this.range.protein, this.range.carbs];

    this.renderChart({
      labels: ['a', 'b', 'c', 'd'],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: ['#F8AB2B', '#A7D29C', '#248174', '#225244'],
          data: dataset,
        },
      ]
    }, {
      legend: {
        display: false
      },
      tooltips: {
      },
      backgroundColor: 'rgba(255, 255, 255, 1)',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          display: false,
          ticks: {
            beginAtZero: true
          }
        }]
      }
    });
  }
}
</script>

<style>

</style>
