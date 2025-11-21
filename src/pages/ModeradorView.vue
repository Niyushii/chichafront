<!-- src/pages/ModeradorViewCompleto.vue -->
<template>
  <div class="moderador-container">
    <!-- Header -->
    <div class="header">
      <div class="header-info">
        <h1>Panel de Moderador</h1>
        <p>Bienvenido, {{ moderadorData?.username || 'Moderador' }}</p>
      </div>
      <button @click="handleLogout" class="btn-logout">
        <i class="pi pi-sign-out"></i>
        <span>Cerrar Sesión</span>
      </button>
    </div>

    <!-- Tabs de navegación -->
    <div class="tabs">
      <button 
        :class="['tab', { active: vistaActual === 'categorias' }]"
        @click="cambiarVista('categorias')"
      >
        <i class="pi pi-tags"></i>
        <span>Categorías</span>
      </button>
      <button 
        :class="['tab', { active: vistaActual === 'tallas' }]"
        @click="cambiarVista('tallas')"
      >
        <i class="pi pi-clone"></i>
        <span>Tallas</span>
      </button>
      <button 
        :class="['tab', { active: vistaActual === 'usuarios' }]"
        @click="cambiarVista('usuarios')"
      >
        <i class="pi pi-users"></i>
        <span>Usuarios</span>
      </button>
      <button 
        :class="['tab', { active: vistaActual === 'tiendas' }]"
        @click="cambiarVista('tiendas')"
      >
        <i class="pi pi-shop"></i>
        <span>Tiendas</span>
      </button>
      <button 
        :class="['tab', { active: vistaActual === 'productos' }]"
        @click="cambiarVista('productos')"
      >
        <i class="pi pi-shopping-bag"></i>
        <span>Productos</span>
      </button>
      <button 
        :class="['tab', { active: vistaActual === 'auditoria' }]"
        @click="cambiarVista('auditoria')"
      >
        <i class="pi pi-history"></i>
        <span>Registro Usuarios</span>
      </button>
    </div>

    <!-- Mensajes -->
    <div v-if="error" class="mensaje mensaje-error">
      <i class="pi pi-times-circle"></i>
      <span>{{ error }}</span>
      <button @click="error = ''" class="btn-cerrar-mensaje">
        <i class="pi pi-times"></i>
      </button>
    </div>
    <div v-if="success" class="mensaje mensaje-success">
      <i class="pi pi-check-circle"></i>
      <span>{{ success }}</span>
      <button @click="success = ''" class="btn-cerrar-mensaje">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- ==================== VISTA: CATEGORÍAS ==================== -->
    <div v-if="vistaActual === 'categorias'">
      <div class="vista-header">
        <h2><i class="pi pi-tags"></i> Gestión de Categorías</h2>
        <button @click="mostrarFormCrearCategoria = true" class="btn-primario">
          <i class="pi pi-plus"></i>
          <span>Nueva Categoría</span>
        </button>
      </div>

      <!-- Estadísticas Categorías -->
      <div v-if="estadisticasCategorias" class="estadisticas">
        <div class="stat-card stat-total">
          <i class="pi pi-tags"></i>
          <div class="stat-content">
            <h3>{{ estadisticasCategorias.total }}</h3>
            <p>Total</p>
          </div>
        </div>
        <div class="stat-card stat-activos">
          <i class="pi pi-check-circle"></i>
          <div class="stat-content">
            <h3>{{ estadisticasCategorias.activas }}</h3>
            <p>Activas</p>
          </div>
        </div>
        <div class="stat-card stat-info">
          <i class="pi pi-folder"></i>
          <div class="stat-content">
            <h3>{{ estadisticasCategorias.principales }}</h3>
            <p>Principales</p>
          </div>
        </div>
        <div class="stat-card stat-warning">
          <i class="pi pi-sitemap"></i>
          <div class="stat-content">
            <h3>{{ estadisticasCategorias.subcategorias }}</h3>
            <p>Subcategorías</p>
          </div>
        </div>
      </div>

      <!-- Controles -->
      <div class="controles">
        <button 
          @click="cargarDatosCategorias" 
          :disabled="loading" 
          class="btn-secundario btn-actualizar"
          title="Actualizar Datos"
        >
          <i :class="['pi', 'pi-refresh', { 'pi-spin': loading }]"></i>
          <span>Actualizar</span>
      </button>
        <button 
          @click="toggleVistaJerarquia"
          class="btn-secundario"
        >
          <i :class="vistaJerarquia ? 'pi pi-list' : 'pi pi-sitemap'"></i>
          <span>{{ vistaJerarquia ? 'Ver Lista' : 'Ver Jerarquía' }}</span>
        </button>
        <input 
          v-model="busquedaCategorias"
          @input="buscarCategorias"
          type="text"
          placeholder="Buscar categorías..."
          class="input-buscar"
        />
      </div>

      <!-- Vista Jerarquía -->
      <div v-if="vistaJerarquia">
        <div v-if="loading && !jerarquia.length" class="loading">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Cargando jerarquía...</p>
        </div>

        <div v-else class="jerarquia-lista">
          <div 
            v-for="categoria in jerarquia" 
            :key="categoria.id"
            class="jerarquia-item"
          >
            <!-- Categoría Principal -->
            <div class="categoria-principal">
              <div class="categoria-info">
                <span class="categoria-icono">{{ categoria.icono || '📁' }}</span>
                <div class="categoria-detalles">
                  <h3>{{ categoria.nombre }}</h3>
                  <p>{{ categoria.subcategorias?.length || 0 }} subcategorías</p>
                </div>
              </div>
              <div class="categoria-acciones">
                <button 
                  @click="abrirEditarCategoria(categoria)"
                  class="btn-icono btn-editar"
                  title="Editar"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button 
                  @click="confirmarEliminarCategoria(categoria)"
                  class="btn-icono btn-eliminar"
                  title="Eliminar"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Subcategorías -->
            <div 
              v-if="categoria.subcategorias && categoria.subcategorias.length > 0"
              class="subcategorias-lista"
            >
              <div 
                v-for="sub in categoria.subcategorias" 
                :key="sub.id"
                class="subcategoria-item"
              >
                <span class="categoria-icono">{{ sub.icono || '📄' }}</span>
                <span class="subcategoria-nombre">{{ sub.nombre }}</span>
                <div class="categoria-acciones">
                  <button 
                    @click="abrirEditarCategoria(sub)"
                    class="btn-icono-sm btn-editar"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    @click="confirmarEliminarCategoria(sub)"
                    class="btn-icono-sm btn-eliminar"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Lista -->
      <div v-else>
        <div v-if="loading && !categorias.length" class="loading">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Cargando categorías...</p>
        </div>

        <div v-else class="tabla-container">
          <table class="tabla">
            <thead>
              <tr>
                <th>Ícono</th>
                <th>Nombre</th>
                <th>Categoría Padre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="categoria in categorias" :key="categoria.id">
                <td class="td-icono">{{ categoria.icono || '📁' }}</td>
                <td><strong>{{ categoria.nombre }}</strong></td>
                <td>
                  <span v-if="categoria.categoriaPadre">
                    {{ categoria.categoriaPadre.icono }} {{ categoria.categoriaPadre.nombre }}
                  </span>
                  <span v-else class="badge-principal">Principal</span>
                </td>
                <td>
                  <span :class="['badge-estado', `badge-${categoria.estado.nombre}`]">
                    {{ categoria.estado.nombre }}
                  </span>
                </td>
                <td>
                  <div class="acciones-tabla">
                    <button 
                      @click="abrirEditarCategoria(categoria)"
                      class="btn-icono-tabla btn-editar"
                    >
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button 
                      @click="confirmarEliminarCategoria(categoria)"
                      class="btn-icono-tabla btn-eliminar"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-if="!loading && categorias.length === 0" class="sin-datos">
            No hay categorías registradas
          </p>
        </div>
      </div>
    </div>

    <!-- ==================== VISTA: TALLAS ==================== -->
    <div v-if="vistaActual === 'tallas'">
      <div class="vista-header">
        <h2><i class="pi pi-clone"></i> Gestión de Tallas</h2>
        <div class="header-acciones">
          <button @click="mostrarFormCrearTalla = true" class="btn-primario">
            <i class="pi pi-plus"></i>
            <span>Nueva Talla</span>
          </button>
          <button @click="mostrarFormTallasMasivas = true" class="btn-secundario">
            <i class="pi pi-upload"></i>
            <span>Crear Varias</span>
          </button>
        </div>
      </div>

      <!-- Grid de tallas -->
      <div v-if="loading && !tallas.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando tallas...</p>
      </div>

      <div v-else class="tallas-grid">
        <div 
          v-for="talla in tallas" 
          :key="talla.id"
          class="talla-card"
        >
          <div class="talla-nombre">
            <h3>{{ talla.nombre }}</h3>
            <span :class="['badge-estado', `badge-${talla.estado.nombre}`]">
              {{ talla.estado.nombre }}
            </span>
          </div>
          <div class="talla-acciones">
            <button 
              @click="abrirEditarTalla(talla)"
              class="btn-icono btn-editar"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button 
              @click="confirmarEliminarTalla(talla)"
              class="btn-icono btn-eliminar"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <p v-if="!loading && tallas.length === 0" class="sin-datos">
          No hay tallas registradas
        </p>
      </div>
    </div>

    <!-- ==================== VISTA: USUARIOS ==================== -->
    <div v-if="vistaActual === 'usuarios'">
      <div class="vista-header">
        <h2><i class="pi pi-users"></i> Gestión de Usuarios</h2>
      </div>

      <!-- Estadísticas Usuarios -->
      <div v-if="estadisticasUsuarios" class="estadisticas">
        <div class="stat-card stat-total">
          <i class="pi pi-users"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsuarios.total }}</h3>
            <p>Total</p>
          </div>
        </div>
        <div class="stat-card stat-activos">
          <i class="pi pi-check-circle"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsuarios.activos }}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div class="stat-card stat-inactivos">
          <i class="pi pi-times-circle"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsuarios.inactivos }}</h3>
            <p>Inactivos</p>
          </div>
        </div>
        <div class="stat-card stat-vendedores">
          <i class="pi pi-shopping-bag"></i>
          <div class="stat-content">
            <h3>{{ estadisticasUsuarios.vendedores }}</h3>
            <p>Vendedores</p>
          </div>
        </div>
      </div>

      <!-- Controles Usuarios -->
      <div class="controles">
        <input 
          v-model="busquedaUsuarios"
          type="text"
          placeholder="Buscar usuarios por nombre, email o username..."
          class="input-buscar"
        />
        <select v-model="filtroVendedor" class="select-filtro">
          <option :value="null">Todos</option>
          <option :value="true">Solo Vendedores</option>
          <option :value="false">Solo Compradores</option>
        </select>
      </div>

      <!-- Tabla Usuarios -->
      <div v-if="loadingUsuarios && !usuarios.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando usuarios...</p>
      </div>

      <div v-else class="tabla-container">
        <table class="tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Username</th>
              <th>Celular</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
              <td>
                <div class="celda-usuario">
                  <div class="avatar">
                    {{ usuario.nombre[0] }}{{ usuario.apellidos[0] }}
                  </div>
                  <span>{{ usuario.nombre }} {{ usuario.apellidos }}</span>
                </div>
              </td>
              <td>{{ usuario.email }}</td>
              <td>@{{ usuario.username }}</td>
              <td>{{ usuario.celular || '-' }}</td>
              <td>
                <span :class="['badge-tipo', { 'badge-vendedor': usuario.isSeller }]">
                  {{ usuario.isSeller ? 'Vendedor' : 'Comprador' }}
                </span>
              </td>
              <td>
                <span :class="['badge-estado', `badge-${usuario.estado.nombre}`]">
                  {{ usuario.estado.nombre }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!loadingUsuarios && usuarios.length === 0" class="sin-datos">
          No hay usuarios registrados
        </p>
      </div>
    </div>
<!-- ==================== VISTA: TIENDAS ==================== -->
    <div v-if="vistaActual === 'tiendas'">
      <div class="vista-header">
        <h2><i class="pi pi-shop"></i> Gestión de Tiendas</h2>
      </div>

      <!-- Controles Tiendas -->
      <div class="controles">
        <input 
          v-model="busquedaTiendas"
          type="text"
          placeholder="Buscar tiendas..."
          class="input-buscar"
        />
        <button 
          @click="cargarTiendas"
          class="btn-secundario"
          :disabled="loadingTiendas"
        >
          <i :class="['pi', loadingTiendas ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
          <span>Actualizar</span>
        </button>
      </div>

      <!-- Grid Tiendas -->
      <div v-if="loadingTiendas && !tiendas.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando tiendas...</p>
      </div>

      <div v-else class="tiendas-grid">
        <div 
          v-for="tienda in tiendasFiltradas" 
          :key="tienda.id"
          class="tienda-card-mod"
        >
          <div class="tienda-imagen-mod">
            <img 
              v-if="tienda.fotoPerfil" 
              :src="tienda.fotoPerfil" 
              :alt="tienda.nombre"
            />
            <div v-else class="imagen-placeholder">
              <i class="pi pi-shop"></i>
            </div>
          </div>

          <div class="tienda-info-mod">
            <h3>{{ tienda.nombre }}</h3>
            <p class="tienda-propietario">
              <i class="pi pi-user"></i>
              {{ tienda.propietario.nombre }} {{ tienda.propietario.apellidos }}
            </p>
            <p class="tienda-email">
              <i class="pi pi-envelope"></i>
              {{ tienda.propietario.email }}
            </p>
            <div class="tienda-meta">
              <span v-if="tienda.telefono">
                <i class="pi pi-phone"></i>
                {{ tienda.telefono }}
              </span>
              <span :class="['badge-estado', `badge-${tienda.estado.nombre}`]">
                {{ tienda.estado.nombre }}
              </span>
            </div>
          </div>

          <div class="tienda-acciones-mod">
            <button 
              @click="verDetallesTienda(tienda)"
              class="btn-icono btn-ver"
              title="Ver detalles"
            >
              <i class="pi pi-eye"></i>
            </button>

            <button 
              @click="abrirEditarTienda(tienda)"
              class="btn-icono btn-editar"
              title="Editar tienda"
            >
              <i class="pi pi-pencil"></i>
            </button>

            <button 
              @click="confirmarEliminarTienda(tienda)"
              class="btn-icono btn-eliminar"
              title="Eliminar"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <p v-if="!loadingTiendas && tiendas.length === 0" class="sin-datos">
          No hay tiendas registradas
        </p>
      </div>
    </div>

    <!-- ==================== VISTA: PRODUCTOS ==================== -->
    <div v-if="vistaActual === 'productos'">
      <div class="vista-header">
        <h2><i class="pi pi-shopping-bag"></i> Gestión de Productos</h2>
      </div>

      <!-- Controles Productos -->
      <div class="controles">
        <input 
          v-model="busquedaProductos"
          type="text"
          placeholder="Buscar productos..."
          class="input-buscar"
        />
        <button 
          @click="cargarProductos"
          class="btn-secundario"
          :disabled="loadingProductos"
        >
          <i :class="['pi', loadingProductos ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
          <span>Actualizar</span>
        </button>
      </div>

      <!-- Grid Productos -->
      <div v-if="loadingProductos && !productos.length" class="loading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando productos...</p>
      </div>

      <div v-else class="productos-grid-mod">
        <div 
          v-for="producto in productosFiltrados" 
          :key="producto.id"
          class="producto-card-mod"
        >
          <div class="producto-header-mod">
            <div>
              <h3>{{ producto.nombre }}</h3>
              <p v-if="producto.categoria" class="producto-categoria">
                {{ producto.categoria.icono }} {{ producto.categoria.nombre }}
              </p>
            </div>
          </div>

          <p v-if="producto.descripcion" class="producto-descripcion-mod">
            {{ producto.descripcion }}
          </p>

          <!-- Variantes -->
          <div 
            v-if="producto.variantesTienda && producto.variantesTienda.length > 0"
            class="variantes-lista"
          >
            <h4>Variantes:</h4>
            <div 
              v-for="variante in producto.variantesTienda" 
              :key="variante.id"
              class="variante-item"
            >
              <div class="variante-info">
                <span class="variante-tienda">
                  <i class="pi pi-shop"></i>
                  {{ variante.tienda.nombre }}
                </span>
                <span v-if="variante.talla" class="variante-talla">
                  Talla: {{ variante.talla.nombre }}
                </span>
                <span class="variante-precio">
                  Bs {{ formatearPrecio(variante.precio) }}
                </span>
                <span class="variante-stock">
                  Stock: {{ variante.stock }}
                </span>
              </div>
              <button 
                @click="confirmarEliminarProducto(variante)"
                class="btn-icono-sm btn-eliminar"
                title="Eliminar variante"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <p v-if="!loadingProductos && productos.length === 0" class="sin-datos">
          No hay productos registrados
        </p>
      </div>
    </div>

    
    <!-- ==================== MODALES ==================== -->

    <!-- Modal Crear Categoría -->
    <div v-if="mostrarFormCrearCategoria" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h3>Nueva Categoría</h3>
          <button @click="cerrarModalCategoria" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="crearCategoria" class="modal-body">
          <div class="campo">
            <label for="cat-nombre">Nombre *</label>
            <input 
              id="cat-nombre"
              v-model="nuevaCategoria.nombre"
              type="text"
              required
              class="input"
              placeholder="Ej: Poleras"
            />
          </div>
          <div class="campo">
            <label for="cat-icono">Ícono</label>
            <input 
              id="cat-icono"
              v-model="nuevaCategoria.icono"
              type="text"
              class="input"
              placeholder="Ej: 📱"
            />
          </div>
          <div class="campo">
            <label for="cat-padre">Categoría Padre</label>
            <select 
              id="cat-padre"
              v-model="nuevaCategoria.categoriaPadreId"
              class="input"
            >
              <option :value="null">-- Principal --</option>
              <option 
                v-for="cat in categoriasPrincipales" 
                :key="cat.id" 
                :value="cat.id"
              >
                {{ cat.icono }} {{ cat.nombre }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" @click="cerrarModalCategoria" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Creando...' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Categoría -->
    <div v-if="categoriaEditando" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h3>Editar Categoría</h3>
          <button @click="cerrarModalCategoria" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="guardarCategoria" class="modal-body">
          <div class="campo">
            <label for="edit-cat-nombre">Nombre *</label>
            <input 
              id="edit-cat-nombre"
              v-model="categoriaEditando.nombre"
              type="text"
              required
              class="input"
            />
          </div>
          <div class="campo">
            <label for="edit-cat-icono">Ícono</label>
            <input 
              id="edit-cat-icono"
              v-model="categoriaEditando.icono"
              type="text"
              class="input"
            />
          </div>
          <div class="campo">
            <label for="edit-cat-padre">Categoría Padre</label>
            <select 
              id="edit-cat-padre"
              v-model="categoriaEditando.categoriaPadreId"
              class="input"
            >
              <option :value="null">-- Principal --</option>
              <option 
                v-for="cat in categoriasPrincipales.filter(c => c.id !== categoriaEditando.id)" 
                :key="cat.id" 
                :value="cat.id"
              >
                {{ cat.icono }} {{ cat.nombre }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" @click="cerrarModalCategoria" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Crear Talla -->
    <div v-if="mostrarFormCrearTalla" class="modal">
      <div class="modal-contenido modal-pequeno">
        <div class="modal-header">
          <h3>Nueva Talla</h3>
          <button @click="cerrarModalTalla" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="crearTalla" class="modal-body">
          <div class="campo">
            <label for="talla-nombre">Nombre *</label>
            <input 
              id="talla-nombre"
              v-model="nuevaTalla.nombre"
              type="text"
              required
              class="input"
              placeholder="Ej: M, L, XL"
            />
          </div>
          <div class="modal-footer">
            <button type="button" @click="cerrarModalTalla" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Creando...' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Talla -->
    <div v-if="tallaEditando" class="modal">
      <div class="modal-contenido modal-pequeno">
        <div class="modal-header">
          <h3>Editar Talla</h3>
          <button @click="cerrarModalTalla" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="guardarTalla" class="modal-body">
          <div class="campo">
            <label for="edit-talla-nombre">Nombre *</label>
            <input 
              id="edit-talla-nombre"
              v-model="tallaEditando.nombre"
              type="text"
              required
              class="input"
            />
          </div>
          <div class="modal-footer">
            <button type="button" @click="cerrarModalTalla" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loading ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Crear Tallas Masivas -->
    <div v-if="mostrarFormTallasMasivas" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h3>Crear Tallas Masivamente</h3>
          <button @click="cerrarModalTallasMasivas" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="crearTallasMasivas" class="modal-body">
          <div class="campo">
            <label for="tallas-masivas">
              Ingresa las tallas separadas por comas *
            </label>
            <textarea 
              id="tallas-masivas"
              v-model="tallasMasivas"
              rows="5"
              required
              class="input"
              placeholder="Ej: S, M, L, XL, XXL"
            ></textarea>
            <small>Separa cada talla con una coma</small>
          </div>
          <div class="modal-footer">
            <button type="button" @click="cerrarModalTallasMasivas" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="btn-primario">
              <i class="pi pi-upload"></i>
              <span>{{ loading ? 'Creando...' : 'Crear Tallas' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detalles Tienda -->
    <div v-if="tiendaSeleccionada" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h3>Detalles de la Tienda</h3>
          <button @click="tiendaSeleccionada = null" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detalle-tienda">
            <div v-if="tiendaSeleccionada.fotoPerfil" class="detalle-imagen">
              <img :src="tiendaSeleccionada.fotoPerfil" :alt="tiendaSeleccionada.nombre"/>
            </div>
            <h2>{{ tiendaSeleccionada.nombre }}</h2>
            <div class="detalle-info">
              <div class="info-row">
                <strong>Propietario:</strong>
                <span>
                  {{ tiendaSeleccionada.propietario.nombre }} 
                  {{ tiendaSeleccionada.propietario.apellidos }}
                </span>
              </div>
              <div class="info-row">
                <strong>Email:</strong>
                <span>{{ tiendaSeleccionada.propietario.email }}</span>
              </div>
              <div class="info-row">
                <strong>Username:</strong>
                <span>@{{ tiendaSeleccionada.propietario.username }}</span>
              </div>
              <div v-if="tiendaSeleccionada.descripcion" class="info-row">
                <strong>Descripción:</strong>
                <span>{{ tiendaSeleccionada.descripcion }}</span>
              </div>
              <div v-if="tiendaSeleccionada.telefono" class="info-row">
                <strong>Teléfono:</strong>
                <span>{{ tiendaSeleccionada.telefono }}</span>
              </div>
              <div v-if="tiendaSeleccionada.direccion" class="info-row">
                <strong>Dirección:</strong>
                <span>{{ tiendaSeleccionada.direccion }}</span>
              </div>
              <div class="info-row">
                <strong>Estado:</strong>
                <span :class="['badge-estado', `badge-${tiendaSeleccionada.estado.nombre}`]">
                  {{ tiendaSeleccionada.estado.nombre }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Dentro del template, después de tu grid de tiendas -->
    <div v-if="modalEditarTienda" class="modal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>Editar Tienda</h2>
          <button @click="modalEditarTienda = false" class="btn-cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="guardarEdicionTienda" class="modal-body">
          <!-- campos -->
          <div class="campo">
            <label>Nombre *</label>
            <input v-model="formEditarTienda.nombre" class="input" type="text" required />
          </div>
          <div class="campo">
            <label>Descripción</label>
            <textarea v-model="formEditarTienda.descripcion" class="input" rows="3"></textarea>
          </div>
          <div class="campo">
            <label>Teléfono</label>
            <input v-model="formEditarTienda.telefono" class="input" type="tel" />
          </div>
          <div class="campo">
            <label>Dirección</label>
            <input v-model="formEditarTienda.direccion" class="input" type="text" />
          </div>
          <div class="campo">
            <label>Foto de perfil</label>
            <input type="file" accept="image/*" @change="e => formEditarTienda.fotoPerfil = e.target.files[0]" class="input-file" />
          </div>
          <div class="campo">
            <label>Código QR</label>
            <input type="file" accept="image/*" @change="e => formEditarTienda.codigoQr = e.target.files[0]" class="input-file" />
          </div>

          <div class="modal-footer">
            <button type="button" @click="modalEditarTienda = false" class="btn-secundario">Cancelar</button>
            <button type="submit" :disabled="loadingTiendas" class="btn-primario">
              <i class="pi pi-save"></i>
              <span>{{ loadingTiendas ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import categoriasService from '../services/categoriasService'
import { moderadoresService } from '../services/moderadorService'

const router = useRouter()

// Estado general
const moderadorData = ref(null)
const vistaActual = ref('categorias')
const loading = ref(false)
const loadingUsuarios = ref(false)
const loadingTiendas = ref(false)
const loadingProductos = ref(false)
const loadingAuditoria = ref(false)
const error = ref('')
const success = ref('')

// Categorías
const categorias = ref([])
const jerarquia = ref([])
const categoriasPrincipales = ref([])
const vistaJerarquia = ref(false)
const busquedaCategorias = ref('')
const mostrarFormCrearCategoria = ref(false)
const categoriaEditando = ref(null)
const nuevaCategoria = ref({
  nombre: '',
  icono: '',
  categoriaPadreId: null
})

// Tallas
const tallas = ref([])
const mostrarFormCrearTalla = ref(false)
const mostrarFormTallasMasivas = ref(false)
const tallaEditando = ref(null)
const nuevaTalla = ref({ nombre: '' })
const tallasMasivas = ref('')

// Usuarios
const usuarios = ref([])
const estadisticasUsuarios = ref(null)
const busquedaUsuarios = ref('')
const filtroVendedor = ref(null)

// Tiendas
const tiendas = ref([])
const busquedaTiendas = ref('')
const tiendaSeleccionada = ref(null)
// 🔵 Edición de Tienda
const tiendaEditando = ref(null)
const modalEditarTienda = ref(false)

const formEditarTienda = ref({
  nombre: "",
  descripcion: "",
  telefono: "",
  direccion: "",
  fotoPerfil: null,
  codigoQr: null
})
const tiendaIdEditando = ref(null)


// Productos
const productos = ref([])
const busquedaProductos = ref('')

// Auditoría
const auditorias = ref([])

// Computed
const estadisticasCategorias = computed(() => {
  if (!categorias.value.length) return null
  return {
    total: categorias.value.length,
    activas: categorias.value.filter(c => c.estado?.nombre === 'activo').length,
    principales: categorias.value.filter(c => !c.categoriaPadre).length,
    subcategorias: categorias.value.filter(c => c.categoriaPadre).length
  }
})

const usuariosFiltrados = computed(() => {
  let filtrados = usuarios.value

  if (filtroVendedor.value !== null) {
    filtrados = filtrados.filter(u => u.isSeller === filtroVendedor.value)
  }

  if (busquedaUsuarios.value) {
    const busqueda = busquedaUsuarios.value.toLowerCase()
    filtrados = filtrados.filter(u => 
      u.nombre.toLowerCase().includes(busqueda) ||
      u.apellidos.toLowerCase().includes(busqueda) ||
      u.email.toLowerCase().includes(busqueda) ||
      u.username.toLowerCase().includes(busqueda)
    )
  }

  return filtrados
})

const tiendasFiltradas = computed(() => {
  if (!busquedaTiendas.value) return tiendas.value
  
  const busqueda = busquedaTiendas.value.toLowerCase()
  return tiendas.value.filter(t => 
    t.nombre.toLowerCase().includes(busqueda) ||
    t.propietario.nombre.toLowerCase().includes(busqueda) ||
    t.propietario.email.toLowerCase().includes(busqueda)
  )
})

const productosFiltrados = computed(() => {
  if (!busquedaProductos.value) return productos.value
  
  const busqueda = busquedaProductos.value.toLowerCase()
  return productos.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
  )
})

onMounted(() => {
  moderadorData.value = authService.getUserData()
  cargarCategorias()
  cargarCategoriasPrincipales()
})

// Funciones de cambio de vista
const cambiarVista = async (vista) => {
  vistaActual.value = vista
  
  if (vista === 'tallas' && tallas.value.length === 0) {
    await cargarTallas()
  } else if (vista === 'usuarios' && usuarios.value.length === 0) {
    await cargarUsuarios()
    await cargarEstadisticasUsuarios()
  } else if (vista === 'tiendas' && tiendas.value.length === 0) {
    await cargarTiendas()
  } else if (vista === 'productos' && productos.value.length === 0) {
    await cargarProductos()
  } else if (vista === 'auditoria' && auditorias.value.length === 0) {
    await cargarAuditoria()
  }
}
// Funciones de Categorías
const actualizarCategoriasVista = async () => {
    await cargarCategorias() 
    await cargarCategoriasPrincipales()
    if (vistaJerarquia.value) {
        await cargarJerarquia()
    }
}

const cargarCategorias = async () => {
  loading.value = true
  try {
    categorias.value = await categoriasService.obtenerTodasCategorias(true, false)
  } catch (err) {
    mostrarError(err.message)
  } finally {
    loading.value = false
  }
}

const cargarCategoriasPrincipales = async () => {
  try {
    categoriasPrincipales.value = await categoriasService.obtenerCategoriasPrincipales()
  } catch (err) {
    console.error('Error al cargar categorías principales:', err)
  }
}

const cargarJerarquia = async () => {
  loading.value = true
  try {
    jerarquia.value = await categoriasService.obtenerJerarquia()
  } catch (err) {
    mostrarError(err.message)
  } finally {
    loading.value = false
  }
}

const toggleVistaJerarquia = async () => {
  vistaJerarquia.value = !vistaJerarquia.value
  if (vistaJerarquia.value && jerarquia.value.length === 0) {
    await cargarJerarquia()
  }
}

const buscarCategorias = async () => {
  if (busquedaCategorias.value.trim() === '') {
    await cargarCategorias()
    return
  }

  loading.value = true
  try {
    categorias.value = await categoriasService.buscarCategorias(busquedaCategorias.value)
  } catch (err) {
    mostrarError(err.message)
  } finally {
    loading.value = false
  }
}

const crearCategoria = async () => {
  loading.value = true
  try {
    const input = {
      nombre: nuevaCategoria.value.nombre,
      ...(nuevaCategoria.value.icono && { icono: nuevaCategoria.value.icono }),
      ...(nuevaCategoria.value.categoriaPadreId && { 
        categoriaPadreId: nuevaCategoria.value.categoriaPadreId 
      })
    }

    const result = await categoriasService.crearCategoria(input)
    mostrarExito(result.mensaje)
    cerrarModalCategoria()
    busquedaCategorias.value = ''
    await cargarCategorias()
    await cargarCategoriasPrincipales()
    if (vistaJerarquia.value) await cargarJerarquia()
  } catch (err) {
    mostrarError(err.message)
  } finally {
    loading.value = false
  }
}

const abrirEditarCategoria = (categoria) => {
  categoriaEditando.value = {
    id: categoria.id,
    nombre: categoria.nombre,
    icono: categoria.icono || '',
    categoriaPadreId: categoria.categoriaPadre?.id || null
  }
}

const guardarCategoria = async () => {
  loading.value = true
  try {
    const { id, ...input } = categoriaEditando.value
    const result = await categoriasService.editarCategoria(id, input)
    mostrarExito(result.mensaje)
    cerrarModalCategoria()
    await cargarCategorias()
    await cargarCategoriasPrincipales()
    if (vistaJerarquia.value) await cargarJerarquia()
  } catch (err) {
    mostrarError(err.message)
  } finally {
    loading.value = false
  }
}

const confirmarEliminarCategoria = async (categoria) => {
  if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
    return
  }

  loading.value = true
  try {
    const result = await categoriasService.eliminarCategoria(categoria.id)
    mostrarExito(result.mensaje)
    await cargarCategorias()
    await cargarCategoriasPrincipales()
    if (vistaJerarquia.value) await cargarJerarquia()
  } catch (err) {
    mostrarError(err.message)
  } finally {
    loading.value = false
  }
}

const cerrarModalCategoria = () => {
  mostrarFormCrearCategoria.value = false
  categoriaEditando.value = null
  nuevaCategoria.value = {
    nombre: '',
    icono: '',
    categoriaPadreId: null
  }
}


// Funciones de Tallas
const cargarTallas = async () => {
  loading.value = true
  const result = await moderadoresService.obtenerTallas()
  loading.value = false

  if (result.success) {
    tallas.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const crearTalla = async () => {
  loading.value = true
  const result = await moderadoresService.crearTalla({ 
    nombre: nuevaTalla.value.nombre 
  })
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    cerrarModalTalla()
    await cargarTallas()
  } else {
    mostrarError(result.error)
  }
}

const abrirEditarTalla = (talla) => {
  tallaEditando.value = {
    id: talla.id,
    nombre: talla.nombre
  }
}

const guardarTalla = async () => {
  loading.value = true
  const { id, ...input } = tallaEditando.value
  const result = await moderadoresService.editarTalla(id, input)
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    cerrarModalTalla()
    await cargarTallas()
  } else {
    mostrarError(result.error)
  }
}

const confirmarEliminarTalla = async (talla) => {
  if (!confirm(`¿Estás seguro de eliminar la talla "${talla.nombre}"?`)) {
    return
  }

  loading.value = true
  const result = await moderadoresService.eliminarTalla(talla.id)
  loading.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    await cargarTallas()
  } else {
    mostrarError(result.error)
  }
}

const crearTallasMasivas = async () => {
  const nombres = tallasMasivas.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== '')

  if (nombres.length === 0) {
    mostrarError('Debes ingresar al menos una talla')
    return
  }

  loading.value = true
  const result = await moderadoresService.crearTallasMasivas(nombres)
  loading.value = false

  if (result.success) {
    let mensaje = result.data.mensaje
    if (result.data.errores && result.data.errores.length > 0) {
      mensaje += '\n\nAdvertencias:\n' + result.data.errores.join('\n')
    }
    mostrarExito(mensaje)
    cerrarModalTallasMasivas()
    await cargarTallas()
  } else {
    mostrarError(result.error)
  }
}

const cerrarModalTalla = () => {
  mostrarFormCrearTalla.value = false
  tallaEditando.value = null
  nuevaTalla.value = { nombre: '' }
}

const cerrarModalTallasMasivas = () => {
  mostrarFormTallasMasivas.value = false
  tallasMasivas.value = ''
}

// Funciones de Usuarios
const cargarUsuarios = async () => {
  loadingUsuarios.value = true
  const result = await moderadoresService.obtenerTodosUsuarios(true)
  loadingUsuarios.value = false

  if (result.success) {
    usuarios.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const cargarEstadisticasUsuarios = async () => {
  const result = await moderadoresService.obtenerEstadisticasUsuarios()
  if (result.success) {
    estadisticasUsuarios.value = result.data
  }
}

// Funciones de Tiendas
const cargarTiendas = async () => {
  loadingTiendas.value = true
  const result = await moderadoresService.obtenerTodasTiendas()
  loadingTiendas.value = false

  if (result.success) {
    tiendas.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const verDetallesTienda = (tienda) => {
  tiendaSeleccionada.value = tienda
}

const confirmarEliminarTienda = async (tienda) => {
  if (!confirm(`¿Estás seguro de eliminar la tienda "${tienda.nombre}"?\n\nEsto también eliminará todos sus productos.`)) {
    return
  }

  loadingTiendas.value = true
  const result = await moderadoresService.eliminarTienda(tienda.id)
  loadingTiendas.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    await cargarTiendas()
  } else {
    mostrarError(result.error)
  }
}

const abrirEditarTienda = (tienda) => {
  tiendaEditando.value = tienda

  formEditarTienda.value = {
    nombre: tienda.nombre || "",
    descripcion: tienda.descripcion || "",
    telefono: tienda.telefono || "",
    direccion: tienda.direccion || "",
    fotoPerfil: null,
    codigoQr: null
  }

  modalEditarTienda.value = true
}
const guardarEdicionTienda = async () => {
  if (!tiendaEditando.value) return
  const input = {
    nombre: formEditarTienda.value.nombre,
    descripcion: formEditarTienda.value.descripcion,
    telefono: formEditarTienda.value.telefono,
    direccion: formEditarTienda.value.direccion
  }
  const response = await moderadoresService.editar(
    tiendaEditando.value.id,
    input,
    formEditarTienda.value.fotoPerfil,
    formEditarTienda.value.codigoQr
  )
  if (response.success) {
    // asumiendo que tienes toast o algo
    // this.$toast.success("Tienda actualizada correctamente")
    modalEditarTienda.value = false
    cargarTiendas()
  } else {
    // this.$toast.error("Error: " + response.error)
    console.error("Error al editar tienda:", response.error)
  }
}



// Funciones de Productos
const cargarProductos = async () => {
  loadingProductos.value = true
  const result = await moderadoresService.obtenerTodosProductos(100, 0)
  loadingProductos.value = false

  if (result.success) {
    productos.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const confirmarEliminarProducto = async (variante) => {
  if (!confirm(`¿Estás seguro de eliminar esta variante del producto?`)) {
    return
  }

  loadingProductos.value = true
  const result = await moderadoresService.eliminarProducto(variante.id)
  loadingProductos.value = false

  if (result.success) {
    mostrarExito(result.data.mensaje)
    await cargarProductos()
  } else {
    mostrarError(result.error)
  }
}

// Funciones de Auditoría
const cargarAuditoria = async () => {
  loadingAuditoria.value = true
  const result = await moderadoresService.obtenerAuditoria()
  loadingAuditoria.value = false

  if (result.success) {
    auditorias.value = result.data
  } else {
    mostrarError(result.error)
  }
}

const getAuditoriaIcon = (accion) => {
  const iconos = {
    'crear_categoria': 'pi-tag',
    'editar_categoria': 'pi-pencil',
    'eliminar_categoria': 'pi-trash',
    'crear_talla': 'pi-plus-circle',
    'editar_talla': 'pi-pencil',
    'eliminar_talla': 'pi-trash',
    'crear_tallas_masivas': 'pi-upload',
    'eliminar_tienda': 'pi-shop',
    'eliminar_producto': 'pi-shopping-bag',
    'editar_producto': 'pi-pencil',
    'default': 'pi-info-circle'
  }
  return `pi ${iconos[accion] || iconos.default}`
}

const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  const opciones = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return date.toLocaleDateString('es-ES', opciones)
}

const formatearPrecio = (precio) => {
  return parseFloat(precio).toFixed(2)
}

// Utilidades
const mostrarError = (mensaje) => {
  error.value = mensaje
  setTimeout(() => error.value = '', 5000)
}

const mostrarExito = (mensaje) => {
  success.value = mensaje
  setTimeout(() => success.value = '', 3000)
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.moderador-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  border-radius: 15px;
  color: white;
}

.header-info h1 {
  margin: 0 0 5px 0;
  font-size: 2rem;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: white;
  color: var(--cafe);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--crema);
  flex-wrap: wrap;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  color: var(--gris-claro);
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tab:hover {
  color: var(--cafe);
}

.tab.active {
  color: var(--cafe);
  border-bottom-color: var(--naranja-opaco);
}

/* Mensajes */
.mensaje {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  position: relative;
}

.mensaje-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.mensaje-success {
  background-color: #efe;
  color: #3a3;
  border: 1px solid #cfc;
}

.btn-cerrar-mensaje {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.btn-cerrar-mensaje:hover {
  opacity: 1;
}

/* Vista Header */
.vista-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.vista-header h2 {
  color: var(--cafe);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
}

.header-acciones {
  display: flex;
  gap: 10px;
}

/* Estadísticas */
.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: white;
  border-radius: 15px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.stat-card i {
  font-size: 3rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2.5rem;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: var(--gris-claro);
  font-size: 0.9rem;
}

.stat-total {
  border-color: var(--cafe);
}

.stat-total i {
  color: var(--cafe);
}

.stat-activos {
  border-color: #4CAF50;
}

.stat-activos i {
  color: #4CAF50;
}

.stat-inactivos {
  border-color: #f44336;
}

.stat-inactivos i {
  color: #f44336;
}

.stat-info {
  border-color: #2196F3;
}

.stat-info i {
  color: #2196F3;
}

.stat-warning {
  border-color: #FF9800;
}

.stat-warning i {
  color: #FF9800;
}

.stat-vendedores {
  border-color: var(--naranja-opaco);
}

.stat-vendedores i {
  color: var(--naranja-opaco);
}

/* Controles */
.controles {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-primario, .btn-secundario {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-primario {
  background: linear-gradient(135deg, var(--cafe), var(--naranja-opaco));
  color: white;
}

.btn-primario:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(111, 72, 39, 0.4);
}

.btn-secundario {
  background: transparent;
  color: var(--cafe);
  border: 2px solid var(--cafe);
}

.btn-secundario:hover {
  background: var(--cafe);
  color: white;
}

.btn-primario:disabled, .btn-secundario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-buscar {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-buscar:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

.select-filtro {
  padding: 12px 20px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-filtro:focus {
  outline: none;
  border-color: var(--naranja-opaco);
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--gris-claro);
}

.loading i {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* Jerarquía */
.jerarquia-lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.jerarquia-item {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
}

.categoria-principal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
}

.categoria-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.categoria-icono {
  font-size: 2rem;
}

.categoria-detalles h3 {
  margin: 0 0 5px 0;
  color: var(--cafe);
}

.categoria-detalles p {
  margin: 0;
  color: var(--gris-claro);
  font-size: 0.9rem;
}

.categoria-acciones {
  display: flex;
  gap: 8px;
}

.subcategorias-lista {
  padding: 15px 20px 15px 60px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subcategoria-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-left: 3px solid var(--naranja-opaco);
  border-radius: 8px;
}

.subcategoria-nombre {
  flex: 1;
  color: var(--cafe);
  font-weight: 600;
}

/* Tabla */
.tabla-container {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla thead {
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
}

.tabla th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
}

.tabla tbody tr {
  border-bottom: 1px solid var(--crema);
  transition: background 0.3s ease;
}

.tabla tbody tr:hover {
  background: var(--crema);
}

.tabla td {
  padding: 15px;
}

.td-icono {
  font-size: 1.8rem;
  text-align: center;
}

.celda-usuario {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.badge-estado {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-activo {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-inactivo {
  background: #ffebee;
  color: #c62828;
}

.badge-principal {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1976d2;
}

.badge-tipo {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1976d2;
}

.badge-vendedor {
  background: #f3e5f5;
  color: #7b1fa2;
}

.acciones-tabla {
  display: flex;
  gap: 8px;
}

.btn-icono, .btn-icono-sm, .btn-icono-tabla {
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: var(--crema);
  color: var(--cafe);
}

.btn-icono {
  width: 36px;
  height: 36px;
}

.btn-icono-sm {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
}

.btn-icono-tabla {
  width: 32px;
  height: 32px;
}

.btn-icono:hover, .btn-icono-sm:hover, .btn-icono-tabla:hover {
  transform: scale(1.1);
}

.btn-editar:hover {
  background: #2196F3;
  color: white;
}

.btn-eliminar:hover {
  background: #f44336;
  color: white;
}

.btn-ver:hover {
  background: var(--naranja-opaco);
  color: white;
}

/* Tallas Grid */
.tallas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.talla-card {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: all 0.3s ease;
}

.talla-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.talla-nombre {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.talla-nombre h3 {
  margin: 0;
  color: var(--cafe);
  font-size: 2rem;
  text-align: center;
}

.talla-acciones {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Tiendas Grid */
.tiendas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.tienda-card-mod {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.tienda-card-mod:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(111, 72, 39, 0.2);
  border-color: var(--naranja-opaco);
}

.tienda-imagen-mod {
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  display: flex;
  align-items: center;
  justify-content: center;
}

.tienda-imagen-mod img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagen-placeholder {
  color: white;
  font-size: 3rem;
}

.tienda-info-mod {
  padding: 20px;
}

.tienda-info-mod h3 {
  color: var(--cafe);
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.tienda-propietario,
.tienda-email {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 5px 0;
  color: var(--gris-oscuro);
  font-size: 0.9rem;
}

.tienda-propietario i,
.tienda-email i {
  color: var(--naranja-opaco);
}

.tienda-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
}

.tienda-meta span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.tienda-acciones-mod {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

/* Productos Grid */
.productos-grid-mod {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.producto-card-mod {
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  padding: 20px;
  transition: all 0.3s ease;
}

.producto-card-mod:hover {
  border-color: var(--naranja-opaco);
  box-shadow: 0 4px 12px rgba(111, 72, 39, 0.1);
}

.producto-header-mod h3 {
  margin: 0 0 5px 0;
  color: var(--cafe);
}

.producto-categoria {
  margin: 0;
  color: var(--gris-claro);
  font-size: 0.9rem;
}

.producto-descripcion-mod {
  margin: 10px 0;
  color: var(--gris-oscuro);
  font-size: 0.9rem;
  line-height: 1.4;
}

.variantes-lista {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--crema);
}

.variantes-lista h4 {
  margin: 0 0 10px 0;
  color: var(--cafe);
  font-size: 0.95rem;
}

.variante-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.variante-info {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.variante-tienda,
.variante-talla,
.variante-precio,
.variante-stock {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: var(--gris-oscuro);
}

.variante-precio {
  color: var(--cafe);
  font-weight: 700;
  font-size: 1rem;
}

.variante-stock {
  color: var(--gris-claro);
}

/* Auditoría */
.auditoria-lista {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auditoria-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 2px solid var(--cafe-claro);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.auditoria-item:hover {
  border-color: var(--naranja-opaco);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.auditoria-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cafe-claro), var(--naranja-opaco));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.auditoria-content {
  flex: 1;
}

.auditoria-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.auditoria-header-item strong {
  color: var(--cafe);
  text-transform: capitalize;
}

.auditoria-fecha {
  color: var(--gris-claro);
  font-size: 0.85rem;
}

.auditoria-descripcion {
  margin: 0 0 10px 0;
  color: var(--gris-oscuro);
  line-height: 1.4;
}

.auditoria-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.85rem;
}

.auditoria-email {
  color: var(--gris-claro);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-contenido {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-pequeno {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid var(--crema);
}

.modal-header h3 {
  color: var(--cafe);
  margin: 0;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gris-claro);
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s ease;
}

.btn-cerrar:hover {
  color: var(--cafe);
}

.modal-body {
  padding: 25px;
}

.campo {
  margin-bottom: 20px;
}

.campo label {
  display: block;
  color: var(--cafe);
  font-weight: 600;
  margin-bottom: 8px;
}

.input,
textarea,
select {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--cafe-claro);
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--naranja-opaco);
  box-shadow: 0 0 0 3px rgba(178, 113, 57, 0.1);
}

small {
  display: block;
  color: var(--gris-claro);
  font-size: 0.85rem;
  margin-top: 5px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px 25px;
  border-top: 2px solid var(--crema);
}

/* Detalles Tienda */
.detalle-tienda {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detalle-imagen {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
}

.detalle-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detalle-tienda h2 {
  color: var(--cafe);
  margin: 0;
  text-align: center;
}

.detalle-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  gap: 10px;
}

.info-row strong {
  color: var(--cafe);
  min-width: 120px;
  flex-shrink: 0;
}

.info-row span {
  color: var(--gris-oscuro);
  flex: 1;
}

.sin-datos {
  text-align: center;
  padding: 40px;
  color: var(--gris-claro);
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    width: 100%;
    justify-content: center;
  }

  .vista-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-acciones {
    flex-direction: column;
  }

  .estadisticas {
    grid-template-columns: 1fr;
  }

  .controles {
    flex-direction: column;
  }

  .tallas-grid {
    grid-template-columns: 1fr;
  }

  .tiendas-grid {
    grid-template-columns: 1fr;
  }

  .tabla-container {
    overflow-x: auto;
  }

  .variante-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .categoria-principal {
    flex-direction: column;
    gap: 15px;
  }

  .subcategorias-lista {
    padding-left: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-primario,
  .btn-secundario {
    width: 100%;
    justify-content: center;
  }
}
</style>