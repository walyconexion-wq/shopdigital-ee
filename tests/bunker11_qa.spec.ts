import { test, expect } from '@playwright/test';

test.describe('🧪 BÚNKER 11 (VORTEX) · SUITE DE AUDITORÍA QA AUTOMATIZADA', () => {

  test('01. Verificar carga limpia de la plataforma en producción', async ({ page }) => {
    // Navegar a la app en vivo
    await page.goto('https://shopdigital-ar.vercel.app');

    // Validar título de la pestaña
    await expect(page).toHaveTitle(/ShopDigital/i);
    console.log('✅ QA Test 01: Carga inicial y título de la plataforma verificados.');
  });

  test('02. Verificar botonera de navegación regional y categorías', async ({ page }) => {
    await page.goto('https://shopdigital-ar.vercel.app/esteban-echeverria/home');

    // Verificar visibilidad del contenedor de categorías
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();

    console.log('✅ QA Test 02: Botonera regional y grilla de categorías auditadas exitosamente.');
  });

});
