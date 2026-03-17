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

                // 3. Generar respuesta con Gemini (Requisito d)
                const aiResponse = await TicketAI.generateSmartResponse(formData.mensaje, userData);

                // 4. Actualizar ticket con la respuesta de la IA
                await updateDoc(ticketRef, {
                    respuesta_ia: aiResponse,
                    respondido_en: serverTimestamp(),
                    status: 'atendido_ia'
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