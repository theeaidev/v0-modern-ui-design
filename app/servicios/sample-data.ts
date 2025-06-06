// Sample data for services
export const serviciosData = [
  {
    id: "1",
    title: "Restaurante El Sabor Latino",
    category: "Restaurantes",
    subcategory: "Comida colombiana",
    description:
      "Auténtica comida colombiana con los mejores sabores tradicionales. Arepas, bandeja paisa y mucho más.",
    imagePath: "https://images.unsplash.com/photo-1723693407562-bb4fcae76797?auto=format&fit=crop&w=400&q=80", // Colombian food - bandeja paisa
    badge: "Destacado",
    price: "Menú 12€",
    location: "Madrid",
    phone: "+34 612 345 678",
    whatsapp: "+34612345678",
    website: "www.saborlatino.es",
    email: "info@saborlatino.es",
    address: "Calle Gran Vía 41, Madrid",
    coordinates: { lat: 40.4256, lng: -3.6868 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás,
userId: "user-1",
  },
  {
    id: "2",
    title: "Peluquería Latina Style",
    category: "Servicios",
    subcategory: "Peluquería",
    description:
      "Cortes, peinados, tratamientos y coloración para todo tipo de cabello. Especialistas en cabello latino.",
    imagePath: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80", // Hair salon styling
    badge: null,
    price: "Desde 15€",
    location: "Barcelona",
    phone: "+34 623 456 789",
    whatsapp: "+34623456789",
    website: "latinastyle.com",
    email: "contacto@latinastyle.com",
    address: "Av. Diagonal 405, Barcelona",
    coordinates: { lat: 41.3975, lng: 2.1702 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás,
userId: "user-2",
  },
  {
    id: "3",
    title: "Asesoría de Extranjería",
    category: "Servicios",
    subcategory: "Extranjería",
    description: "Trámites de residencia, nacionalidad, reagrupación familiar y todo tipo de gestiones migratorias.",
    imagePath: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80", // Immigration documents
    badge: "Verificado",
    price: "Consulta 40€",
    location: "Madrid",
    phone: "+34 634 567 890",
    whatsapp: "+34634567890",
    website: "asesoriainmigracion.es",
    email: "info@asesoriainmigracion.es",
    address: "Calle Alcalá 120, Madrid",
    coordinates: { lat: 40.423, lng: -3.673 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás,
userId: "user-3",
  },
  {
    id: "4",
    title: "Empleo: Camarero/a",
    category: "Empleo",
    subcategory: "Tiempo completo",
    description: "Se busca camarero/a con experiencia para restaurante latino. Horario completo, contrato estable.",
    imagePath: "https://images.unsplash.com/photo-1651977560788-98792cd34da0?auto=format&fit=crop&w=400&q=80", // Waiter in restaurant
    badge: "Urgente",
    price: "1.200€/mes",
    location: "Valencia",
    phone: "+34 645 678 901",
    whatsapp: "+34645678901",
    email: "empleo@restaurantelatino.es",
    address: "Calle de la Paz 15, Valencia",
    coordinates: { lat: 39.4702, lng: -0.3768 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás,
userId: "user-4"
  },
  {
    id: "5",
    title: "Curso de Cocina Dominicana",
    category: "Formación",
    subcategory: "Cursos",
    description: "Aprende a preparar los platos más tradicionales de la República Dominicana con chef profesional.",
    imagePath: "https://sazonytumbao.com/wp-content/uploads/2024/04/image6-1-e1615827745597.jpg", // Dominican cooking class
    badge: "Nuevo",
    price: "120€",
    location: "Barcelona",
    phone: "+34 656 789 012",
    whatsapp: "+34656789012",
    website: "cocinadominicana.es",
    email: "cursos@cocinadominicana.es",
    address: "Rambla de Catalunya 60, Barcelona",
    coordinates: { lat: 41.392, lng: 2.165 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 días atrás,
userId: "user-5"
  },
  {
    id: "6",
    title: "Productos Típicos Mexicanos",
    category: "Productos",
    subcategory: "Alimentos",
    description: "Venta de productos importados de México: salsas, dulces, snacks y más. Envíos a toda España.",
    imagePath: "https://images.unsplash.com/photo-1601325979086-d54da2c7419c?auto=format&fit=crop&w=400&q=80", // Mexican food products
    badge: null,
    price: "Varios",
    location: "Online",
    phone: "+34 667 890 123",
    whatsapp: "+34667890123",
    website: "productosmexicanos.es",
    email: "info@productosmexicanos.es",
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 días atrás,
userId: "user-6"
  },
  {
    id: "7",
    title: "Masajes Terapéuticos",
    category: "Servicios",
    subcategory: "Masajes",
    description: "Masajes relajantes, descontracturantes y terapéuticos. Técnicas tradicionales latinoamericanas.",
    imagePath: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80", // Therapeutic massage
    badge: null,
    price: "35€/sesión",
    location: "Sevilla",
    phone: "+34 678 901 234",
    whatsapp: "+34678901234",
    website: "masajesterapeuticos.es",
    email: "citas@masajesterapeuticos.es",
    address: "Av. de la Constitución 20, Sevilla",
    coordinates: { lat: 37.3886, lng: -5.9953 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 días atrás,
userId: "user-7"
  },
  {
    id: "8",
    title: "Empleo: Limpieza de Hogar",
    category: "Empleo",
    subcategory: "Por horas",
    description: "Se busca persona para limpieza de hogar. 4 horas diarias, 3 días a la semana. Zona centro.",
    imagePath: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80", // Home cleaning
    badge: null,
    price: "10€/hora",
    location: "Madrid",
    phone: "+34 689 012 345",
    whatsapp: "+34689012345",
    email: "empleo.limpieza@gmail.com",
    address: "Barrio Salamanca, Madrid",
    verified: false,
    isNew: false,
    publishedAt: new Date(Date.now() - 22  * 24 * 60 * 60 * 1000), // 22 días atrás,
userId: "user-8"
  },
  {
    id: "9",
    title: "Taller de Baile Latino",
    category: "Formación",
    subcategory: "Talleres",
    description: "Aprende salsa, bachata, merengue y más. Clases para todos los niveles. Primera clase gratis.",
    imagePath: "https://images.unsplash.com/photo-1545959570-a94084071b5d?auto=format&fit=crop&w=400&q=80", // Latin dance class
    badge: "Popular",
    price: "50€/mes",
    location: "Barcelona",
    phone: "+34 690 123 456",
    whatsapp: "+34690123456",
    website: "bailelatino.es",
    email: "info@bailelatino.es",
    address: "Carrer de Balmes 150, Barcelona",
    coordinates: { lat: 41.395, lng: 2.1527 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 días atrás,
userId: "user-9"
  },
  {
    id: "10",
    title: "Artesanía Peruana",
    category: "Productos",
    subcategory: "Artesanía",
    description: "Productos artesanales importados de Perú: textiles, cerámica, joyería y decoración.",
    imagePath: "https://images.unsplash.com/photo-1730432447768-2e5a86e5256c?auto=format&fit=crop&w=400&q=80", // Peruvian textiles and crafts
    badge: null,
    price: "Varios",
    location: "Madrid",
    phone: "+34 601 234 567",
    whatsapp: "+34601234567",
    website: "artesaniasperuanas.es",
    email: "ventas@artesaniasperuanas.es",
    address: "Calle Fuencarral 70, Madrid",
    coordinates: { lat: 40.426, lng: -3.702 },
    verified: false,
    isNew: true,
    publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 días atrás,
userId: "user-10"
  },
  {
    id: "11",
    title: "Restaurante Sabor Venezolano",
    category: "Restaurantes",
    subcategory: "Comida venezolana",
    description: "Auténticas arepas, tequeños, pabellón criollo y más especialidades venezolanas.",
    imagePath: "https://images.unsplash.com/photo-1640718534338-466077731ca9?auto=format&fit=crop&w=400&q=80", // Venezuelan arepas
    badge: null,
    price: "Menú 10€",
    location: "Valencia",
    phone: "+34 612 345 678",
    whatsapp: "+34612345678",
    website: "saborvenezolano.es",
    email: "info@saborvenezolano.es",
    address: "Av. del Puerto 45, Valencia",
    coordinates: { lat: 39.465, lng: -0.335 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 días atrás,
userId: "user-11"
  },
  {
    id: "12",
    title: "Certificación de Español",
    category: "Formación",
    subcategory: "Certificaciones",
    description: "Preparación para exámenes DELE. Profesores nativos con amplia experiencia.",
    imagePath: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80", // Spanish language learning
    badge: "Certificado",
    price: "200€/curso",
    location: "Málaga",
    phone: "+34 623 456 789",
    whatsapp: "+34623456789",
    website: "certificacionespanol.es",
    email: "info@certificacionespanol.es",
    address: "Paseo Marítimo 25, Málaga",
    coordinates: { lat: 36.7213, lng: -4.4214 },
    verified: true,
    isNew: false,
    publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 días atrás,
userId: "user-12"
  },
]
