import InfoTooltip from '@protocol/elements/tooltip'

// Shared info tooltips for the Campo de aplicación / Objetivo socioeconómico
// / Tipo de investigación dropdowns. Used by both the standard protocol's
// Descripción form and the teacher-thesis equivalent.

export const FieldInfo = () => (
  <InfoTooltip>
    <p>
      <b>Ciencias exactas y naturales:</b> astronomía; ciencias espaciales;
      bacteriología; biología; bioquímica; biofísica; botánica; toxicología;
      genética; física; geofísica; geografía física; geología; mineralogía;
      informática (solo desarrollo del software, el hardware deberá ser
      clasificado como ingeniería y tecnología); matemática; estadística;
      meteorología; química; entomología; zoología; antropología física;
      psicofisiología; otros campos conexos.
    </p>
    <p>
      <b>Ingeniería y tecnología:</b> ingeniería civil; ingeniería eléctrica;
      ingeniería electrónica; ingeniería mecánica; ingeniería química con sus
      diversas especializaciones; ingeniería en telecomunicaciones; productos
      forestales; ciencias aplicadas como la geodesia, la química industrial,
      etc.; ciencia y tecnología de la producción de alimentos y bebidas;
      tecnología textil, calzado y cueros; tecnologías especializadas o ramas
      interdisciplinarias, por ejemplo, análisis de sistemas; metalurgia,
      minería e industrias extractivas; arquitectura y urbanismo; cartografía;
      otros campos conexos.
    </p>
    <p>
      <b> Ciencias médicas:</b> anatomía; farmacia; fisioterapia; medicina;
      obstetricia; odontología; optometría; osteopatía; sanidad pública;
      higiene; técnicas de enfermería; otros campos conexos.
    </p>
    <p>
      <b>Ciencias agrícolas y veterinarias:</b>
      agronomía; horticultura; ganadería; pesca; silvicultura; productos
      forestales; veterinaria; zootecnia; otros campos conexos.
    </p>
    <p>
      <b> Ciencias sociales:</b> antropología (social y cultural) y etnología;
      demografía; economía; educación y formación; geografía (humana, económica
      y social); gestión lingüística (excluidos los estudios de lenguas
      efectuados sobre textos determinados, que deberían clasificarse en
      humanidades en la categoría de lenguas y literaturas antiguas y modernas);
      psicología; ciencias jurídicas; ciencias políticas; sociología;
      organización científica del trabajo; comercio y administración; ciencias
      sociales varias y actividades de CyT interdisciplinarias, metodológicas,
      históricas, etc., relativas a los campos de este grupo. La
      psicofisiología, la antropología y la geografía físicas deberán
      clasificarse entre las ciencias exactas y naturales.
    </p>
    <p>
      <b>Humanidades y artes:</b>
      artes (historia y crítica de las artes, excluidas las investigaciones
      artísticas de todo tipo); lenguas y literaturas antiguas y modernas;
      filosofía (incluida la historia de las ciencias y las técnicas); religión;
      prehistoria e historia, así como las ciencias auxiliares de la historia:
      arqueología, paleografía, numismática, etc.; otros campos y materias
      correspondientes a este grupo y actividades de CyT interdisciplinarias,
      metodológicas, históricas, etc., relativas a los campos de este grupo.
    </p>
  </InfoTooltip>
)

export const ObjectiveInfo = () => (
  <InfoTooltip>
    <p>
      <b>Exploración y explotación de la tierra:</b> abarca la I+D cuyos
      objetivos estén relacionados con la exploración de la corteza y la
      cubierta terrestre, los mares, los océanos y la atmósfera, y la I+D sobre
      su explotación. También incluye la I+D climática y meteorológica, la
      exploración polar y la hidrológica. No incluye: la I+D sobre la mejora de
      suelos (OSE4), contaminación (OSE2) y pesca y uso de suelos (OSE8).
    </p>
    <p>
      <b>Medio ambiente:</b> comprende la I+D sobre el control de la
      contaminación, destinada a la identificación y análisis de sus fuentes de
      contaminación y causas, y todos los contaminantes, incluyendo su
      dispersión en el medio ambiente y los efectos sobre la humanidad, sobre
      las especies vivas (fauna, flora, microorganismos) y la biosfera. Incluye
      el desarrollo de instalaciones de control para la medición de todo tipo de
      contaminantes. Lo mismo es válido para la eliminación y prevención de todo
      tipo de contaminantes en todos los tipos de medio ambientes.
    </p>
    <p>
      <b>Exploración y explotación del espacio:</b> abarca toda la I+D civil en
      el espacio relacionada con la exploración del espacio, laboratorios
      espaciales, navegación espacial y sistemas de lanzamiento. La
      investigación análoga realizada en Defensa se clasifica en el OSE13.
      Aunque la I+D espacial civil no está en general orientada a un objetivo
      específico, con frecuencia sí tiene un fin determinado, como el aumento
      del conocimiento general (por ejemplo, la astronomía), o se refiere a
      aplicaciones particulares (por ejemplo, la observación de la Tierra y los
      satélites de telecomunicaciones). Sin embargo, esta categoría se mantiene
      para facilitar los informes de países con grandes programas espaciales.
    </p>
    <p>
      <b>Transporte, telecomunicación y otras infraestructuras:</b> abarca la
      I+D dirigida a infraestructura y desarrollo territorial, incluyendo la
      construcción de edificios. En general, este OSE engloba toda la I+D
      relativa a la planificación general del uso del suelo. Esto incluye la I+D
      destinada a la protección contra los efectos dañinos de la planificación
      urbana y rural, pero no la investigación de otros tipos de contaminación
      (OSE 2). Este OSE también incluye la I+D relativa a los sistemas de
      transporte; sistemas de telecomunicación; planificación general del uso
      del suelo; la construcción y planificación de edificios; ingeniería civil;
      y abastecimiento de agua.
    </p>
    <p>
      <b>Energía:</b> abarca la I+D destinada a la mejora de la producción,
      almacenamiento, transporte, distribución y uso racional de todas las
      formas de la energía. También incluye la I+D sobre los procesos diseñados
      para incrementar la eficacia de su producción y distribución, y el estudio
      de la conservación. No incluye la I+D relacionada con prospecciones (OSE1)
      y la I+D de la propulsión de vehículos y motores (OSE6).
    </p>
    <p>
      <b> Producción y tecnología industrial:</b>
      cubre la I+D destinada a la mejora de la producción y la tecnología
      industrial, incluyendo la I+D en productos industriales y sus procesos de
      fabricación, excepto en los casos en que forman una parte integrante de la
      búsqueda de otros objetivos (por ejemplo: defensa, espacio, energía,
      agricultura).
    </p>
  </InfoTooltip>
)

export const TypeInfo = () => (
  <InfoTooltip>
    <p>
      <b> Investigación básica:</b> consiste en trabajos experimentales o
      teóricos que se emprenden con el objetivo de obtener nuevos conocimientos
      acerca de los fundamentos de fenómenos y hechos observables, sin pensar en
      darles ninguna aplicación o utilización determinada.
    </p>
    <p>
      <b>Investigación aplicada:</b>consiste en trabajos originales realizados
      para adquirir nuevos conocimientos; sin embargo, está dirigida
      fundamentalmente hacia un objetivo práctico específico.
    </p>
    <p>
      <b>Desarrollo experimental:</b> consiste en trabajos sistemáticos basados
      en conocimientos obtenidos de la investigación y la experiencia práctica y
      en la producción de conocimiento adicional, dirigidos a la producción de
      nuevos productos o procesos o a la mejora de productos y procesos
      existentes.
    </p>
  </InfoTooltip>
)
