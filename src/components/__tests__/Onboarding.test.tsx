import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Onboarding } from "../Onboarding";

describe("Onboarding", () => {
  it("muestra el formulario de registro", () => {
    render(<Onboarding onSave={vi.fn()} />);
    expect(screen.getByText("Cuentanos sobre ti")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Como te llamas?")).toBeInTheDocument();
  });

  it("no permite enviar si faltan datos", async () => {
    const onSave = vi.fn();
    render(<Onboarding onSave={onSave} />);
    const buttons = screen.getAllByRole("button");
    const saveBtn = buttons.find((b) => b.textContent?.includes("EMPEZAR") || b.textContent?.includes("Guardar"));
    if (saveBtn) {
      await userEvent.click(saveBtn);
      expect(onSave).not.toHaveBeenCalled();
    }
  });

  it("muestra boton de volver si onCancel esta presente", () => {
    render(<Onboarding onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("← Volver")).toBeInTheDocument();
  });
});
