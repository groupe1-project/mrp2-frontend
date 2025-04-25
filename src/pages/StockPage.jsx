import { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Container } from 'react-bootstrap';
import api from '../services/api';

export default function StockPage() {
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    type: 'in'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stockRes, productsRes] = await Promise.all([
        api.get('/stock'),
        api.get('/products')
      ]);
      setStock(stockRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Erreur de chargement", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/movements', formData);
      fetchData();
      setShowModal(false);
      setFormData({ productId: '', quantity: '', type: 'in' });
    } catch (error) {
      console.error("Erreur d'enregistrement", error);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Gestion de Stock</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Nouveau Mouvement
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Référence</th>
            <th>Quantité</th>
            <th>Dernière Mise à Jour</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item._id}>
              <td>{item.product?.name || 'N/A'}</td>
              <td>{item.product?.reference || 'N/A'}</td>
              <td className={item.quantity < 10 ? 'text-danger fw-bold' : ''}>
                {item.quantity} {item.product?.unit || 'unité(s)'}
              </td>
              <td>{new Date(item.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nouveau Mouvement</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Produit</Form.Label>
              <Form.Select 
                required
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
              >
                <option value="">Sélectionnez un produit</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.reference})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="in">Entrée de stock</option>
                <option value="out">Sortie de stock</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Enregistrer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}