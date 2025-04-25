import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Badge,
  Spinner
} from 'react-bootstrap';
import api from '../services/api';

const NomenclaturePage = () => {
  // Déclaration des états
  const [nomenclatures, setNomenclatures] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    parentProduct: '',
    components: [{ product: '', quantity: 1 }],
    version: '1.0'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, nomenclaturesRes] = await Promise.all([
        api.get('/products'),
        api.get('/nomenclatures')
      ]);
      setProducts(productsRes.data);
      setNomenclatures(nomenclaturesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddComponent = () => {
    setFormData({
      ...formData,
      components: [...formData.components, { product: '', quantity: 1 }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Données du formulaire:', formData);
    
    try {
      console.log('Envoi des données...');
      const response = await api.post('/nomenclatures', formData);
      console.log('Réponse du serveur:', response.data);
      
      await fetchData();
      setShowModal(false);
      setFormData({
        parentProduct: '',
        components: [{ product: '', quantity: 1 }],
        version: '1.0'
      });
      
      console.log('Nomenclature créée avec succès');
    } catch (err) {
      console.error('Erreur complète:', {
        error: err,
        response: err.response,
        request: err.request
      });
      setError(err.response?.data?.message || 'Échec de l\'enregistrement');
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="d-flex justify-content-between mb-4">
        <h2>Gestion des Nomenclatures</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>Nouvelle Nomenclature
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="bg-light">
          <tr>
            <th>Produit</th>
            <th>Version</th>
            <th>Composants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {nomenclatures.map(nomenclature => (
            <tr key={nomenclature._id}>
              <td>
                {nomenclature.parentProduct?.name}
                <div className="text-muted small">{nomenclature.parentProduct?.reference}</div>
              </td>
              <td><Badge bg="info">{nomenclature.version}</Badge></td>
              <td>
                <ul className="list-unstyled mb-0">
                  {nomenclature.components.map((comp, i) => (
                    <li key={i}>
                      {comp.quantity} x {comp.product?.name} ({comp.product?.reference})
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2">
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="outline-danger" size="sm">
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de création */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Créer une nomenclature</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Produit parent</Form.Label>
              <Form.Select
                required
                value={formData.parentProduct}
                onChange={(e) => setFormData({...formData, parentProduct: e.target.value})}
              >
                <option value="">Sélectionner un produit</option>
                {products.filter(p => !nomenclatures.some(n => n.parentProduct._id === p._id))
                  .map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({product.reference})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Composants</h5>
              <Button variant="outline-secondary" size="sm" onClick={handleAddComponent}>
                <i className="fas fa-plus me-1"></i>Ajouter
              </Button>
            </div>

            {formData.components.map((comp, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Label>Produit</Form.Label>
                    <Form.Select
                      required
                      value={comp.product}
                      onChange={(e) => {
                        const newComponents = [...formData.components];
                        newComponents[index].product = e.target.value;
                        setFormData({...formData, components: newComponents});
                      }}
                    >
                      <option value="">Sélectionner un composant</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.reference})
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className="col-md-4">
                    <Form.Label>Quantité</Form.Label>
                    <Form.Control
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={comp.quantity}
                      onChange={(e) => {
                        const newComponents = [...formData.components];
                        newComponents[index].quantity = parseFloat(e.target.value) || 0;
                        setFormData({...formData, components: newComponents});
                      }}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    {index > 0 && (
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          const newComponents = formData.components.filter((_, i) => i !== index);
                          setFormData({...formData, components: newComponents});
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

export default NomenclaturePage;