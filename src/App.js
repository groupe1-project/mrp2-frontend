import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    stock: 0,
    allocated: 0,
    location: ''
  });
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Récupérer les produits existants
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(response => setProducts(response.data))
      .catch(error => {
        console.error('Erreur:', error);
        setError("Impossible de charger les produits");
      });
  };

  // Gérer les changements dans les inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'allocated' ? parseInt(value) || 0 : value
    }));
  };

  // Calculer le disponible automatiquement
  const calculateAvailable = (stock, allocated) => stock - allocated;

  // Ajouter ou modifier un produit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const productData = {
      ...newProduct,
      available: calculateAvailable(newProduct.stock, newProduct.allocated)
    };

    const request = editingId 
      ? axios.put(`http://localhost:5000/api/products/${editingId}`, productData)
      : axios.post('http://localhost:5000/api/products', productData);

    request.then(() => {
      alert(`Produit ${editingId ? 'modifié' : 'ajouté'} avec succès !`);
      fetchProducts();
      setNewProduct({ code: '', name: '', stock: 0, allocated: 0, location: '' });
      setEditingId(null);
    })
    .catch(error => {
      console.error('Erreur:', error);
      setError(error.response?.data?.error || "Une erreur est survenue");
    });
  };

  // Pré-remplir le formulaire pour modification
  const handleEdit = (product) => {
    setNewProduct({
      code: product.code,
      name: product.name,
      stock: product.stock,
      allocated: product.allocated,
      location: product.location
    });
    setEditingId(product.id);
  };

  // Supprimer un produit
  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      axios.delete(`http://localhost:5000/api/products/${id}`)
        .then(() => fetchProducts())
        .catch(error => setError("Impossible de supprimer le produit"));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Gestion des Stocks MRP2</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Modifier un produit" : "Ajouter un nouveau produit"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code*</label>
            <input
              type="text"
              name="code"
              value={newProduct.code}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom*</label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
            <input
              type="number"
              name="stock"
              value={newProduct.stock}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alloué</label>
            <input
              type="number"
              name="allocated"
              value={newProduct.allocated}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
            <input
              type="text"
              name="location"
              value={newProduct.location}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setNewProduct({ code: '', name: '', stock: 0, allocated: 0, location: '' });
                setEditingId(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingId ? "Modifier" : "Ajouter"} le produit
          </button>
        </div>
      </form>

      {/* Tableau des produits */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border text-left">Code</th>
              <th className="py-3 px-4 border text-left">Produit</th>
              <th className="py-3 px-4 border text-left">Stock</th>
              <th className="py-3 px-4 border text-left">Alloué</th>
              <th className="py-3 px-4 border text-left">Disponible</th>
              <th className="py-3 px-4 border text-left">Emplacement</th>
              <th className="py-3 px-4 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{product.code}</td>
                <td className="py-2 px-4 border">{product.name}</td>
                <td className="py-2 px-4 border">{product.stock}</td>
                <td className="py-2 px-4 border">{product.allocated}</td>
                <td className="py-2 px-4 border">{product.available}</td>
                <td className="py-2 px-4 border">{product.location}</td>
                <td className="py-2 px-4 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;