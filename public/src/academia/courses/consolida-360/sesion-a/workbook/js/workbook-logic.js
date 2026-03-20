//public/src/academia/courses/consolida-360-sesion-a-workbook-js-workbook-logic.js

/**
 * DREAMS WORKBOOK LOGIC - SESIÓN A | VERSIÓN INTEGRAL DEFINITIVA v2.0
 * Mantiene el 100% de la metodología Consolida 360° original.
 * Integra la Resiliencia y Persistencia Cloud del Core v1.1.
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. CONFIGURACIÓN DE SECCIONES (IDENTIDAD METODOLÓGICA) ---
    const sectionsData = [
        { id: 'evaluacion', title: '1. Dependencia Operativa', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { id: 'vocacion', title: '2. Vocación Puestos Clave', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'prioridades', title: '3. Prioridades de Mejora', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'mision', title: '4. Misión de Puesto', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
        { id: 'delegacion', title: '5. Delegación Efectiva', icon: 'M8 7h.01M12 7h.01M16 7h.01M9 17h6M9 14h6M9 11h6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'feedback', title: '6. Feedback Ágil', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z' },
        { id: 'roleplay', title: '7. Role-Play', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
        { id: 'plan', title: '8. Mi Plan de Implementación', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
    ];

    const mainContainer = document.getElementById('workbook-sections-container');
    const navMenu = document.getElementById('nav-menu').querySelector('ul');
    const getCleanTitle = (title) => title.replace(/^\d+\.\s*/, '');

    // --- 2. MOTOR DE RENDERIZADO DINÁMICO ---
    const initUI = () => {
        sectionsData.forEach((section) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#${section.id}" class="nav-link flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                    <span class="completion-icon opacity-20 text-green-600 font-black text-[8px]">●</span>
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${section.icon}" /></svg>
                    <span class="text-[11px] font-bold uppercase tracking-tight">${getCleanTitle(section.title)}</span>
                </a>`;
            navMenu.appendChild(li);

            const secEl = document.createElement('section');
            secEl.id = section.id;
            secEl.className = 'section-content bg-white shadow-xl shadow-blue-900/5 rounded-[2rem] p-8 md:p-12 border border-gray-100 mb-10';
            mainContainer.appendChild(secEl);
        });

        injectSectionTemplates();
        setupEvents();
        // TRACEABILIDAD (Hito 4.3): Eliminamos llamado y definición local redundante.
        // La reparación de activos se ejecuta de forma centralizada al final del DOMContentLoaded.
    };

    // --- 3. TEMPLATES METODOLÓGICOS (INTEGRIDAD TOTAL DE MUNDOS) ---
    const injectSectionTemplates = () => {
        const boxClass = "bg-blue-50 border-l-4 border-[#0F3460] p-6 mb-8 rounded-r-2xl text-xs";
        const titleClass = "text-2xl font-black text-[#0F3460] mb-6 flex items-center gap-3";

        // EJ. 1: EVALUACIÓN (7 Preguntas exactas + Lógica de Semáforo)
        document.getElementById('evaluacion').innerHTML = `
            <h2 class="${titleClass}">Diagnóstico de Dependencia Operativa</h2>
            <div class="${boxClass}"><strong>Objetivo:</strong> Identificar el nivel de involucramiento innecesario del líder en la operación diaria.</div>
            <table class="w-full text-left">
                <thead><tr class="text-[10px] uppercase text-gray-400 border-b"><th class="pb-4">Afirmación</th>${[1,2,3,4,5].map(v=>`<th class="text-center pb-4">${v}</th>`).join('')}</tr></thead>
                <tbody>${[
                    "Las decisiones importantes se detienen si no estoy yo.", "Mi equipo me consulta problemas que podrían solucionar ellos mismos.", "Siento que tengo que microgestionar las tareas para asegurar calidad.", "Dedico la mayor parte de mi tiempo a 'apagar incendios' operativos.", "Los proyectos o iniciativas importantes se retrasan si no estoy involucrado.", "Mi equipo tiene dificultades para tomar iniciativa sin instrucción explícita.", "Me siento abrumado por la cantidad de tareas que solo yo puedo resolver."
                ].map((q, i) => `<tr class="border-b"><td class="py-4 text-xs font-medium text-gray-600">${q}</td>${[1,2,3,4,5].map(v => `<td class="text-center"><input type="radio" name="q${i}" value="${v}" class="autosave-input h-5 w-5 accent-[#0F3460]" data-id="evaluacion_q${i}"></td>`).join('')}</tr>`).join('')}</tbody>
            </table>
            <div class="mt-8 flex justify-between items-center">
                <div id="score-result" class="hidden p-4 bg-orange-50 border-l-4 border-[#957C3D] rounded-r-lg"><p id="score-text" class="text-xs font-black text-[#0F3460]"></p></div>
                <button id="btn-calc-score" class="bg-[#0F3460] text-white px-8 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-transform">CALCULAR RESULTADO</button>
            </div>
            <div class="mt-10"><label class="block font-black text-[#0F3460] mb-2 uppercase text-[10px]">Reflexión Final: Mi mayor cuello de botella es...</label>
            <textarea class="autosave-input w-full p-5 bg-gray-50 border-none rounded-2xl h-32 text-sm" data-id="evaluacion_reflexion" placeholder="Ej: La autorización de facturas menores que quita 2 horas al día..."></textarea></div>`;

        // EJ. 2: VOCACIÓN (Puestos Clave + Análisis de Enfoque)
        document.getElementById('vocacion').innerHTML = `
            <h2 class="${titleClass}">Vocación de Puestos Clave</h2>
            <div class="${boxClass}">Describe las funciones de 2 puestos críticos y analiza si operan por tarea o por resultado (Ownership).</div>
            <div id="puestos-grid" class="space-y-10"></div>
            <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t">
                <div><label class="block font-bold text-[#0F3460] mb-2 text-[10px] uppercase">Problema más recurrente</label><textarea class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl h-24 text-xs" data-id="vocacion_problema"></textarea></div>
                <div><label class="block font-bold text-[#0F3460] mb-2 text-[10px] uppercase">Impacto en resultados PyME</label><textarea class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl h-24 text-xs" data-id="vocacion_impacto"></textarea></div>
            </div>`;
        [1,2].forEach(i => document.getElementById('puestos-grid').innerHTML += `
            <div class="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                <h3 class="font-black text-[#957C3D] mb-6 uppercase text-xs">Puesto Clave ${i}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" class="autosave-input p-3 rounded-xl border-none shadow-sm text-sm md:col-span-2" data-id="vocacion_p${i}_titulo" placeholder="Título del Puesto">
                    <input type="text" class="autosave-input p-3 rounded-xl border-none shadow-sm text-sm" data-id="vocacion_p${i}_antiguedad_creacion" placeholder="Antigüedad de creación del puesto">
                    <input type="text" class="autosave-input p-3 rounded-xl border-none shadow-sm text-sm" data-id="vocacion_p${i}_antiguedad" placeholder="Antigüedad de la persona actual">
                </div>
                <input type="text" class="autosave-input w-full p-3 mt-4 rounded-xl border-none shadow-sm text-sm" data-id="vocacion_p${i}_historico" placeholder="Histórico de personas que han ocupado el puesto">
                <textarea class="autosave-input w-full p-3 mt-4 rounded-xl border-none shadow-sm h-20 text-xs" data-id="vocacion_p${i}_funciones" placeholder="Funciones principales (Tareas diarias)"></textarea>
                <textarea class="autosave-input w-full p-3 mt-4 rounded-xl border-none shadow-sm h-20 text-xs border-l-4 border-[#0F3460]" data-id="vocacion_p${i}_enfoque" placeholder="Enfoque en el Objetivo (Ownership)"></textarea>
            </div>`);

        // EJ. 3: PRIORIDADES (Sincronización de títulos)
        document.getElementById('prioridades').innerHTML = `
            <h2 class="${titleClass}">Prioridades de Mejora</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">${[1,2].map(i => `
                <div class="p-6 bg-blue-50/30 rounded-2xl">
                    <h4 class="font-black text-[#0F3460] text-[10px] uppercase mb-4 tracking-widest">ANÁLISIS: <span id="prio_name_p${i}" class="text-[#957C3D]">...</span></h4>
                    <label class="text-[9px] font-bold text-gray-400">Situación Inicial / Problema</label>
                    <textarea class="autosave-input w-full p-3 text-xs rounded-xl border-none shadow-inner h-20 mb-3 mt-1" data-id="prio_p${i}_situacion"></textarea>
                    <label class="text-[9px] font-bold text-gray-400">Abordaje con Ownership (Ideal)</label>
                    <textarea class="autosave-input w-full p-3 text-xs rounded-xl border-none shadow-inner h-20 mt-1" data-id="prio_p${i}_ownership"></textarea>
                </div>`).join('')}</div>
            <div class="mt-8 p-6 bg-gray-50 rounded-3xl"><label class="block font-bold text-[#0F3460] text-xs uppercase mb-2">¿Qué harías diferente como líder?</label>
            <textarea class="autosave-input w-full p-4 bg-white rounded-2xl h-24 text-xs" data-id="prioridades_reflexion"></textarea></div>`;

        // EJ. 4: MISIÓN (Definición de Ficha)
        document.getElementById('mision').innerHTML = `
            <h2 class="${titleClass}">Misión de Puesto</h2>
            <div class="${boxClass}">Crea una definición inspiradora y clara del "para qué" de cada rol.</div>
            <div class="space-y-8">${[1,2].map(i => `
                <div class="border-2 border-dashed border-gray-100 p-8 rounded-[2.5rem]">
                    <h3 class="text-lg font-black text-[#0F3460] mb-6 underline decoration-[#957C3D] decoration-2">PUESTO: <span id="mision_name_p${i}">---</span></h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Misión del Rol (Objetivo Central)</label>
                        <textarea class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl h-32 mt-2 text-xs" data-id="mision_p${i}_desc" placeholder="Ej: Asegurar que el cliente reciba su pedido en tiempo y forma..."></textarea></div>
                        <div><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prioridades de Éxito (KPIs)</label>
                        <textarea class="autosave-input w-full p-4 bg-gray-50 border-none rounded-2xl h-32 mt-2 text-xs" data-id="mision_p${i}_kpis" placeholder="1. Cero retrasos, 2. Calidad 100%..."></textarea></div>
                    </div>
                </div>`).join('')}</div>`;

        // EJ. 5: DELEGACIÓN (7 Prácticas x 3 Tareas) - REHABILITACIÓN DE FILAS (Hito 3.1)
        const dQ = ["¿Vínculo con Misión?", "¿Repaso de Objetivo?", "¿Recurrente/Excepción?", "¿Fecha y Hora exacta?", "¿Respaldo por Escrito?", "¿Confirmación de Recursos?", "¿Pregunta de Ayuda?"];
        document.getElementById('delegacion').innerHTML = `
            <h2 class="${titleClass}">Delegación Efectiva</h2>
            <div class="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                        <tr>
                            <th class="p-5 border-b">Buenas Prácticas de Delegación</th>
                            ${[1,2,3].map(t=>`<th class="text-center border-b">Tarea ${t}</th>`).join('')}
                            <th class="text-center border-b bg-blue-50/50">Cumplimiento %</th>
                        </tr>
                    </thead>
                    <tbody>${dQ.map((q, i) => `
                        <tr class="border-b">
                            <td class="p-5 text-xs font-bold text-gray-600">${q}</td>
                            ${[1,2,3].map(t => `<td class="p-5 text-center"><select class="autosave-input p-2 rounded-lg text-[10px] bg-gray-50 font-bold border-none" data-id="del_t${t}_q${i}"><option value="--">--</option><option value="0">NO</option><option value="1">SÍ</option></select></td>`).join('')}
                            <td id="score_row_q${i}" class="text-center font-black text-[#0F3460] bg-blue-50/30 text-xs">0%</td>
                        </tr>`).join('')}</tbody>
                    <tfoot class="bg-[#0F3460] text-white">
                        <tr>
                            <td class="p-5 font-black text-xs uppercase tracking-widest">Total Prácticas Aplicadas</td>
                            ${[1,2,3].map(t => `<td id="score_del_t${t}" class="text-center font-black text-sm">0/7</td>`).join('')}
                            <td class="bg-[#0F3460]/80"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;

        // EJ. 6: FEEDBACK (Sincronización Total - 5 filas de plan de acción)
        document.getElementById('feedback').innerHTML = `
            <h2 class="${titleClass}">Feedback Ágil</h2>
            <div class="flex gap-2 mb-8" id="fb-tabs-header">
                <button class="fb-tab active bg-[#0F3460] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest" data-target="fb-p1-box">Puesto 1</button>
                <button class="fb-tab bg-gray-100 text-gray-400 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest" data-target="fb-p2-box">Puesto 2</button>
            </div>
            <div id="fb-panes-container">
                ${[1,2].map(i => `
                <div id="fb-p${i}-box" class="fb-pane ${i===2?'hidden':''} space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" class="autosave-input p-3 bg-gray-50 rounded-xl border-none text-xs" data-id="fb_p${i}_colab" placeholder="Nombre del Colaborador">
                        <input type="date" class="autosave-input p-3 bg-gray-50 rounded-xl border-none text-xs" data-id="fb_p${i}_fecha">
                    </div>
                    <textarea class="autosave-input w-full p-4 bg-blue-50/50 rounded-2xl border-none text-xs h-20" data-id="fb_p${i}_obj" placeholder="Objetivo de Puesto a Evaluar..."></textarea>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="p-6 bg-green-50/50 rounded-3xl border border-green-100">
                            <h4 class="text-[10px] font-black uppercase text-green-800 mb-4 tracking-widest">1. Autoevaluación</h4>
                            ${['Verde','Azul','Amarillo','Rojo'].map(c => `<label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-white rounded-xl transition-all mb-1"><input type="radio" name="fb_p${i}_sc" value="${c}" class="autosave-input accent-green-600" data-id="fb_p${i}_sc"> <span class="text-xs font-bold text-green-900">${c}</span></label>`).join('')}
                        </div>
                        <div class="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                            <h4 class="text-[10px] font-black uppercase text-blue-800 mb-4 tracking-widest">2. Evaluación Líder</h4>
                            ${['Verde','Azul','Amarillo','Rojo'].map(c => `<label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-white rounded-xl transition-all mb-1"><input type="radio" name="fb_p${i}_sl" value="${c}" class="autosave-input accent-blue-600" data-id="fb_p${i}_sl"> <span class="text-xs font-bold text-blue-900">${c}</span></label>`).join('')}
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5">
                        <h4 class="text-xs font-black uppercase text-gray-400 mb-6 italic tracking-widest">3. Plan de Acción Acordado</h4>
                        <table class="w-full text-left text-[10px]">
                            <thead><tr class="text-gray-400 font-black uppercase border-b"><th class="pb-3">Acción</th><th class="pb-3">Responsable</th><th class="pb-3">Fecha</th></tr></thead>
                            <tbody>${[1,2,3,4,5].map(a => `
                                <tr class="border-b border-gray-50">
                                    <td class="py-3 pr-2"><input type="text" class="autosave-input w-full p-2 bg-gray-50 border-none rounded-lg font-bold" data-id="fb_p${i}_a${a}_desc" placeholder="Acuerdo ${a}"></td>
                                    <td class="py-3 pr-2"><input type="text" class="autosave-input w-full p-2 bg-gray-50 border-none rounded-lg" data-id="fb_p${i}_a${a}_resp"></td>
                                    <td class="py-3"><input type="date" class="autosave-input w-full p-2 bg-gray-50 border-none rounded-lg" data-id="fb_p${i}_a${a}_fecha"></td>
                                </tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>`).join('')}
            </div>`;

        // EJ. 7: ROLE-PLAY (RESTAURACIÓN DE INTEGRIDAD METODOLÓGICA)
        const rpAspectos = ["Claridad del Objetivo/Misión", "Tipo de Preguntas", "Manejo del Semáforo / Feedback", "Acuerdo de Acciones", "Comunicación No Verbal"];
        
        document.getElementById('roleplay').innerHTML = `
            <h2 class="${titleClass}">Role-Play Entrenamiento</h2>
            <div class="${boxClass}">Anota aciertos y oportunidades observados durante la simulación de feedback.</div>
            
            <div class="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 class="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Escenario de Role-Play:</h4>
                <div class="flex flex-wrap gap-6">
                    ${[
                        {id: 'rigidez', text: 'Rigidez en la lista de tareas'},
                        {id: 'imprevistas', text: 'Delegación de tareas imprevistas'},
                        {id: 'semaforo', text: 'Feedback con semáforo'}
                    ].map(esc => `
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" class="autosave-input h-5 w-5 rounded border-gray-300 text-[#0F3460] focus:ring-[#0F3460]" data-id="roleplay_escenario_${esc.id}">
                            <span class="text-xs font-bold text-gray-600 group-hover:text-[#0F3460] transition-colors">${esc.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="overflow-x-auto rounded-3xl border border-gray-100 shadow-sm mb-10">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                        <tr>
                            <th class="p-5 border-b w-1/4">Aspectos Clave a Observar</th>
                            <th class="p-5 border-b text-center">Aciertos / Fortalezas del Líder</th>
                            <th class="p-5 border-b text-center">Oportunidades de Mejora</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rpAspectos.map((aspecto, idx) => `
                            <tr class="border-b border-gray-50">
                                <td class="p-5 text-xs font-bold text-[#0F3460] bg-gray-50/30">${aspecto}</td>
                                <td class="p-2"><textarea class="autosave-input w-full p-3 bg-gray-50 border-none rounded-xl text-[11px] h-20 shadow-inner" data-id="roleplay_a${idx}_aciertos" placeholder="Logros..."></textarea></td>
                                <td class="p-2"><textarea class="autosave-input w-full p-3 bg-gray-50 border-none rounded-xl text-[11px] h-20 shadow-inner" data-id="roleplay_a${idx}_mejoras" placeholder="Ajustes..."></textarea></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                <h4 class="text-xs font-black uppercase text-[#0F3460] mb-4 tracking-widest">Mi Aprendizaje del Role-Play</h4>
                <p class="text-[11px] text-gray-500 mb-4 italic italic">¿Qué idea o estrategia te llevas de esta práctica que aplicarás en tu PYME?</p>
                <textarea class="autosave-input w-full p-5 bg-white border-none rounded-2xl h-32 text-sm shadow-sm" data-id="roleplay_aprendizaje" placeholder="Ej: Me di cuenta que tiendo a dar la solución en lugar de guiar con preguntas..."></textarea>
            </div>`;

        // EJ. 8: PLAN (Cronograma consolidado)
        document.getElementById('plan').innerHTML = `
            <h2 class="${titleClass}">Cronograma de Ejecución</h2>
            <div id="plan-timeline-container" class="space-y-12"></div>`;
    };

    // --- 4. LÓGICA DE HERENCIA Y ACTUALIZACIÓN (CERO VACÍOS) ---
    const updateLocalLogic = () => {
        const t1 = localStorage.getItem('cuaderno_vocacion_p1_titulo') || 'Puesto 1';
        const t2 = localStorage.getItem('cuaderno_vocacion_p2_titulo') || 'Puesto 2';
        
        // Sincronizar títulos dinámicos en Secciones 3, 4, 6 y 8
        const updateText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
        updateText('prio_name_p1', t1); updateText('prio_name_p2', t2);
        updateText('mision_name_p1', t1); updateText('mision_name_p2', t2);

        // Recalcular Tabla Delegación (Sección 5) - INTEGRIDAD DE FILAS Y COLUMNAS (Hito 3.2)
        // 1. Cálculo por Columnas (Tareas 1, 2, 3) - Cuantitativo
        [1,2,3].forEach(t => {
            let sum = 0;
            for(let q=0; q<7; q++) {
                const val = localStorage.getItem(`cuaderno_del_t${t}_q${q}`);
                if(val === '1') sum++;
            }
            updateText(`score_del_t${t}`, `${sum}/7`);
        });

        // 2. Cálculo por Filas (Prácticas 0-6) - Análisis Cualitativo
        for(let q=0; q<7; q++) {
            let rowSum = 0;
            for(let t=1; t<=3; t++) {
                const val = localStorage.getItem(`cuaderno_del_t${t}_q${q}`);
                if(val === '1') rowSum++;
            }
            const rowPercent = Math.round((rowSum / 3) * 100);
            const rowEl = document.getElementById(`score_row_q${q}`);
            
            if(rowEl) {
                rowEl.textContent = `${rowPercent}%`;
                // SEMAFORIZACIÓN: Rojo (0%), Oro (33-66%), Verde (100%)
                rowEl.className = "text-center font-black text-xs py-2 transition-colors duration-500";
                if(rowPercent === 0) rowEl.classList.add('text-red-500');
                else if(rowPercent < 100) rowEl.classList.add('text-[#957C3D]'); 
                else rowEl.classList.add('text-green-600');
            }
        }

        renderTimeline();
        populateReport();
        updateProgressBar();
    };

    const renderTimeline = () => {
        const cont = document.getElementById('plan-timeline-container');
        if(!cont) return;
        cont.innerHTML = '';
        [1,2].forEach(i => {
            const puesto = localStorage.getItem(`cuaderno_vocacion_p${i}_titulo`) || `Puesto ${i}`;
            let rows = "";
            for(let a=1; a<=5; a++){
                const desc = localStorage.getItem(`cuaderno_fb_p${i}_a${a}_desc`);
                if(!desc) continue;
                rows += `
                    <div class="flex justify-between items-center p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-all group">
                        <div class="flex flex-col">
                            <span class="text-xs font-bold text-gray-700">${desc}</span>
                            <span class="text-[9px] text-gray-400 uppercase font-black">Resp: ${localStorage.getItem(`cuaderno_fb_p${i}_a${a}_resp`) || '---'}</span>
                        </div>
                        <span class="text-[10px] font-black text-[#957C3D] bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">${localStorage.getItem(`cuaderno_fb_p${i}_a${a}_fecha`) || 'S/F'}</span>
                    </div>`;
            }
            if(rows) cont.innerHTML += `<div class="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-md">
                <div class="bg-[#0F3460] p-4 text-white text-[10px] font-black uppercase tracking-widest text-center">${puesto}</div>${rows}</div>`;
        });
    };

    // --- 5. MOTOR DE PERSISTENCIA Y EVENTOS CORE ---
    const setupEvents = () => {
        let timer;
        document.addEventListener('input', (e) => {
            if(e.target.classList.contains('autosave-input')){
                const el = e.target;
                const val = (el.type === 'checkbox') ? el.checked : el.value;
                const clean = WorkbookCore.utils.sanitize(val);
                
                // Delegamos la persistencia al WorkbookCore para cumplir la Regla de Oro (Debounce)
                WorkbookCore.saveProgress(el.dataset.id, clean);
                
                // Actualizamos la lógica visual local inmediatamente
                updateLocalLogic();
            }
        });

        document.getElementById('fb-tabs-header')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.fb-tab');
            if(!btn) return;
            document.querySelectorAll('.fb-tab').forEach(b => b.classList.remove('active','bg-[#0F3460]','text-white'));
            btn.classList.add('active','bg-[#0F3460]','text-white');
            document.querySelectorAll('.fb-pane').forEach(p => p.classList.add('hidden'));
            document.getElementById(btn.dataset.target).classList.remove('hidden');
        });

        document.getElementById('btn-calc-score')?.addEventListener('click', () => {
            let total = 0;
            for(let i=0; i<7; i++){
                const rb = document.querySelector(`input[name="q${i}"]:checked`);
                if(rb) total += parseInt(rb.value);
            }
            const res = document.getElementById('score-result');
            const txt = document.getElementById('score-text');
            res.classList.remove('hidden');
            let nivel = total > 25 ? "ALTO (Cuello de Botella Crítico)" : (total > 14 ? "MODERADO" : "BAJO (Sana Autonomía)");
            txt.textContent = `PUNTAJE: ${total} - NIVEL DE DEPENDENCIA: ${nivel}`;
        });

        // Navegación de Secciones
        const links = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section-content');
        const show = (hash) => {
            const id = hash.replace('#','') || 'evaluacion';
            sections.forEach(s => s.classList.toggle('active', s.id === id));
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+id));
            window.scrollTo(0,0);
        };
        window.addEventListener('hashchange', () => show(window.location.hash));
        show(window.location.hash || '#evaluacion');
    };

    // --- 6. REPORTING & PDF (MÁXIMA FIDELIDAD) ---
    const populateReport = () => {
        const rep = document.getElementById('reporte-dinamico-content');
        if(!rep) return;
        
        // Función de obtención con Fallback Prestige
        const gV = (id) => {
            const val = localStorage.getItem('cuaderno_'+id);
            if (val && val !== '---') return val;
            return id === 'nombre_participante' ? 'Líder ME Crece' : 'Mi Empresa Crece';
        };

        rep.innerHTML = `
            <div class="grid grid-cols-2 gap-8">
                <div class="p-6 bg-gray-50 rounded-2xl"><h6 class="text-[9px] font-black text-gray-400 uppercase">Líder / Dueño</h6><p class="font-bold text-[#0F3460] uppercase">${gV('nombre_participante')}</p></div>
                <div class="p-6 bg-gray-50 rounded-2xl"><h6 class="text-[9px] font-black text-gray-400 uppercase">Organización</h6><p class="font-bold text-[#0F3460] uppercase">${gV('nombre_empresa')}</p></div>
            </div>
            <div class="p-8 border-l-[10px] border-[#957C3D] bg-orange-50/30 rounded-r-[2.5rem]">
                <h6 class="text-[10px] font-black text-[#957C3D] uppercase mb-2">Diagnóstico de Dependencia Operativa</h6>
                <p class="text-sm italic text-gray-700 font-medium">"${gV('evaluacion_reflexion')}"</p>
            </div>
            <div class="grid grid-cols-2 gap-8">
                ${[1,2].map(i => `
                    <div class="p-6 border border-gray-100 rounded-[2rem]">
                        <h6 class="font-black text-[#0F3460] text-[10px] uppercase mb-1 underline decoration-[#957C3D] underline-offset-4">${gV('vocacion_p'+i+'_titulo')}</h6>
                        <div class="mb-3 text-[8px] text-gray-400 font-bold uppercase tracking-tight italic">
                            Creación: ${gV('vocacion_p'+i+'_antiguedad_creacion')} | Histórico: ${gV('vocacion_p'+i+'_historico')}
                        </div>
                        <p class="text-[11px] text-gray-600 mb-2"><span class="font-bold">Misión:</span> ${gV('mision_p'+i+'_desc')}</p>
                        <p class="text-[10px] text-[#957C3D] font-bold italic">Acuerdo Principal: ${gV('fb_p'+i+'_a1_desc')}</p>
                    </div>`).join('')}
            </div>
            <div class="mt-8 p-8 bg-[#0F3460] rounded-[2.5rem] text-white">
                <div class="flex justify-between items-start mb-6 border-b border-blue-800 pb-4">
                    <h6 class="text-[10px] font-black uppercase tracking-widest text-blue-200">Entrenamiento Role-Play</h6>
                    <span class="text-[8px] bg-blue-500/20 px-2 py-1 rounded text-blue-200 font-bold uppercase tracking-widest">Validación de Metodología</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p class="text-[9px] font-black uppercase text-blue-300 mb-2">Escenarios Practicados:</p>
                        <div class="flex flex-wrap gap-2">
                            ${['rigidez', 'imprevistas', 'semaforo'].map(id => {
                                if (localStorage.getItem('cuaderno_roleplay_escenario_' + id) === 'true') {
                                    const lbl = { rigidez: 'Rigidez Operativa', imprevistas: 'Tareas Imprevistas', semaforo: 'Feedback Semáforo' };
                                    return `<span class="text-[10px] border border-blue-400/30 px-3 py-1 rounded-full bg-blue-900/50 font-bold text-blue-50">✓ ${lbl[id]}</span>`;
                                }
                                return '';
                            }).join('') || '<span class="text-[10px] text-blue-400 italic">No se registraron escenarios</span>'}
                        </div>
                    </div>
                    <div>
                        <p class="text-[9px] font-black uppercase text-blue-300 mb-2">Aprendizaje Estratégico:</p>
                        <p class="text-[11px] italic leading-relaxed text-blue-50 font-medium">"${gV('roleplay_aprendizaje')}"</p>
                    </div>
                </div>
            </div>`;
    };

    const updateProgressBar = () => {
        const inputs = document.querySelectorAll('.autosave-input');
        const filled = Array.from(inputs).filter(i => {
            if(i.type === 'radio' || i.type === 'checkbox') return i.checked;
            return i.value.trim() !== "";
        }).length;
        document.getElementById('progress-bar').style.width = (filled / inputs.length * 100) + '%';
    };

    // --- 7. HIDRATACIÓN DESDE NUBE ---
    window.addEventListener('coreHydrated', () => {
        document.querySelectorAll('.autosave-input').forEach(input => {
            const val = localStorage.getItem('cuaderno_' + input.dataset.id);
            if(val){
                if(input.type === 'radio') { if(input.value === val) input.checked = true; }
                else if(input.type === 'checkbox') { input.checked = (val === 'true'); }
                else if(input.tagName === 'SELECT') { input.value = val; }
                else { input.value = val; }
            }
        });
        updateLocalLogic();
    });

    document.getElementById('export-pdf')?.addEventListener('click', () => {
        populateReport();
        const emp = (localStorage.getItem('cuaderno_nombre_empresa') || 'MiEmpresa').replace(/\s+/g, '_');
        WorkbookCore.exportToPDF('reporte', `PlanMaestro_Consolida360_${emp}`);
    });

    // --- INICIALIZACIÓN FINAL ---
    initUI();
    updateLocalLogic();
});