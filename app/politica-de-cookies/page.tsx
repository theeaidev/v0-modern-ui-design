import React from 'react';
import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'


const PoliticaDeCookiesPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Política de Cookies</h1>
      <div className="prose lg:prose-xl max-w-3xl mx-auto">
        <p className="text-lg">
          Bienvenido a la Política de Cookies de <strong>Directorios Latinos sl</strong>. 
          Esta sección explica qué son las cookies, cómo las utilizamos en nuestro sitio web y sus opciones con respecto a ellas.
        </p>
        <p className="text-lg">
          En <strong>Directorios Latinos sl</strong>, utilizamos cookies para mejorar su experiencia de navegación, analizar el tráfico del sitio y ofrecer contenido personalizado. Al continuar utilizando nuestro sitio, usted acepta nuestro uso de cookies de acuerdo con esta política.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">¿Qué son las Cookies?</h2>
        <p className="text-lg">
          Las cookies son pequeños archivos de texto que los sitios web que visita colocan en su dispositivo (ordenador, tableta, smartphone). Se utilizan ampliamente para que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">Cómo Utilizamos las Cookies</h2>
        <p className="text-lg">
          Utilizamos cookies para:
        </p>
        <ul className="list-disc pl-5 text-lg">
          <li>Asegurar la funcionalidad básica del sitio web.</li>
          <li>Recordar sus preferencias y configuraciones.</li>
          <li>Analizar cómo utiliza nuestro sitio web para poder mejorarlo.</li>
          <li>Proporcionar publicidad relevante (si aplica).</li>
        </ul>
        <p className="text-lg mt-4">
          Puede administrar sus preferencias de cookies a través de la configuración de su navegador. Para más información, por favor contáctenos.
        </p>
      </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default PoliticaDeCookiesPage;
