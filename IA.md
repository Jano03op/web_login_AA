# Uso de Inteligencia Artificial en el Proyecto SportClub
Este documento detalla la metodología y el alcance del uso de herramientas de Inteligencia Artificial en el desarrollo del sistema web estático de SportClub.

## 1. Herramientas Utilizadas
Google Stitch: Utilizado como motor principal para la generación y refinamiento de la Interfaz de Usuario (UI). Su capacidad de interpretación visual permitió transformar los conceptos iniciales del club en estructuras de código HTML5 y CSS3 coherentes.

Asistente de IA (Arquitectura): Se empleó un agente especializado para la estructuración lógica del código, asegurando el cumplimiento de estándares de industria y la organización modular del repositorio.

## 2. Alcance de Google Stitch en la UI
El uso de Google Stitch se centró en los siguientes aspectos críticos del diseño:

Interpretación de Identidad Visual: Traducción de la paleta corporativa en una jerarquía visual moderna y equilibrada.

Maquetación de Componentes: Generación de la estructura semántica para la Landing Page, incluyendo las secciones Hero, Beneficios y Visión, así como la estructura visual de los Dashboards para Usuario, Coach y Administrador.

Consistencia de Diseño: Asegurar que los botones, tipografías y contenedores mantuvieran un estilo unificado a lo largo de todas las pantallas del sistema.
![Interfaz de usuario de SportClub](/images/imagen-1.png)

## 3. Metodología y Buenas Prácticas
El desarrollo no fue automatizado al 100%, sino guiado por criterios técnicos estrictos para garantizar la calidad del producto final:

Diseño Mobile-First: Se supervisó que las propuestas de UI de Google Stitch se adaptaran correctamente a dispositivos móviles antes de escalar a resoluciones de escritorio.

## 4. Validación y Control de Calidad
Cada entrega de código realizada por la IA pasó por una fase de revisión manual:

Pruebas en DevTools: Verificación del comportamiento responsive y cumplimiento del ancho máximo de contenedores (1200px) para evitar deformaciones en pantallas grandes.

Auditoría Semántica: Sustitución de etiquetas genéricas por elementos semánticos de HTML5 para mejorar el SEO y la accesibilidad.

Eliminación de Deuda Técnica: Limpieza de estilos en línea y uso innecesario de !important para mantener una cascada CSS limpia y predecible.