<template>
  <div class="stock-management">
    <h2>Gestion de Stock</h2>
    
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>Mouvements de Stock</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="addStockMovement">
              <div class="form-group">
                <label>Produit</label>
                <select v-model="movement.product" class="form-control" required>
                  <option v-for="product in products" :value="product._id" :key="product._id">
                    {{ product.name }} ({{ product.reference }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Quantité</label>
                <input type="number" v-model="movement.quantity" class="form-control" required min="1">
              </div>
              <div class="form-group">
                <label>Type</label>
                <select v-model="movement.type" class="form-control" required>
                  <option value="in">Entrée</option>
                  <option value="out">Sortie</option>
                  <option value="adjustment">Ajustement</option>
                </select>
              </div>
              <div class="form-group">
                <label>Référence</label>
                <input type="text" v-model="movement.reference" class="form-control">
              </div>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </form>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>État des Stocks</h5>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Stock</th>
                  <th>Emplacement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in stockItems" :key="item._id">
                  <td>{{ getProductName(item.product) }}</td>
                  <td :class="{'text-danger': item.quantity < item.safetyStock}">
                    {{ item.quantity }}
                    <span v-if="item.quantity < item.safetyStock" class="badge bg-warning">Stock bas</span>
                  </td>
                  <td>{{ item.location }}</td>
                  <td>
                    <button @click="showStockHistory(item)" class="btn btn-sm btn-info">Historique</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal pour l'historique des mouvements -->
    <div class="modal fade" id="stockHistoryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Historique des mouvements</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h6>{{ selectedProduct ? selectedProduct.name : '' }}</h6>
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantité</th>
                  <th>Référence</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(movement, index) in stockHistory" :key="index">
                  <td>{{ formatDate(movement.date) }}</td>
                  <td>
                    <span :class="{
                      'badge bg-success': movement.type === 'in',
                      'badge bg-danger': movement.type === 'out',
                      'badge bg-secondary': movement.type === 'adjustment'
                    }">
                      {{ movement.type === 'in' ? 'Entrée' : movement.type === 'out' ? 'Sortie' : 'Ajustement' }}
                    </span>
                  </td>
                  <td>{{ movement.quantity }}</td>
                  <td>{{ movement.reference }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import axios from 'axios';

export default {
  name: 'StockManagement',
  data() {
    return {
      products: [],
      stockItems: [],
      stockHistory: [],
      selectedProduct: null,
      movement: {
        product: '',
        quantity: 1,
        type: 'in',
        reference: ''
      },
      stockHistoryModal: null
    };
  },
  async created() {
    await this.fetchProducts();
    await this.fetchStock();
  },
  mounted() {
    this.stockHistoryModal = new Modal(document.getElementById('stockHistoryModal'));
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('/api/products');
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    async fetchStock() {
      try {
        const response = await axios.get('/api/stock');
        this.stockItems = response.data;
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    },
    async addStockMovement() {
      try {
        await axios.post('/api/stock/movements', this.movement);
        this.movement = {
          product: '',
          quantity: 1,
          type: 'in',
          reference: ''
        };
        await this.fetchStock();
        this.$toast.success('Mouvement enregistré avec succès');
      } catch (error) {
        console.error('Error adding stock movement:', error);
        this.$toast.error('Erreur lors de l\'enregistrement du mouvement');
      }
    },
    getProductName(productId) {
      const product = this.products.find(p => p._id === productId);
      return product ? `${product.name} (${product.reference})` : 'N/A';
    },
    async showStockHistory(stockItem) {
      try {
        const response = await axios.get(`/api/stock/${stockItem._id}/history`);
        this.stockHistory = response.data;
        this.selectedProduct = this.products.find(p => p._id === stockItem.product);
        this.stockHistoryModal.show();
      } catch (error) {
        console.error('Error fetching stock history:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.stock-management {
  padding: 20px;
}
.text-danger {
  color: #dc3545;
  font-weight: bold;
}
</style>