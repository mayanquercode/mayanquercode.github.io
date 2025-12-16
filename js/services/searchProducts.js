import { supabase } from "../const/supabase.js"

/**
 * @description Conecta con Supabase para buscar productos por texto.
 * @param {string} searchTerm - Texto a buscar.
 */
export default async function searchProducts(searchTerm) {

  const term = searchTerm.trim();

  try {
    // Consulta con OR para buscar en 'name' O 'code' (con 'ilike' para case-insensitive)
    const { data, error } = await supabase
      .from("products")
      .select("code, name, category, unit_type") // Solo trae los campos necesarios
      .or(`name.ilike.%${term}%,code.ilike.%${term}%`)
      .limit(10); // Limita los resultados

    if (error) throw error;

    return data
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    return []
  }
}
