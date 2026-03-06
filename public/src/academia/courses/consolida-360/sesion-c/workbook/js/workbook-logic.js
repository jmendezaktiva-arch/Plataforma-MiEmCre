/**
 * DREAMS WORKBOOK LOGIC - SESIÓN C | CONSOLIDACIÓN FINANCIERA
 * Versión: Clean Room 1.0
 * Objetivo: Mantener 100% de la lógica externa en la nueva arquitectura.
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. MAPA DE SECCIONES (ESTRUCTURA DOCUMENTAL ORIGINAL) ---
    // Restauramos los 11 pasos exactos de la metodología Sesión C Externa.
    const sectionsData = [
        { id: 'ej1', title: '1. Diagnóstico de Consolidación', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { id: 'ej2', title: '2. Plan de Acción', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'ej3', title: '3. Autoevaluación de gestión', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { id: 'ej4', title: '4. Flujo de Caja Libre', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'ej5', title: '5. Prioridades de Negocio', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'ej6', title: '6. Evaluación del Rendimiento', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
        { id: 'ej7', title: '7. Evaluación del Monto', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
        { id: 'ej8', title: '8. Evaluación del Plazo', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'ej9', title: '9. Evaluación del Riesgo', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { id: 'ej10', title: '10. Evaluación del Propósito', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { id: 'ej11', title: '11. Plan de Implementación', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
    ];

    // --- 2. INICIALIZADOR DEL WORKBOOK ---
    const initWorkbook = () => {
        const nav = document.getElementById('workbook-nav');
        const content = document.getElementById('workbook-content');
        
        if (!nav || !content) return;

        // Limpieza de Canvas
        nav.innerHTML = '';
        
        // --- MOTOR DE RENDERIZADO POR BLOQUES (INTEGRIDAD METODOLÓGICA) ---
        const renderNavItem = (section, index) => {
            const navLink = document.createElement('a');
            navLink.href = `#${section.id}`;
            navLink.className = `nav-link flex items-center p-3 text-sm rounded-xl transition-all duration-300 gap-3 ${index === 0 ? 'active' : ''}`;
            navLink.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${section.icon}"></path>
                </svg>
                <span class="font-medium">${section.title}</span>
            `;
            navLink.addEventListener('click', (e) => { e.preventDefault(); showSection(section.id); });
            nav.appendChild(navLink);
        };

        const addNavTitle = (text) => {
            const titleDiv = document.createElement('div');
            titleDiv.className = "mt-6 mb-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest";
            titleDiv.innerText = text;
            nav.appendChild(titleDiv);
        };

        // Bloque 1: Diagnóstico inicial (EJ 1 - 5)
        addNavTitle("Diagnóstico inicial");
        sectionsData.slice(0, 5).forEach((sec, i) => renderNavItem(sec, i));

        // Bloque 2: Metodología para evaluar inversiones (EJ 6 - 10)
        addNavTitle("Evaluación de Inversiones");
        sectionsData.slice(5, 10).forEach((sec, i) => renderNavItem(sec, i + 5));

        // Bloque 3: Cierre y Ejecución (EJ 11)
        addNavTitle("Cierre y Ejecución");
        sectionsData.slice(10).forEach((sec, i) => renderNavItem(sec, i + 10));

        // Ocultar Loading una vez armada la estructura base
        setTimeout(() => {
            document.getElementById('loading-overlay')?.classList.add('opacity-0');
            setTimeout(() => {
                document.getElementById('loading-overlay')?.remove();
            }, 500);
        }, 800);
    };

    // --- 3. DICCIONARIO DE TEMPLATES (CONTENIDO METODOLÓGICO) ---
    // Aquí residirá el HTML de cada ejercicio para garantizar la carga instantánea.
    const sectionTemplates = {
        'ej1': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-4xl mx-auto">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-[#0F3460] mb-4 uppercase tracking-tighter">1. Diagnóstico de Consolidación</h2>
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Internalizar que tú no eres la empresa, para convertirte en el Arquitecto de tu patrimonio. Separar tu identidad de la del negocio es el primer filtro para tomar decisiones de inversión con la cabeza fría y no con el bolsillo personal.
                            </p>
                        </div>
                        <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl">
                             <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones de Rigor:</p>
                             <p class="text-[11px] text-gray-500 leading-loose">
                                El desorden entre la cartera del dueño y la caja de la empresa es el mayor enemigo del crecimiento. Responde con objetividad para identificar tu nivel de consolidación financiera actual.
                             </p>
                        </div>
                    </header>

                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                        <h3 class="text-xl font-bold text-[#0F3460] mb-8 border-b pb-4">Apartado A: Fijación de Sueldo del Fundador</h3>
                        
                        <div class="mb-12">
                            <label class="block font-bold text-[#0F3460] mb-6 text-sm">1. ¿Has establecido un salario fijo para ti, o tus ingresos varían según el desempeño de la empresa?</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${['fijo', 'combinado', 'variable', 'ninguno'].map(tipo => `
                                    <label class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all shadow-sm">
                                        <input type="radio" name="salario_tipo" value="${tipo}" class="autosave-input w-4 h-4 accent-[#0F3460]" data-section="ej1" data-id="ej1_salario_tipo">
                                        <span class="text-xs font-bold text-gray-600 uppercase tracking-tight">${tipo === 'combinado' ? 'Fijo + Variable' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="mb-12">
                             <h4 class="font-bold text-[#0F3460] text-[10px] uppercase tracking-widest mb-4">Criterios de Mercado (Referencia Institucional)</h4>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="overflow-hidden border border-gray-50 rounded-2xl">
                                    <table class="w-full text-[10px]">
                                        <thead><tr class="bg-gray-50 text-[#0F3460]"><th class="p-3 text-left font-black uppercase">Referentes</th><th class="p-3 text-right font-black uppercase">Sueldos MXN</th></tr></thead>
                                        <tbody class="divide-y divide-gray-50 text-gray-500">
                                            <tr><td class="p-3">Microempresa</td><td class="p-3 text-right font-bold">$25k – $40k</td></tr>
                                            <tr><td class="p-3">Pequeña empresa</td><td class="p-3 text-right font-bold">$30k – $45k</td></tr>
                                            <tr class="bg-blue-50/30 text-[#0F3460]"><td class="p-3 font-black">Director Senior</td><td class="p-3 text-right font-black">$120k+</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="overflow-hidden border border-gray-50 rounded-2xl">
                                    <table class="w-full text-[10px]">
                                        <thead><tr class="bg-gray-50 text-[#0F3460]"><th class="p-3 text-left font-black uppercase">Facturación</th><th class="p-3 text-right font-black uppercase">Recomendado</th></tr></thead>
                                        <tbody class="divide-y divide-gray-50 text-gray-500">
                                            <tr><td class="p-3">$300k – $1M</td><td class="p-3 text-right font-bold">$18k – $60k</td></tr>
                                            <tr><td class="p-3">$1M – $5M</td><td class="p-3 text-right font-bold">$30k – $90k</td></tr>
                                            <tr class="bg-blue-50/30 text-[#0F3460]"><td class="p-3 font-black">$5M – $20M</td><td class="p-3 text-right font-black">$60k – $200k+</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                        </div>

                        <div class="mb-10">
                            <label class="block font-bold text-[#0F3460] mb-3 text-sm">2. Basado en el mercado, ¿cuál sería un sueldo justo para tu rol?</label>
                            <div class="bg-orange-50/50 p-4 rounded-2xl mb-4 border-l-4 border-[#957C3D] flex gap-3 items-start">
                                <span class="text-lg">💡</span>
                                <p class="text-[10px] text-gray-600 leading-relaxed italic">
                                    <strong>Pro-Tip:</strong> Imagina que tu empresa es adquirida mañana. ¿Qué sueldo te ofrecería el mercado para asegurar que el negocio siga operando con tu talento bajo una estructura profesional?
                                </p>
                            </div>
                            <textarea placeholder="Describe el análisis de tu valor de mercado..." class="autosave-input w-full p-5 border border-gray-100 rounded-2xl h-28 text-xs focus:ring-2 focus:ring-[#0F3460] outline-none shadow-inner" data-section="ej1" data-id="ej1_salario_mercado"></textarea>
                        </div>

                        <div class="bg-[#F5F5F0] p-6 rounded-3xl border border-[#957C3D]/10">
                            <label class="block font-bold text-[#0F3460] mb-1 text-sm text-center">3. Definición Final de Sueldo Coherente</label>
                            <p class="text-[9px] text-gray-400 mb-6 italic text-center uppercase tracking-widest">Sueldo realista basado en tablas y análisis de mercado</p>
                            <input type="text" placeholder="Ej: $55,000 MXN mensuales" class="autosave-input w-full p-5 border border-white rounded-2xl text-center text-sm font-black text-[#0F3460] focus:ring-4 focus:ring-[#0F3460]/10 outline-none shadow-lg" data-section="ej1" data-id="ej1_salario_definido">
                        </div>
                    </div>
                </div>
            </section>
        `,
        
        'ej2': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-5xl mx-auto">
                    <h2 class="text-3xl font-black text-[#0F3460] mb-6 uppercase tracking-tighter">2. Plan de Acción para la Consolidación Financiera</h2>
                    
                    <div class="mindset-container mb-8">
                        <button class="btn-mindset" onclick="toggleMindsetBubble(this)">
                            <span>💡</span> MINDSET ESTRATÉGICO
                        </button>
                        <div class="mindset-bubble">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase mb-3 tracking-widest">Bases de la Consolidación:</p>
                            <ul class="text-xs space-y-2 text-gray-600 mb-4">
                                <li><strong>A)</strong> Limitar el gasto de dirección para definir cuánta utilidad se puede destinar para inversiones.</li>
                                <li><strong>B)</strong> Definir una meta deseable de ingreso y de utilidad.</li>
                                <li><strong>C)</strong> Definir proyectos que tengan el potencial de cubrir esa meta de crecimiento.</li>
                            </ul>
                            <div class="border-t border-gray-100 pt-3">
                                <p class="text-[10px] text-gray-400 italic leading-relaxed">
                                    <strong>El peso de la disciplina:</strong> Definir y respetar tus políticas de sueldo no es solo un trámite administrativo; es el acto fundacional para consolidarte como dueño. Sin un sueldo fijo, tu estructura de costos es ficticia y tu capacidad de inversión es impredecible.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                        <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                        <p class="text-sm text-gray-600 leading-relaxed italic">
                            Pasarás del caos reactivo al control estratégico. Al definir reglas claras de compensación y prioridades de reinversión, dejas de "sacar dinero" de la empresa para empezar a gestionar una entidad financiera profesional que alimenta tu visión a largo plazo.
                        </p>
                    </div>

                    <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl mb-10">
                        <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones de Rigor:</p>
                        <p class="text-[11px] text-gray-500 leading-loose">
                            Un plan sin políticas es solo una lista de deseos. Utiliza este apartado para formalizar cómo te pagará la empresa y qué destino prioritario tendrán las utilidades. Establecer estas "reglas de la casa" ahora es lo que permitirá que tus futuros proyectos de inversión tengan fondos etiquetados y protegidos del gasto corriente.
                        </p>
                    </div>

                    <div class="space-y-12">
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 class="text-xl font-bold text-[#0F3460] mb-8 border-b pb-4">Apartado A: Definición de Políticas de Compensación y Utilidades</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <label class="block font-bold text-[#0F3460] mb-4 text-sm tracking-tight">1. Tipo de Compensación del Dueño</label>
                                    <div class="flex flex-col gap-3">
                                        <label class="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                            <input type="radio" name="tipo_compensacion" value="fijo" class="autosave-input w-4 h-4 accent-[#0F3460]" data-id="ej2_tipo_comp">
                                            <span class="text-xs font-bold text-gray-600 uppercase">Sueldo Fijo</span>
                                        </label>
                                        <label class="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                            <input type="radio" name="tipo_compensacion" value="variable" class="autosave-input w-4 h-4 accent-[#0F3460]" data-id="ej2_tipo_comp">
                                            <span class="text-xs font-bold text-gray-600 uppercase">Compensación Variable (Utilidades)</span>
                                        </label>
                                        <label class="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                            <input type="radio" name="tipo_compensacion" value="mixto" class="autosave-input w-4 h-4 accent-[#0F3460]" data-id="ej2_tipo_comp" checked>
                                            <span class="text-xs font-bold text-gray-600 uppercase">Mixto (Fijo + Bono Utilidad)</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label class="block font-bold text-[#0F3460] mb-4 text-sm tracking-tight">2. Prioridad de la Política de Utilidades</label>
                                    <div class="flex flex-col gap-3">
                                        <label class="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                            <input type="radio" name="prioridad_utilidades" value="sostenimiento" class="autosave-input w-4 h-4 accent-[#0F3460]" data-id="ej2_prio_util">
                                            <span class="text-xs font-bold text-gray-600 uppercase">Sostenimiento Operativo</span>
                                        </label>
                                        <label class="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                            <input type="radio" name="prioridad_utilidades" value="reinversion" class="autosave-input w-4 h-4 accent-[#0F3460]" data-id="ej2_prio_util" checked>
                                            <span class="text-xs font-bold text-gray-600 uppercase">Reinversión para Crecimiento</span>
                                        </label>
                                        <label class="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                            <input type="radio" name="prioridad_utilidades" value="monetizacion" class="autosave-input w-4 h-4 accent-[#0F3460]" data-id="ej2_prio_util">
                                            <span class="text-xs font-bold text-gray-600 uppercase">Monetización / Capitalización</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-10 space-y-8 pt-8 border-t border-gray-50">
                                <div id="sueldo-fijo-section">
                                    <h4 class="text-[10px] font-black text-[#957C3D] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-[#957C3D]"></div> Política de Sueldo Fijo
                                    </h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Monto mensual actualizado</label>
                                            <input type="text" placeholder="$0.00 MXN" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-black text-[#0F3460] shadow-inner" data-id="ej2_sueldo_fijo">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Fecha vigencia de actualización</label>
                                            <input type="date" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460]" data-id="ej2_fecha_fijo">
                                        </div>
                                    </div>
                                </div>

                                <div id="sueldo-variable-section">
                                    <h4 class="text-[10px] font-black text-[#957C3D] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-[#957C3D]"></div> Política de Compensación Variable
                                    </h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Periodicidad de Reparto</label>
                                            <select class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460]" data-id="ej2_var_periodo">
                                                <option value="trimestral">Trimestral</option>
                                                <option value="semestral">Semestral</option>
                                                <option value="anual">Anual</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tipo de Reparto</label>
                                            <div class="flex gap-4 p-1 bg-gray-50 rounded-xl">
                                                <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all">
                                                    <input type="radio" name="tipo_reparto" value="porcentual" class="autosave-input" data-id="ej2_var_tipo_reparto" checked>
                                                    <span class="text-[10px] font-black uppercase tracking-tighter">Porcentual</span>
                                                </label>
                                                <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all">
                                                    <input type="radio" name="tipo_reparto" value="monto" class="autosave-input" data-id="ej2_var_tipo_reparto">
                                                    <span class="text-[10px] font-black uppercase tracking-tighter">Monto Base</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-6">
                                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Porcentaje o Monto Definido</label>
                                        <input type="text" placeholder="Ej: 15% sobre utilidad neta" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-black text-[#0F3460] shadow-inner" data-id="ej2_var_monto">
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Fecha Vigencia</label>
                                            <input type="date" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460]" data-id="ej2_var_fecha_vigencia">
                                        </div>
                                        <div>
                                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Próxima Revisión</label>
                                            <input type="date" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460]" data-id="ej2_var_fecha_revision">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 class="text-xl font-bold text-[#0F3460] mb-8 border-b pb-4">Apartado B: Alineación Estratégica - Metas y Proyectos</h3>
                            
                            <div class="mb-10">
                                <h4 class="text-[10px] font-black text-[#957C3D] uppercase tracking-widest mb-4">Borrador de Metas Anuales Vigentes</h4>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <input type="text" placeholder="Meta Ingreso Anual" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460] shadow-inner" data-id="ej2_meta_ingreso">
                                    <input type="text" placeholder="Meta Utilidad Anual" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460] shadow-inner" data-id="ej2_meta_utilidad">
                                    <input type="date" class="autosave-input w-full p-4 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460]" data-id="ej2_meta_fecha">
                                </div>
                            </div>

                            <div>
                                <h4 class="text-[10px] font-black text-[#957C3D] uppercase tracking-widest mb-4">Iniciativas de Inversión Estratégicas</h4>
                                <div class="space-y-4">
                                    ${[1, 2, 3].map(i => `
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                            <input type="text" placeholder="Proyecto ${i}: Nombre" class="autosave-input p-3 border border-white rounded-xl text-xs font-bold text-[#0F3460]" data-id="ej2_proy${i}_nombre">
                                            <input type="text" placeholder="Enfoque (Ventas, OP...)" class="autosave-input p-3 border border-white rounded-xl text-xs" data-id="ej2_proy${i}_enfoque">
                                            <input type="text" placeholder="$ Monto Estimado" class="autosave-input p-3 border border-white rounded-xl text-xs font-black text-[#957C3D] text-right" data-id="ej2_proy${i}_monto">
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="bg-[#0F3460] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            <h3 class="text-2xl font-black mb-4 uppercase tracking-tighter text-[#957C3D]">Apartado C: Compromiso de Ejecución</h3>
                            <p class="text-sm font-medium text-white mb-8 leading-relaxed italic">
                                "Comprométete a que empiece a suceder 1 de estos 3 proyectos de crecimiento, ponle fecha de inicio (Mínimo Producto Viable)."
                            </p>
                            <div class="max-w-md">
                                <label class="block text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Fecha compromiso de inicio:</label>
                                <input type="date" class="autosave-input w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-lg font-black text-white focus:bg-white/20 outline-none transition-all" data-id="ej2_fecha_compromiso">
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'ej3': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-6xl mx-auto">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-[#0F3460] mb-4 uppercase tracking-tighter">3. Autoevaluación de gestión</h2>
                        
                        <div class="mindset-container mb-8">
                            <button class="btn-mindset" onclick="toggleMindsetBubble(this)">
                                <span>💡</span> MINDSET: PUNTO CIEGO
                            </button>
                            <div class="mindset-bubble">
                                <p class="text-[11px] font-black text-[#0F3460] uppercase mb-2 tracking-widest">La Realidad del Inversionista:</p>
                                <p class="text-xs text-gray-700 mb-3 leading-relaxed">
                                    Todos consideramos que somos excelentes invirtiendo, pero todos tenemos áreas de oportunidad. Si has tenido excelentes resultados hasta ahora, podrían ser mejores si trabajaras con un <strong>enfoque metodológico</strong>.
                                </p>
                                <div class="border-t border-gray-100 pt-3">
                                    <p class="text-[10px] text-gray-500 italic leading-tight">
                                        Hablar de dinero es un tema sensible; no es común recibir consejos objetivos sobre tus prácticas de inversión. No pierdas la oportunidad de trabajar un área clave para mejorar tus finanzas personales y las de tu empresa.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Identificarás tus "puntos ciegos" financieros. Al evaluar tus decisiones pasadas bajo la lupa del rigor técnico, descubrirás por qué algunas inversiones no dieron el fruto esperado y, lo más importante, aprenderás a calibrar tu brújula para no repetir errores costosos.
                            </p>
                        </div>

                        <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl mb-10">
                            <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones de Rigor:</p>
                            <p class="text-[11px] text-gray-500 leading-loose">
                                Selecciona las 3 inversiones más representativas de tu último año (aquellas que más capital comprometieron o que más impacto esperabas). Califícate con total honestidad: no estamos juzgando el pasado, estamos construyendo tu nuevo criterio de <strong>Arquitecto de Inversiones</strong>. Tu Score de Madurez final te indicará qué tan cerca estás de un proceso de decisión profesional.
                            </p>
                        </div>
                    </header>

                    <div class="mb-10 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <h3 class="text-xl font-bold text-[#0F3460] mb-4 font-montserrat tracking-tight">Paso 1: Define tus Inversiones a Evaluar</h3>
                        <p class="text-xs text-gray-500 mb-6 leading-relaxed italic">Consulta tu registro histórico y piensa en las 3 inversiones más importantes (contrataciones, equipo, marketing, etc.) que has realizado en los <strong>últimos 12 meses</strong>.</p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            ${[1, 2, 3].map(i => `
                                <div class="relative group">
                                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Inversión ${i}</label>
                                    <input type="text" id="inv-name-${i}" placeholder="Ej: Maquinaria, Nuevo Vendedor..." 
                                        class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#0F3460] transition-all text-sm shadow-inner" 
                                        data-section="ej3" data-id="ej3_inv_name_${i}"
                                        oninput="const header = document.getElementById('header-inv-${i}'); if(header) header.innerText = this.value || 'Inversión ${i}'">
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 overflow-x-auto">
                        <h3 class="text-xl font-bold text-[#0F3460] mb-6 font-montserrat tracking-tight">Paso 2: Autoevaluación Retrospectiva</h3>
                        <table class="w-full matrix-table border-collapse">
                            <thead>
                                <tr>
                                    <th class="text-left rounded-tl-2xl bg-[#0F3460] text-white p-4 text-[10px] uppercase tracking-widest">Buena Práctica de Inversión</th>
                                    <th id="header-inv-1" class="bg-[#0F3460] text-white p-4 text-[10px] uppercase tracking-widest">Inversión 1</th>
                                    <th id="header-inv-2" class="bg-[#0F3460] text-white p-4 text-[10px] uppercase tracking-widest">Inversión 2</th>
                                    <th id="header-inv-3" class="bg-[#0F3460] text-white p-4 text-[10px] uppercase tracking-widest rounded-tr-2xl">Inversión 3</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${[
                                    { label: 'Conocías tu Flujo de Caja Libre (FCL) al momento de invertir.', hasInfo: true },
                                    { label: 'Ponderaste la inversión según tu FCL contra otras posibles inversiones.', hasInfo: true },
                                    { label: 'Evaluaste alternativas con posibilidad de mayor rentabilidad.' },
                                    { label: 'Respaldaste el monto requerido por escrito (cotización, plan, etc.).' },
                                    { label: 'Hiciste un cálculo para determinar una Rentabilidad Esperada (ROI).' },
                                    { label: 'Definiste un plazo específico para recuperar la inversión.' },
                                    { label: 'Identificaste los riesgos clave del proyecto.' },
                                    { label: 'Ajustaste la inversión o tomaste acciones para mitigar esos riesgos.' }
                                ].map((practice, pIdx) => `
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="p-4 text-xs font-bold text-[#0F3460] flex items-center gap-2">
                                            <span>${practice.label}</span>
                                            ${practice.hasInfo ? `<button class="inline-flex items-center justify-center w-4 h-4 text-[10px] font-black text-white bg-[#0F3460] rounded-full hover:bg-[#957C3D] transition-colors" onclick="openFCLInfo(event)">i</button>` : ''}
                                        </td>
                                        ${[1, 2, 3].map(i => `
                                            <td class="p-2">
                                                <select class="autosave-input w-full p-2 text-[10px] font-bold rounded-lg border-gray-100 outline-none transition-all" 
                                                    data-section="ej3" 
                                                    data-id="ej3_p${pIdx}_i${i}" 
                                                    onchange="calculateEj3Scores()">
                                                    <option value="0">No (0)</option>
                                                    <option value="1">Parcial (1)</option>
                                                    <option value="2">Sí (2)</option>
                                                </select>
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="bg-gray-50/50">
                                    <td class="p-6 text-right font-black text-[#0F3460] text-[10px] uppercase tracking-widest">Puntaje de Respaldo Operativo:</td>
                                    <td class="p-4"><div id="ej3_i1_total" class="score-total-box">0 / 16</div></td>
                                    <td class="p-4"><div id="ej3_i2_total" class="score-total-box">0 / 16</div></td>
                                    <td class="p-4"><div id="ej3_i3_total" class="score-total-box">0 / 16</div></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div class="bg-[#F5F5F0] p-10 rounded-[32px] border border-[#0F3460]/5 text-center flex flex-col justify-center shadow-sm">
                            <h3 class="text-[10px] font-black text-[#0F3460] uppercase tracking-[0.2em] mb-2">Score de Madurez en Inversión</h3>
                            <div id="general-percentage" class="text-7xl font-black text-[#0F3460] mb-4 transition-all duration-500">0%</div>
                            <p id="score-feedback" class="text-xs font-bold text-gray-400 uppercase tracking-tight italic">Completa la matriz para obtener tu diagnóstico</p>
                        </div>

                        <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 class="text-lg font-bold text-[#0F3460] mb-4 font-montserrat tracking-tight">Análisis de Brechas</h3>
                            
                            <div id="ej3-areas-conclusion" class="mb-6 hidden animate-fadeIn">
                                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Prácticas Críticas Detectadas:</p>
                                <div id="ej3-areas-list" class="flex flex-wrap gap-2 mb-6">
                                    </div>
                            </div>

                            <label class="block text-xs font-bold text-gray-600 mb-3 leading-relaxed">Basado en tu score, ¿cuál es el área de oportunidad N°1 que revela este diagnóstico en tu proceso de toma de decisiones?</label>
                            <textarea id="reflection" rows="3" class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#957C3D] shadow-inner mb-6" data-section="ej3" data-id="ej3_reflection" placeholder="Ej: Necesito validar mis inversiones contra el FCL real..."></textarea>
                            
                            <div id="cta-container-ej3" class="hidden animate-fadeIn">
                                <button onclick="window.sendConsultancyEmail('ej3')" class="w-full bg-[#957C3D] hover:bg-[#866d31] text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 group">
                                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-xs uppercase tracking-widest">Solicitar Apoyo Técnico</span>
                                </button>
                                <p class="text-[9px] text-gray-400 text-center mt-3 uppercase font-medium">Atención prioritaria: contacto@miempresacrece.com.mx</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'ej4': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-6xl mx-auto">
                    <header class="mb-10">
                        <div class="flex items-center gap-4 mb-6">
                            <h2 class="text-3xl font-black text-[#0F3460] uppercase tracking-tighter mb-0">4. Cálculo de Flujo de Caja Libre</h2>
                            <button class="inline-flex items-center justify-center w-6 h-6 text-xs font-black text-white bg-[#0F3460] rounded-full hover:bg-[#957C3D] transition-all hover:scale-110 shadow-sm" onclick="openFCLInfo(event)">i</button>
                        </div>
                        
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Descubrirás la "liquidez Real" de tu negocio. El Flujo de Caja Libre (FCL) es el capital que queda tras cumplir con todas tus obligaciones operativas; es el único recurso con el que puedes comprar el futuro sin asfixiar el presente.
                            </p>
                        </div>

                        <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl mb-10">
                            <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones:</p>
                            <p class="text-[11px] text-gray-500 leading-loose">
                                Registra tus ingresos cobrados y egresos pagados de los últimos meses. Te recomendamos un análisis de 6 meses para neutralizar la estacionalidad y obtener un promedio robusto. Si buscas una visibilidad rápida de tu liquidez inmediata, utiliza el modo de 3 meses. Nota: Este no es un ejercicio contable fiscal, es un diagnóstico de capacidad de maniobra.
                            </p>
                        </div>
                    </header>

                    <div class="flex border-b border-gray-100 mb-8">
                        <button id="tab-ej4-calc" onclick="switchEj4Tab('calc')" 
                            class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 border-[#0F3460] text-[#0F3460]">
                            📊 Calculadora FCL
                        </button>
                        <button id="tab-ej4-example" onclick="switchEj4Tab('example')" 
                            class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 border-transparent text-gray-400 hover:text-[#957C3D] hover:bg-gray-50/50">
                            💡 Ejemplo Guiado
                        </button>
                    </div>

                    <div id="ej4-calc-view" class="block animate-fadeIn">
                        <div class="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                            <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Profundidad del Análisis:</span>
                            <div class="flex p-1 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <button id="btn-fcl-3" onclick="updateFCLPeriod(3)" 
                                    class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#0F3460] text-white shadow-md transform active:scale-95">
                                    3 Meses (Inmediato)
                                </button>
                                <button id="btn-fcl-6" onclick="updateFCLPeriod(6)" 
                                    class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-400 hover:text-[#0F3460] transform active:scale-95">
                                    6 Meses (Estructural)
                                </button>
                            </div>
                        </div>

                        <div id="ej4-calculator-content" class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-gray-100">
                                        <th class="py-4 px-2 text-[10px] font-black text-[#0F3460] uppercase tracking-widest w-1/4">Concepto</th>
                                        <th id="fcl-header-months-container" class="py-4 px-2">
                                            <div class="flex gap-2">
                                                <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Esperando selección de periodo...</span>
                                            </div>
                                        </th>
                                        <th class="py-4 px-2 text-[10px] font-black text-[#957C3D] uppercase tracking-widest text-right">Promedio</th>
                                    </tr>
                                </thead>
                                <tbody id="fcl-table-body" class="divide-y divide-gray-50 text-[#0F3460]">
                                    <tr class="bg-blue-50/30">
                                        <td colspan="3" class="py-2 px-3 text-[10px] font-black text-[#0F3460] uppercase tracking-widest">1. Ingresos Cobrados (+)</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Ventas / Cobranza</span></td>
                                        <td id="row-ingreso_ventas-inputs" class="py-3 px-2"></td>
                                        <td id="ingreso_ventas-promedio" class="py-3 px-2 text-right font-black text-sm text-[#0F3460]">$0.00</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Otros Ingresos</span></td>
                                        <td id="row-ingreso_otros-inputs" class="py-3 px-2"></td>
                                        <td id="ingreso_otros-promedio" class="py-3 px-2 text-right font-black text-sm text-[#0F3460]">$0.00</td>
                                    </tr>
                                    <tr class="bg-blue-50/50 border-t border-blue-100">
                                        <td class="py-2 px-3 text-right"><span class="text-[10px] font-black uppercase text-[#0F3460]">Total Ingresos</span></td>
                                        <td id="row-ingreso_total-results" class="py-2 px-2"></td>
                                        <td id="ingreso_total-promedio" class="py-2 px-2 text-right font-black text-sm text-[#0F3460]">$0.00</td>
                                    </tr>

                                    <tr class="bg-red-50/20">
                                        <td colspan="3" class="py-2 px-3 text-[10px] font-black text-red-800 uppercase tracking-widest mt-2">2. Costos Variables (-)</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Costo de Venta (Insumos)</span></td>
                                        <td id="row-egreso_costoventa-inputs" class="py-3 px-2"></td>
                                        <td id="egreso_costoventa-promedio" class="py-3 px-2 text-right font-black text-sm text-red-600">$0.00</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Comisiones / Logística</span></td>
                                        <td id="row-egreso_comisiones-inputs" class="py-3 px-2"></td>
                                        <td id="egreso_comisiones-promedio" class="py-3 px-2 text-right font-black text-sm text-red-600">$0.00</td>
                                    </tr>

                                    <tr class="bg-red-50/20">
                                        <td colspan="3" class="py-2 px-3 text-[10px] font-black text-red-800 uppercase tracking-widest">3. Gastos Fijos (-)</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Nóminas y Carga Social</span></td>
                                        <td id="row-egreso_nomina-inputs" class="py-3 px-2"></td>
                                        <td id="egreso_nomina-promedio" class="py-3 px-2 text-right font-black text-sm text-red-600">$0.00</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Renta y Mantenimiento</span></td>
                                        <td id="row-egreso_renta-inputs" class="py-3 px-2"></td>
                                        <td id="egreso_renta-promedio" class="py-3 px-2 text-right font-black text-sm text-red-600">$0.00</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Servicios (Luz, Agua, Int)</span></td>
                                        <td id="row-egreso_servicios-inputs" class="py-3 px-2"></td>
                                        <td id="egreso_servicios-promedio" class="py-3 px-2 text-right font-black text-sm text-red-600">$0.00</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Otros Gastos Fijos</span></td>
                                        <td id="row-egreso_otros-inputs" class="py-3 px-2"></td>
                                        <td id="egreso_otros-promedio" class="py-3 px-2 text-right font-black text-sm text-red-600">$0.00</td>
                                    </tr>
                                    <tr class="bg-red-50/50 border-t border-red-100">
                                        <td class="py-2 px-3 text-right"><span class="text-[10px] font-black uppercase text-red-800">Total Egresos</span></td>
                                        <td id="row-egreso_total-results" class="py-2 px-2"></td>
                                        <td id="egreso_total-promedio" class="py-2 px-2 text-right font-black text-sm text-red-700">$0.00</td>
                                    </tr>

                                    <tr class="bg-[#F5F5F0]/90 border-t-4 border-[#0F3460]">
                                        <td class="py-6 px-3">
                                            <span class="text-[11px] font-black uppercase tracking-widest text-[#0F3460]">Flujo de Caja Libre (FCL)</span>
                                            <p class="text-[9px] text-[#957C3D] font-bold italic uppercase leading-none mt-1">Capacidad de Maniobra</p>
                                        </td>
                                        <td id="row-fcl-results" class="py-6 px-2"></td>
                                        <td id="fcl-promedio" class="py-6 px-2 text-right font-black text-[#0F3460] text-xl">$0.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="fcl-results-container-2-2" class="bg-gray-50 p-8 rounded-[32px] border border-gray-100 hidden animate-fadeIn mb-10">
                        <h3 class="text-xl font-bold text-[#0F3460] mb-8 text-center uppercase tracking-tight">Diagnóstico y Capacidad de Inversión</h3>
                        
                        <div class="mb-10">
                            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Evolución de Liquidez Mensual (FCL)</h4>
                            <div id="monthly-fcl-results-2-2" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Promedio FCL Mensual</p>
                                <p id="avg-monthly-fcl-2-2" class="text-3xl font-black text-[#0F3460]">$0.00</p>
                            </div>
                            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Capacidad Anual (Caja Libre)</p>
                                <p id="annual-fcl-2-2" class="text-3xl font-black text-[#957C3D]">$0.00</p>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Ponderación de Capacidad de Inversión Anual</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div id="semaphore-green-2-2" class="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-2xl shadow-sm transition-all hover:scale-[1.02]">
                                    <p class="text-[10px] font-black text-green-800 uppercase mb-1 tracking-tighter">✅ Inversión Segura (0% - 8%)</p>
                                    <p class="text-sm font-bold text-green-700">$0.00 - $0.00</p>
                                </div>
                                <div id="semaphore-blue-2-2" class="p-4 bg-blue-50 border-l-4 border-[#0F3460] rounded-r-2xl shadow-sm transition-all hover:scale-[1.02]">
                                    <p class="text-[10px] font-black text-[#0F3460] uppercase mb-1 tracking-tighter">⚖️ Inversión Calculada (9% - 20%)</p>
                                    <p class="text-sm font-bold text-[#0F3460]">$0.00 - $0.00</p>
                                </div>
                                <div id="semaphore-yellow-2-2" class="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-2xl shadow-sm transition-all hover:scale-[1.02]">
                                    <p class="text-[10px] font-black text-yellow-800 uppercase mb-1 tracking-tighter">⚠️ Alto Riesgo (21% - 70%)</p>
                                    <p class="text-sm font-bold text-yellow-700">$0.00 - $0.00</p>
                                </div>
                                <div id="semaphore-red-2-2" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-sm transition-all hover:scale-[1.02]">
                                    <p class="text-[10px] font-black text-red-800 uppercase mb-1 tracking-tighter">🚨 Riesgo de Descapitalización (71%+)</p>
                                    <p class="text-sm font-bold text-red-700">$0.00 - $0.00</p>
                                </div>
                            </div>
                        </div>

                        <div id="fcl-cta-container-2-2" class="mt-10"></div>
                    </div>

                    <div id="ej4-example-view" class="hidden animate-fadeIn">
                        <div class="bg-orange-50 border-l-4 border-[#957C3D] p-6 rounded-r-2xl mb-8 flex gap-4 items-start shadow-sm">
                            <span class="text-2xl mt-1">💡</span>
                            <div>
                                <p class="text-[11px] font-black text-[#957C3D] uppercase tracking-widest mb-2">Análisis del Ejemplo: Creativa Digital</p>
                                <p class="text-sm text-gray-700 leading-relaxed italic">
                                    "El FCL promedio mensual es de $1,633, lo que da una proyección anualizada de $19,600. Esto significa que una inversión "segura" (verde) para Creativa Digital sería de hasta $1,568 al año. Una inversión de $5,000 (como el software que querían comprar) representaría el 25.5% de su FCL anual, cayendo en la categoría de Alto Riesgo (Amarillo)."
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="border-b border-gray-100">
                                            <th class="py-4 px-2 text-[10px] font-black text-[#0F3460] uppercase tracking-widest w-1/3">Concepto</th>
                                            <th class="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-l border-gray-100">Mes 1</th>
                                            <th class="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-l border-gray-100">Mes 2</th>
                                            <th class="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-l border-gray-100">Mes 3</th>
                                            <th class="py-4 px-2 text-[10px] font-black text-[#957C3D] uppercase tracking-widest text-right border-l border-gray-100">Promedio</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-50 text-[#0F3460]">
                                        <tr class="bg-blue-50/30">
                                            <td colspan="5" class="py-2 px-3 text-[10px] font-black text-[#0F3460] uppercase tracking-widest">Ingresos Cobrados (+)</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Ingresos por Servicios</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-[#0F3460] border-l border-gray-100">$45,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-[#0F3460] border-l border-gray-100">$38,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-[#0F3460] border-l border-gray-100">$42,000</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-[#0F3460] border-l border-gray-100">$41,666</td>
                                        </tr>
                                        <tr class="bg-blue-50/50 border-t border-blue-100">
                                            <td class="py-2 px-3 text-right"><span class="text-[10px] font-black uppercase text-[#0F3460]">Total Ingresos</span></td>
                                            <td class="py-2 px-2 text-center text-[10px] font-black text-[#0F3460] border-l border-gray-200">$45,000</td>
                                            <td class="py-2 px-2 text-center text-[10px] font-black text-[#0F3460] border-l border-gray-200">$38,000</td>
                                            <td class="py-2 px-2 text-center text-[10px] font-black text-[#0F3460] border-l border-gray-200">$42,000</td>
                                            <td class="py-2 px-2 text-right text-[11px] font-black text-[#0F3460] border-l border-gray-200">$41,666</td>
                                        </tr>
                                        <tr class="bg-red-50/20">
                                            <td colspan="5" class="py-2 px-3 text-[10px] font-black text-red-800 uppercase tracking-widest mt-2">Egresos Pagados (-)</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Nómina y Honorarios</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$20,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$20,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$20,000</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-100">$20,000</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Renta y Servicios</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$5,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$5,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$5,000</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-100">$5,000</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Software y Suscripciones</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$3,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$3,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$3,000</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-100">$3,000</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Publicidad</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$4,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$2,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$3,000</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-100">$3,000</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-100">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Impuestos</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$6,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$4,000</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$5,500</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-100">$5,166</td>
                                        </tr>
                                        <tr class="hover:bg-gray-50/50 transition-colors">
                                            <td class="py-3 px-3 pl-6"><span class="text-[11px] font-bold">Otros Gastos Fijos</span></td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$4,500</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$4,500</td>
                                            <td class="py-3 px-2 text-center text-[10px] font-bold text-red-700 border-l border-gray-100">$2,600</td>
                                            <td class="py-3 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-100">$3,866</td>
                                        </tr>
                                        <tr class="bg-red-50/50 border-t border-red-100">
                                            <td class="py-2 px-3 text-right"><span class="text-[10px] font-black uppercase text-red-800">Total Egresos</span></td>
                                            <td class="py-2 px-2 text-center text-[10px] font-black text-red-700 border-l border-gray-200">$42,500</td>
                                            <td class="py-2 px-2 text-center text-[10px] font-black text-red-700 border-l border-gray-200">$38,500</td>
                                            <td class="py-2 px-2 text-center text-[10px] font-black text-red-700 border-l border-gray-200">$39,100</td>
                                            <td class="py-2 px-2 text-right text-[11px] font-black text-red-700 border-l border-gray-200">$40,033</td>
                                        </tr>
                                        <tr class="bg-[#F5F5F0]/90 border-t-4 border-[#0F3460]">
                                            <td class="py-6 px-3">
                                                <span class="text-[11px] font-black uppercase tracking-widest text-[#0F3460]">Flujo de Caja Libre (FCL)</span>
                                            </td>
                                            <td class="py-6 px-2 text-center text-[11px] font-black text-[#0F3460] border-l border-gray-200 bg-green-50/50">$2,500</td>
                                            <td class="py-6 px-2 text-center text-[11px] font-black text-red-600 border-l border-gray-200 bg-red-50/50">-$500</td>
                                            <td class="py-6 px-2 text-center text-[11px] font-black text-[#0F3460] border-l border-gray-200 bg-green-50/50">$2,900</td>
                                            <td class="py-6 px-2 text-right text-lg font-black text-[#0F3460] border-l border-gray-200">$1,633</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div id="ej4-interpretation-container" class="lg:col-span-1 bg-white border border-[#0F3460]/10 shadow-sm rounded-3xl overflow-hidden flex flex-col h-fit">
                                <div class="bg-[#0F3460] text-white p-4">
                                    <span class="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <svg class="w-4 h-4 text-[#957C3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Referencia Estratégica
                                    </span>
                                </div>
                                <div class="p-6">
                                    <div class="mb-6">
                                        <span class="inline-block bg-blue-50 text-[#0F3460] px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-blue-100 mb-2">Perfil de la Empresa</span>
                                        <p class="text-[11px] text-gray-600 italic leading-relaxed">Agencia de marketing con 5 empleados. Enfrentan una caída estacional de ventas en el Mes 2.</p>
                                    </div>
                                    
                                    <div class="bg-[#F5F5F0] p-5 rounded-2xl border border-[#957C3D]/20 min-h-[160px] flex flex-col justify-center">
                                        <p id="ej4-interpretation-text" class="text-[11px] text-gray-700 leading-relaxed transition-opacity duration-300">
                                            <strong>Guía de lectura estratégica:</strong><br><br>Cargando interpretación...
                                        </p>
                                    </div>

                                    <div class="mt-6 flex justify-between items-center">
                                        <button onclick="if(window.changeEj4Interpretation) window.changeEj4Interpretation(-1)" class="w-10 h-10 rounded-full bg-gray-100 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all flex items-center justify-center font-bold">&larr;</button>
                                        <span id="ej4-interpretation-counter" class="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">1 / 4</span>
                                        <button onclick="if(window.changeEj4Interpretation) window.changeEj4Interpretation(1)" class="w-10 h-10 rounded-full bg-gray-100 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all flex items-center justify-center font-bold">&rarr;</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'ej5': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-4xl mx-auto">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-[#0F3460] mb-4 uppercase tracking-tighter">5. Análisis Rápido de Prioridades de Negocio</h2>
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Pasarás de la dispersión al enfoque láser. El recurso más escaso de un dueño no es el dinero, sino su atención. Este ejercicio te obliga a sacrificar lo "bueno" para perseguir lo "extraordinario", asegurando que tu inversión se inyecte en el área que realmente desbloqueará tu siguiente nivel de escala.
                            </p>
                        </div>
                        <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl mb-10">
                             <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones:</p>
                             <p class="text-[11px] text-gray-500 leading-loose">
                                No todas las metas tienen el mismo peso. Inicia vaciando tus ideas actuales y luego utiliza los filtros de prioridad para seleccionar el **Área Estratégica** donde una inversión hoy generará el mayor efecto multiplicador. Recuerda: invertir en el área equivocada, por más rentable que parezca, es solo un gasto costoso.
                             </p>
                        </div>
                    </header>
                </div>
            </section>

            <div id="step-1" class="step-content bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn">
                        <h3 class="text-xl font-bold text-[#0F3460] mb-2 font-montserrat tracking-tight">Paso 1: Vaciado de Iniciativas de Crecimiento</h3>
                        <p class="text-xs text-gray-500 mb-8 italic leading-relaxed">Captura las 5 prioridades o proyectos que tienes en mente. Este es tu inventario de posibilidades antes del filtro estratégico.</p>
                        
                        <div class="grid grid-cols-1 gap-4">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <div class="relative group">
                                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Iniciativa Potencial ${i}</label>
                                    <input type="text" placeholder="Ej: Contratar nuevo vendedor, Cambiar software de ventas..." 
                                        class="autosave-input w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#0F3460] shadow-inner focus:ring-2 focus:ring-[#0F3460] outline-none transition-all" 
                                        data-section="ej5" data-id="ej5_prio${i}">
                                </div>
                            `).join('')}
                        </div>

                        <div class="mt-10 flex justify-end border-t border-gray-50 pt-8">
                            <button id="btn-start-analysis" class="bg-[#0F3460] text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#164275] transition-all shadow-lg hover:scale-105 active:scale-95">
                                Terminé la lluvia de ideas, iniciar análisis estratégico
                            </button>
                        </div>
                    </div>

                    <div id="step-2" class="step-content bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn hidden mt-8">
                        <div class="flex items-center gap-4 mb-6">
                            <h3 class="text-xl font-bold text-[#0F3460] font-montserrat tracking-tight mb-0">Paso 2: Matriz de Priorización Estratégica</h3>
                            <span class="bg-blue-50 text-[#0F3460] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">Filtro de Impacto</span>
                        </div>
                        
                        <p class="text-xs text-gray-500 mb-8 leading-relaxed italic">Asigna a cada iniciativa su área de impacto y el nivel de importancia estratégica para tu negocio hoy.</p>

                        <div class="overflow-hidden border border-gray-50 rounded-2xl">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-50 text-[#0F3460]">
                                        <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/2">Iniciativa Detectada</th>
                                        <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/4">Área Estratégica</th>
                                        <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/4">Efecto Multiplicador</th>
                                    </tr>
                                </thead>
                                <tbody id="prioritization-matrix-body" class="divide-y divide-gray-50">
                                    ${[1, 2, 3, 4, 5].map(i => `
                                        <tr>
                                            <td class="p-4">
                                                <div id="label-prio-${i}" class="text-xs font-bold text-gray-400 italic">Esperando iniciativa...</div>
                                            </td>
                                            <td class="p-2">
                                                <select class="autosave-input !m-0 !p-3 text-[10px] font-bold" data-section="ej5" data-id="ej5_area_${i}">
                                                    <option value="">Seleccionar área...</option>
                                                    <option value="ventas">Ventas y Marketing</option>
                                                    <option value="operaciones">Operaciones y Tecnología</option>
                                                    <option value="talento">Talento y Cultura</option>
                                                    <option value="finanzas">Finanzas y Legal</option>
                                                </select>
                                            </td>
                                            <td class="p-2">
                                                <select class="autosave-input !m-0 !p-3 text-[10px] font-bold" data-section="ej5" data-id="ej5_multiplicador_${i}">
                                                    <option value="">Seleccionar nivel...</option>
                                                    <option value="1">1 - Bajo (Mantenimiento)</option>
                                                    <option value="2">2 - Moderado</option>
                                                    <option value="3">3 - Alto (Crecimiento)</option>
                                                    <option value="4">4 - Muy Alto</option>
                                                    <option value="5">5 - Crítico (Escalamiento)</option>
                                                </select>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-10 flex justify-between items-center border-t border-gray-50 pt-8">
                            <button onclick="document.getElementById('step-2').classList.add('hidden'); document.getElementById('step-1').classList.remove('hidden');" 
                                class="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-[#0F3460] transition-colors">
                                &larr; Volver al vaciado
                            </button>
                            <button id="btn-show-priorities" class="bg-[#957C3D] text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#866d31] transition-all shadow-lg">
                                Finalizar Evaluación de Impacto
                            </button>
                        </div>
                    </div>

                    <div id="step-3" class="step-content bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn hidden mt-8">
                        <div class="flex items-center gap-4 mb-6">
                            <h3 class="text-xl font-bold text-[#0F3460] font-montserrat tracking-tight mb-0">Paso 3: Selección de Tácticas por Área</h3>
                            <span class="bg-blue-50 text-[#0F3460] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">Caja de Herramientas</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-8 leading-relaxed italic">Selecciona las tácticas específicas que planeas implementar en cada área estratégica para potenciar tus resultados.</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 class="text-[10px] font-black text-[#0F3460] uppercase mb-4 tracking-widest text-blue-800">Ventas y Marketing</h4>
                                <div class="space-y-2">
                                    ${['CRM', 'Pauta Digital', 'Funnel de Ventas', 'Equipo Comercial'].map(t => `
                                        <label class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50 cursor-pointer hover:bg-blue-50 transition-all">
                                            <input type="checkbox" class="autosave-input w-4 h-4 accent-[#0F3460]" data-section="ej5" data-id="ej5_tactica_ventas_${t.toLowerCase().replace(/ /g, '_')}">
                                            <span class="text-xs font-bold text-gray-600">${t}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 class="text-[10px] font-black text-[#0F3460] uppercase mb-4 tracking-widest">Operaciones y Tecnología</h4>
                                <div class="space-y-2">
                                    ${['Software ERP', 'Maquinaria', 'Control de Inventarios', 'Logística'].map(t => `
                                        <label class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50 cursor-pointer hover:bg-blue-50 transition-all">
                                            <input type="checkbox" class="autosave-input w-4 h-4 accent-[#0F3460]" data-section="ej5" data-id="ej5_tactica_operaciones_${t.toLowerCase().replace(/ /g, '_')}">
                                            <span class="text-xs font-bold text-gray-600">${t}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 class="text-[10px] font-black text-[#0F3460] uppercase mb-4 tracking-widest">Talento y Cultura</h4>
                                <div class="space-y-2">
                                    ${['Capacitación Técnica', 'Clima Organizacional', 'Plan de Retención', 'Plan de Carrera'].map(t => `
                                        <label class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50 cursor-pointer hover:bg-blue-50 transition-all">
                                            <input type="checkbox" class="autosave-input w-4 h-4 accent-[#0F3460]" data-section="ej5" data-id="ej5_tactica_talento_${t.toLowerCase().replace(/ /g, '_')}">
                                            <span class="text-xs font-bold text-gray-600">${t}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 class="text-[10px] font-black text-[#0F3460] uppercase mb-4 tracking-widest">Finanzas y Legal</h4>
                                <div class="space-y-2">
                                    ${['Optimización Fiscal', 'Gestión de Deuda', 'Auditoría Interna', 'Control de Costos'].map(t => `
                                        <label class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-blue-50 transition-all">
                                            <input type="checkbox" class="autosave-input w-4 h-4 accent-[#0F3460]" data-section="ej5" data-id="ej5_tactica_finanzas_${t.toLowerCase().replace(/ /g, '_')}">
                                            <span class="text-xs font-bold text-gray-600">${t}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="mt-10 flex justify-between items-center border-t border-gray-50 pt-8">
                            <button onclick="document.getElementById('step-3').classList.add('hidden'); document.getElementById('step-2').classList.remove('hidden');" 
                                class="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-[#0F3460] transition-colors">
                                &larr; Volver a Matriz
                            </button>
                            <button id="btn-to-step-4" class="bg-[#0F3460] text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#164275] transition-all shadow-lg">
                                Definir Detalle de Iniciativas
                            </button>
                        </div>
                    </div>

                    <div id="step-4" class="step-content bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn hidden mt-8">
                        <div class="flex items-center gap-4 mb-6">
                            <h3 class="text-xl font-bold text-[#0F3460] font-montserrat tracking-tight mb-0">Paso 4: Detalle de Iniciativas y Cronograma</h3>
                            <span class="bg-orange-50 text-[#957C3D] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100">Plan de Acción</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-8 leading-relaxed italic">Transforma las tácticas seleccionadas en acciones concretas. Define el qué, quién y cuándo para asegurar la trazabilidad de tu inversión.</p>
                        
                        <div id="initiatives-detail-container" class="space-y-6">
                            <div class="text-center p-10 border-2 border-dashed border-gray-100 rounded-3xl">
                                <p class="text-xs text-gray-400 italic font-medium">Selecciona tácticas en el Paso 3 para desplegar el cronograma de ejecución...</p>
                            </div>
                        </div>

                        <div class="mt-10 flex justify-between items-center border-t border-gray-50 pt-8">
                            <button onclick="document.getElementById('step-4').classList.add('hidden'); document.getElementById('step-3').classList.remove('hidden');" 
                                class="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-[#0F3460] transition-colors">
                                &larr; Ajustar Tácticas
                            </button>
                            <button id="btn-to-step-5" class="bg-[#957C3D] text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#866d31] transition-all shadow-lg">
                                Generar Síntesis de Prioridades
                            </button>
                        </div>
                    </div>

                    <div id="step-5" class="step-content bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn hidden mt-8">
                        <div class="flex items-center gap-4 mb-6">
                            <h3 class="text-xl font-bold text-[#0F3460] font-montserrat tracking-tight mb-0">Paso 5: Síntesis de Prioridades de Inversión</h3>
                            <span class="bg-[#957C3D]/10 text-[#957C3D] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#957C3D]/20">Enfoque Maestro</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-8 leading-relaxed italic">Este es tu Enfoque Maestro. Representa el área donde cada peso invertido tendrá el mayor impacto multiplicador en tu crecimiento actual.</p>

                        

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div class="bg-[#0F3460] p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[260px]">
                                <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">Prioridad Absoluta Detectada</p>
                                <div id="winning-area-display" class="text-3xl font-black text-white uppercase mb-4 leading-tight italic">Calculando ganador...</div>
                                <p class="text-[11px] text-white leading-relaxed font-light">"Invertir aquí no es un gasto, es el motor que desbloqueará la capacidad de maniobra de tu negocio."</p>
                            </div>

                            <div class="bg-[#F5F5F0] p-8 rounded-[40px] border border-[#0F3460]/5 flex flex-col justify-center">
                                <p class="text-[10px] font-black text-[#0F3460] uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span class="w-2 h-2 bg-[#957C3D] rounded-full"></span> Impacto por Área Estratégica
                                </p>
                                <div id="priority-summary-list" class="space-y-3">
                                    </div>
                            </div>
                        </div>

                        <div class="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100 mb-10">
                            <label class="block text-[10px] font-black text-[#0F3460] uppercase tracking-widest mb-4">Reflexión Estratégica:</label>
                            <textarea class="autosave-input w-full p-6 bg-white border border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-[#0F3460]/10 outline-none transition-all h-32 shadow-inner" 
                                data-section="ej5" data-id="ej5_reflexion_final" 
                                placeholder="Basado en el efecto multiplicador, ¿por qué has decidido que esta sea tu prioridad N°1 para invertir capital y atención?"></textarea>
                        </div>

                        <div class="bg-[#F5F5F0] p-6 rounded-3xl border border-dashed border-[#957C3D]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div class="text-center sm:text-left">
                                <p class="text-xs font-bold text-[#0F3460] mb-1 uppercase tracking-tight">¿Deseas validar este plan?</p>
                                <p class="text-[10px] text-gray-400 italic">Tu consultor puede revisar este cronograma para asegurar la viabilidad financiera.</p>
                            </div>
                            <button onclick="window.sendConsultancyEmail('ej5')" class="bg-[#0F3460] text-white font-black py-4 px-8 rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#164275] transition-all shadow-lg whitespace-nowrap">
                                Solicitar Revisión de Prioridades
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `,
            'ej6': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-6xl mx-auto">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-brand-orange uppercase tracking-tighter mb-4">6. Evaluación del Rendimiento</h2>
                        <div class="bg-blue-50 border-l-4 border-brand-blue p-6 rounded-r-2xl shadow-sm mb-8">
                            <p class="text-[11px] font-black text-brand-blue uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Dejarás de "apostar" dinero para empezar a "sembrar" resultados. Evaluarás si una inversión es un motor de flujo inmediato o un andamio de infraestructura.
                            </p>
                        </div>
                    </header>

                    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-10">
                        <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                            <p class="text-xs font-bold text-[#00529B]">Elige qué tipo de inversión vas a evaluar:</p>
                            <div class="flex flex-wrap gap-2">
                                <label class="flex items-center gap-2 p-2 px-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all group">
                                    <input type="radio" name="ej6_tipo_evaluacion" value="pasada" class="autosave-input hidden" data-id="ej6_tipo_evaluacion" onchange="PerformanceManager.updateInstructions(this.value)">
                                    <span class="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#00529B]">🕒 Inversión Pasada</span>
                                </label>
                                <label class="flex items-center gap-2 p-2 px-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all group">
                                    <input type="radio" name="ej6_tipo_evaluacion" value="planeada" class="autosave-input hidden" data-id="ej6_tipo_evaluacion" onchange="PerformanceManager.updateInstructions(this.value)">
                                    <span class="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#00529B]">🏗️ Planeada / Actual</span>
                                </label>
                                <label class="flex items-center gap-2 p-2 px-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all group">
                                    <input type="radio" name="ej6_tipo_evaluacion" value="iniciativa" class="autosave-input hidden" data-id="ej6_tipo_evaluacion" onchange="PerformanceManager.updateInstructions(this.value)">
                                    <span class="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#00529B]">🚀 Iniciativa (Paso 5)</span>
                                </label>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
                            <p id="ej6_instrucciones_dinamicas" class="text-[11px] text-gray-400 italic text-center mb-0">Selecciona una opción para ver las instrucciones.</p>
                            
                            <div id="ej6_iniciativa_selector_container" class="hidden mt-4 pt-4 border-t border-gray-200/50">
                                <label class="block text-[10px] font-black text-[#00529B] uppercase tracking-widest mb-2 italic">Selecciona la Iniciativa del Paso 5 a evaluar:</label>
                                <select id="ej6_iniciativa_selector" class="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#0F3460] outline-none focus:ring-2 focus:ring-[#00529B] transition-all" onchange="PerformanceManager.applyInitiativeText(this.value)">
                                    <option value="">-- Elige una iniciativa guardada --</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <div class="flex justify-between items-center mb-8 border-b pb-4">
                                <h3 class="text-lg font-bold text-[#00529B]">Análisis Cuantitativo (ROI)</h3>
                                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mide el rendimiento económico</span>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">A. Monto Inversión</label>
                                    <input type="text" placeholder="0" class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl text-right font-black text-[#00529B] shadow-inner focus:ring-2 focus:ring-[#00529B]" data-section="ej6" data-id="ej6_monto_inversion" oninput="PerformanceManager.calculateROI()">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">B. Ganancia Estimada (Rendimiento)</label>
                                    <input type="text" placeholder="0" class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl text-right font-black text-[#00529B] shadow-inner focus:ring-2 focus:ring-[#00529B]" data-section="ej6" data-id="ej6_rendimiento_esperado" oninput="PerformanceManager.calculateROI()">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">C. Plazo Objetivo (Meses)</label>
                                    <input type="number" placeholder="12" class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl text-right font-black text-[#00529B] shadow-inner focus:ring-2 focus:ring-[#00529B]" data-section="ej6" data-id="ej6_plazo_meses" oninput="PerformanceManager.calculateROI()">
                                </div>

                                <div class="bg-[#F5F5F0] rounded-3xl p-6 text-center border border-gray-100">
                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ROI ANUALIZADO ESTIMADO</p>
                                    <div id="ej6_roi_result" class="text-5xl font-black text-gray-300 transition-all duration-500 mb-2">0%</div>
                                    <div class="px-6 py-2 bg-gray-200 text-gray-500 text-[10px] font-black uppercase rounded-lg inline-block">Introduce datos</div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <div class="flex justify-between items-center mb-8 border-b pb-4">
                                <h3 class="text-lg font-bold text-[#00529B]">Análisis Cualitativo</h3>
                                <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mide el impacto estratégico</span>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">¿Qué problema resuelve o qué meta impulsa?</label>
                                    <textarea class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl text-sm h-24 shadow-inner" data-section="ej6" data-id="ej6_problema_resuelve" placeholder="Describe el impacto..."></textarea>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-gray-500 italic">1. FRECUENCIA DEL PROBLEMA</label>
                                    <select class="autosave-input w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold" data-section="ej6" data-id="ej6_frecuencia" onchange="PerformanceManager.updateCategorization()">
                                        <option value="0">Baja (Ocurre poco)</option>
                                        <option value="1">Media (Recurrente)</option>
                                        <option value="2">Alta (Diario / Crítico)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-gray-500 italic">2. GRADO DE SOLUCIÓN</label>
                                    <select class="autosave-input w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold" data-section="ej6" data-id="ej6_solucion" onchange="PerformanceManager.updateCategorization()">
                                        <option value="0">Parcial (Mitiga síntomas)</option>
                                        <option value="1">Sustancial (Mejora proceso)</option>
                                        <option value="2">Total (Elimina la causa raíz)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-gray-500 italic">3. IMPACTO EN EL NEGOCIO</label>
                                    <select class="autosave-input w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold" data-section="ej6" data-id="ej6_impacto" onchange="PerformanceManager.updateCategorization()">
                                        <option value="0">Ordinario (Impacto interno bajo)</option>
                                        <option value="1">Táctico (Eficiencia / Ahorro)</option>
                                        <option value="2">Estratégico (Ventas / Escala)</option>
                                    </select>
                                </div>

                                <div class="mt-8 p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">CALIFICACIÓN ESTRATÉGICA</p>
                                    <div id="ej6_categoria_result" class="bg-gray-200 text-gray-500 py-2 px-6 rounded-lg inline-block text-[10px] font-black uppercase tracking-widest">CALCULANDO...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-center mt-12 pb-6">
                        <div class="flex flex-wrap justify-center gap-8">
                            <button onclick="PerformanceManager.openExample('roi')" class="text-[10px] font-black text-gray-400 hover:text-[#0F3460] uppercase tracking-widest underline decoration-1 underline-offset-4 transition-all">Ver Ejemplo Maquinaria (ROI)</button>
                            <button onclick="PerformanceManager.openExample('strat')" class="text-[10px] font-black text-gray-400 hover:text-[#0F3460] uppercase tracking-widest underline decoration-1 underline-offset-4 transition-all">Ver Ejemplo Software (Estratégico)</button>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'ej7': `
            <section id="ej7" class="section-content active animate-fadeIn">
                <div class="max-w-4xl mx-auto">
                    <header class="mb-10">
                        <div class="flex items-center gap-3 mb-4">
                            <h2 class="text-3xl font-black text-[#0F3460] uppercase tracking-tighter mb-0">7. Evaluación del Monto</h2>
                            <button class="w-5 h-5 flex items-center justify-center bg-[#0F3460] text-white rounded-full text-[10px] font-black" onclick="openFCLInfo(event)">i</button>
                        </div>
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Aprenderás a medir el "Peso Específico" de tu inversión. No importa si algo es barato o caro en términos absolutos, lo que importa es cuántos meses de tu "liquidez" (FCL) consume.
                            </p>
                        </div>
                        <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl mb-10">
                             <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones de Rigor:</p>
                             <p class="text-[11px] text-gray-500 leading-loose">
                                Utiliza el FCL promedio del Ejercicio 4 para determinar a cuántos meses de operación equivale este desembolso. Si el total compromete más del 50% de tu liquidez anual, estás en zona de alto riesgo.
                             </p>
                        </div>
                    </header>

                    <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10">
                        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                            <p class="text-xs font-bold text-[#0F3460]">Fuente del Flujo de Caja Libre (FCL):</p>
                            <div class="flex flex-wrap gap-2">
                                <label class="fcl-option-card selected flex items-center gap-2 p-3 px-5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all group">
                                    <input type="radio" name="fcl_source" value="auto" class="autosave-input hidden" data-id="ej7_fcl_source" checked onchange="AmountManager.toggleFCLSource(this)">
                                    <span class="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#0F3460]">📊 Real (Ejercicio 4)</span>
                                </label>
                                <label class="fcl-option-card flex items-center gap-2 p-3 px-5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white transition-all group">
                                    <input type="radio" name="fcl_source" value="manual" class="autosave-input hidden" data-id="ej7_fcl_source" onchange="AmountManager.toggleFCLSource(this)">
                                    <span class="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#0F3460]">✍️ Escenario Manual</span>
                                </label>
                            </div>
                        </div>

                        <div id="manual-fcl-container" class="hypothetical-input-container hidden mt-8 pt-8 border-t border-gray-50 animate-fadeIn">
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">FCL Mensual para este Escenario:</label>
                            <input type="text" placeholder="$0.00" 
                                class="autosave-input w-full p-5 bg-gray-50 border-none rounded-2xl text-right font-black text-[#0F3460] shadow-inner focus:ring-2 focus:ring-[#0F3460]" 
                                data-id="ej7_manual_fcl_value" 
                                oninput="AmountManager.calculateFCLMonths()">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-center">
                            <h3 class="text-lg font-bold text-[#0F3460] mb-4">Monto de la Inversión a Evaluar</h3>
                            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-6">Inversión base que estamos analizando en esta sesión</p>
                            <input type="text" placeholder="$0.00" 
                                class="autosave-input w-full p-6 bg-[#0F3460]/5 border-none rounded-3xl text-center text-2xl font-black text-[#0F3460] focus:ring-4 focus:ring-[#0F3460]/10 transition-all shadow-inner" 
                                data-id="ej7_monto_principal" 
                                oninput="AmountManager.calculateFCLMonths()">
                        </div>

                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <h3 class="text-lg font-bold text-[#0F3460] mb-2">Proyectos Adicionales (Anuales)</h3>
                            <p class="text-[10px] text-gray-400 italic mb-6 leading-relaxed">Registra otras inversiones activas o planeadas para este año. Esto nos permite medir el compromiso real de tu flujo anual.</p>
                            
                            <div class="space-y-3">
                                ${[1, 2, 3, 4, 5].map(i => `
                                    <div class="grid grid-cols-12 gap-2 p-2 bg-gray-50/50 rounded-2xl border border-gray-50 items-center">
                                        <div class="col-span-7">
                                            <input type="text" placeholder="Proyecto adicional ${i}" 
                                                class="autosave-input w-full p-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-[#0F3460]" 
                                                data-id="ej7_proy_nombre_${i}">
                                        </div>
                                        <div class="col-span-5">
                                            <input type="text" placeholder="$ 0" 
                                                class="autosave-input w-full p-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-[#957C3D] text-right" 
                                                data-id="ej7_proy_monto_${i}" 
                                                oninput="AmountManager.calculateFCLMonths()">
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div id="ej7-dashboard" class="bg-[#0F3460] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden transition-all duration-500">
                        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                            <div class="text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-10">
                                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#957C3D] mb-2">Peso Específico (Viabilidad)</p>
                                <div class="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                                    <span id="ej7_meses_fcl" class="text-6xl font-black italic">0.0</span>
                                    <span class="text-sm font-bold uppercase opacity-60">Meses de FCL</span>
                                </div>
                                <div id="ej7_advice_box" class="inline-block px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80">
                                    Esperando datos...
                                </div>
                            </div>

                            <div class="text-center md:text-left">
                                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#957C3D] mb-2">Compromiso del Flujo Anual</p>
                                <div class="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                                    <span id="ej7_porcentaje_anual" class="text-6xl font-black italic">0%</span>
                                </div>
                                <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4 border border-white/5">
                                    <div id="ej7_progress_bar" class="h-full bg-[#957C3D] transition-all duration-1000 ease-out" style="width: 0%"></div>
                                </div>
                                <p id="ej7_status_text" class="text-[11px] italic opacity-80 leading-relaxed">Suma el monto principal y proyectos adicionales contra tu liquidez anual.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="ej7_cat_container" class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 hidden animate-fadeIn">
                        
                        <div class="cat-advisory-card p-8 bg-white border-2 border-red-100 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-red-500 transition-all">
                            <div class="relative z-10">
                                <span class="bg-red-50 text-red-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-100 mb-4 inline-block italic">Riesgo Crítico Detectado</span>
                                <h4 class="text-sm font-black text-[#0F3460] mb-2 uppercase leading-tight">Blindaje de Flujo Operativo</h4>
                                <p class="text-[10px] text-gray-500 italic leading-relaxed mb-6">Tu capacidad de maniobra actual es vulnerable. Antes de comprometer capital, es vital validar que la estructura de costos soporte este movimiento sin asfixiar la operación.</p>
                            </div>
                            <button onclick="window.sendConsultancyEmail('ej7_monto')" class="w-full bg-red-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-md group-hover:scale-[1.02]">
                                SOLICITAR PLAN DE RESCATE
                            </button>
                        </div>

                        <div class="cat-advisory-card p-8 bg-[#0F3460] border-2 border-white/10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-[#957C3D] transition-all">
                            <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                            <div class="relative z-10">
                                <span class="bg-[#957C3D] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block italic">Visión Estratégica</span>
                                <h4 class="text-sm font-black text-white mb-2 uppercase leading-tight">Ingeniería de Crecimiento</h4>
                                <p class="text-[10px] text-white/70 italic leading-relaxed mb-6">Si este proyecto es el motor de tu siguiente nivel, necesitamos estructurar la inversión para que el retorno sea acelerado. Convirtamos este gasto en un activo de escala.</p>
                            </div>
                            <button onclick="window.sendConsultancyEmail('ej7_monto')" class="w-full bg-[#957C3D] text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#0F3460] transition-all shadow-md group-hover:scale-[1.02]">
                                AGENDAR CONSULTORÍA PRO
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            </section>
        `,
        'ej8': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-4xl mx-auto">
                    <header class="mb-10">
                        <div class="flex items-center gap-4 mb-6">
                            <h2 class="text-3xl font-black text-brand-orange uppercase tracking-tighter mb-0">8. Evaluación del Plazo</h2>
                            <button class="inline-flex items-center justify-center w-6 h-6 text-xs font-black text-white bg-brand-orange rounded-full hover:bg-[#957C3D] transition-all hover:scale-110 shadow-sm" onclick="openPlazoInfo(event)">i</button>
                        </div>
                        
                        <div class="bg-blue-50 border-l-4 border-brand-blue p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-brand-blue uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Dominarás el "Factor Tiempo" como medida de riesgo. En el mundo de las PYMES, el dinero detenido es dinero vulnerable. El objetivo es que visualices la velocidad de retorno como una póliza de seguro.
                            </p>
                        </div>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-center">
                            <h3 class="text-lg font-bold text-[#0F3460] mb-2 text-center">Configuración del Payback</h3>
                            <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-8 text-center">Tiempo estimado de recuperación</p>
                            
                            <div class="relative max-w-xs mx-auto w-full">
                                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Plazo proyectado (Meses)</label>
                                <input type="number" placeholder="Ej: 6" 
                                    class="autosave-input w-full p-6 bg-gray-50 border-none rounded-3xl text-center text-3xl font-black text-[#0F3460] focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner" 
                                    data-id="ej8_plazo_propuesto" 
                                    oninput="if(window.TimeManager) TimeManager.evaluate()">
                            </div>
                        </div>

                        <div class="bg-[#F5F5F0] p-8 rounded-[40px] border border-gray-100 flex flex-col justify-center text-center">
                            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Diagnóstico de Velocidad</p>
                            
                            <div id="ej8_plazo_status" class="inline-block mx-auto px-6 py-2 rounded-xl bg-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 transition-all duration-500">
                                Introduce un plazo
                            </div>

                            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                                <p id="ej8_feedback_text" class="text-xs font-medium text-gray-500 italic leading-relaxed">
                                    Define los meses de recuperación para evaluar el nivel de exposición de tu capital.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-10 p-6 bg-white rounded-3xl border border-dashed border-gray-200 flex items-center gap-4">
                        <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl shadow-sm">⏱️</div>
                        <p class="text-[11px] text-gray-500 leading-relaxed italic">
                            <strong>Nota del Consultor:</strong> Un plazo menor a 6 meses se considera de "Alta Liquidez". Si tu proyecto supera los 18 meses, considera buscar financiamiento externo para no asfixiar tu operación diaria.
                        </p>
                    </div>
        </div>
                </div>
            </section>
        `,
        'ej9': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-6xl mx-auto">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-[#0F3460] mb-4 uppercase tracking-tighter">9. Evaluación del Riesgo</h2>
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Visualizarás las amenazas antes de que ocurran para diseñar tu "escudo de protección". Dejarás de temer al riesgo para empezar a gestionarlo, asegurando que un imprevisto no derribe todo tu plan de crecimiento.
                            </p>
                        </div>
                        <div class="bg-[#F5F5F0] border border-[#957C3D]/20 p-5 rounded-2xl">
                             <p class="text-[10px] text-[#957C3D] font-black uppercase mb-1">Instrucciones de Rigor:</p>
                             <p class="text-[11px] text-gray-500 leading-loose">
                                Toda inversión conlleva riesgos; el error no es tenerlos, sino ignorarlos. Selecciona una iniciativa, identifica qué podría salir mal y define un <strong>Plan A (Mitigación)</strong> para evitarlo, y un <strong>Plan B (Contingencia)</strong> por si llega a ocurrir.
                             </p>
                        </div>
                    </header>

                    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-4">
                        <label class="text-xs font-black text-[#0F3460] uppercase tracking-widest whitespace-nowrap">Analizar Riesgos de:</label>
                        <select id="current-risk-initiative" class="autosave-input w-full p-3 bg-gray-50 border-none rounded-xl text-xs font-bold text-[#0F3460] outline-none focus:ring-2 focus:ring-[#0F3460]" data-id="ej9_selected_initiative" onchange="RiskManager.runDualDiagnosis()">
                            <option value="">Cargando iniciativas...</option>
                        </select>
                    </div>

                    <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10 overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                    <th class="py-4 px-2 w-1/4">Amenaza Detectada</th>
                                    <th class="py-4 px-2">Prob.</th>
                                    <th class="py-4 px-2">Imp.</th>
                                    <th class="py-4 px-2 w-1/5">Plan A (Mitigación)</th>
                                    <th class="py-4 px-2 w-1/5">Plan B (Contingencia)</th>
                                    <th class="py-4 px-2 text-center">Riesgo Final</th>
                                </tr>
                            </thead>
                            <tbody id="risk-matrix-body">
                                </tbody>
                        </table>
                        <button onclick="RiskManager.addRiskRow()" class="mt-6 flex items-center gap-2 text-[10px] font-black text-[#957C3D] uppercase tracking-[0.2em] hover:opacity-70 transition-all">
                            <span class="w-6 h-6 flex items-center justify-center bg-[#957C3D] text-white rounded-full">+</span>
                            Agregar Amenaza
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div id="diag-vulnerability" class="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl flex flex-col items-center">
                            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Estado de Vulnerabilidad</p>
                            <div class="diag-result text-2xl font-black text-gray-300">ESPERANDO DATOS</div>
                            <p class="text-[10px] text-gray-400 italic text-center mt-4">Mide si tus riesgos altos tienen un Plan B de respaldo.</p>
                        </div>
                        <div id="diag-effectiveness" class="bg-[#0F3460] p-8 rounded-[40px] shadow-xl flex flex-col items-center text-white">
                            <p class="text-[10px] font-black text-[#957C3D] uppercase tracking-widest mb-4">Efectividad de Mitigación</p>
                            <div class="diag-result text-2xl font-black text-white/20">ESPERANDO DATOS</div>
                            <p class="text-[10px] text-white/50 italic text-center mt-4">Mide si tu Plan A reduce realmente la exposición al riesgo.</p>
                        </div>
                    </div>

                    <div class="bg-[#F5F5F0] p-8 rounded-[40px] border border-dashed border-[#0F3460]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div class="text-center md:text-left">
                            <h4 class="text-sm font-black text-[#0F3460] uppercase mb-1">¿Deseas validar tus Puntos Ciegos?</h4>
                            <p class="text-[11px] text-gray-500 italic leading-relaxed">A veces el mayor riesgo es el que no podemos ver. Envía tu matriz para una revisión de blindaje experto.</p>
                        </div>
                        <button onclick="window.sendConsultancyEmail('ej9_riesgo')" class="bg-[#957C3D] text-white font-black py-4 px-8 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                            Solicitar Auditoría de Riesgos
                        </button>
                    </div>
                </div>
            </section>
        `,
        'ej10': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-5xl mx-auto">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-[#0F3460] mb-4 uppercase tracking-tighter">10. Matriz de Definición Estratégica</h2>
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Esta tabla consolida tu visión completa. Aquí es donde validas que tus prioridades financieras, tácticas y operativas están alineadas con el propósito de la empresa.
                            </p>
                        </div>
                    </header>

                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 overflow-x-auto">
                        <h3 class="text-xl font-bold text-[#0F3460] mb-6 font-montserrat tracking-tight">Síntesis de Alineación</h3>
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 text-[#0F3460]">
                                    <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/4">Concepto</th>
                                    <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/4 text-center">Inversión Propuesta</th>
                                    <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/4 text-center">Impacto Estratégico</th>
                                    <th class="p-4 text-[10px] font-black uppercase tracking-widest w-1/4 text-center">Resultado Esperado</th>
                                </tr>
                            </thead>
                            <tbody id="strategic-matrix-body" class="divide-y divide-gray-100">
                                </tbody>
                        </table>
                    </div>

                    <div class="bg-[#0F3460] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-12">
                        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#957C3D] mb-6">Pitch de Inversión Autogenerado</p>
                        <div id="investment-pitch-container" class="text-2xl font-light italic leading-relaxed text-blue-50">
                            "Completa los ejercicios previos para generar tu declaración de valor..."
                        </div>
                    </div>

                    <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-12 text-center">
                        <p class="text-[10px] font-black text-[#0F3460] mb-6 uppercase tracking-[0.2em]">Filtro Final de Coherencia</p>
                        <p class="text-xs font-bold text-gray-400 mb-8 italic">¿Te parece que tu estrategia es adecuada y está alineada con el objetivo buscado?</p>
                        <div class="flex flex-col sm:flex-row justify-center gap-6">
                            <label class="flex items-center gap-3 p-5 border border-gray-100 rounded-2xl hover:bg-green-50 cursor-pointer transition-all flex-1">
                                <input type="radio" name="ej10_validacion" value="adecuada" class="autosave-input w-4 h-4 accent-green-600" data-id="ej10_validacion_status">
                                <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest text-left leading-tight">Sí, es adecuada y está alineada</span>
                            </label>
                            <label class="flex items-center gap-3 p-5 border border-gray-100 rounded-2xl hover:bg-orange-50 cursor-pointer transition-all flex-1">
                                <input type="radio" name="ej10_validacion" value="ajustes" class="autosave-input w-4 h-4 accent-orange-500" data-id="ej10_validacion_status">
                                <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest text-left leading-tight">Aún requiere algunos ajustes</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div class="p-10 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] shadow-sm text-center flex flex-col justify-between hover:border-[#0F3460] transition-all group animate-fadeIn">
                            <div>
                                <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-7 h-7 text-[#0F3460]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <p class="text-xs font-bold text-gray-700 leading-relaxed mb-8 px-4">¿Te gustaría que te ayudáramos a identificar una mejor opción de inversión?</p>
                            </div>
                            <button onclick="window.sendConsultancyEmailCustom('Solicitud Ej10: Identificar mejor opción de inversión')" class="w-full bg-[#0F3460] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-[#164275] transition-all shadow-xl hover:scale-[1.02]">EXPLORAR OPCIONES</button>
                        </div>

                        <div class="p-10 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] shadow-sm text-center flex flex-col justify-between hover:border-[#F68D2E] transition-all group animate-fadeIn">
                            <div>
                                <div class="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <svg class="w-7 h-7 text-[#F68D2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <p class="text-xs font-bold text-gray-700 leading-relaxed mb-8 px-4">¿Te gustaría que un consultor te ayudara a garantizar el éxito de la inversión definida?</p>
                            </div>
                            <button onclick="window.sendConsultancyEmailCustom('Solicitud Ej10: Garantía de éxito en inversión')" class="w-full bg-[#F68D2E] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-[#e07d24] transition-all shadow-xl hover:scale-[1.02]">ASEGURAR MI INVERSIÓN</button>
                        </div>
                    </div>

                    <div class="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 text-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F68D2E] to-transparent"></div>
                        <h4 class="text-2xl font-black text-[#0F3460] mb-2 uppercase tracking-tighter">¿Listo para consolidar tu diagnóstico?</h4>
                        <p class="text-[10px] text-gray-400 uppercase font-black tracking-[0.3em] mb-10">Esta acción enviará tus respuestas al equipo de Mi Empresa Crece</p>
                        <button id="btn-final-submit" onclick="DataSyncManager.submitWorkbook()" class="bg-[#F68D2E] text-white font-black py-6 px-16 rounded-[2.5rem] text-sm uppercase tracking-[0.25em] hover:bg-[#e07d24] transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-4 mx-auto group">
                            <span>FINALIZAR Y ENVIAR RESULTADOS</span>
                            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>
            </section>
        `,
        'ej11': `
            <section class="section-content active animate-fadeIn">
                <div class="max-w-6xl mx-auto pb-20">
                    <header class="mb-10">
                        <h2 class="text-3xl font-black text-[#0F3460] mb-4 uppercase tracking-tighter">11. Plan de Implementación Estratégico</h2>
                        <div class="bg-blue-50 border-l-4 border-[#0F3460] p-6 rounded-r-2xl shadow-sm mb-6">
                            <p class="text-[11px] font-black text-[#0F3460] uppercase tracking-widest mb-2">Objetivo Transformacional:</p>
                            <p class="text-sm text-gray-600 leading-relaxed italic">
                                Este es tu tablero de comando. Aquí consolidamos tu visión, tu capacidad financiera y tu gestión de riesgos en un solo plan de acción. No es solo un resumen; es la hoja de ruta que llevarás a la ejecución real.
                            </p>
                        </div>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div class="bg-white p-8 rounded-3xl border-l-8 border-[#00529B] shadow-sm">
                            <h3 class="text-[10px] font-black text-[#00529B] uppercase tracking-[0.2em] mb-4">Apartado A: Blindaje Personal</h3>
                            <div class="space-y-4">
                                <div>
                                    <p class="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Sueldo de Mercado:</p>
                                    <p id="summary-salary" class="text-lg font-black text-[#0F3460]">$0.00</p>
                                </div>
                                <div>
                                    <p class="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Política de Utilidades:</p>
                                    <p id="summary-utility-policy" class="text-xs font-bold text-gray-600 italic">No definida</p>
                                </div>
                            </div>
                            <p class="mt-6 text-[9px] text-gray-400 italic leading-relaxed">"La utilidad se pierde como gasto personal al repartirla o se reinvierte en crecimiento."</p>
                        </div>

                        <div class="bg-white p-8 rounded-3xl border-l-8 border-[#F68D2E] shadow-sm">
                            <h3 class="text-[10px] font-black text-[#F68D2E] uppercase tracking-[0.2em] mb-4">Apartado B: Rumbo de Crecimiento</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Meta Ingresos:</p>
                                    <p id="summary-target-income" class="text-lg font-black text-[#0F3460]">$0.00</p>
                                </div>
                                <div>
                                    <p class="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Meta Utilidad:</p>
                                    <p id="summary-target-profit" class="text-lg font-black text-[#0F3460]">$0.00</p>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-50">
                                <p class="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Fecha Objetivo:</p>
                                <p id="summary-target-date" class="text-xs font-bold text-gray-600">-- / -- / --</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-[#0F3460] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden mb-10">
                        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#957C3D] mb-6">Declaración Estratégica de Inversión (Pitch)</p>
                        <blockquote id="summary-pitch" class="text-xl font-light italic leading-relaxed text-blue-50">
                            "Esperando consolidación de datos..."
                        </blockquote>
                    </div>

                    <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 mb-10">
                        <h3 class="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Indicadores de Viabilidad Técnica</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div class="text-center">
                                <p class="text-[8px] font-black text-gray-400 uppercase mb-2">Promedio FCL</p>
                                <p id="summary-fcl-avg" class="text-xl font-black text-[#0F3460]">$0</p>
                            </div>
                            <div class="text-center border-l border-gray-50">
                                <p class="text-[8px] font-black text-gray-400 uppercase mb-2">FCL Anualizado</p>
                                <p id="summary-fcl-annual" class="text-xl font-black text-[#957C3D]">$0</p>
                            </div>
                            <div class="text-center border-l border-gray-50">
                                <p class="text-[8px] font-black text-gray-400 uppercase mb-2">FCL Comprometido</p>
                                <p id="summary-fcl-consumption" class="text-xl font-black text-[#0F3460]">0%</p>
                            </div>
                            <div class="text-center border-l border-gray-50">
                                <p class="text-[8px] font-black text-gray-400 uppercase mb-2">Payback (Plazo)</p>
                                <p id="summary-payback" class="text-xl font-black text-[#0F3460]">0 Meses</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div class="md:col-span-2 bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
                            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Mapa de Blindaje (Riesgos Clave)</h3>
                            <div id="summary-risks-list" class="space-y-3">
                                </div>
                        </div>
                        <div class="bg-[#F5F5F0] p-8 rounded-3xl text-center flex flex-col justify-center border border-gray-200/50">
                            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Score de Madurez</p>
                            <div id="summary-maturity-score" class="text-5xl font-black text-[#0F3460]">0%</div>
                            <p class="text-[8px] font-bold text-gray-400 uppercase mt-2">Nivel de Gestión</p>
                        </div>
                    </div>

                    <div class="bg-white p-10 rounded-[4rem] shadow-2xl border-2 border-[#F68D2E]/20 text-center">
                        <h4 class="text-xl font-black text-[#0F3460] mb-2 uppercase">Próximos Pasos</h4>
                        <p class="text-xs text-gray-400 mb-8 italic">"El conocimiento sin ejecución es solo una ilusión de progreso."</p>
                        <div class="max-w-2xl mx-auto">
                            <label class="block text-[10px] font-black text-[#F68D2E] uppercase tracking-widest mb-4">¿Cuál es el primer paso inmediato para que este plan empiece a suceder?</label>
                            <textarea class="autosave-input w-full p-6 bg-gray-50 border-none rounded-[2rem] text-sm text-[#0F3460] font-bold focus:ring-4 focus:ring-[#F68D2E]/10 outline-none shadow-inner h-28" 
                                data-id="ej11_first_step" placeholder="Define pasos, fechas y recursos específicos aquí..."></textarea>
                        </div>
                    </div>

                    <div class="bg-[#0F172A] p-12 rounded-[2rem] shadow-2xl border border-white/5 text-center mt-12 relative overflow-hidden animate-fadeIn">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F68D2E] to-transparent"></div>
                        <h4 class="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">"Una visión sin ejecución es solo una alucinación."</h4>
                        <p class="text-xs text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
                            Has completado el rigor técnico necesario para ser un Arquitecto de Inversiones. Tu siguiente paso es descargar tu PDF y agendar la sesión de revisión con tu consultor.
                        </p>
                        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button onclick="window.scrollTo(0,0); document.querySelector('a[href=\\'#ej10\\']').click();" 
                                class="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-white/10 text-white hover:bg-white/5 transition-all">
                                REVISAR DETALLES
                            </button>
                            <button id="btn-final-sync" onclick="DataSyncManager.submitWorkbook()" 
                                class="bg-[#F68D2E] text-white font-black py-4 px-10 rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#e07d24] transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-3 group">
                                <span>SINCRONIZAR Y CERRAR PLAN</span>
                                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `,
    };

    // --- 4. GESTOR DE VISIBILIDAD (MOTOR DE INYECCIÓN) ---
    // --- GESTOR DE VISIBILIDAD CON REHIDRATACIÓN (SOLUCIONA PÉRDIDA DE DATOS) [cite: 364] ---
    window.showSection = (sectionId) => {
        const content = document.getElementById('workbook-content');
        if (!content) return;

        // 1. Actualizar Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });

        // 2. Transición y Carga de Template
        content.style.opacity = '0';
        setTimeout(() => {
            content.innerHTML = sectionTemplates[sectionId] || '<p class="p-20 text-center text-gray-400">Sección en construcción...</p>';
            
            // 3. REHIDRATACIÓN QUIRÚRGICA: Recuperamos los datos del caché para esta sección específica
            // Esto evita que los campos se vean vacíos al cambiar de ejercicio.
            content.querySelectorAll('.autosave-input').forEach(input => {
                const savedValue = localStorage.getItem(`cuaderno_${input.getAttribute('data-id')}`);
                if (savedValue !== null) {
                    if (input.type === 'radio' || input.type === 'checkbox') {
                        input.checked = (input.value === savedValue);
                    } else {
                        input.value = savedValue;
                    }
                }
            });

            content.style.opacity = '1';
            window.dispatchEvent(new CustomEvent('sectionRendered', { detail: { sectionId } }));
        }, 200);
    };

    // --- 5. LÓGICA DE BURBUJAS MINDSET (LIQUID GLASS) ---
    const mindsetContent = {
        'bonos': {
            title: 'Estrategia de Bonos',
            text: 'Un bono no es un "sobrante". Es un premio a la eficiencia operativa. No debe superar el 20% de la utilidad neta después de haber cubierto tu fondo de reserva de 3 meses de operación.'
        }
    };

    window.openMindset = (key) => {
        const overlay = document.createElement('div');
        overlay.id = 'mindset-overlay';
        overlay.className = 'purpose-overlay active';
        overlay.innerHTML = `
            <div class="purpose-bubble">
                <button class="close-bubble" onclick="closeMindset()">&times;</button>
                <h2 class="text-xl font-bold mb-4">${mindsetContent[key].title}</h2>
                <p class="text-sm leading-relaxed text-gray-600">${mindsetContent[key].text}</p>
                <button onclick="closeMindset()" class="btn-primary mt-8 py-3 text-xs">Entendido, continuar</button>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.querySelector('.purpose-bubble').style.opacity = '1', 10);
    };

    window.closeMindset = () => {
        const overlay = document.getElementById('mindset-overlay');
        if (overlay) {
            overlay.querySelector('.purpose-bubble').style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    };

    // --- 6. INICIALIZACIÓN ---
    if (window.WorkbookCore) {
        WorkbookCore.metadata.sessionID = 'sesion_c';
    }
    
    initWorkbook();
    setTimeout(() => showSection('ej1'), 100);
});
// --- 7. GESTOR DE INTERACTIVIDAD: MINDSET ESTRATÉGICO ---
    /**
     * Controla la apertura y cierre de las burbujas de contexto estratégico.
     * Mantiene la integridad del flujo original permitiendo consultas rápidas
     * sin perder el progreso del ejercicio.
     */
    window.toggleMindsetBubble = (btn) => {
        const container = btn.closest('.mindset-container');
        const bubble = container ? container.querySelector('.mindset-bubble') : null;
        
        if (bubble) {
            // Alternamos el estado de la burbuja
            const isActive = bubble.classList.toggle('active');
            
            // Lógica de "Cerrar al hacer clic fuera" para no entorpecer la navegación
            if (isActive) {
                const closeOnClickOutside = (e) => {
                    if (!container.contains(e.target)) {
                        bubble.classList.remove('active');
                        document.removeEventListener('click', closeOnClickOutside);
                    }
                };
                // Pequeño delay para evitar que el mismo clic de apertura la cierre
                setTimeout(() => document.addEventListener('click', closeOnClickOutside), 10);
            }
        }
    };

    // --- 8. LÓGICA CONDICIONAL: EJERCICIO 2 (PLAN DE ACCIÓN) ---
    /**
     * Gestiona la visibilidad de los apartados de sueldo según el tipo 
     * de compensación seleccionado, manteniendo la integridad del 
     * diagnóstico original.
     */
    const updateEj2SalaryVisibility = () => {
        const selected = document.querySelector('input[name="tipo_compensacion"]:checked')?.value;
        const fijoSec = document.getElementById('sueldo-fijo-section');
        const variableSec = document.getElementById('sueldo-variable-section');

        if (!fijoSec || !variableSec) return;

        // Lógica condicional del Principio Rector (App Externa)
        fijoSec.style.display = (selected === 'fijo' || selected === 'mixto') ? 'block' : 'none';
        variableSec.style.display = (selected === 'variable' || selected === 'mixto') ? 'block' : 'none';
    };

    // Listener para cambios en tiempo real (Interacción del usuario)
    document.addEventListener('change', (e) => {
        if (e.target.name === 'tipo_compensacion') {
            updateEj2SalaryVisibility();
        }
    });

    // Listener para el renderizado inicial (Hidratación de datos de Firebase)
    window.addEventListener('sectionRendered', (e) => {
        if (e.detail.sectionId === 'ej2') {
            updateEj2SalaryVisibility();
        }
        // Trazabilidad Ej3: Ejecutar cálculos al entrar para reflejar datos guardados
        if (e.detail.sectionId === 'ej3') {
            calculateEj3Scores();
        }
        // --- MOTOR DE ARRANQUE EJERCICIO 4: Inicialización dinámica del FCL ---
        if (e.detail.sectionId === 'ej4') {
            const savedPeriod = parseInt(localStorage.getItem('cuaderno_ej4_periodo_seleccionado')) || 3;
            window.updateFCLPeriod(savedPeriod);
        }

        // --- MOTOR DE TRANSICIÓN EJERCICIO 5: Vaciado a Matriz ---
        if (e.detail.sectionId === 'ej5') {
            const btnStart = document.getElementById('btn-start-analysis');
            if (btnStart) {
                btnStart.onclick = () => {
                    // 1. Poblado automático de etiquetas en la Matriz del Paso 2
                    for (let i = 1; i <= 5; i++) {
                        const inputVal = document.querySelector(`[data-id="ej5_prio${i}"]`)?.value.trim();
                        const label = document.getElementById(`label-prio-${i}`);
                        
                        if (label) {
                            if (inputVal) {
                                label.innerText = inputVal;
                                label.classList.remove('text-gray-400', 'italic');
                                label.classList.add('text-[#0F3460]', 'font-bold');
                            } else {
                                label.innerText = `Iniciativa ${i} (No definida)`;
                                label.classList.add('text-gray-400', 'italic');
                            }
                        }
                    }

                    // 2. Navegación quirúrgica entre pasos (Control de Visibilidad)
                    const step1 = document.getElementById('step-1');
                    const step2 = document.getElementById('step-2');
                    
                    if (step1 && step2) {
                        step1.classList.add('hidden');
                        step2.classList.remove('hidden');
                        // Scroll suave al inicio del ejercicio para mejor UX
                        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };
            }

            // --- GESTOR: Matriz a Tácticas (2 -> 3) con Filtro de Prioridad ---
            const btnShowStep3 = document.getElementById('btn-show-priorities');
            if (btnShowStep3) {
                btnShowStep3.onclick = () => {
                    const step2 = document.getElementById('step-2');
                    const step3 = document.getElementById('step-3');
                    
                    // 1. Calcular el área ganadora según el multiplicador más alto de la matriz
                    const areaScores = { ventas: 0, operaciones: 0, talento: 0, finanzas: 0 };
                    const areaLabels = { 
                        ventas: 'Ventas y Marketing', 
                        operaciones: 'Operaciones y Tecnología', 
                        talento: 'Talento y Cultura', 
                        finanzas: 'Finanzas y Legal' 
                    };

                    for (let i = 1; i <= 5; i++) {
                        const area = document.querySelector(`[data-id="ej5_area_${i}"]`)?.value;
                        const mult = parseInt(document.querySelector(`[data-id="ej5_multiplicador_${i}"]`)?.value) || 0;
                        if (area && areaScores.hasOwnProperty(area)) {
                            areaScores[area] += mult;
                        }
                    }

                    // Identificamos el área con el puntaje más alto
                    let winningAreaKey = Object.keys(areaScores).reduce((a, b) => areaScores[a] >= areaScores[b] ? a : b);

                    // 2. Filtrar visibilidad en el Paso 3
                    const tacticGroups = step3.querySelectorAll('#step-3 > div.grid > div');
                    tacticGroups.forEach(group => {
                        const headerText = group.querySelector('h4')?.innerText || "";
                        // Si el encabezado del grupo NO coincide con el área ganadora, lo ocultamos
                        if (headerText.includes(areaLabels[winningAreaKey])) {
                            group.classList.remove('hidden');
                        } else {
                            group.classList.add('hidden');
                        }
                    });

                    // 3. Ajustar el grid para que el área ganadora se vea centrada (de 2 columnas a 1)
                    const gridContainer = step3.querySelector('div.grid');
                    if (gridContainer) gridContainer.classList.replace('md:grid-cols-2', 'md:grid-cols-1');

                    // 4. Ejecutar transición visual
                    if (step2 && step3) {
                        step2.classList.add('hidden');
                        step3.classList.remove('hidden');
                        step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };
            }

            // --- GESTOR: Tácticas a Detalle (3 -> 4) con Blindaje de Datos ---
            const btnToStep4 = document.getElementById('btn-to-step-4');
            if (btnToStep4) {
                btnToStep4.onclick = () => {
                    const detailContainer = document.getElementById('initiatives-detail-container');
                    const checkedTactics = document.querySelectorAll('#step-3 input[type="checkbox"]:checked');
                    
                    if (detailContainer) {
                        if (checkedTactics.length > 0) {
                            // 1. Generamos el HTML basado en la selección actual
                            detailContainer.innerHTML = Array.from(checkedTactics).map(checkbox => {
                                const tId = checkbox.getAttribute('data-id');
                                const tName = checkbox.nextElementSibling.innerText;
                                return `
                                    <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-fadeIn">
                                        <h4 class="text-[10px] font-black text-[#0F3460] uppercase mb-4 tracking-widest flex items-center gap-2">
                                            <span class="w-1.5 h-1.5 bg-[#957C3D] rounded-full"></span> ${tName}
                                        </h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="md:col-span-2">
                                                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Acción Concreta (Descripción)</label>
                                                <textarea placeholder="Define el 'qué'..." class="autosave-input w-full p-4 bg-white border border-gray-100 rounded-xl text-sm h-20" data-section="ej5" data-id="${tId}_desc"></textarea>
                                            </div>
                                            <div><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Responsable</label><input type="text" class="autosave-input w-full p-4 bg-white border border-gray-100 rounded-xl text-sm" data-section="ej5" data-id="${tId}_owner"></div>
                                            <div><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Fecha Límite</label><input type="date" class="autosave-input w-full p-4 bg-white border border-gray-100 rounded-xl text-sm" data-section="ej5" data-id="${tId}_deadline"></div>
                                        </div>
                                    </div>`;
                            }).join('');

                            // 2. REHIDRATACIÓN QUIRÚRGICA: Restauramos valores guardados inmediatamente después de inyectar el HTML
                            detailContainer.querySelectorAll('.autosave-input').forEach(input => {
                                const savedValue = localStorage.getItem(`cuaderno_${input.getAttribute('data-id')}`);
                                if (savedValue) input.value = savedValue;
                            });

                        } else {
                            detailContainer.innerHTML = `<div class="text-center p-10 border-2 border-dashed border-gray-100 rounded-3xl"><p class="text-xs text-gray-400 italic">No seleccionaste tácticas. Vuelve atrás para marcar al menos una.</p></div>`;
                        }
                    }
                    document.getElementById('step-3').classList.add('hidden');
                    document.getElementById('step-4').classList.remove('hidden');
                    document.getElementById('step-4').scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
            }

            // --- GESTOR: Detalle a Síntesis con Cálculo Maestro (4 -> 5) ---
            const btnToStep5 = document.getElementById('btn-to-step-5');
            if (btnToStep5) {
                btnToStep5.onclick = () => {
                    const areaScores = { ventas: 0, operaciones: 0, talento: 0, finanzas: 0 };
                    const areaNames = { 
                        ventas: 'Ventas y Marketing', 
                        operaciones: 'Operaciones y Tecnología', 
                        talento: 'Talento y Cultura', 
                        finanzas: 'Finanzas y Legal' 
                    };
                    
                    // 1. Recolección de puntajes
                    for (let i = 1; i <= 5; i++) {
                        const area = document.querySelector(`[data-id="ej5_area_${i}"]`)?.value;
                        const mult = parseInt(document.querySelector(`[data-id="ej5_multiplicador_${i}"]`)?.value) || 0;
                        if (area && areaScores.hasOwnProperty(area)) areaScores[area] += mult;
                    }

                    // 2. Determinación del Ganador (Con jerarquía de desempate Ventas > OP > Talento > Fin)
                    let winKey = null, maxV = 0;
                    const hierarchy = ['ventas', 'operaciones', 'talento', 'finanzas'];
                    hierarchy.forEach(key => {
                        if (areaScores[key] > maxV) {
                            maxV = areaScores[key];
                            winKey = key;
                        }
                    });

                    // 3. Renderizado y Persistencia de Trazabilidad
                    const winningDisplay = document.getElementById('winning-area-display');
                    if (winningDisplay) {
                        if (winKey) {
                            winningDisplay.innerText = areaNames[winKey];
                            winningDisplay.classList.remove('opacity-50');
                            // GUARDADO MAESTRO: Enviamos el área ganadora a la base de datos
                            if (window.WorkbookCore) {
                                WorkbookCore.saveProgress('ej5_area_ganadora_final', areaNames[winKey]);
                            }
                        } else {
                            winningDisplay.innerText = "Sin área prioritaria definida";
                            winningDisplay.classList.add('opacity-50');
                        }
                    }

                    const summaryEl = document.getElementById('priority-summary-list');
                    if (summaryEl) {
                        const sorted = Object.entries(areaScores)
                            .filter(([_, s]) => s > 0)
                            .sort((a, b) => b[1] - a[1]);

                        summaryEl.innerHTML = sorted.length > 0 ? sorted.map(([k, s]) => `
                            <div class="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-fadeIn">
                                <span class="text-[10px] font-bold text-[#0F3460]">${areaNames[k]}</span>
                                <span class="text-[9px] font-black bg-blue-50 text-[#0F3460] px-2 py-1 rounded-full uppercase">Impacto Total: ${s}</span>
                            </div>
                        `).join('') : '<p class="text-xs text-gray-400 italic text-center p-4">Completa la matriz del Paso 2 para ver el análisis.</p>';
                    }
                    document.getElementById('step-4').classList.add('hidden');
                    document.getElementById('step-5').classList.remove('hidden');
                    document.getElementById('step-5').scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
            }
        }

        // --- MOTOR DE ARRANQUE EJERCICIO 6: Inicialización de Datos y Cálculos ---
        if (e.detail.sectionId === 'ej6') {
            // 1. Sincronización con el Ejercicio 5 (Trae el área ganadora)
            PerformanceManager.syncIniciativas();

            // 2. Disparar cálculos para procesar datos recuperados de Firebase/Caché
            PerformanceManager.calculateROI();
            PerformanceManager.updateCategorization();

            // 3. Restaurar estado visual de instrucciones si ya hay una selección guardada
            const selectedType = document.querySelector('input[name="ej6_tipo_evaluacion"]:checked')?.value;
            if (selectedType) {
                PerformanceManager.updateInstructions(selectedType);
            }

            } // Cierre quirúrgico del bloque Ejercicio 6

        // --- MOTOR DE ARRANQUE EJERCICIO 7: Sincronización UI y Datos ---
        if (e.detail.sectionId === 'ej7') {
            // 1. Sincronizamos el estado visual del selector de fuente (Auto vs Manual)
            const savedSource = localStorage.getItem('cuaderno_ej7_fcl_source') || 'auto';
            const radioToSelect = document.querySelector(`input[data-id="ej7_fcl_source"][value="${savedSource}"]`);
            
            if (radioToSelect) {
                radioToSelect.checked = true;
                // Disparamos la lógica de clases visuales y visibilidad del manual-container
                AmountManager.toggleFCLSource(radioToSelect);
            }

            // 2. Ejecutamos el cálculo inicial para hidratar el Dashboard
            AmountManager.calculateFCLMonths();
        }

        // --- MOTOR DE ARRANQUE EJERCICIO 8: Rehidratación de Plazos ---
        if (e.detail.sectionId === 'ej8') {
            if (window.TimeManager) window.TimeManager.evaluate();
        }

        // --- MOTOR DE ARRANQUE EJERCICIO 9: Sincronización y Rehidratación de Riesgos ---
        if (e.detail.sectionId === 'ej9') {
            // 1. Sincronizar iniciativas del Ejercicio 5 (Trazabilidad Fresh)
            RiskManager.syncIniciativas();

            // 2. Rehidratación de Filas Dinámicas
            const tbody = document.getElementById('risk-matrix-body');
            if (tbody) {
                tbody.innerHTML = ''; // Limpieza de seguridad
                
                let rowCounter = 1;
                let dataFound = false;

                // Verificamos en el almacenamiento si existen filas previas
                while (localStorage.getItem(`cuaderno_ej9_risk_desc_${rowCounter}`)) {
                    RiskManager.addRiskRow();
                    rowCounter++;
                    dataFound = true;
                }

                // Si es un ejercicio nuevo, inyectamos 2 filas base (Metodología Consolida)
                if (!dataFound) {
                    RiskManager.addRiskRow();
                    RiskManager.addRiskRow();
                }

                // 3. Forzamos la carga de valores guardados en las nuevas celdas
                tbody.querySelectorAll('.autosave-input').forEach(input => {
                    const savedValue = localStorage.getItem(`cuaderno_${input.getAttribute('data-id')}`);
                    if (savedValue !== null) {
                        input.value = savedValue;
                        // Actualizar color de semáforo si es un select de Prob/Imp
                        if (input.tagName === 'SELECT') RiskManager.updateRowStyle(input);
                    }
                });
            }

            // 4. Ejecutar el primer diagnóstico (Doble Verificación)
            RiskManager.runDualDiagnosis();
        }

        // --- MOTOR DE ARRANQUE EJERCICIO 10: Sincronización y Pitch ---
        if (e.detail.sectionId === 'ej10') {
            if (window.PurposeManager) {
                PurposeManager.syncStrategicMatrix();
            }
        }

        // --- MOTOR DE ARRANQUE EJERCICIO 11: Tablero de Comando ---
        if (e.detail.sectionId === 'ej11') {
            // Activamos el motor de agregación para construir el Resumen Ejecutivo
            if (window.ImplementationManager) {
                ImplementationManager.refreshSummary();
            }
        }
    });



    /**
     * MOTOR UNIFICADO DE CÁLCULO - EJERCICIO 3
     * Calcula madurez, detecta brechas técnicas y controla la visibilidad del CAT.
     * Mantiene integridad total con la lógica de la app externa.
     */
    window.calculateEj3Scores = function() {
        let totalPoints = 0;
        const maxPossible = 48; // 8 prácticas * 3 inversiones * 2 pts
        const practiceLabels = [
            "Conocimiento del FCL", "Ponderación vs FCL", "Análisis de Alternativas", 
            "Respaldo Documental", "Cálculo de ROI", "Definición de Plazos", 
            "Identificación de Riesgos", "Mitigación de Riesgos"
        ];
        
        const opportunityAreas = [];

        // 1. PROCESAMIENTO DE COLUMNAS (Inversión 1, 2 y 3)
        for (let inv = 1; inv <= 3; inv++) {
            let invScore = 0;
            for (let pIdx = 0; pIdx < 8; pIdx++) {
                const select = document.querySelector(`[data-id="ej3_p${pIdx}_i${inv}"]`);
                if (select) {
                    const val = parseInt(select.value) || 0;
                    invScore += val;

                    // Aplicación de Semáforos en Celdas
                    select.classList.remove('score-select-green', 'score-select-yellow', 'score-select-red');
                    if (val === 2) select.classList.add('score-select-green');
                    else if (val === 1) select.classList.add('score-select-yellow');
                    else if (val === 0) select.classList.add('score-select-red');
                }
            }
            
            // Actualizar Cuadro de Total por Inversión
            const resBox = document.getElementById(`ej3_i${inv}_total`);
            if (resBox) {
                resBox.innerText = `${invScore} / 16`;
                const totalColor = (invScore <= 8) ? '#e74c3c' : (invScore <= 13) ? '#f1c40f' : '#2ecc71';
                resBox.style.setProperty('background-color', totalColor, 'important');
            }
            totalPoints += invScore;
        }

        // 2. CÁLCULO DE PORCENTAJE Y FEEDBACK
        const percentage = Math.round((totalPoints / maxPossible) * 100);
        const display = document.getElementById('general-percentage');
        const feedback = document.getElementById('score-feedback');

        if (display) {
            display.innerText = `${percentage}%`;
            display.style.color = (percentage < 40) ? '#e74c3c' : (percentage < 75) ? '#f1c40f' : '#2ecc71';
        }

        if (feedback) {
            if (percentage === 0) feedback.innerText = "Completa la matriz para obtener tu diagnóstico";
            else if (percentage < 40) feedback.innerText = "Nivel Crítico: Estructura técnica débil";
            else if (percentage < 75) feedback.innerText = "Nivel Moderado: Ejecución inconsistente";
            else feedback.innerText = "Nivel Avanzado: Proceso de decisión sólido";
        }

        // 3. DETECCIÓN DE PUNTOS CIEGOS (Mapeo de Brechas)
        for (let pIdx = 0; pIdx < 8; pIdx++) {
            let practiceTotal = 0;
            for (let i = 1; i <= 3; i++) {
                practiceTotal += parseInt(document.querySelector(`[data-id="ej3_p${pIdx}_i${i}"]`)?.value || 0);
            }
            if (practiceTotal < 4) opportunityAreas.push(practiceLabels[pIdx]);
        }

        // 4. CONTROL DE VISIBILIDAD DEL CAT
        const areasBox = document.getElementById('ej3-areas-conclusion');
        const areasList = document.getElementById('ej3-areas-list');
        const ctaContainer = document.getElementById('cta-container-ej3');

        if (totalPoints > 0 && opportunityAreas.length > 0) {
            areasBox?.classList.remove('hidden');
            ctaContainer?.classList.remove('hidden');
            if (areasList) {
                areasList.innerHTML = opportunityAreas.map(area => 
                    `<span class="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold border border-red-100">⚠️ ${area}</span>`
                ).join('');
            }
        } else {
            areasBox?.classList.add('hidden');
            ctaContainer?.classList.add('hidden');
        }
    };

    window.switchEj4Tab = (tab) => {
        const calcView = document.getElementById('ej4-calc-view');
        const exampleView = document.getElementById('ej4-example-view');
        const btnCalc = document.getElementById('tab-ej4-calc');
        const btnExample = document.getElementById('tab-ej4-example');

        if (!calcView || !exampleView || !btnCalc || !btnExample) return;

        if (tab === 'calc') {
            // Visibilidad de Contenedores
            calcView.classList.remove('hidden');
            calcView.classList.add('block');
            exampleView.classList.remove('block');
            exampleView.classList.add('hidden');

            // Estado Activo: Calculadora
            btnCalc.classList.add('border-[#0F3460]', 'text-[#0F3460]');
            btnCalc.classList.remove('border-transparent', 'text-gray-400');

            // Estado Inactivo: Ejemplo
            btnExample.classList.add('border-transparent', 'text-gray-400');
            btnExample.classList.remove('border-[#0F3460]', 'text-[#0F3460]');
        } else {
            // Visibilidad de Contenedores
            calcView.classList.remove('block');
            calcView.classList.add('hidden');
            exampleView.classList.remove('hidden');
            exampleView.classList.add('block');

            // Estado Activo: Ejemplo
            btnExample.classList.add('border-[#0F3460]', 'text-[#0F3460]');
            btnExample.classList.remove('border-transparent', 'text-gray-400');

            // Estado Inactivo: Calculadora
            btnCalc.classList.add('border-transparent', 'text-gray-400');
            btnCalc.classList.remove('border-[#0F3460]', 'text-[#0F3460]');

            // SINCRONIZACIÓN PEDAGÓGICA: Carga automática del primer punto del ejemplo
            if (window.changeEj4Interpretation) {
                currentEj4Step = 0; // Reiniciamos al primer paso
                window.changeEj4Interpretation(0); // Disparamos la renderización
            }
        }
    };

    // --- 10. MOTOR DINÁMICO DE TEMPORALIDAD - EJERCICIO 4 ---
    /**
     * Regenera las columnas de la tabla FCL basándose en el periodo seleccionado (3 o 6 meses).
     * Mantiene la integridad técnica mediante IDs persistentes que el WorkbookCore detecta
     * para el autoguardado en Firebase.
     */
    window.updateFCLPeriod = (months) => {
        const btn3 = document.getElementById('btn-fcl-3');
        const btn6 = document.getElementById('btn-fcl-6');

        // 1. Actualización Visual de los Selectores (Estilo Prestige)
        [btn3, btn6].forEach(btn => {
            if (btn) {
                btn.classList.remove('bg-[#0F3460]', 'text-white', 'shadow-md');
                btn.classList.add('text-gray-400');
            }
        });
        const activeBtn = (months === 3) ? btn3 : btn6;
        if (activeBtn) {
            activeBtn.classList.add('bg-[#0F3460]', 'text-white', 'shadow-md');
            activeBtn.classList.remove('text-gray-400');
        }

        // 2. Diccionarios de Categorías (Mapeo Granular)
        const inputCategories = [
            { id: 'ingreso_ventas', theme: 'blue' },
            { id: 'ingreso_otros', theme: 'blue' },
            { id: 'egreso_costoventa', theme: 'red' },
            { id: 'egreso_comisiones', theme: 'red' },
            { id: 'egreso_nomina', theme: 'red' },
            { id: 'egreso_renta', theme: 'red' },
            { id: 'egreso_servicios', theme: 'red' },
            { id: 'egreso_otros', theme: 'red' }
        ];
        
        // Filas que solo muestran resultados (Subtotales y Total FCL)
        const resultCategories = ['ingreso_total', 'egreso_total', 'fcl'];

        // 3. Limpieza de Contenedores y Preparación de Flexbox
        const headerContainer = document.getElementById('fcl-header-months-container');
        if (headerContainer) headerContainer.innerHTML = '<div class="flex w-full"></div>';
        const headerFlex = headerContainer?.querySelector('.flex');

        inputCategories.forEach(cat => {
            const row = document.getElementById(`row-${cat.id}-inputs`);
            if (row) row.innerHTML = '<div class="flex w-full"></div>';
        });

        resultCategories.forEach(cat => {
            const row = document.getElementById(`row-${cat}-results`);
            if (row) row.innerHTML = '<div class="flex w-full"></div>';
        });

        // 4. Generación Quirúrgica de Columnas
        for (let i = 1; i <= months; i++) {
            // Encabezados de Mes
            if (headerFlex) {
                headerFlex.innerHTML += `
                    <div class="flex-1 min-w-[70px] text-center text-[9px] font-black text-gray-400 uppercase tracking-widest border-l border-gray-100 py-1">
                        Mes ${i}
                    </div>`;
            }

            // Inputs Dinámicos por Categoría
            inputCategories.forEach(cat => {
                const flexContainer = document.getElementById(`row-${cat.id}-inputs`)?.querySelector('.flex');
                if (flexContainer) {
                    const bgColor = cat.theme === 'blue' ? 'bg-blue-50/40' : 'bg-red-50/40';
                    const textColor = cat.theme === 'blue' ? 'text-[#0F3460]' : 'text-red-700';
                    const focusColor = cat.theme === 'blue' ? 'focus:ring-[#0F3460]' : 'focus:ring-red-600';
                    
                    flexContainer.innerHTML += `
                        <div class="flex-1 min-w-[70px] px-1 border-l border-gray-100">
                            <input type="text" placeholder="$0" 
                                class="autosave-input w-full p-2 text-[10px] font-bold text-center border-none ${bgColor} rounded-lg focus:ring-2 ${focusColor} transition-all ${textColor}"
                                data-section="ej4" data-id="ej4_${cat.id}_${i}" oninput="if(window.calculateFCL) window.calculateFCL()">
                        </div>`;
                }
            });

            // Celdas de Resultados Intermedios y Finales
            resultCategories.forEach(cat => {
                const flexContainer = document.getElementById(`row-${cat}-results`)?.querySelector('.flex');
                if (flexContainer) {
                    const isExpense = cat === 'egreso_total';
                    const textColor = isExpense ? 'text-red-600' : 'text-[#0F3460]';
                    flexContainer.innerHTML += `
                        <div id="ej4_${cat}_res_${i}" class="flex-1 min-w-[70px] text-center text-[10px] font-black ${textColor} border-l border-gray-200 py-2 flex items-center justify-center">
                            $0.00
                        </div>`;
                }
            });
        }

        // 5. Persistencia de Preferencia de Periodo
        if (window.WorkbookCore) {
            WorkbookCore.saveProgress('ej4_periodo_seleccionado', months);
        }

        // 6. Hidratación Quirúrgica y Cálculo Inicial
        setTimeout(() => {
            // Recuperamos datos del LocalStorage para rellenar los inputs granulares
            for (let i = 1; i <= months; i++) {
                inputCategories.forEach(cat => {
                    const val = localStorage.getItem(`cuaderno_ej4_${cat.id}_${i}`);
                    const input = document.querySelector(`[data-id="ej4_${cat.id}_${i}"]`);
                    if (input && val) input.value = val;
                });
            }
            if (window.calculateFCL) window.calculateFCL();
        }, 100);
    };

    // --- 11. MOTOR DE CÁLCULO FINANCIERO GRANULAR - EJERCICIO 4 ---
    /**
     * Procesa sumatorias, promedios y balances mensuales en tiempo real con desglose granular.
     * Mantiene la objetividad técnica calculando ingresos totales, egresos totales y el FCL final.
     */
    window.calculateFCL = () => {
        const btn6 = document.getElementById('btn-fcl-6');
        const months = (btn6 && btn6.classList.contains('bg-[#0F3460]')) ? 6 : 3;
        const incomeCategories = ['ingreso_ventas', 'ingreso_otros'];
        const expenseCategories = ['egreso_costoventa', 'egreso_comisiones', 'egreso_nomina', 'egreso_renta', 'egreso_servicios', 'egreso_otros'];
        const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

        let categoryTotals = {};
        [...incomeCategories, ...expenseCategories].forEach(cat => categoryTotals[cat] = 0);
        let grandTotalIncomes = 0, grandTotalExpenses = 0;
        let monthlyFCLList = [];

        // 1. Procesamiento Mensual
        for (let i = 1; i <= months; i++) {
            let mInc = 0, mExp = 0;
            incomeCategories.forEach(c => {
                const n = parseFloat(document.querySelector(`[data-id="ej4_${c}_${i}"]`)?.value.replace(/[^0-9.-]+/g, "")) || 0;
                mInc += n; categoryTotals[c] += n;
            });
            expenseCategories.forEach(c => {
                const n = parseFloat(document.querySelector(`[data-id="ej4_${c}_${i}"]`)?.value.replace(/[^0-9.-]+/g, "")) || 0;
                mExp += n; categoryTotals[c] += n;
            });
            const mFCL = mInc - mExp;
            monthlyFCLList.push(mFCL);
            grandTotalIncomes += mInc; grandTotalExpenses += mExp;

            document.getElementById(`ej4_ingreso_total_res_${i}`)?.setAttribute('text', formatter.format(mInc)); // Support dynamic update
            document.getElementById(`ej4_ingreso_total_res_${i}`).innerText = formatter.format(mInc);
            document.getElementById(`ej4_egreso_total_res_${i}`).innerText = formatter.format(mExp);
            const resFCL = document.getElementById(`ej4_fcl_res_${i}`);
            if (resFCL) { 
                resFCL.innerText = formatter.format(mFCL); 
                resFCL.style.color = (mFCL < 0) ? '#e74c3c' : '#0F3460';
            }
        }

        // 2. Promedios y Totales
        const avgFCL = (grandTotalIncomes - grandTotalExpenses) / months;
        const annualFCL = avgFCL * 12;
        
        document.getElementById('fcl-promedio').innerText = formatter.format(avgFCL);
        document.getElementById('fcl-promedio').style.color = (avgFCL < 0) ? '#e74c3c' : '#0F3460';
        Object.keys(categoryTotals).forEach(c => {
            const el = document.getElementById(`${c}-promedio`);
            if (el) el.innerText = formatter.format(categoryTotals[c] / months);
        });

        // 3. ACTUALIZACIÓN DEL DIAGNÓSTICO (REVELACIÓN QUIRÚRGICA)
        const diagContainer = document.getElementById('fcl-results-container-2-2');
        if (diagContainer && grandTotalIncomes > 0) {
            diagContainer.classList.remove('hidden');
            
            // A. Evolución Mensual
            const grid = document.getElementById('monthly-fcl-results-2-2');
            if (grid) {
                grid.innerHTML = monthlyFCLList.map((val, idx) => `
                    <div class="bg-white p-3 rounded-xl border border-gray-100 text-center">
                        <p class="text-[8px] font-black text-gray-400 uppercase mb-1">Mes ${idx+1}</p>
                        <p class="text-xs font-bold ${val < 0 ? 'text-red-500' : 'text-[#0F3460]'}">${formatter.format(val)}</p>
                    </div>
                `).join('');
            }

            // B. Dashboards Principales
            document.getElementById('avg-monthly-fcl-2-2').innerText = formatter.format(avgFCL);
            document.getElementById('annual-fcl-2-2').innerText = formatter.format(annualFCL);

            // PERSISTENCIA QUIRÚRGICA: Guardamos los resultados calculados para que el Ejercicio 7 pueda leerlos
            if (window.WorkbookCore) {
                WorkbookCore.saveProgress('avg-monthly-fcl-2-2', avgFCL.toFixed(2));
                WorkbookCore.saveProgress('annual-fcl-2-2', annualFCL.toFixed(2));
            }

            // C. Semáforos (Lógica Externa Innegociable)
            const updateSem = (id, minPer, maxPer) => {
                const el = document.getElementById(id);
                if (el) {
                    const min = annualFCL * minPer;
                    const max = annualFCL * maxPer;
                    el.querySelector('p:last-child').innerText = `${formatter.format(min)} - ${formatter.format(max)}`;
                }
            };
            updateSem('semaphore-green-2-2', 0, 0.08);
            updateSem('semaphore-blue-2-2', 0.09, 0.20);
            updateSem('semaphore-yellow-2-2', 0.21, 0.70);
            updateSem('semaphore-red-2-2', 0.71, 1.00);

            // D. CTA Dinámico
            const ctaBox = document.getElementById('fcl-cta-container-2-2');
            if (ctaBox) {
                if (annualFCL <= 0) {
                    ctaBox.innerHTML = `<div class="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                        <p class="text-red-800 font-bold mb-2">⚠️ Situación Crítica detectada</p>
                        <p class="text-xs text-red-600 mb-4">Tu negocio está operando sin margen de maniobra. No realices inversiones hasta estabilizar tu flujo.</p>
                        <button onclick="window.sendConsultancyEmail('fcl_urgente')" class="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase">Solicitar Plan de Rescate</button>
                    </div>`;
                } else {
                    const esMicro = annualFCL < 100000;
                    ctaBox.innerHTML = `<div class="bg-[#0F3460] p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl">
                        <div class="relative z-10">
                            <h4 class="text-lg font-black text-[#957C3D] mb-2 uppercase">${esMicro ? 'Capacidad de Microinversión' : 'Capacidad de Escalamiento'}</h4>
                            <p class="text-xs opacity-80 mb-6 italic leading-relaxed">${esMicro ? 'Tu flujo permite inversiones tácticas de bajo costo. Enfócate en herramientas que liberen tu tiempo de inmediato.' : 'Cuentas con un flujo sólido para proyectos de expansión. Es momento de delegar áreas críticas y tecnificar tu operación.'}</p>
                            <button onclick="window.sendConsultancyEmail('fcl_estrategia')" class="w-full bg-[#957C3D] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#866d31] transition-all">Validar mi Estrategia de Inversión</button>
                        </div>
                    </div>`;
                }
            }
        }
    };

    // --- 12. GESTOR DE INTERPRETACIÓN (BURBUJA FLOTANTE EJ. 4) ---
    let currentEj4Step = 0;
    const ej4Interpretations = [
        `<strong>Guía de lectura estratégica:</strong><br><br><strong>1. Ingresos (Ventas):</strong> Observa el Mes 2: las ventas caen a $38,000. Sin el FCL, el dueño solo sentiría "falta de flujo", pero aquí identificamos que esa caída es el origen del desbalance operativo.`,
        `<strong>Guía de lectura estratégica:</strong><br><br><strong>2. El Peso Fijo:</strong> Los egresos en el Mes 2 son de $38,500. Al ser mayores que el ingreso, el negocio deja de ser autosuficiente. El gasto fijo es la "cuota de existencia" que no perdona caídas de venta.`,
        `<strong>Guía de lectura estratégica:</strong><br><br><strong>3. La Verdad del FCL:</strong> El resultado de -$500 en el Mes 2 es una señal de alerta roja. Indica que ese mes la empresa "quemó" caja en lugar de generarla, obligando al dueño a financiarse con ahorros o deuda.`,
        `<strong>Guía de lectura estratégica:</strong><br><br><strong>4. Capacidad de Maniobra:</strong> Con un FCL promedio de $1,633, Creativa Digital solo tiene $19,600 anuales para invertir. Comprar un software de $5,000 compromete el 25% de su utilidad real anual. Es una decisión de Alto Riesgo.`
    ];

    /**
     * Controla la navegación del caso de estudio (Ejemplo FCL).
     * @param {number} direction - 1 para avanzar, -1 para retroceder
     */
    window.changeEj4Interpretation = (direction) => {
        // 1. Cálculo del paso con blindaje de límites (0 a N)
        let nextStep = currentEj4Step + direction;
        if (nextStep < 0) nextStep = 0;
        if (nextStep >= ej4Interpretations.length) nextStep = ej4Interpretations.length - 1;
        
        currentEj4Step = nextStep;

        const textEl = document.getElementById('ej4-interpretation-text');
        const counterEl = document.getElementById('ej4-interpretation-counter');

        if (textEl && counterEl) {
            // 2. Animación Liquid Glass: Transición de salida
            textEl.style.opacity = '0';
            textEl.style.transform = 'translateY(5px)';
            
            setTimeout(() => {
                // 3. Inyección de contenido estratégico
                textEl.innerHTML = ej4Interpretations[currentEj4Step];
                counterEl.innerText = `${currentEj4Step + 1} / ${ej4Interpretations.length}`;
                
                // 4. Transición de entrada
                textEl.style.opacity = '1';
                textEl.style.transform = 'translateY(0)';
            }, 200); 
        }
    };

    /**
     * MANAGER DE CONSULTORÍA (ACTIVACIÓN DEL CAT)
     * Rescata la conexión de correo institucional de la app externa.
     */
    window.sendConsultancyEmail = function(tipo) {
        const emailDestino = "contacto@miempresacrece.com.mx";
        const nombre = document.querySelector('[data-id="sesionc_nombre_participante"]')?.value || "Empresario";
        const empresa = document.querySelector('[data-id="sesionc_nombre_empresa"]')?.value || "Mi Empresa";
        
        let asunto = "";
        let cuerpo = "";

        // Lógica de bifurcación por origen del CAT
        if (tipo === 'ej7_monto') {
            // Captura de datos financieros en tiempo real del Ejercicio 7
            const meses = document.getElementById('ej7_meses_fcl')?.innerText || "0.0";
            const porc = document.getElementById('ej7_porcentaje_anual')?.innerText || "0%";
            
            asunto = `Alerta de Riesgo: Evaluación de Monto - ${empresa}`;
            cuerpo = `Hola equipo de Mi Empresa Crece,\n\nSoy ${nombre} de la empresa ${empresa}.\n\nHe realizado el Ejercicio 7 (Evaluación del Monto) y el sistema ha detectado un nivel de riesgo que requiere validación experta:\n\n- Esfuerzo detectado: ${meses} meses de FCL.\n- Compromiso anual: ${porc} de mi liquidez.\n\nMe gustaría recibir apoyo para revisar la viabilidad técnica de esta inversión y no afectar mi operación operativa.\n\nSaludos.`;
        } else {
            // Mantener lógica original para Ejercicio 3 u otros diagnósticos
            const reflexion = document.getElementById('reflection')?.value || "Sin reflexión definida.";
            asunto = `Solicitud de Apoyo Técnico (Ejercicio 3) - ${empresa}`;
            cuerpo = `Hola equipo de Mi Empresa Crece,\n\nSoy ${nombre} de la empresa ${empresa}.\n\nHe completado mi autoevaluación de gestión y he identificado la siguiente área de oportunidad:\n\n"${reflexion}"\n\nMe gustaría recibir apoyo para profesionalizar mi proceso de inversión.\n\nSaludos.`;
        }

        const mailtoUrl = `mailto:${emailDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

        // MÉTODO QUIRÚRGICO: Evita que el workbook se detenga al disparar el correo.
        // Creamos un link "fantasma" que abre el cliente de correo en un proceso independiente.
        const navLink = document.createElement('a');
        navLink.href = mailtoUrl;
        navLink.target = '_blank'; 
        navLink.click();
    };

    /**
     * CONTROLADOR GLOBAL DE MODALES (SESIÓN C)
    */
    window.openFCLInfo = function(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const overlay = document.getElementById('fcl-overlay');
        const fclModal = document.getElementById('fcl-modal');
        const plazoModal = document.getElementById('plazo-modal');

        if (overlay && fclModal) {
            if (plazoModal) plazoModal.style.display = 'none'; // Blindaje: oculta el otro modal
            overlay.classList.add('active');
            fclModal.classList.add('active');
            fclModal.style.display = 'block';
        }
    };

    window.openPlazoInfo = function(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const overlay = document.getElementById('fcl-overlay');
        const fclModal = document.getElementById('fcl-modal');
        const plazoModal = document.getElementById('plazo-modal');

        if (overlay && plazoModal) {
            if (fclModal) fclModal.style.display = 'none'; // Blindaje: oculta el otro modal
            overlay.classList.add('active');
            plazoModal.classList.add('active');
            plazoModal.style.display = 'block';
        }
    };

    window.closeFCLInfo = function() {
        const overlay = document.getElementById('fcl-overlay');
        const modals = [document.getElementById('fcl-modal'), document.getElementById('plazo-modal')];
        if (overlay) overlay.classList.remove('active');
        modals.forEach(m => {
            if (m) { m.classList.remove('active'); m.style.display = 'none'; }
        });
    };
    /**
     * CONTROLADOR DE MODAL - EJERCICIO 8 (PLAZO)
     * Despliega la guía técnica sobre velocidad de riesgo y Payback.
     */
    window.openPlazoInfo = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const overlay = document.getElementById('fcl-overlay'); 
        const plazoModal = document.getElementById('plazo-modal');

        if (overlay && plazoModal) {
            overlay.classList.add('active');
            plazoModal.classList.add('active');
            plazoModal.style.display = 'block';
        }
    };

    window.closePlazoInfo = function() {
        const overlay = document.getElementById('fcl-overlay');
        const plazoModal = document.getElementById('plazo-modal');
        if (overlay) overlay.classList.remove('active');
        if (plazoModal) {
            plazoModal.classList.remove('active');
            plazoModal.style.display = 'none';
        }
    };

    // Vinculación de eventos de cierre (Seguridad de Trazabilidad)
    ['fcl-close', 'plazo-close', 'plazo-close-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = window.closeFCLInfo;
    });

    // Delegación de eventos para botones de cierre del Ejercicio 8
    document.addEventListener('click', (e) => {
        if (e.target.id === 'plazo-close' || e.target.id === 'plazo-close-btn') {
            window.closePlazoInfo();
        }
    });
    
    const overlay = document.getElementById('fcl-overlay');
    if (overlay) {
        overlay.onclick = (e) => { 
            if (e.target === overlay) {
                window.closeFCLInfo();
                window.closePlazoInfo();
            }
        };
    }
    
    // Listener de teclado global para cerrar todos los modales informativos con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeFCLInfo();
            window.closePlazoInfo();
        }
    });

    /**
     * PERFORMANCE MANAGER | MOTOR DE EVALUACIÓN (EJ. 6)
     * Gestiona el ROI Anualizado y la Matriz de Categorización.
     */
    window.PerformanceManager = {
        calculateROI: function() {
            const montoInput = document.querySelector('[data-id="ej6_monto_inversion"]');
            const rendimientoInput = document.querySelector('[data-id="ej6_rendimiento_esperado"]');
            const monto = parseFloat(montoInput?.value.replace(/[^0-9.-]+/g, "")) || 0;
            const rendimiento = parseFloat(rendimientoInput?.value.replace(/[^0-9.-]+/g, "")) || 0;
            const plazo = parseInt(document.querySelector('[data-id="ej6_plazo_meses"]')?.value) || 12;

            const display = document.getElementById('ej6_roi_result');
            const badge = display?.nextElementSibling; // El cuadro de texto debajo del porcentaje

            if (monto > 0) {
                // 1. CÁLCULO FIEL: ROI Anualizado = ((Rendimiento / Monto) / (Plazo / 12)) * 100
                const roiAnualizado = ((rendimiento / monto) / (plazo / 12)) * 100;
                
                if (display) {
                    display.innerText = roiAnualizado.toFixed(1) + '%';
                    
                    // 2. RANGOS METODOLÓGICOS EXACTOS
                    let status = "", color = "", bg = "";
                    
                    if (roiAnualizado >= 30) {
                        status = "ALTA RENTABILIDAD";
                        color = "#16a34a"; // Verde Esmeralda
                        bg = "#dcfce7";
                    } else if (roiAnualizado >= 15) {
                        status = "RENTABILIDAD MEDIA";
                        color = "#ca8a04"; // Oro Viejo
                        bg = "#fef9c3";
                    } else {
                        status = "BAJA RENTABILIDAD";
                        color = "#dc2626"; // Rojo Alerta
                        bg = "#fee2e2";
                    }

                    // 3. ACTUALIZACIÓN VISUAL PRESTIGE
                    display.style.color = color;
                    if (badge) {
                        badge.innerText = status;
                        badge.style.backgroundColor = bg;
                        badge.style.color = color;
                        badge.classList.remove('bg-gray-200', 'text-gray-500');
                    }
                }
                
                if (window.WorkbookCore) {
                    WorkbookCore.saveProgress('ej6_roi_calculado', roiAnualizado.toFixed(1));
                }
            } else {
                // Reset si no hay datos suficientes
                if (display) {
                    display.innerText = "0%";
                    display.style.color = "#d1d5db";
                }
                if (badge) {
                    badge.innerText = "Introduce datos";
                    badge.style.backgroundColor = "#e5e7eb";
                    badge.style.color = "#6b7280";
                }
            }
        },

        updateCategorization: function() {
            const f = parseInt(document.querySelector('[data-id="ej6_frecuencia"]')?.value) || 0;
            const s = parseInt(document.querySelector('[data-id="ej6_solucion"]')?.value) || 0;
            const i = parseInt(document.querySelector('[data-id="ej6_impacto"]')?.value) || 0;
            
            const totalPoints = f + s + i;
            const categoryDisplay = document.getElementById('ej6_categoria_result');
            const iconDisplay = document.getElementById('ej6_categoria_icon');

            if (categoryDisplay) {
                // TRACEABILIDAD: Limpiamos solo las clases de estado, preservando la estructura base del badge
                categoryDisplay.classList.remove('bg-gray-200', 'text-gray-500', 'bg-blue-100', 'text-brand-blue', 'bg-orange-100', 'text-brand-orange');
                
                if (totalPoints >= 5) {
                    categoryDisplay.innerText = "ESTRATEGIA MAESTRA";
                    categoryDisplay.classList.add('bg-orange-100', 'text-brand-orange');
                    if (iconDisplay) iconDisplay.innerHTML = '🏆';
                } else if (totalPoints >= 3) {
                    categoryDisplay.innerText = "INVERSIÓN TÁCTICA";
                    categoryDisplay.classList.add('bg-blue-100', 'text-brand-blue');
                    if (iconDisplay) iconDisplay.innerHTML = '⚙️';
                } else {
                    categoryDisplay.innerText = "GASTO ORDINARIO";
                    categoryDisplay.classList.add('bg-gray-200', 'text-gray-500');
                    if (iconDisplay) iconDisplay.innerHTML = '📦';
                }
            }
        },

        syncIniciativas: function() {
            const selector = document.getElementById('ej6_iniciativa_selector');
            if (!selector) return;

            // 1. Limpieza de opciones previas (preservando el prompt inicial)
            selector.innerHTML = '<option value="">-- Elige una iniciativa guardada --</option>';

            // 2. Recuperación de frases del Paso 5 desde el LocalStorage (Trazabilidad limpia)
            const initiatives = [];
            for (let i = 1; i <= 5; i++) {
                const val = localStorage.getItem(`cuaderno_ej5_prio${i}`);
                if (val && val.trim() !== "") {
                    initiatives.push(val.trim());
                }
            }

            // 3. Poblado dinámico del selector
            if (initiatives.length > 0) {
                initiatives.forEach(text => {
                    const opt = document.createElement('option');
                    opt.value = text;
                    // Limitamos el texto visual en el select para no romper el UI
                    opt.innerText = text.length > 75 ? text.substring(0, 75) + "..." : text;
                    selector.appendChild(opt);
                });
            } else {
                const opt = document.createElement('option');
                opt.value = "";
                opt.innerText = "⚠️ No se encontraron iniciativas en el Paso 5";
                opt.disabled = true;
                selector.appendChild(opt);
            }
        },

        applyInitiativeText: function(text) {
            if (!text) return;
            // Ubicamos el textarea de "problema o meta" del análisis cualitativo en Ej. 6
            const targetInput = document.querySelector('[data-id="ej6_problema_resuelve"]');
            if (targetInput) {
                targetInput.value = text;
                // VITAL: Disparamos el evento 'input' para que el motor de autoguardado detecte el cambio
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Feedback visual sutil (Opcional: Prestige Style)
                targetInput.focus();
                targetInput.classList.add('ring-2', 'ring-green-400');
                setTimeout(() => targetInput.classList.remove('ring-2', 'ring-green-400'), 1000);
            }
        },

        /**
         * Refinado para soportar múltiples contextos (ROI vs Estratégico).
         * @param {string} type - 'roi' para enfoque numérico, 'strat' para enfoque cualitativo.
         */
        openExample: function(type) {
            const container = document.getElementById('example-float-container');
            const content = document.getElementById('example-float-content');
            const title = document.getElementById('example-title');
            
            if (!container || !content) {
                console.error("🚨 Dreams Error: Contenedor flotante no encontrado.");
                return;
            }

            let html = '';
            if (type === 'roi') {
                if (title) title.innerText = "Guía: Horno Industrial (ROI)";
                html = `
                    <div class="animate-fadeIn">
                        <p class="text-[10px] text-gray-500 mb-3 leading-relaxed">Referencia de rentabilidad directa (Maquinaria):</p>
                        <ul class="space-y-2 text-[11px] text-gray-600 italic">
                            <li><span class="font-bold text-[#0F3460]">Monto:</span> $100,000 MXN</li>
                            <li><span class="font-bold text-[#0F3460]">Ganancia:</span> $40,000 (Ahorro/Extra)</li>
                            <li><span class="font-bold text-[#0F3460]">Plazo:</span> 24 meses</li>
                            <li class="mt-2 pt-2 border-t border-gray-100">
                                <span class="font-black text-green-600 uppercase tracking-widest text-[9px]">Resultado: 20% ROI ANUALIZADO</span>
                            </li>
                        </ul>
                    </div>
                `;
            } else if (type === 'strat') {
                if (title) title.innerText = "Guía: Sistema CRM (Estratégico)";
                html = `
                    <div class="animate-fadeIn">
                        <p class="text-[10px] text-gray-500 mb-3 leading-relaxed">Referencia de impacto estructural (Software):</p>
                        <ul class="space-y-2 text-[11px] text-gray-600 italic">
                            <li><span class="font-bold text-[#0F3460]">Frecuencia:</span> Alta (2) - Diario</li>
                            <li><span class="font-bold text-[#0F3460]">Solución:</span> Total (2) - Elimina causa raíz</li>
                            <li><span class="font-bold text-[#0F3460]">Impacto:</span> Estratégico (2) - Escala</li>
                            <li class="mt-2 pt-2 border-t border-gray-100">
                                <span class="font-black text-[#957C3D] uppercase tracking-widest text-[9px]">ESTRATEGIA MAESTRA (5+ pts)</span>
                            </li>
                        </ul>
                    </div>
                `;
            }

            content.innerHTML = html;
            
            // FORZADO QUIRÚRGICO: Anulamos el display:none del inline style
            container.style.setProperty('display', 'block', 'important');
            container.classList.add('active');
        },

        closeExample: function() {
            const container = document.getElementById('example-float-container');
            if (container) {
                container.style.setProperty('display', 'none', 'important');
                container.classList.remove('active');
            }
        },

        /**
         * Actualiza las instrucciones con los textos METODOLÓGICOS ORIGINALES.
         * TRACEABILIDAD: Mantiene la fidelidad absoluta con el workbook externo.
         */
        updateInstructions: function(type) {
            const display = document.getElementById('ej6_instrucciones_dinamicas');
            const selectorContainer = document.getElementById('ej6_iniciativa_selector_container');
            if (!display) return;

            const instructions = {
                'pasada': '<strong>Inversión Realizada:</strong> Considera todos los gastos reales efectuados, no solo el presupuesto original. Si ya maduró o si no se ha completado, ingresa el valor estimado de rendimientos.',
                'planeada': '<strong>Inversión Planeada / Ejecución:</strong> Ingresa el plazo objetivo definido para los rendimientos. Si no está definido, asígnalo ahora; sé exigente para saber si fue exitosa.',
                'iniciativa': '<strong>Escenario de Iniciativa:</strong> Evaluaremos un escenario probable de tus prioridades definidas. Esto servirá como guía para establecer tu presupuesto y proyección de ventas posterior.'
            };

            // 1. Inyección de HTML con estilo institucional
            display.innerHTML = instructions[type] || 'Selecciona una opción para ver las instrucciones.';
            display.classList.remove('text-gray-400', 'italic');
            display.classList.add('text-[#00529B]');
            
            // 2. Control Quirúrgico de Visibilidad y Sincronización
            if (selectorContainer) {
                if (type === 'iniciativa') {
                    // Mostramos el selector y disparamos la carga de frases del Paso 5
                    selectorContainer.classList.remove('hidden');
                    this.syncIniciativas();
                } else {
                    // Ocultamos el selector si elige "Pasada" o "Planeada"
                    selectorContainer.classList.add('hidden');
                }
            }
        }

    };

    /**
     * AMOUNT MANAGER | MOTOR DE VIABILIDAD (EJ. 7)
     * Gestiona la conexión con el FCL del Ejercicio 4 y los cálculos de meses de cobertura.
     */
    window.AmountManager = {
        // 1. CONTROL DE FUENTE: Gestiona clases visuales y visibilidad de entrada manual
        toggleFCLSource: function(radioEl) {
            const value = radioEl.value;
            const manualContainer = document.getElementById('manual-fcl-container');
            
            // Gestión de Resaltado: Removemos .selected de todas las cards del grupo
            document.querySelectorAll('.fcl-option-card').forEach(card => card.classList.remove('selected'));
            
            // Añadimos .selected a la card del radio presionado
            radioEl.closest('.fcl-option-card')?.classList.add('selected');

            if (manualContainer) {
                if (value === 'manual') {
                    manualContainer.classList.remove('hidden');
                    manualContainer.classList.add('active'); // Activa borde dashed del CSS
                    // Foco automático para mejorar UX
                    setTimeout(() => document.querySelector('[data-id="ej7_manual_fcl_value"]')?.focus(), 100);
                } else {
                    manualContainer.classList.add('hidden');
                    manualContainer.classList.remove('active');
                }
            }
            this.calculateFCLMonths(); 
        },

        // 2. OBTENCIÓN DE DATOS (TRAZABILIDAD BLINDADA): Recupera el FCL de la fuente o del caché
        getFCLValue: function() {
            const source = document.querySelector('input[name="fcl_source"]:checked')?.value;
            
            if (source === 'manual') {
                const manualInput = document.querySelector('[data-id="ej7_manual_fcl_value"]');
                return parseFloat(manualInput?.value.replace(/[^0-9.-]+/g, "")) || 0;
            } else {
                // 1. Intentamos recuperar el promedio ya calculado por el Ejercicio 4
                let fclValue = parseFloat(localStorage.getItem('cuaderno_avg-monthly-fcl-2-2')) || 0;

                // 2. RESPALDO QUIRÚRGICO: Si es 0, reconstruimos el cálculo desde los datos brutos de Ej 4
                if (fclValue === 0) {
                    const period = parseInt(localStorage.getItem('cuaderno_ej4_periodo_seleccionado')) || 3;
                    const cats = ['ingreso_ventas', 'ingreso_otros', 'egreso_costoventa', 'egreso_comisiones', 'egreso_nomina', 'egreso_renta', 'egreso_servicios', 'egreso_otros'];
                    let totalBalance = 0;
                    
                    for (let i = 1; i <= period; i++) {
                        cats.forEach(cat => {
                            const val = parseFloat(localStorage.getItem(`cuaderno_ej4_${cat}_${i}`)) || 0;
                            totalBalance += cat.startsWith('ingreso') ? val : -val;
                        });
                    }
                    fclValue = totalBalance / period;
                }
                return fclValue;
            }
        },

        // 3. MOTOR DE CÁLCULO (Base para el Dashboard)
        calculateFCLMonths: function() {
            const fclMensual = this.getFCLValue();
            const montoInversion = parseFloat(document.querySelector('[data-id="ej7_monto_principal"]')?.value.replace(/[^0-9.-]+/g, "")) || 0;

            // Nueva lógica: Si hay flujo (positivo o negativo), calculamos los meses. 
            // Si el flujo es 0, evitamos división por cero devolviendo 0.
            const mesesCobertura = fclMensual !== 0 ? (montoInversion / fclMensual) : 0;

            console.log(`Logística Ej7: FCL $${fclMensual} | Inversión $${montoInversion} | Meses: ${mesesCobertura.toFixed(1)}`);
            
            // Aquí se disparará la actualización visual del Dashboard en el siguiente paso
            this.updateDashboardUI(mesesCobertura);
        },

        // 4. ACTUALIZACIÓN VISUAL Y CONSEJOS DINÁMICOS
        updateDashboardUI: function(meses) {
            const fclMensual = this.getFCLValue();
            const montoPrincipal = parseFloat(document.querySelector('[data-id="ej7_monto_principal"]')?.value.replace(/[^0-9.-]+/g, "")) || 0;
            const source = document.querySelector('input[name="fcl_source"]:checked')?.value;
            
            // Calculamos la suma de todos los proyectos adicionales
            let montoProyectos = 0;
            for(let i=1; i<=5; i++) {
                const pMonto = parseFloat(document.querySelector(`[data-id="ej7_proy_monto_${i}"]`)?.value.replace(/[^0-9.-]+/g, "")) || 0;
                montoProyectos += pMonto;
            }

            const compromisoTotalAnual = montoPrincipal + montoProyectos;
            const fclAnual = fclMensual * 12;
            const porcentajeConsumo = fclAnual > 0 ? (compromisoTotalAnual / fclAnual) * 100 : 0;

            // --- Actualización Dashboard con Blindaje de Contraste Prestige ---
            const mesesEl = document.getElementById('ej7_meses_fcl');
            const adviceEl = document.getElementById('ej7_advice_box');
            const statusTextEl = document.getElementById('ej7_status_text');
            const porcEl = document.getElementById('ej7_porcentaje_anual');

            // Blindaje de Visibilidad con Sombra de Contraste Prestige 
            const textShadow = "2px 2px 4px rgba(0,0,0,0.3)"; // Sombra sutil para legibilidad

            const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

            if(mesesEl) {
                // 1. Blindaje contra valores infinitos y actualización de cifra principal
                const mesesVal = isFinite(meses) ? meses.toFixed(1) : "0.0";
                mesesEl.innerText = mesesVal;
                mesesEl.style.setProperty('color', '#FFFFFF', 'important');
                mesesEl.style.setProperty('text-shadow', textShadow, 'important');
                
                // 2. REFUERZO DE VISIBILIDAD: Inyectamos la base del FCL directamente debajo del indicador
                let subLabel = mesesEl.parentNode.querySelector('.fcl-base-value');
                if (!subLabel) {
                    subLabel = document.createElement('div');
                    subLabel.className = 'fcl-base-value text-[10px] font-bold opacity-70 mt-1';
                    mesesEl.parentNode.appendChild(subLabel);
                }
                subLabel.innerText = `Base FCL: ${currencyFormatter.format(fclMensual)} / mes`;
            }

            if(porcEl) {
                // 3. Cálculo de porcentaje con protección
                const displayPorc = isFinite(porcentajeConsumo) ? Math.round(porcentajeConsumo) : 0;
                porcEl.innerText = displayPorc + "%";
                porcEl.style.setProperty('color', '#FFFFFF', 'important');
                porcEl.style.setProperty('text-shadow', textShadow, 'important');
                
                // 4. REFUERZO DE VISIBILIDAD: Mostramos el Monto Total de Inversión (Principal + Adicionales)
                let subLabelAnual = porcEl.parentNode.querySelector('.fcl-total-committed');
                if (!subLabelAnual) {
                    subLabelAnual = document.createElement('div');
                    subLabelAnual.className = 'fcl-total-committed text-[10px] font-bold opacity-70 mt-1';
                    porcEl.parentNode.appendChild(subLabelAnual);
                }
                subLabelAnual.innerText = `Compromiso Total: ${currencyFormatter.format(compromisoTotalAnual)}`;
            }

            if(adviceEl && statusTextEl) {
                // Forzamos visibilidad total del consejo con sombra negra de respaldo
                statusTextEl.className = "text-[11px] italic leading-relaxed text-white";
                statusTextEl.style.setProperty('color', '#FFFFFF', 'important');
                statusTextEl.style.setProperty('text-shadow', "1px 1px 2px rgba(0,0,0,0.5)", 'important');

                if (meses === 0) {
                    adviceEl.innerText = "Esperando datos...";
                    adviceEl.className = "inline-block px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80";
                } else if (meses < 0) {
                    // Bloque de Alerta Roja por Déficit Operativo
                    adviceEl.innerText = "🚨 DÉFICIT OPERATIVO";
                    adviceEl.className = "inline-block px-4 py-2 rounded-xl bg-red-600/40 border border-red-500 text-[10px] font-black uppercase text-white animate-pulse";
                    statusTextEl.innerHTML = "<strong style='color: white !important;'>ALERTA CRÍTICA:</strong> No tienes flujo de caja libre. Cualquier inversión ahora se pagará con deuda o capital de trabajo, poniendo en riesgo la supervivencia de la empresa.";
                } else if (meses <= 1) {
                    adviceEl.innerText = "✅ Inversión Segura";
                    adviceEl.className = "inline-block px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-[10px] font-bold uppercase text-green-400";
                    statusTextEl.innerHTML = "<strong style='color: white !important;'>Consejo:</strong> Inversión saludable. El negocio tiene la liquidez para absorber este impacto en un solo mes. Procede con confianza.";
                } else if (meses <= 3) {
                    adviceEl.innerText = "⚠️ Inversión Moderada";
                    adviceEl.className = "inline-block px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-[10px] font-bold uppercase text-yellow-400";
                    statusTextEl.innerHTML = "<strong style='color: white !important;'>Consejo:</strong> Impacto considerable. Estás comprometiendo el flujo de un trimestre. Vigila tus gastos fijos antes de firmar.";
                } else {
                    adviceEl.innerText = "🚨 Alto Riesgo de Flujo";
                    adviceEl.className = "inline-block px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-[10px] font-bold uppercase text-red-400";
                    statusTextEl.innerHTML = "<strong style='color: white !important;'>Consejo:</strong> ¡Peligro! Esta inversión asfixia tu liquidez inmediata. Busca financiamiento externo o pagos diferidos.";
                }
            }

            // --- Actualizar % Consumo, Barra de Progreso y Alertas de Riesgo ---
            const porcElRef = document.getElementById('ej7_porcentaje_anual'); // Re-referencia para seguridad
            const barEl = document.getElementById('ej7_progress_bar');
            const dashboardEl = document.getElementById('ej7-dashboard');

            if(porcEl) porcEl.innerText = Math.round(porcentajeConsumo) + "%";
            
            if(barEl) {
                barEl.style.width = Math.min(porcentajeConsumo, 100) + "%";
                // Semaforización de la barra (Rojo si compromete > 50% de la liquidez anual)
                if (porcentajeConsumo > 50) barEl.style.backgroundColor = "#ef4444"; 
                else if (porcentajeConsumo > 20) barEl.style.backgroundColor = "#eab308"; 
                else barEl.style.backgroundColor = "#957C3D"; 
            }

            // Inyección de la alerta de riesgo ctaBreath (Animación de respiración)
            if (dashboardEl) {
                if (porcentajeConsumo > 50) {
                    dashboardEl.classList.add('high-risk-alert');
                } else {
                    dashboardEl.classList.remove('high-risk-alert');
                }
            }

            // Buscamos la etiqueta "📊 Real" de forma robusta usando el contenedor del radio button
            const autoRadio = document.querySelector('input[data-id="ej7_fcl_source"][value="auto"]');
            const labelReal = autoRadio?.closest('label')?.querySelector('span');

            if (labelReal) {
                if (source === 'auto') {
                    const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
                    // Actualizamos texto y forzamos visibilidad con clases de contraste
                    labelReal.innerText = `📊 Real (${formatter.format(fclMensual)})`;
                    labelReal.classList.remove('text-gray-400');
                    labelReal.classList.add('text-[#0F3460]', 'font-extrabold');
                } else {
                    labelReal.innerText = `📊 Real (Ejercicio 4)`;
                    labelReal.classList.add('text-gray-400');
                    labelReal.classList.remove('text-[#0F3460]', 'font-extrabold');
                }
            }

            // --- ACTIVACIÓN AUTOMÁTICA DE CAT (Contextual Advisory Tool) ---
            const catContainer = document.getElementById('ej7_cat_container');
            if (catContainer) {
                // VISIBILIDAD QUIRÚRGICA: El CAT se activa en cualquiera de estos 3 casos críticos:
                // 1. meses < 0 : El negocio está en DÉFICIT (Riesgo de quiebra técnica).
                // 2. meses > 3 : El esfuerzo es demasiado alto para la liquidez mensual.
                // 3. porcentajeConsumo > 50 : Se compromete más de la mitad del flujo anual.
                
                if (meses < 0 || meses > 3 || porcentajeConsumo > 50) {
                    catContainer.classList.remove('hidden');
                    catContainer.style.display = 'grid'; // Aseguramos el layout de rejilla
                } else {
                    catContainer.classList.add('hidden');
                    catContainer.style.display = 'none';
                }
            }

            if (window.WorkbookCore) {
                WorkbookCore.saveProgress('ej7_meses_calculados', meses.toFixed(1));
                WorkbookCore.saveProgress('ej7_porcentaje_anual', Math.round(porcentajeConsumo));
            }
        }
    };

    /**
     * TIME MANAGER | MOTOR DE VELOCIDAD (EJ. 8)
     * Evalúa el riesgo basado en el plazo de recuperación (Payback).
     * Mantiene la trazabilidad con los criterios de liquidez para PYMES.
     */
    window.TimeManager = {
        evaluate: function() {
            const input = document.querySelector('[data-id="ej8_plazo_propuesto"]');
            const statusEl = document.getElementById('ej8_plazo_status');
            const feedbackEl = document.getElementById('ej8_feedback_text');
            const catContainer = document.getElementById('ej7_cat_container'); // ID compartido en el template ej8
            const val = parseInt(input?.value) || 0;

            if (!statusEl || !feedbackEl) return;

            // Reset inicial si el campo está vacío
            if (val <= 0) {
                statusEl.innerText = "Introduce un plazo";
                statusEl.className = "inline-block mx-auto px-6 py-2 rounded-xl bg-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 transition-all duration-500";
                feedbackEl.innerText = "Define los meses de recuperación para evaluar el nivel de exposición de tu capital.";
                if (catContainer) catContainer.classList.add('hidden');
                return;
            }

            let text = "", feedback = "", colorClasses = "";
            let showCat = false;

            // LÓGICA DE SEMAFORIZACIÓN (Blueprint: 0-6 Exc, 6-12 Est, +18 Riesgo)
            if (val <= 6) {
                text = "EXCELENTE (ALTA LIQUIDEZ)";
                feedback = "Inversión táctica de alta velocidad. El capital retorna pronto para mantener la agilidad operativa.";
                colorClasses = "bg-green-500 text-white shadow-lg shadow-green-200";
            } else if (val <= 12) {
                text = "ESTÁNDAR (PLAZO MEDIO)";
                feedback = "Rango aceptable para equipamiento o tecnología. El riesgo es moderado frente a la incertidumbre.";
                colorClasses = "bg-yellow-500 text-white shadow-lg shadow-yellow-200";
            } else if (val <= 18) {
                text = "OBSERVACIÓN (RETORNO LENTO)";
                feedback = "Atención: El capital queda comprometido por un periodo considerable. Monitorea tu flujo de caja libre.";
                colorClasses = "bg-orange-500 text-white shadow-lg shadow-orange-200";
                showCat = true; 
            } else {
                text = "ALTO RIESGO (CAPITAL CONGELADO)";
                feedback = "Peligro: Plazo demasiado largo para una PYME. Podría asfixiar tu capacidad de reacción ante imprevistos.";
                colorClasses = "bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse";
                showCat = true;
            }

            // Inyección de estados visuales
            statusEl.innerText = text;
            statusEl.className = `inline-block mx-auto px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6 transition-all duration-500 ${colorClasses}`;
            feedbackEl.innerText = feedback;

            // Activación automática de herramientas de asesoría (CAT)
            if (catContainer) {
                if (showCat) {
                    catContainer.classList.remove('hidden');
                    catContainer.style.display = 'grid';
                } else {
                    catContainer.classList.add('hidden');
                    catContainer.style.display = 'none';
                }
            }

            // Persistencia en Firestore/Caché para el reporte final
            if (window.WorkbookCore) {
                WorkbookCore.saveProgress('ej8_plazo_status_text', text);
            }
        }
    };

    /**
     * RISK MANAGER | MOTOR DE PROTECCIÓN (EJ. 9)
     * Gestiona la Matriz de Mitigación y el Algoritmo de Doble Diagnóstico.
     * Mantiene la trazabilidad con las iniciativas del Ejercicio 5.
     */
    window.RiskManager = {
        // 1. SINCRONIZACIÓN DINÁMICA: Importa las ideas del Ejercicio 5 al selector
        syncIniciativas: function() {
            const selector = document.getElementById('current-risk-initiative');
            if (!selector) return;
            
            selector.innerHTML = '<option value="">-- Elige una iniciativa --</option>';
            let found = 0;
            for (let i = 1; i <= 5; i++) {
                const val = localStorage.getItem(`cuaderno_ej5_prio${i}`);
                if (val && val.trim() !== "") {
                    const opt = document.createElement('option');
                    opt.value = val.trim();
                    opt.innerText = val.trim().length > 60 ? val.trim().substring(0, 60) + "..." : val.trim();
                    selector.appendChild(opt);
                    found++;
                }
            }
            if (found === 0) {
                selector.innerHTML = '<option value="">⚠️ Define iniciativas en el Paso 5</option>';
            }
            // Rehidratar selección previa
            const saved = localStorage.getItem('cuaderno_ej9_selected_initiative');
            if (saved) selector.value = saved;
        },

        // 2. CONSTRUCTOR DE FILAS: Crea entradas con IDs únicos para persistencia
        addRiskRow: function() {
            const tbody = document.getElementById('risk-matrix-body');
            if (!tbody) return;
            const rowCount = tbody.children.length + 1;
            const row = document.createElement('tr');
            row.className = "border-b border-gray-50 hover:bg-gray-50/30 transition-colors";
            
            row.innerHTML = `
                <td class="py-4 px-2">
                    <input type="text" placeholder="Ej: Fuga de talento..." class="autosave-input w-full p-3 bg-gray-50 border-none rounded-xl text-xs font-bold text-[#0F3460] shadow-inner" data-id="ej9_risk_desc_${rowCount}">
                </td>
                <td class="py-4 px-2">
                    <select class="autosave-input w-full p-2 text-[10px] font-bold rounded-lg border-none bg-gray-50 outline-none transition-all" data-id="ej9_risk_prob_${rowCount}" onchange="RiskManager.updateRowStyle(this); RiskManager.runDualDiagnosis();">
                        <option value="1">1-Baja</option>
                        <option value="2">2-Media</option>
                        <option value="3">3-Alta</option>
                    </select>
                </td>
                <td class="py-4 px-2">
                    <select class="autosave-input w-full p-2 text-[10px] font-bold rounded-lg border-none bg-gray-50 outline-none transition-all" data-id="ej9_risk_impact_${rowCount}" onchange="RiskManager.updateRowStyle(this); RiskManager.runDualDiagnosis();">
                        <option value="1">1-Bajo</option>
                        <option value="2">2-Medio</option>
                        <option value="3">3-Alto</option>
                    </select>
                </td>
                <td class="py-4 px-2">
                    <textarea placeholder="¿Cómo evitarlo?" class="autosave-input w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] h-16 shadow-inner" data-id="ej9_risk_plan_a_${rowCount}" oninput="RiskManager.runDualDiagnosis()"></textarea>
                </td>
                <td class="py-4 px-2">
                    <textarea placeholder="¿Si llegara a ocurrir?" class="autosave-input w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] h-16 shadow-inner" data-id="ej9_risk_plan_b_${rowCount}" oninput="RiskManager.runDualDiagnosis()"></textarea>
                </td>
                <td class="py-4 px-2 text-center">
                    <div id="ej9_final_level_${rowCount}" class="inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400">---</div>
                </td>
            `;
            tbody.appendChild(row);
            this.updateRowStyle(row.querySelector(`[data-id="ej9_risk_prob_${rowCount}"]`));
            this.updateRowStyle(row.querySelector(`[data-id="ej9_risk_impact_${rowCount}"]`));
        },

        updateRowStyle: function(select) {
            const val = parseInt(select.value);
            select.classList.remove('bg-green-100', 'bg-yellow-100', 'bg-red-100', 'text-green-700', 'text-yellow-700', 'text-red-700');
            if (val === 1) select.classList.add('bg-green-100', 'text-green-700');
            else if (val === 2) select.classList.add('bg-yellow-100', 'text-yellow-700');
            else if (val === 3) select.classList.add('bg-red-100', 'text-red-700');
        },

        // 3. CEREBRO DE DIAGNÓSTICO: Evalúa Vulnerabilidad y Efectividad
        runDualDiagnosis: function() {
            const rows = document.getElementById('risk-matrix-body')?.children;
            if (!rows) return;

            let isVulnerable = false;
            let effectivenessScore = 0; 
            let totalAnalyzed = 0;

            Array.from(rows).forEach((row, idx) => {
                const i = idx + 1;
                const prob = parseInt(document.querySelector(`[data-id="ej9_risk_prob_${i}"]`)?.value) || 0;
                const impact = parseInt(document.querySelector(`[data-id="ej9_risk_impact_${i}"]`)?.value) || 0;
                const planA = document.querySelector(`[data-id="ej9_risk_plan_a_${i}"]`)?.value.trim() || "";
                const planB = document.querySelector(`[data-id="ej9_risk_plan_b_${i}"]`)?.value.trim() || "";
                const levelBox = document.getElementById(`ej9_final_level_${i}`);

                const initialRisk = prob * impact;
                totalAnalyzed++;

                // A. Algoritmo de Vulnerabilidad: Riesgo Alto sin Plan B sólido
                if (initialRisk >= 4 && planB.length < 5) isVulnerable = true;

                // B. Algoritmo de Efectividad: ¿El Plan A realmente reduce la exposición?
                let finalScore = (planA.length > 10) ? Math.max(1, initialRisk - 2) : initialRisk;
                
                let finalLevelText = "Bajo";
                let finalLevelColor = "bg-green-100 text-green-700";
                if (finalScore >= 6) { finalLevelText = "Crítico"; finalLevelColor = "bg-red-600 text-white"; }
                else if (finalScore >= 4) { finalLevelText = "Alto"; finalLevelColor = "bg-red-100 text-red-700"; }
                else if (finalScore >= 2) { finalLevelText = "Medio"; finalLevelColor = "bg-yellow-100 text-yellow-700"; }

                if (levelBox) {
                    levelBox.innerText = finalLevelText;
                    levelBox.className = `inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${finalLevelColor}`;
                }

                if (finalScore < initialRisk) effectivenessScore++;
            });

            // C. Actualización de Tarjetas Visuales
            const vRes = document.querySelector('#diag-vulnerability .diag-result');
            const eRes = document.querySelector('#diag-effectiveness .diag-result');

            if (vRes) {
                vRes.innerText = isVulnerable ? "⛔ PROYECTO VULNERABLE" : "🛡️ COBERTURA SÓLIDA";
                vRes.className = `diag-result text-2xl font-black text-center uppercase tracking-tighter py-4 ${isVulnerable ? 'text-red-600' : 'text-green-600'}`;
            }

            if (eRes && totalAnalyzed > 0) {
                let status = "⚖️ IMPACTO LIMITADO";
                let color = "text-yellow-600";
                if (effectivenessScore === totalAnalyzed) { status = "🚀 MITIGACIÓN EXITOSA"; color = "text-green-600"; }
                else if (effectivenessScore === 0) { status = "❌ ESTRATEGIA INEFICAZ"; color = "text-red-600"; }
                eRes.innerText = status;
                eRes.className = `diag-result text-2xl font-black text-center uppercase tracking-tighter py-4 ${color}`;
            }
        }
    };

    /**
     * PURPOSE MANAGER | MOTOR DE CIERRE ESTRATÉGICO (EJ. 10)
     * Consolida la trazabilidad de los ejercicios 5 y 6 para generar el Pitch.
     */
    window.PurposeManager = {
        syncStrategicMatrix: function() {
            const tbody = document.getElementById('strategic-matrix-body');
            if (!tbody) return;

            // 1. Recuperación de Datos Maestros (Trazabilidad Blindada)
            const areaGanadora = localStorage.getItem('cuaderno_ej5_area_ganadora_final') || "Área no definida";
            const invNombre = localStorage.getItem('cuaderno_ej6_problema_resuelve') || "Inversión no detallada";
            
            // Re-calculamos impacto (Ej 6) para asegurar consistencia si el usuario no pasó por ahí hoy
            const f = parseInt(localStorage.getItem('cuaderno_ej6_frecuencia')) || 0;
            const s = parseInt(localStorage.getItem('cuaderno_ej6_solucion')) || 0;
            const i = parseInt(localStorage.getItem('cuaderno_ej6_impacto')) || 0;
            const totalScore = f + s + i;
            const impactoLabel = totalScore >= 5 ? "ESTRATEGIA MAESTRA" : (totalScore >= 3 ? "INVERSIÓN TÁCTICA" : "GASTO ORDINARIO");

            // 2. Inyección de Fila Única de Alineación
            tbody.innerHTML = `
                <tr class="animate-fadeIn">
                    <td class="p-4">
                        <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Área Clave (Ej. 5):</p>
                        <p class="text-xs font-bold text-[#0F3460]">${areaGanadora}</p>
                    </td>
                    <td class="p-4 text-center">
                        <p class="text-xs font-medium text-gray-600 italic leading-tight">${invNombre}</p>
                    </td>
                    <td class="p-4 text-center">
                        <span class="inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${totalScore >= 5 ? 'bg-orange-100 text-[#957C3D]' : 'bg-blue-100 text-[#0F3460]'}">
                            ${impactoLabel}
                        </span>
                    </td>
                    <td class="p-4">
                        <textarea class="autosave-input w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] h-20 shadow-inner focus:ring-2 focus:ring-[#957C3D] outline-none" 
                            data-id="ej10_resultado_esperado" 
                            placeholder="Ej: Lograr un incremento del 15% en ventas trimestrales..."
                            oninput="PurposeManager.updatePitch()"></textarea>
                    </td>
                </tr>
            `;

            // Rehidratar el textarea y generar el Pitch inicial
            const savedRes = localStorage.getItem('cuaderno_ej10_resultado_esperado');
            if (savedRes) tbody.querySelector('textarea').value = savedRes;
            
            this.updatePitch();
        },

        updatePitch: function() {
            const pitchContainer = document.getElementById('investment-pitch-container');
            if (!pitchContainer) return;

            const inv = localStorage.getItem('cuaderno_ej6_problema_resuelve') || "[INVERSIÓN]";
            const area = localStorage.getItem('cuaderno_ej5_area_ganadora_final') || "[ÁREA]";
            const res = document.querySelector('[data-id="ej10_resultado_esperado"]')?.value || "__________";
            
            // Construcción del Tactic Label (Mapeo dinámico de checkboxes marcados en Ej. 5)
            const tactics = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('cuaderno_ej5_tactica_') && localStorage.getItem(key) === 'true') {
                    const parts = key.split('_');
                    const cleanName = parts[parts.length - 1].replace(/_/g, ' ').toUpperCase();
                    tactics.push(cleanName);
                }
            }
            const tacticLabel = tactics.length > 0 ? tactics.join(' Y ') : "[TÁCTICAS]";

            // Renderizado con estética Prestige (Contraste alto)
            pitchContainer.innerHTML = `
                "La inversión en <span class="text-[#957C3D] font-bold underline decoration-[#957C3D]/30">${inv}</span> 
                impactará directamente en el área de <span class="text-[#957C3D] font-bold">${area}</span> 
                mediante la ejecución de <span class="text-[#957C3D] font-bold">${tacticLabel}</span>, 
                lo que nos permitirá <span class="text-white font-bold italic underline decoration-[#957C3D] underline-offset-8">${res}</span>."
            `;
        }
    };

    /**
     * MOTOR DE INTERACCIÓN Y CONSULTORÍA PERSONALIZADA
     * Gestiona la comunicación directa para los CTAs 1 y 2 del Ejercicio 10.
     */
    window.sendConsultancyEmailCustom = function(asuntoPersonalizado) {
        const emailDestino = "contacto@miempresacrece.com.mx";
        
        // Trazabilidad de identidad: rescatamos datos de la sesión
        const nombre = localStorage.getItem('cuaderno_sesionc_nombre_participante') || "Empresario";
        const empresa = localStorage.getItem('cuaderno_sesionc_nombre_empresa') || "Mi Empresa";
        
        // Rescatamos el Pitch actual para que el consultor sepa de qué inversión hablamos
        const pitch = document.getElementById('investment-pitch-container')?.innerText || "Pitch no generado";

        const cuerpo = `Hola equipo de Mi Empresa Crece,\n\nSoy ${nombre} de la empresa ${empresa}.\n\nHe llegado al Ejercicio 10 (Matriz Estratégica) y solicito apoyo para:\n"${asuntoPersonalizado}"\n\nMi Pitch de Inversión actual es:\n"${pitch}"\n\nQuedo a la espera de su contacto para validar mi estrategia.\n\nSaludos.`;

        const mailtoUrl = `mailto:${emailDestino}?subject=${encodeURIComponent(asuntoPersonalizado)}&body=${encodeURIComponent(cuerpo)}`;

        // Apertura quirúrgica en proceso independiente
        const navLink = document.createElement('a');
        navLink.href = mailtoUrl;
        navLink.target = '_blank';
        navLink.click();
    };

    /**
     * DATA SYNC MANAGER | CIERRE GLOBAL DEL ECOSISTEMA
     * Empaqueta todas las respuestas de la sesión y las envía al endpoint central.
     */
    window.DataSyncManager = {
        submitWorkbook: async function() {
            const btn = document.getElementById('btn-final-submit');
            if (!btn || btn.disabled) return;

            // 1. Protocolo de Seguridad: Validación de Conexión
            if (!window.navigator.onLine) {
                alert("⚠️ Error de Red: No se detecta conexión a internet. Los resultados no pueden enviarse en este momento.");
                return;
            }

            // 2. Feedback Visual Prestige (Estado de Carga)
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>⏳ Sincronizando...</span>
            `;
            btn.classList.add('opacity-80', 'cursor-not-allowed');

            try {
                // 3. Recolección Quirúrgica de Datos (.autosave-input)
                const respuestas = {};
                document.querySelectorAll('.autosave-input').forEach(input => {
                    const id = input.getAttribute('data-id');
                    if (id) {
                        if (input.type === 'radio' || input.type === 'checkbox') {
                            if (input.checked) respuestas[id] = input.value;
                        } else {
                            respuestas[id] = input.value;
                        }
                    }
                });

                // 4. Construcción del Payload Maestro
                const payload = {
                    token: "PROYECTO_DREAMS_2026",
                    sesion: "SESION_C",
                    nombre_participante: localStorage.getItem('cuaderno_sesionc_nombre_participante') || "Usuario no identificado",
                    nombre_empresa: localStorage.getItem('cuaderno_sesionc_nombre_empresa') || "Empresa no identificada",
                    pitch_final: document.getElementById('investment-pitch-container')?.innerText || "",
                    datos: respuestas,
                    metadata: {
                        fecha_envio: new Date().toLocaleString(),
                        url_origen: window.location.href,
                        user_agent: navigator.userAgent
                    }
                };

                // 5. Envío al Endpoint (Google Apps Script)
                // Se utiliza la URL definida en tu configuración global o el endpoint por defecto
                const url = window.CONFIG?.API_URL || "https://script.google.com/macros/s/AKfycbw6H.../exec";

                await fetch(url, {
                    method: 'POST',
                    mode: 'no-cors', // Protocolo estándar para evitar bloqueos CORS con Google Scripts
                    cache: 'no-cache',
                    body: JSON.stringify(payload)
                });

                // 6. Éxito: Transformación a Estado Sincronizado
                btn.classList.remove('bg-[#F68D2E]', 'hover:bg-[#e07d24]');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');
                btn.innerHTML = `
                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <span>✓ INFORMACIÓN SINCRONIZADA</span>
                `;
                
                alert("¡Felicidades! Tu Plan de Consolidación ha sido enviado y guardado exitosamente en la plataforma.");

            } catch (error) {
                console.error("Dreams DataSync Error:", error);
                btn.disabled = false;
                btn.innerHTML = originalContent;
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
                alert("Hubo un inconveniente al conectar con el servidor. Por favor, verifica tu conexión e intenta de nuevo.");
            }
        }
    };

    /**
     * IMPLEMENTATION MANAGER | MOTOR DE AGREGACIÓN (EJ. 11)
     * Centraliza y formatea los datos de toda la sesión para el tablero final.
     */
    window.ImplementationManager = {
        refreshSummary: function() {
            const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
            
            // 1. BLINDAJE (EJ. 1 Y 2)
            const salario = localStorage.getItem('cuaderno_ej1_salario_definido') || "$0.00";
            const tipoComp = localStorage.getItem('cuaderno_ej2_tipo_comp') || "No definido";
            const politica = localStorage.getItem('cuaderno_ej2_prio_util') || "No definida";
            
            this.setText('summary-salary', salario);
            this.setText('summary-utility-policy', `Compensación: ${tipoComp.toUpperCase()} | Prioridad: ${politica.toUpperCase()}`);

            // 2. RUMBO (EJ. 2)
            this.setText('summary-target-income', formatter.format(parseFloat(localStorage.getItem('cuaderno_ej2_meta_ingreso')) || 0));
            this.setText('summary-target-profit', formatter.format(parseFloat(localStorage.getItem('cuaderno_ej2_meta_utilidad')) || 0));
            this.setText('summary-target-date', localStorage.getItem('cuaderno_ej2_meta_fecha') || "-- / -- / --");

            // 3. PROPÓSITO (EJ. 10) - Rescatamos el Pitch exacto generado
            const pitchHtml = document.getElementById('investment-pitch-container')?.innerHTML;
            const pitchDisplay = document.getElementById('summary-pitch');
            if (pitchDisplay && pitchHtml) {
                pitchDisplay.innerHTML = pitchHtml;
            }

            // 4. VIABILIDAD (EJ. 4, 7 Y 8)
            const fclAvg = parseFloat(localStorage.getItem('cuaderno_avg-monthly-fcl-2-2')) || 0;
            const fclAnnual = parseFloat(localStorage.getItem('cuaderno_annual-fcl-2-2')) || 0;
            const consumo = parseInt(localStorage.getItem('cuaderno_ej7_porcentaje_anual')) || 0;
            const payback = localStorage.getItem('cuaderno_ej8_plazo_propuesto') || "0";

            this.setText('summary-fcl-avg', formatter.format(fclAvg));
            this.setText('summary-fcl-annual', formatter.format(fclAnnual));
            
            const consumptionEl = document.getElementById('summary-fcl-consumption');
            if (consumptionEl) {
                consumptionEl.innerText = `${consumo}%`;
                consumptionEl.className = `text-xl font-black ${consumo > 50 ? 'text-red-600' : 'text-[#0F3460]'}`;
            }
            this.setText('summary-payback', `${payback} Meses`);

            // 5. MADUREZ (EJ. 3)
            const maturityText = document.getElementById('general-percentage')?.innerText || "0%";
            const scoreVal = parseInt(maturityText);
            const scoreEl = document.getElementById('summary-maturity-score');
            if (scoreEl) {
                scoreEl.innerText = maturityText;
                scoreEl.style.color = (scoreVal < 40) ? '#dc2626' : (scoreVal < 75) ? '#ca8a04' : '#16a34a';
            }

            // 6. RIESGOS (EJ. 9) - Mapeo de las primeras 2 amenazas válidas
            const riskContainer = document.getElementById('summary-risks-list');
            if (riskContainer) {
                const risks = [];
                for (let i = 1; i <= 10; i++) {
                    const desc = localStorage.getItem(`cuaderno_ej9_risk_desc_${i}`);
                    if (desc && desc.trim() !== "") {
                        const level = document.getElementById(`ej9_final_level_${i}`)?.innerText || "Bajo";
                        risks.push({ desc, level });
                    }
                }
                
                riskContainer.innerHTML = risks.slice(0, 2).map(r => `
                    <div class="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm animate-fadeIn">
                        <span class="text-[10px] font-bold text-[#0F3460]">${r.desc}</span>
                        <span class="text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${r.level === 'Crítico' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'}">${r.level}</span>
                    </div>
                `).join('') || '<p class="text-[10px] text-gray-400 italic">No se identificaron riesgos críticos.</p>';
            }
        },

        setText: function(id, text) {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        }
    };