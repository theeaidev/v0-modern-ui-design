import React from 'react';
import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'


const PoliticaDePrivacidadPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Política de Privacidad</h1>
      <div className="prose lg:prose-xl max-w-3xl mx-auto">
        <p className="text-lg">
          Bienvenido a la Política de Privacidad de <strong>Directorios Latinos sl</strong>. 
          Esta sección describe cómo recopilamos, usamos y protegemos su información personal cuando utiliza nuestros servicios y visita nuestro sitio web.
        </p>
        <p className="text-lg">
          En <strong>Directorios Latinos sl</strong>, nos comprometemos a proteger su privacidad y asegurar que su información personal sea manejada de manera segura y responsable, en cumplimiento con la legislación vigente.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">Información que Recopilamos</h2>
        <p className="text-lg">
          Podemos recopilar información personal que usted nos proporciona directamente, como su nombre, dirección de correo electrónico, número de teléfono, etc., cuando se registra en nuestro sitio, se suscribe a nuestro boletín, o interactúa con nuestros servicios de cualquier otra forma.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-3">Uso de la Información</h2>
        <p className="text-lg">
          La información que recopilamos se utiliza para:
        </p>
        <ul className="list-disc pl-5 text-lg">
          <li>Proveer y mejorar nuestros servicios.</li>
          <li>Personalizar su experiencia en nuestro sitio web.</li>
          <li>Comunicarnos con usted sobre su cuenta o nuestros servicios.</li>
          <li>Enviar información promocional y actualizaciones, con su consentimiento.</li>
        </ul>
        <p className="text-lg mt-4">
          Para más detalles sobre nuestras prácticas de privacidad, por favor contáctenos.
        </p>
      </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default PoliticaDePrivacidadPage;
