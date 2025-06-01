import React from 'react';
import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'

const AvisoLegalPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Aviso Legal</h1>
      <div className="prose lg:prose-xl max-w-3xl mx-auto">
        <p className="text-lg">
          Bienvenido al Aviso Legal de <strong>Directorios Latinos sl</strong>. 
          Esta sección contiene información legal importante sobre el uso de nuestro sitio web y nuestros servicios.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-3">Datos Identificativos</h2>
        <p className="text-lg">
          <strong>Denominación Social:</strong> Directorios Latinos sl
          <br />
          <strong>Domicilio Social:</strong> [Su Dirección Completa Aquí] 
          <br />
          <strong>CIF/NIF:</strong> [Su CIF/NIF Aquí]
          <br />
          <strong>Datos de Inscripción Registral:</strong> Inscrita en el Registro Mercantil de [Ciudad], Tomo [Tomo], Folio [Folio], Hoja [Hoja], Inscripción [Número]. (Si aplica)
          <br />
          <strong>Correo Electrónico de Contacto:</strong> [Su Email de Contacto Aquí]
          <br />
          <strong>Teléfono de Contacto:</strong> [Su Teléfono de Contacto Aquí] (Opcional)
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Objeto</h2>
        <p className="text-lg">
          El presente Aviso Legal regula el acceso y uso del sitio web [Su Dominio Web Aquí] (en adelante, el "Sitio Web"), titularidad de <strong>Directorios Latinos sl</strong>. La utilización del Sitio Web atribuye la condición de usuario del mismo (en adelante, el "Usuario") e implica la aceptación de todas las condiciones incluidas en este Aviso Legal.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Propiedad Intelectual e Industrial</h2>
        <p className="text-lg">
          Todos los contenidos del Sitio Web, entendiendo por estos, a título meramente enunciativo, los textos, fotografías, gráficos, imágenes, iconos, tecnología, software, links y demás contenidos audiovisuales o sonoros, así como su diseño gráfico y códigos fuente, son propiedad intelectual de <strong>Directorios Latinos sl</strong> o de terceros, sin que puedan entenderse cedidos al Usuario ninguno de los derechos de explotación reconocidos por la normativa vigente en materia de propiedad intelectual sobre los mismos.
        </p>
        
        <p className="text-lg mt-4">
          El acceso y uso de este sitio web implica la aceptación de los términos y condiciones aquí establecidos. Si no está de acuerdo con cualquiera de las condiciones aquí establecidas, no deberá usar/acceder a este sitio web.
        </p>
      </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default AvisoLegalPage;
