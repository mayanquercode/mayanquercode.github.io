import { supabase } from "./js/const/supabase.js"
import searchProductService from "./js/services/searchProducts.js";

document.addEventListener("DOMContentLoaded", () => {
  // // ----------------------------------------------------------------------
  // // CONFIGURACIÓN DE SUPABASE
  // // ----------------------------------------------------------------------
  // const SUPABASE_URL = "https://doxfkasuczubrsxmaqne.supabase.co";
  // const SUPABASE_ANON_KEY =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveGZrYXN1Y3p1YnJzeG1hcW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDg4MjgsImV4cCI6MjA4MDcyNDgyOH0.3YOc39BacxmpoI4IQ5gjm841U7qmwxZ8i7PksWmw8xU";
  // // La variable global 'supabase' viene de la CDN
  // const supabase = window.supabase.createClient(
  //   SUPABASE_URL,
  //   SUPABASE_ANON_KEY
  // );

  // ----------------------------------------------------------------------
  // REFERENCIAS DOM
  // ----------------------------------------------------------------------
  // Lista Principal
  const productsList = document.getElementById("products-list");
  const loadingState = document.getElementById("loading-state");
  const emptyState = document.getElementById("empty-state");
  const errorState = document.getElementById("error-state");
  const errorMessage = document.getElementById("error-message");

  const $textSpanSearch = document.getElementById("text-span-search");

  // Modal
  const openBtn = document.getElementById("open-search-modal");
  const closeBtn = document.getElementById("close-search-modal");
  const modal = document.getElementById("search-modal");
  const searchInput = document.getElementById("search-input");
  const searchResultsList = document.getElementById(
    "search-results-list"
  );
  const searchPlaceholder = document.getElementById("search-placeholder");

  // ----------------------------------------------------------------------
  // FUNCIONES GENERALES DE RENDERIZADO
  // ----------------------------------------------------------------------

  /**
   * @description Crea el HTML para la tarjeta de un producto.
   * @param {Object} product - Objeto con los datos del producto.
   * @param {boolean} isSearchContext - Si se llama desde el modal de búsqueda.
   */
  function renderProductCard(product, isSearchContext = false) {
    let categoryColor = "bg-blue-100 text-blue-800";
    let unitColor = "bg-gray-200 text-gray-700";

    if (product.category === "Alimentos")
      categoryColor = "bg-green-100 text-green-800";

    // Añade el atributo data-code para identificar el producto al hacer click
    const cardHTML = `
                    <div data-code="${product.code}" class="product-card ${isSearchContext
        ? "cursor-pointer hover:bg-indigo-50 active:bg-indigo-100"
        : ""
      } bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                        <div class="flex items-start justify-between mb-2">
                            <h2 class="text-lg font-semibold text-gray-900 leading-snug">${product.name
      }</h2>
                            <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ${unitColor}">
                                ${product.unit_type}
                            </span>
                        </div>
                        
                        <div class="space-y-1 text-sm">
                            <p class="flex justify-between text-gray-600">
                                <span class="font-medium">Código:</span>
                                <span class="font-mono text-indigo-700">${product.code
      }</span>
                            </p>
                            
                            <p class="flex justify-between items-center">
                                <span class="font-medium text-gray-600">Categoría:</span>
                                <span class="inline-block px-2 py-0.5 text-xs font-medium rounded ${categoryColor}">
                                    ${product.category}
                                </span>
                            </p>
                        </div>
                    </div>
                `;
    return cardHTML;
  }

  /**
   * @description Muestra una alerta simple de detalle y cierra el modal.
   * @param {string} code - El código del producto.
   */
  function showProductDetail(payload) {
    alert(`Simulando ir a la vista de Detalle del Producto: ${payload.code}`);
    $textSpanSearch.innerHTML = payload.name;
    closeModal();
  }

  // ----------------------------------------------------------------------
  // LÓGICA DEL MODAL DE BÚSQUEDA
  // ----------------------------------------------------------------------

  function openModal() {
    modal.classList.add("is-active");
    modal.classList.remove("opacity-0", "pointer-events-none");
    searchInput.focus(); // Enfoca el input automáticamente
  }

  function closeModal() {
    modal.classList.remove("is-active");
    // Retrasamos la ocultación total para permitir que la animación se complete
    setTimeout(() => {
      modal.classList.add("opacity-0", "pointer-events-none");
    }, 300); // 300ms = duración de la transición CSS
  }

  /**
   * @description Conecta con Supabase para buscar productos por texto.
   * @param {string} searchTerm - Texto a buscar.
   */
  async function searchProducts(searchTerm) {
    const term = searchTerm.trim();
    searchResultsList.innerHTML = "";
    searchPlaceholder.classList.remove("hidden");

    if (term.length < 2) {
      searchPlaceholder.textContent =
        "Comienza a escribir para buscar productos...";
      return;
    }

    searchPlaceholder.textContent = "Buscando...";

    try {
      const data = await searchProductService(term)
      // Consulta con OR para buscar en 'name' O 'code' (con 'ilike' para case-insensitive)

      searchPlaceholder.classList.add("hidden");

      if (data.length === 0) {
        searchResultsList.innerHTML = `<p class="text-center text-gray-500 mt-10">No hay resultados para "${term}".</p>`;
      } else {
        data.forEach((product) => {
          searchResultsList.innerHTML += renderProductCard(product, true);
        });
        // Añadir listener para la acción de detalle en los resultados
        attachDetailListeners();
      }
    } catch (error) {
      searchPlaceholder.classList.remove("hidden");
      searchPlaceholder.textContent = `Error al buscar: ${error.message}`;
      console.error("Error en la búsqueda:", error);
    }
  }

  // ----------------------------------------------------------------------
  // LÓGICA DE DETALLE Y LISTENERS
  // ----------------------------------------------------------------------

  function attachDetailListeners() {
    // Elimina listeners anteriores para evitar duplicados
    document
      .querySelectorAll("#search-results-list .product-card")
      .forEach((card) => {
        // Clonar y reemplazar para eliminar listeners antiguos de manera eficiente (opcional)
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
      });

    // Añade listeners a las nuevas tarjetas
    document
      .querySelectorAll("#search-results-list .product-card")
      .forEach((card) => {
        card.addEventListener("click", () => {
          const code = card.getAttribute("data-code");
          showProductDetail(code);
        });
      });
  }

  // ----------------------------------------------------------------------
  // EVENT LISTENERS DEL MODAL
  // ----------------------------------------------------------------------

  // Abrir Modal
  openBtn.addEventListener("click", openModal);

  // Cerrar Modal
  closeBtn.addEventListener("click", closeModal);

  // Búsqueda en tiempo real (con un pequeño retraso para optimizar la DB)
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value;
    searchTimeout = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300); // 300ms de retraso para no saturar la base de datos
  });

  // ----------------------------------------------------------------------
  // CARGA INICIAL (LISTA PRINCIPAL)
  // ----------------------------------------------------------------------

  async function fetchProducts() {
    // ... (El código de fetchProducts es el mismo que tenías) ...
    loadingState.classList.remove("hidden");
    productsList.innerHTML = "";
    emptyState.classList.add("hidden");
    errorState.classList.add("hidden");

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      loadingState.classList.add("hidden");

      if (data && data.length > 0) {
        data.forEach((product) => {
          productsList.innerHTML += renderProductCard(product, false);
        });
      } else {
        emptyState.classList.remove("hidden");
      }
    } catch (error) {
      loadingState.classList.add("hidden");
      errorState.classList.remove("hidden");
      errorMessage.textContent =
        error.message || "Verifica tu URL, clave o las políticas RLS.";
      console.error("Error al obtener datos de Supabase:", error);
    }
  }

  fetchProducts();
});