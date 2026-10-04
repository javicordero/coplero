import { expect, test } from "@playwright/test"

const DONACION =
  "https://www.buymeacoffee.com/AcordesGaditanos?utm_source=coplero"
const ENDPOINT = "https://formspree.io/f/mdeanyjr"

test("la página de colaboración muestra el título y el CTA a jugar", async ({
  page,
}) => {
  await page.goto("/colaborar")

  await expect(
    page.getByRole("heading", { level: 1, name: "Colaborar" }),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: /empezar a jugar/i }).first(),
  ).toHaveAttribute("href", "/jugar")
})

test("el enlace de donación apunta a Buy Me a Coffee con origen Coplero", async ({
  page,
}) => {
  await page.goto("/colaborar")

  const enlace = page.locator(`a[href="${DONACION}"]`)
  await expect(enlace).toHaveCount(1)
  await expect(enlace).toHaveAttribute("target", "_blank")
  await expect(enlace).toHaveAttribute("rel", "noopener noreferrer")
})

test("el formulario de sugerencias funciona sin JavaScript", async ({
  page,
}) => {
  await page.goto("/colaborar")

  const form = page.locator("form")
  await expect(form).toHaveAttribute("action", ENDPOINT)
  await expect(form).toHaveAttribute("method", "POST")

  const mensaje = page.locator('textarea[name="mensaje"]')
  await expect(mensaje).toHaveAttribute("maxlength", "500")
  await expect(mensaje).toHaveAttribute("required", "")

  const tipo = page.locator('select[name="tipo"]')
  await expect(tipo).toHaveAttribute("required", "")
  await expect(tipo.locator("option")).toHaveCount(3)

  const email = page.locator('input[name="email"]')
  await expect(email).toHaveAttribute("type", "email")
  await expect(email).not.toHaveAttribute("required", "")

  await expect(page.locator('input[name="_subject"]')).toHaveValue(
    "Coplero — Nueva sugerencia",
  )
  await expect(page.locator('input[name="origen"]')).toHaveValue("coplero")
  await expect(page.locator('input[name="_gotcha"]')).toHaveCount(1)
})

test("el envío sin JavaScript llega al servicio con los datos", async ({
  page,
}) => {
  let cuerpo = ""
  await page.route("https://formspree.io/**", async (route) => {
    cuerpo = route.request().postData() ?? ""
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html lang='es'><body>Gracias</body></html>",
    })
  })

  await page.goto("/colaborar")
  await page.locator('select[name="tipo"]').selectOption("situacion")
  await page
    .locator('textarea[name="mensaje"]')
    .fill("Una chirigota que ensaya en la playa")
  await page.locator('button[type="submit"]').click()

  await expect.poll(() => cuerpo).toContain("mensaje=")
  expect(cuerpo).toContain("tipo=situacion")
  expect(cuerpo).toContain("origen=coplero")
  expect(cuerpo).toContain("_subject=")
})
