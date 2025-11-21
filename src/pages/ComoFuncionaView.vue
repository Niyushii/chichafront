<template>
  <div class="about-container">
    <div class="hero-section">
      <h1>Sobre Nosotros</h1>
      <p>Conectando compradores y vendedores de ropa usada en Sucre</p>
    </div>

    <div class="content-section">
      <div class="mission-section">
        <div class="icon-circle">
          <i class="pi pi-heart"></i>
        </div>
        <h2>Nuestra Misión</h2>
        <p>
          En Chichawasi, creemos en dar una segunda vida a la ropa. Nuestra misión es 
          facilitar la compra y venta de ropa usada de calidad, promoviendo el consumo 
          responsable y la economía circular en Sucre.
        </p>
      </div>

      <div class="values-grid">
        <div class="value-card">
          <i class="pi pi-shield"></i>
          <h3>Confianza</h3>
          <p>Creamos un espacio seguro para compradores y vendedores</p>
        </div>

        <div class="value-card">
          <i class="pi pi-globe"></i>
          <h3>Sostenibilidad</h3>
          <p>Promovemos el consumo responsable y la moda circular</p>
        </div>

        <div class="value-card">
          <i class="pi pi-users"></i>
          <h3>Comunidad</h3>
          <p>Conectamos a personas con intereses similares</p>
        </div>

        <div class="value-card">
          <i class="pi pi-star"></i>
          <h3>Calidad</h3>
          <p>Garantizamos productos de segunda mano en buen estado</p>
        </div>
      </div>

      <div class="story-section">
        <h2>Nuestra Historia</h2>
        <p>
          Chichawasi nació de la necesidad de crear un espacio donde los habitantes de Sucre 
          pudieran comprar y vender ropa usada de manera fácil y segura. Inspirados por el 
          concepto de economía circular y la tradición local de los "chichas" (mercados de 
          segunda mano), desarrollamos esta plataforma para digitalizar y mejorar esta 
          experiencia.
        </p>
        <p>
          Hoy, somos la plataforma líder en Sucre para la compraventa de ropa usada, 
          conectando a cientos de vendedores con miles de compradores que buscan moda 
          sostenible y económica.
        </p>
      </div>

      <div class="team-section">
        <h2>Nuestro Equipo</h2>
        <p>
          Somos un equipo apasionado por la tecnología y la sostenibilidad, trabajando 
          constantemente para mejorar tu experiencia en Chichawasi.
        </p>
      </div>

      <div class="cta-section">
        <h2>¿Listo para empezar?</h2>
        <p>Únete a nuestra comunidad y descubre la nueva forma de comprar ropa</p>
        <div class="cta-buttons">
          <router-link to="/registro" class="btn-primary">
            <i class="pi pi-user-plus"></i>
            <span>Registrarse</span>
          </router-link>
          <router-link to="/como-funciona" class="btn-secondary">
            <i class="pi pi-question-circle"></i>
            <span>Aprende Más</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No necesita lógica adicional por ahora
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
  text-align: center;
  padding: 80px 20px;
  border-radius: 0 0 30px 30px;
  margin-bottom: 60px;
}

.hero-section h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
}

.hero-section p {
  font-size: 1.3rem;
  opacity: 0.95;
}

.content-section {
  padding: 0 20px 60px;
}

.mission-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.icon-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-circle i {
  font-size: 3rem;
  color: white;
}

.mission-section h2 {
  color: var(--cafe);
  font-size: 2rem;
  margin-bottom: 20px;
}

.mission-section p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--gris-oscuro);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.value-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.value-card i {
  font-size: 3rem;
  color: var(--naranja-opaco);
  margin-bottom: 15px;
}

.value-card h3 {
  color: var(--cafe);
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.value-card p {
  color: var(--gris-claro);
  line-height: 1.6;
}

.story-section,
.team-section {
  max-width: 800px;
  margin: 0 auto 60px;
}

.story-section h2,
.team-section h2 {
  color: var(--cafe);
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.story-section p,
.team-section p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--gris-oscuro);
  margin-bottom: 20px;
}

.cta-section {
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  text-align: center;
  padding: 60px 40px;
  border-radius: 20px;
  margin-top: 60px;
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.95;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border-radius: 25px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: white;
  color: var(--cafe);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: var(--cafe);
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section p {
    font-size: 1.1rem;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>