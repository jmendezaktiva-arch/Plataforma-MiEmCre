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

                // 4. DISCRIMINADOR DE INTENCIÓN Y DISPARO DE CORREO (Netlify Handshake)
                let intentType = 'CONFIRMACION_SOPORTE';
                if (formData.interes === 'Consultoría') intentType = 'CARRITO_COMPRA';
                if (formData.mensaje.includes('Ecosistema de Apps')) intentType = 'INTERES_APPS';

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

                // 5. Mostrar respuesta al usuario
                statusElement.innerHTML = `<div style="background:#f0f7ff; padding:15px; border-radius:8px; border-left:4px solid var(--accent-gold); margin-top:10px;">
                    <strong style="color:var(--brand-blue)">Respuesta de tu Consultor IA:</strong><br>
                    <p style="font-style:italic; font-size:0.85rem; margin-top:5px;">"${aiResponse}"</p>
                </div>`;

                contactForm.reset();

            } catch (error) {
                console.error("Error en SupportService:", error);
                statusElement.innerText = "Hubo un error. Intenta de nuevo.";
            } finally {
                btnSend.disabled = false;
            }
        });
    }
};