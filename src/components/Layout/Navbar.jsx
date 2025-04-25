import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">MRP2</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar" />
        <Navbar.Collapse id="basic-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/stock">Stock</Nav.Link>
            <Nav.Link as={Link} to="/nomenclature">Nomenclatures</Nav.Link>
            <Nav.Link as={Link} to="/forecast">Prévisions</Nav.Link>
            <Nav.Link as={Link} to="/products">Produits</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}