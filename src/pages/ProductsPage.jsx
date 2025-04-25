import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reference: '',
    name: '',
    type: 'finished',
    unit: 'pcs'
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products'); // Doit correspondre à votre route backend
      console.log('Réponse API:', res.data); // Debug
      setProducts(res.data);
    } catch (err) {
      console.error('Détails de l\'erreur:', {
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      await fetchProducts();
      setShowModal(false);
      setFormData({
        reference: '',
        name: '',
        type: 'finished',
        unit: 'pcs'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Gestion des Produits</h2>
        <Button onClick={() => setShowModal(true)}>
          Créer Produit
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Unité</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.reference}</td>
                <td>{product.name}</td>
                <td>
                  {product.type === 'raw' ? 'Matière Première' : 
                   product.type === 'component' ? 'Composant' : 'Produit Fini'}
                </td>
                <td>{product.unit}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nouveau Produit</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Référence *</Form.Label>
              <Form.Control 
                required
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nom *</Form.Label>
              <Form.Control 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="finished">Produit Fini</option>
                <option value="component">Composant</option>
                <option value="raw">Matière Première</option>
              </Form.Select>
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
};

export default ProductsPage;