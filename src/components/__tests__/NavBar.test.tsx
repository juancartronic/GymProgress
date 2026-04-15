import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "../NavBar";
import { MemoryRouter } from "react-router-dom";

describe("NavBar", () => {
  it("no renderiza sin usuario", () => {
    const { container } = render(
      <MemoryRouter>
        <NavBar hasUser={false} accent="#c3ff00" muted="#666" />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renderiza los 3 items con usuario", () => {
    render(
      <MemoryRouter>
        <NavBar hasUser={true} accent="#c3ff00" muted="#666" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Planes")).toBeInTheDocument();
    expect(screen.getByText("Historial")).toBeInTheDocument();
  });
});
