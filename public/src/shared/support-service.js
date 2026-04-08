/**
 * SupportService - Gestión de Tickets e IA
 * Ubicación: /src/shared/support-service.js
 */
import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { TicketAI } from '../admin/support/ticket-ai.js';

export const SupportService = {
    async init() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusElement = document.getElementById('contact-status');
            const btnSend = document.getElementById('btn-send-contact');
            
            // Bloqueo de UI
            btnSend.disabled = true;
            statusElement.innerText = "Procesando con IA... 🤖";

            const formData = {
                nombre: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                interes: document.getElementById('contact-interest').value,
                mensaje: document.getElementById('contact-message').value
            };

            try {
                const user = auth.currentUser;
                if (!user) throw new Error("Debes estar logueado");

                // 1. Obtener contexto del usuario para la IA (Requisito g)
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                // 2. Guardar Ticket en el Expediente (Tracing - Requisito g)
                // Lo guardamos en una sub-colección dentro del usuario
                const ticketRef = await addDoc(collection(db, "usuarios", user.uid, "tickets"), {
                    ...formData,
                    fecha: serverTimestamp(),
                    status: 'pendiente',
                    tipo: 'soporte_ia'
                });

                // 3. GENERAR RESPUESTA CON IA (Guardián de Contención)
                const aiResponse = await TicketAI.generateSmartResponse(formData.mensaje, userData);

                // 4. DISCRIMINADOR DE INTENCIÓN (UNIFICACIÓN CALENDLY)
                let intentType = 'CONFIRMACION_SOPORTE';
                
                // TRACEABILIDAD: Consultoría y Apps comparten el flujo de agendamiento (Calendly)
                if (formData.interes === 'Consultoría' || formData.mensaje.includes('Ecosistema de Apps')) {
                    intentType = 'CARRITO_COMPRA';
                }

                await fetch('/.netlify/functions/intervencion-notificacion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        destinatario: formData.email,
                        cliente: { 
                            nombre: formData.nombre, 
                            email: formData.email, 
                            empresa: userData.empresa || '',
                            uid: user.uid 
                        },
                        servicio: { 
                            titulo: intentType === 'INTERES_APPS' ? 'Ecosistema de Apps' : formData.interes, 
                            id: 'atencion_automatica' 
                        },
                        tipo: intentType,
                        omitirRegistroFirestore: true // Ya lo guardamos en el paso 2 de esta función
                    })
                });

                // 5. ACTUALIZAR TRAZABILIDAD EN FIRESTORE
                await updateDoc(ticketRef, {
                    respuesta_ia: aiResponse,
                    respondido_en: serverTimestamp(),
                    status: 'atendido_ia',
                    intent_detected: intentType
                });

                // 5. RENDERIZADO PRESTIGE: Respuesta IA Centrada y Personalizada
                statusElement.innerHTML = `
                    <div style="background: rgba(15, 52, 96, 0.03); padding: 25px; border-radius: 15px; border: 1px solid rgba(149, 124, 61, 0.2); margin-top: 20px; text-align: center; animation: fadeIn 0.8s ease-out;">
                        <span style="display: block; font-size: 0.65rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Respuesta de tu Consultor IA</span>
                        <p style="font-family: 'Montserrat'; font-style: italic; font-size: 0.9rem; color: var(--primary-midnight); line-height: 1.6; margin: 0; font-weight: 400;">
                            "${aiResponse}"
                        </p>
                        <div style="width: 40px; height: 1px; background: var(--accent-gold); margin: 15px auto 0 auto; opacity: 0.5;"></div>
                    </div>`;

                contactForm.reset();

                // PROTOCOLO PRESTIGE: Redirección automática si es una solicitud comercial (Apps/Consultoría)
                if (intentType === 'CARRITO_COMPRA') {
                    setTimeout(() => {
                        window.location.href = `agendar.html?service=${formData.interes}`;
                    }, 3500); // Damos 3.5s para que el usuario lea la respuesta de la IA antes de redirigir
                }

            } catch (error) {
                console.error("Error en SupportService:", error);
                statusElement.innerText = "Hubo un error. Intenta de nuevo.";
            } finally {
                btnSend.disabled = false;
            }
        });
    }
};